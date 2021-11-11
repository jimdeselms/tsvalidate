// This set of named validators should include all the built-in validators for typescript
const NAMED_VALIDATORS = {
}

const OK = { status: "ok" }
const FAIL = { status: "fail" }

function registerType(name, validator) {
  NAMED_VALIDATORS[name] = validator
}

function Named(name) {
  return (o) => {
    const validator = NAMED_VALIDATORS[name]
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

function Boolean(val) {
  return (typeof(val) === "boolean") 
    ? OK
    : FAIL
}

function ObjectValidator(types) {
  return (o) => validateObject(types, o)
}

function validateObject(types, o) {
  if (typeof(o) !== "object" || Array.isArray(o) || o === null) return FAIL

  for (const [key, validator] of Object.entries(types)) {
    if (validator(o[key]).status === "fail") {
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

module.exports = {
  registerType,
  Named,
  String,
  Number,
  Union,
  Intersection,
  Boolean,
  Never,
  Any,
  Object: ObjectValidator,
  Optional,
  Array: ArrayValidator,
  Tuple
}