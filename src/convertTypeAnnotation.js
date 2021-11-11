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
        default:
            throw new Error("Unknown annotation type " + annotation?.type)
    }
}

module.exports = {
    convertTypeAnnotation
}