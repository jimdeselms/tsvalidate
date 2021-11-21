const babel = require('@babel/core')
const t = require('@babel/types')
const { convertTypeAnnotation } = require('./convertTypeAnnotation')
const Type = require('.')

describe("convertTypeAnnotations", () => {
    it("string", async () => {
        const v = await buildValidatorForType("string")
        expectPass(v("hello"))
        expectFail(v(123))
    })

    it("number", async () => {
        const v = await buildValidatorForType("number")
        expectPass(v(50))
        expectFail(v('50'))
    })

    it("union", async () => {
        const v = await buildValidatorForType("number|string")
        expectPass(v(50))
        expectPass(v("hi"))
        expectFail(v(true))
    })

    it("array", async () => {
        const v = await buildValidatorForType("number[]")
        expectPass(v([]))
        expectPass(v([1]))
        expectPass(v([1,2]))
    })

    it("array builtin", async () => {
        const v = await buildValidatorForType("Array<number>")
        expectPass(v([]))
        expectPass(v([1]))
        expectPass(v([1,2]))
    })

    it("record builtin", async () => {
        const v = await buildValidatorForType("Record<string, number>")
        expectPass(v({ a: 5, b: 5 }))
        expectPass(v({}))
        expectFail(v({a: 1, b: "b"}))
        expectFail(v(true))
    })

    it("never", async () => {
        const v = await buildValidatorForType("never")
        expectFail(v(5))
    })
    it("any", async () => {
        const v = await buildValidatorForType("any")
        expectPass(v(5))
    })

    it("named", async () => {
        Type.registerType("Name", Type.String)
        const v = await buildValidatorForType("Name")
        expectPass(v("HELLO"))
    })

    it("type literal", async () => {
        const v = await buildValidatorForType("{ name: string, age: number }")
        expectPass(v({ name: 'fred', age: 4 }))
        expectPass(v({ age: 4, name: 'fred' }))

        expectFail(v({ name: 'fred' }))
        expectFail(v({ age: 20 }))
        expectFail(v({ name: 'fred', age: 'fred' }))
        expectFail(v(5))
    })

    it("type literal with optional member", async () => {
        const v = await buildValidatorForType("{ name?: string, age: number }")
        expectPass(v({ name: 'fred', age: 4 }))
        expectPass(v({ age: 4, name: 'fred' }))

        expectFail(v({ name: 'fred' }))
        expectPass(v({ age: 20 }))
        expectFail(v({ age: 'dave' }))
    })

    it("tuple type", async () => {
        const v = await buildValidatorForType("[number, string]")
        expectPass(v([5,"5"]))
        expectFail(v([5]))
        expectFail(v([5, 5]))
        expectFail(v(5))
    })

    it("constant", async () => {
        const v = await buildValidatorForType("5")
        expectPass(v(5))
        expectFail(v(6))
    })
})

async function buildValidatorForType(type) {
    let code = `let x: ${type};`

    const ast = await babel.parse(code, {
        filename: "myfile.ts",
        presets: ['@babel/preset-typescript']
    })

    const statement = ast.program.body[0]
    const id = statement.declarations[0].id
    
    const ast2 = convertTypeAnnotation(id.typeAnnotation.typeAnnotation)
    const result = babel.transformFromAstSync(t.program([t.expressionStatement(ast2)])).code

    return eval(result.slice(0,-1))
}

function expectPass(expr) {
    expect(expr.status).toBe("ok")
}

function expectFail(expr) {
    expect(expr.status).toBe("fail")
}