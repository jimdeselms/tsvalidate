
// This set of named validators should include all the built-in validators for typescript
// You can find built in types here: https://www.typescriptlang.org/docs/handbook/utility-types.html
const NAMED_VALIDATORS = {
  Array: (params) => ArrayValidator(params[0]),
  Record: (params) => Record(params[0], params[1]),
  Partial: (params) => Partial(params[0]),
  Readonly: (params) => params[0],
  Pick: (params) => Pick(params[0], params[1]),
  Omit: (params) => Omit(params[0], params[1])
}

const OK = { status: "ok" }
const FAIL = { status: "fail" }

function registerType(name, validator) {
  // This needs to be smarter to deal with type parameters
  const newValidator = () => validator
  copyProps(validator, newValidator)
  NAMED_VALIDATORS[name] = newValidator
}

function copyProps(from, to) {
  if (from && to) {
    for (const prop of Object.getOwnPropertyNames(from)) {
      if (prop !== "caller" && prop !== "callee" && prop !== "arguments") {
        to[prop] = from[prop]
      }
    }
  }
}

function Named(name, typeParameters=[]) {
  const orig = NAMED_VALIDATORS[name]
  const validator = orig?.(typeParameters)

  const newValidator = (o) => {
    return validator?.(o) ?? FAIL
  }

  copyProps(orig, newValidator)

  return newValidator
}
 
function String(val) {
  return (typeof(val) === "string") 
    ? OK
    : FAIL
}

function Never() { return FAIL }

function Any() { return OK }

function Number(val) {
  return (typeof(val) === "number") 
    ? OK
    : FAIL
}

function Record(keyType, valueType) {
  return (o) => validateRecord(keyType, valueType, o)
}
function validateRecord(keyType, valueType, o) {
  if (o !== null && typeof o === "object" && !Array.isArray(o)) {
    for (const [key, value] of Object.entries(o)) {
      if (keyType(key).status === "fail" || valueType(value).status === "fail") {
        return FAIL
      }
    }
    return OK
  } else {
    return FAIL
  }
}

function Boolean(val) {
  return (typeof(val) === "boolean") 
    ? OK
    : FAIL
}

function ObjectValidator(types) {
  const validator = (o) => validateObject(types, {}, o)
  validator.__types = types
  return validator
}

function Partial(type) {
  const types = type?.__types
  
  return (o) => validateObject(types, {optional: true}, o)
}

function Required(type) {
  const types = type?.__types

  return (o) => validateObject(types, {required: true}, o)
}

function validateObject(types, opts, o) {
  opts = opts ?? {}

  if (typeof(o) !== "object" || Array.isArray(o) || o === null) return FAIL

  for (const [key, validator] of Object.entries(types)) {
    const value = o[key]
    if (value === undefined) {
      if (opts.optional) continue
      if (opts.required) return FAIL
    }

    if (validator(value).status === "fail") {
      return FAIL
    }
  }

  return OK
}

function ArrayValidator(arrayType) {
  return (o) => validateArray(arrayType, o)
}

function validateArray(arrayType, array) {
  if (!Array.isArray(array)) return FAIL

  if (array.every(a => arrayType(a).status === "ok")) {
    return OK
  }

  return FAIL
}

function Tuple(...types) {
  return (o) => validateTuple(types, o)
}
function validateTuple(types, array) {
  if (!Array.isArray(array)) return FAIL
  if (array.length !== types.length) return FAIL

  for (let i = 0; i < types.length; i++) {
    if (types[i](array[i]).status !== "ok") {
      return FAIL
    }
  }

  return OK
}

function Union(...types) {
  const validator = (o) => validateUnion(types, o)

  validator.__value = types.map(t => t?.__value)

  return validator
}
function validateUnion(types, obj) {
  for (const validator of types) {
    if (validator(obj).status === "ok") {
      return OK
    }
  }
  return FAIL
}

function Intersection(...types) {
  return (o) => validateIntersection(types, o)
}
function validateIntersection(types, obj) {
  for (const validator of types) {
    if (validator(obj).status === "fail") {
      return FAIL
    }
  }
  return OK
}

function Optional(type) {
  return (o) => validateOptional(type, o)
}
function validateOptional(type, o) {
  if (o === undefined) {
    return OK
  }

  return type(o)
}

function Literal(val) {
  const validator = (o) => validateLiteral(val, o)
  validator.__value = val
  return validator
}

function validateLiteral(expected, actual) {
  return actual === expected ? OK : FAIL
}

function tsValidate(result) {
  if (result.status !== "ok") {
    throw new Error("FAIL!")
  }
}

function Pick(type, thingsToPick) {
  return (o) => validatePick(type, thingsToPick, o)
}
function validatePick(type, thingsToPick, o) {
  if (typeof o !== "object") {
    return FAIL
  }

  const validators = type?.__types ?? type

  const keys = typeof(thingsToPick?.__value) === "string"
    ? [thingsToPick.__value]
    : thingsToPick?.__value

  if (keys) {
    for (const key of keys) {
      const validator = validators[key]
      if (!validator) {
        return FAIL
      }

      const currValue = o?.[key]

      if (validator(currValue).status === "fail") {
        return FAIL
      }
    }
    return OK
  } else {
    return FAIL
  }
}

function Omit(type, thingsToPick) {
  return (o) => validateOmit(type, thingsToPick, o)
}
function validateOmit(type, thingsToOmit, o) {
  if (typeof o !== "object") {
    return FAIL
  }

  const validators = type?.__types ?? type

  const keysToOmit = typeof(thingsToOmit?.__value) === "string"
    ? [thingsToOmit.__value]
    : thingsToOmit?.__value

  const keysToInclude = Object.keys(validators).filter(k => !keysToOmit.includes(k))
  
  if (keysToInclude) {
    for (const key of keysToInclude) {
      const validator = validators[key]
      if (!validator) {
        return FAIL
      }

      const currValue = o?.[key]
      if (validator(currValue).status === "fail") {
        return FAIL
      }
    }
    return OK
  } else {
    return FAIL
  }
}

module.exports = {
  registerType,
  Named,
  String,
  Number,
  Literal,
  Union,
  Intersection,
  Boolean,
  Record,
  Partial,
  Pick,
  Omit,
  Required,
  Never,
  Any,
  Object: ObjectValidator,
  Optional,
  Array: ArrayValidator,
  Tuple,
  tsValidate
}
