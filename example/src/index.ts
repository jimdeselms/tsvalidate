const Type = require('@jimdeselms/validate-ts')

interface Person {
    name: string
    age: number
}
Type.tsValidate<Person>({ name: "Jim", age: "51" })