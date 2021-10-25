import { ValidationResult, Validator } from "./types"

const OK: ValidationResult = { status: "ok" }
const FAIL: ValidationResult = { status: "fail" }

export function String(val: any): ValidationResult {
  return (typeof(val) === "string") 
    ? OK
    : FAIL
}

export function Number(val: any): ValidationResult {
  return (typeof(val) === "number") 
    ? OK
    : FAIL
}

export function Boolean(val: any): ValidationResult {
  return (typeof(val) === "boolean") 
    ? OK
    : FAIL
}

function ObjectValidator(types: Record<string, Validator>): Validator {
  return (o: any) => validateObject(types, o)
}
export { ObjectValidator as Object }
function validateObject(types: Record<string, Validator>, o: any): ValidationResult {
  if (typeof(o) !== "object" || Array.isArray(o) || o === null) return FAIL

  for (const [key, validator] of Object.entries(types)) {
    if (validator(o[key]).status === "fail") {
      return FAIL
    }
  }

  return OK
}

function ArrayValidator(arrayType: Validator): Validator {
  return (o: any) => validateArray(arrayType, o)
}
export { ArrayValidator as Array }

function validateArray(arrayType: Validator, array: any): ValidationResult {
  if (!Array.isArray(array)) return FAIL

  if (array.every(a => arrayType(a).status === "ok")) {
    return OK
  }

  return FAIL
}

export function Union(...types: Validator[]): Validator {
  return (o: any) => validateUnion(types, o)
}
function validateUnion(types: Validator[], obj: any): ValidationResult {
  for (const validator of types) {
    if (validator(obj).status === "ok") {
      return OK
    }
  }
  return FAIL
}

export function Intersection(...types: Validator[]): Validator {
  return (o: any) => validateIntersection(types, o)
}
function validateIntersection(types: Validator[], obj: any): ValidationResult {
  for (const validator of types) {
    if (validator(obj).status === "fail") {
      return FAIL
    }
  }
  return OK
}

export function Optional(type: Validator): Validator {
  return (o: any) => validateOptional(type, o)
}
function validateOptional(type: Validator, o: any): ValidationResult {
  if (o === undefined) {
    return OK
  }

  return type(o)
}