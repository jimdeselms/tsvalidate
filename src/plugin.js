const babel = require('@babel/core')
const t = require('@babel/types')
const { convertTypeAnnotation } = require('./convertTypeAnnotation')

const code = "const Type = require('.'); Type.tsValidate<number>(5)"

function myPlugin() {
    return {
        visitor: {
            CallExpression(path) {
                if (path.node?.callee?.object?.name === "Type" && path.node?.callee?.property?.name === "tsValidate") {
                    if (path.node.typeParameters?.params?.length === 1) {
                        const annotation = path.node.typeParameters.params[0]
                        const validator = convertTypeAnnotation(annotation)
                        const validatorCall = t.callExpression(validator, path.node.arguments)
                        path.node.arguments = [ validatorCall ]
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