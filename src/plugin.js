const babel = require('@babel/core')
const t = require('@babel/types')
const { convertTypeAnnotation } = require('./convertTypeAnnotation')

const code = "const Type = require('.'); type A = string; Type.tsValidate<A>(5);"

function instrumentTypeChecksPlugin() {
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
            },

            TSTypeAliasDeclaration(path) {
                const validator = convertTypeAnnotation(path.node.typeAnnotation)
                const id = path.node.id.name

                path.replaceWith(t.expressionStatement(
                        t.callExpression(
                            t.memberExpression(t.identifier("Type"), t.identifier("registerType")),
                            [
                                t.stringLiteral(id),
                                validator
                            ]
                        )
                    )
                )
                path.skip()
            }
        }
    }
}

module.exports = {
    instrumentTypeChecksPlugin
}