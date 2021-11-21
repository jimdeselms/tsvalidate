const { types: t } = require('@babel/core')
const { declare } = require("@babel/helper-plugin-utils")

const { convertTypeAnnotation } = require('./convertTypeAnnotation')

const VALIDATE_TS_PACKAGE = "@jimdeselms/validate-ts"

const instrumentTypeChecksPlugin = ((api, options) => {
    api.assertVersion(7)

    return {
        name: "validate-ts",
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

                replaceWithCallToRegisterType(t, path, id, validator)
            },

            TSInterfaceDeclaration(path) {
                const validator = convertTypeAnnotation(path.node)
                const id = path.node.id.name

                replaceWithCallToRegisterType(t, path, id, validator)
            },

            ClassDeclaration(path) {
                const validator = convertTypeAnnotation(path.node)
                const id = path.node.id.name

                replaceWithCallToRegisterType(t, path, id, validator)
            }
        }
    }
})

function replaceWithCallToRegisterType(t, path, id, validator) {
    const callee = t.callExpression(t.identifier('require'), [t.stringLiteral(VALIDATE_TS_PACKAGE)])

    path.replaceWith(t.expressionStatement(
        t.callExpression(
            t.memberExpression(callee, t.identifier("registerType")),
                [
                    t.stringLiteral(id),
                    validator
                ]
            )
        )
    )
    path.skip()
}

module.exports = {
    instrumentTypeChecksPlugin
}