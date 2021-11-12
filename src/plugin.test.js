const babel = require('@babel/core')
const { instrumentTypeChecksPlugin } = require('./plugin')

describe("plugin", () => {
    it("simple non-named validations", () => {
        expectPass("Type.tsValidate<number>(5)")
        expectFail("Type.tsValidate<number>('a')")
    })

    it("understands type aliases", () => {
        expectPass("type A = string; Type.tsValidate<A>('hi')")
        expectFail("type A = 5; Type.tsValidate<A>(6)")
    })
})

function expectPass(code) {
    runCode(code)
}

function expectFail(code) {
    try {
        runCode(code)
    } catch {
        return
    }

    throw new Error("Expected expression to fail")
}

function runCode(code) {
    const output = babel.transformSync(`const Type = require('.'); ${code}`, {
        plugins: [ instrumentTypeChecksPlugin ],
        filename: "myfile.ts",
        presets: ['@babel/preset-typescript']
    })
    
    eval(output.code)
}