const t = require('@babel/types')
const babel = require('@babel/core')
const Type = require('.')

function convertTypeAnnotation(annotation) {
    const expr = buildExpr(annotation)
    return expr
}

function buildExpr(annotation) {
    switch(annotation.type) {
        case "TSStringKeyword": {
            const node = t.memberExpression(t.identifier("Type"), t.identifier("String"))
            return node
        }
        case "TSNumberKeyword": {
            const node = t.memberExpression(t.identifier("Type"), t.identifier("Number"))
            return node
        }
        case "TSUnionType": {
            return t.callExpression(
                t.memberExpression(t.identifier("Type"), t.identifier("Union")),
                annotation.types.map(buildExpr)
            )
        }
        case "TSArrayType": {
            return t.callExpression(
                t.memberExpression(t.identifier("Type"), t.identifier("Array")),
                [ buildExpr(annotation.elementType) ]
            )
        }
        case "TSTupleType": {
            return t.callExpression(
                t.memberExpression(t.identifier("Type"), t.identifier("Tuple")),
                annotation.elementTypes.map(buildExpr)
            )
        }
        case "TSLiteralType": {
            const literalValue = annotation.literal.value
            let literalType
            switch (typeof(literalValue)) {
                case "string": literalType = t.stringLiteral(literalValue); break
                case "number": literalType = t.numericLiteral(literalValue); break
                case "boolean": literalType = t.booleanLiteral(literalValue); break
                case "bigint": literalType = t.bigIntLiteral(literalValue); break
                default: throw new Error("Unknown literal type " + typeof(literalValue))
            }

            return t.callExpression(
                t.memberExpression(t.identifier("Type"), t.identifier("Literal")),
                [ literalType ]
            )
        }
        case "TSNeverKeyword": {
            const node = t.memberExpression(t.identifier("Type"), t.identifier("Never"))
            return node
        }
        case "TSAnyKeyword": {
            const node = t.memberExpression(t.identifier("Type"), t.identifier("Any"))
            return node
        }
        case "TSTypeReference": {
            const typeParameters = (annotation.typeParameters?.params || [])
                .map(buildExpr)

            return t.callExpression(
                t.memberExpression(t.identifier("Type"), t.identifier("Named")),
                [ t.stringLiteral(annotation.typeName.name ?? annotation.typeName.value), t.arrayExpression(typeParameters) ]
            )
        }
        case "TSTypeLiteral": {
            const properties = []

            for (const node of annotation.members) {
                const innerValidator = buildExpr(node.typeAnnotation.typeAnnotation)
                const property = node.optional
                    ? t.callExpression(
                        t.memberExpression(t.identifier("Type"), t.identifier("Optional")),
                        [ innerValidator ]
                      )
                    : innerValidator
                properties.push(t.objectProperty(t.stringLiteral(node.key.name), property))
            }

            return t.callExpression(
                t.memberExpression(t.identifier("Type"), t.identifier("Object")),
                [ t.objectExpression(properties) ]
            )
        }
        case "TSInterfaceDeclaration": {
            const properties = []

            for (const node of annotation.body.body) {
                const innerValidator = buildExpr(node.typeAnnotation.typeAnnotation)
                const property = node.optional
                    ? t.callExpression(
                        t.memberExpression(t.identifier("Type"), t.identifier("Optional")),
                        [ innerValidator ]
                      )
                    : innerValidator
                properties.push(t.objectProperty(t.stringLiteral(node.key.name), property))
            }

            return t.callExpression(
                t.memberExpression(t.identifier("Type"), t.identifier("Object")),
                [ t.objectExpression(properties) ]
            )
        }
        case "ClassDeclaration": {
            const properties = []

            for (const node of annotation.body.body) {
                const innerValidator = buildExpr(node.typeAnnotation.typeAnnotation)
                const property = node.optional
                    ? t.callExpression(
                        t.memberExpression(t.identifier("Type"), t.identifier("Optional")),
                        [ innerValidator ]
                      )
                    : innerValidator
                properties.push(t.objectProperty(t.stringLiteral(node.key.name), property))
            }

            return t.callExpression(
                t.memberExpression(t.identifier("Type"), t.identifier("Object")),
                [ t.objectExpression(properties) ]
            )
        }
        default: {
            throw new Error("Unknown annotation type " + annotation?.type)
        }
    }
}

function toCode(expr) {
    const result = babel.transformFromAstSync(t.program([t.expressionStatement(expr)]))
    return result.code.slice(0, -1)
}

module.exports = {
    convertTypeAnnotation
}