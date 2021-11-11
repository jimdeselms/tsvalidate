const babel = require('@babel/core')

const code = "typetest<string>('hi')"

function myPlugin() {
    return {
        visitor: {
            Identifier(path) {
                path.node.name = path.node.name + "1"
            },
            CallExpression(path) {
                let i = 0
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