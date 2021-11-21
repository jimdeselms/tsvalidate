const babel = require('@babel/core')
const { convertTypeAnnotation } = require('./convertTypeAnnotation')

const code = "const Type = require('.'); type A = string; Type.tsValidate<A>(5);"

function instrumentTypeChecksPlugin(opts) {
    const t = opts.types 
    return new opts.Plugin('check-ts-types', {
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
    })
}

function replaceWithCallToRegisterType(t, path, id, validator) {
    const callee = t.callExpression(t.identifier('require'), [t.stringLiteral('.')])

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