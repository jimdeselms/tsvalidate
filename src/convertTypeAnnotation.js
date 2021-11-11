const Type = require('.')

function convertTypeAnnotation(annotation) {
    switch(annotation.type) {
        case "TSStringKeyword":
            return Type.String
        case "TSNumberKeyword":
            return Type.Number
        default:
            throw new Error("Unknown annotation type " + annotation?.type)
    }
}

module.exports = {
    convertTypeAnnotation
}