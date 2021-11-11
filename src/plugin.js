const babel = require('@babel/core')

const code = "tsValidate<number>(5)"

function myPlugin() {
    return {
        visitor: {
            CallExpression(path) {
                if (path.node?.callee?.name === "tsValidate") {
                    if (path.node.typeParameters?.params?.length === 1) {
                        const annotation = path.node.typeParameters.params[0]
                        console.log(annotation)
                    }
                }
            }
        }
    }
}

const output = babel.transformSync(code, {
    plugins: [ myPlugin ],
    filename: "myfile.ts",
    presets: ['@babel/preset-typescript']
})

console.log(output.code)