const Type = require('.')

describe("validate", () => {
    test("string", () => {
        expectPass(Type.String("string"))
        expectFail(Type.String(123))
    })

    test("number", () => {
        expectPass(Type.Number(123))
        expectFail(Type.Number("string"))
    })

    test("boolean", () => {
        expectPass(Type.Boolean(true))
        expectPass(Type.Boolean(false))
        expectFail(Type.Boolean("string"))
    })

    test("array", () => {
        const validate = Type.Array(Type.String)
        expectPass(validate([]))
        expectPass(validate(["a", "b"]))

        expectFail(validate({a: "hello"}))
        expectFail(validate([5]))
    })

    test("object", () => {
        const validate = Type.Object({
            name: Type.String,
            age: Type.Number
        })

        expectPass(validate({ name: "Jim", age: 52 }))

        expectFail(validate({ name: 123, age: 52 }))
        expectFail(validate({ name: "Jim", age: "52" }))
    })

    test("partial", () => {
        const validate = Type.Partial({
            name: Type.String,
            age: Type.Number
        })

        expectPass(validate({ name: "Jim" }))
        expectFail(validate({ name: "Jim", age: "hello" }))
    })

    test("required", () => {
        const validate = Type.Required({
            name: Type.Optional(Type.String),
            age: Type.Optional(Type.Number)
        })

        expectPass(validate({ name: "Jim", age: 20 }))
        expectFail(validate({ name: "Jim" }))
    })

    test("union", () => {
        const validate = Type.Union(Type.String, Type.Number)
        expectPass(validate(50))
        expectPass(validate("str"))

        expectFail(validate(true))

        const arrayOfUnion = Type.Array(Type.Union(Type.String, Type.Number))
        expectPass(arrayOfUnion([50, "hello"]))

        expectFail(arrayOfUnion([50, true]))
    })

    test("intersection", () => {
        const validate = Type.Intersection(Type.Array(Type.String), Type.Array(Type.Number))
        expectPass(validate([]))

        expectFail(validate([1]))
        expectFail(validate(["s"]))
        expectFail(validate([1, "s"]))
    })

    test("named", () => {
        Type.registerType("Name", Type.String)
        const validate = Type.Named("Name")
        expectPass(validate("Jim"))
        expectFail(validate(50))

        const badValidator = Type.Named("Unknown")
        expectFail(badValidator(0))
    })

    test("optional", () => {
        const optionalNumber = Type.Optional(Type.Number)
        expectPass(optionalNumber(0))
        expectPass(optionalNumber(undefined))

        expectFail(optionalNumber("x"))

        const objWithOptionalNumber = Type.Object({ age: optionalNumber })
        expectPass(objWithOptionalNumber({}))
        expectPass(objWithOptionalNumber({ age: 5 }))
        expectPass(objWithOptionalNumber({ somethingElse: "Howdy" }))

        expectFail(objWithOptionalNumber(null))
        expectFail(objWithOptionalNumber(undefined))
        expectFail(objWithOptionalNumber({ age: "a" }))
    })
})

function expectPass(expr) {
    expect(expr.status).toBe("ok")
}

function expectFail(expr) {
    expect(expr.status).toBe("fail")
}