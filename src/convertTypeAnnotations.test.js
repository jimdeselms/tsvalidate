const babel = require('@babel/core')
const { convertTypeAnnotation } = require('./convertTypeAnnotation')

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
    it("never", async () => {
        const v = await buildValidatorForType("never")
        expectFail(v(5))
    })
    it("any", async () => {
        const v = await buildValidatorForType("any")
        expectPass(v(5))
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
    
    return convertTypeAnnotation(id.typeAnnotation.typeAnnotation)
}

async function expectPass(expr) {
    expect(expr.status).toBe("ok")
}

async function expectFail(expr) {
    expect(expr.status).toBe("fail")
}