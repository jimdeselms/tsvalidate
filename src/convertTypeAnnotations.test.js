const babel = require('@babel/core')
const { convertTypeAnnotation } = require('./convertTypeAnnotation')

describe("convertTypeAnnotations", () => {
    it("string", async () => {
        const stringValidator = await buildValidatorForType("string")
        expectPass(stringValidator("hello"))
        expectFail(stringValidator(123))
    })

    it("number", async () => {
        const numberValidator = await buildValidatorForType("number")
        expectPass(numberValidator(50))
        expectFail(numberValidator('50'))
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