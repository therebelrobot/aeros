import { Kind } from 'graphql/language'

function parseJsonLiteral (ast) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value)
    case Kind.OBJECT: {
      const value = Object.create(null)
      ast.fields.forEach(field => {
        value[field.name.value] = parseJsonLiteral(field.value)
      })
      return value
    }
    case Kind.LIST:
      return ast.values.map(parseJsonLiteral)
    default:
      return null
  }
}

export default {
  __parseLiteral: parseJsonLiteral,
  __serialize: (value) => value,
  __parseValue: (value) => value
}
