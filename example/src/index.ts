const Type = require('@jimdeselms/validate-ts')

interface Person {
    name: string
    age: number
}
Type.tsValidate<Person>({ name: "Jim", age: 51 })

class JSONSafe {
    parse<T>(s: string): T {
        const obj = JSON.parse(s)
        Type.tsValidate<number>(obj)
        return obj
    }
}

