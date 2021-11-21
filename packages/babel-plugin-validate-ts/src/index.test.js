const babel = require('@babel/core')
const { instrumentTypeChecksPlugin } = require('.')

describe("plugin", () => {
    it("simple non-named validations", () => {
       expectPass("Type.tsValidate<number>(5)")
       expectFail("Type.tsValidate<number>('a')")
    })

    it("understands type aliases", () => {
        expectPass("type A = string; Type.tsValidate<A>('hi')")
        expectFail("type A = 5; Type.tsValidate<A>(6)")
    })

    it("understands interfaces", () => {
        expectPass("interface A { name: string }; Type.tsValidate<A>({ name: 'jim' })")
        expectFail("interface A { name: string }; Type.tsValidate<A>({ nam: 'fred' })")
    })

    it("understands classes", () => {
        expectPass("class A { name: string; age?: number }; Type.tsValidate<A>({ name: 'jim' })")
        expectFail("class A { name: string }; Type.tsValidate<A>({ nam: 'fred' })")
    })
})

function expectPass(code) {
    runCode(code)
}

function expectFail(code) {
     try {
         runCode(code)
     } catch(err) {
         return
     }

     throw new Error("Expected expression to fail")
}

function runCode(code) {
    const output = babel.transformSync("const Type=require('@jimdeselms/validate-ts');" + code, {
        plugins: [ instrumentTypeChecksPlugin ],
        filename: "myfile.ts",
        presets: ['@babel/preset-typescript']
    })
    
    eval(output.code)
}