const { tsRestType } = require('@babel/types')
const Type = require('.')

function convertTypeAnnotation(annotation) {
    switch(annotation.type) {
        case "TSStringKeyword":
            return Type.String
        case "TSNumberKeyword":
            return Type.Number
        case "TSUnionType":
            return Type.Union(...annotation.types.map(convertTypeAnnotation))
        case "TSArrayType":
            return Type.Array(convertTypeAnnotation(annotation.elementType))
        case "TSNeverKeyword":
            return Type.Never
        case "TSAnyKeyword":
            return Type.Any
        case "TSTypeReference":
            return Type.Named(annotation.typeName.name)
        case "TSTypeLiteral":
            const typeObj = {}
            for (const node of annotation.members) {
                const innerValidator = convertTypeAnnotation(node.typeAnnotation.typeAnnotation)
                typeObj[node.key.name] = node.optional
                    ? Type.Optional(innerValidator)
                    : innerValidator
            }
            return Type.Object(typeObj)
        default:
            throw new Error("Unknown annotation type " + annotation?.type)
    }
}

module.exports = {
    convertTypeAnnotation
}