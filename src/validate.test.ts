const Type = require('.')

describe("validate", () => {
    test("string", () => {
        pass(Type.String("string"))
        fail(Type.String(123))
    })

    test("number", () => {
        pass(Type.Number(123))
        fail(Type.Number("string"))
    })

    test("boolean", () => {
        pass(Type.Boolean(true))
        pass(Type.Boolean(false))
        fail(Type.Boolean("string"))
    })

    test("array", () => {
        const validate = Type.Array(Type.String)
        pass(validate([]))
        pass(validate(["a", "b"]))

        fail(validate({a: "hello"}))
        fail(validate([5]))
    })

    test("object", () => {
        const validate = Type.Object({
            name: Type.String,
            age: Type.Number
        })

        pass(validate({ name: "Jim", age: 52 }))

        fail(validate({ name: 123, age: 52 }))
        fail(validate({ name: "Jim", age: "52" }))
    })

    test("union", () => {
        const validate = Type.Union(Type.String, Type.Number)
        pass(validate(50))
        pass(validate("str"))

        fail(validate(true))

        const arrayOfUnion = Type.Array(Type.Union(Type.String, Type.Number))
        pass(arrayOfUnion([50, "hello"]))

        fail(arrayOfUnion([50, true]))
    })

    test("intersection", () => {
        const validate = Type.Intersection(Type.Array(Type.String), Type.Array(Type.Number))
        pass(validate([]))

        fail(validate([1]))
        fail(validate(["s"]))
        fail(validate([1, "s"]))
    })

    test("optional", () => {
        const optionalNumber = Type.Optional(Type.Number)
        pass(optionalNumber(0))
        pass(optionalNumber(undefined))

        fail(optionalNumber("x"))

        const objWithOptionalNumber = Type.Object({ age: optionalNumber })
        pass(objWithOptionalNumber({}))
        pass(objWithOptionalNumber({ age: 5 }))
        pass(objWithOptionalNumber({ somethingElse: "Howdy" }))

        fail(objWithOptionalNumber(null))
        fail(objWithOptionalNumber(undefined))
        fail(objWithOptionalNumber({ age: "a" }))
    })
})

function pass(expr: any): void {
    expect(expr.status).toBe("ok")
}

function fail(expr: any): void {
    expect(expr.status).toBe("fail")
}