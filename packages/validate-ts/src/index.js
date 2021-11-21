// This set of named validators should include all the built-in validators for typescript
const NAMED_VALIDATORS = {
  Array: (params) => ArrayValidator(params[0]),
  Record: (params) => Record(params[0], params[1]),
  Partial: (params) => Partial(params[0])
}

const OK = { status: "ok" }
const FAIL = { status: "fail" }

function registerType(name, validator) {
  // This needs to be smarter to deal with type parameters
  NAMED_VALIDATORS[name] = () => validator
}

function Named(name, typeParameters=[]) {
  return (o) => {
    const validator = NAMED_VALIDATORS[name]?.(typeParameters)
    return validator?.(o) ?? FAIL
  }
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
  return (o) => validateObject(types, {}, o)
}

function Partial(types) {
  return (o) => validateObject(types, {optional: true}, o)
}

function Required(types) {
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
  return (o) => validateUnion(types, o)
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
  return (o) => validateLiteral(val, o)
}

function validateLiteral(expected, actual) {
  return actual === expected ? OK : FAIL
}

function tsValidate(result) {
  if (result.status !== "ok") {
    throw new Error("FAIL!")
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
  Required,
  Never,
  Any,
  Object: ObjectValidator,
  Optional,
  Array: ArrayValidator,
  Tuple,
  tsValidate
}
