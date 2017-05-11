const { makeExecutableSchema } = require('graphql-tools')

const JsonScalar = require('./scalars/Json')
const DateScalar = require('./scalars/Date')

const noop = { noop: 'Boolean' }

module.exports = (config) => {
  const { query, mutation, types = {}, scalars = {} } = config

  scalars.Json = scalars.Json || JsonScalar
  scalars.Date = scalars.Date || DateScalar

  let resolvers = {}
  let scalarSchema = ''
  for (let scalarKeyIndex in Object.keys(scalars)) {
    const scalarKey = Object.keys(scalars)[scalarKeyIndex]
    scalarSchema += `scalar ${scalarKey}
`
  }

  const topLevelSchema = `
${scalarSchema}
type Meta {
  # Healthcheck endpoint. Should return 200 immediately if we are healthy
  health: Int!

  # HTTP Request Headers
  headers: Json
  # Current time on server
  serverTime: Date
}

type Noop {
  noop: Boolean
}

schema {
  query: ${query ? 'RootQuery' : 'Noop'}
  mutation: ${mutation ? 'RootMutation' : 'Noop'}
}`
  let typeSchema = ''
  types.RootQuery = query || noop
  types.RootMutation = mutation || noop
  for (let typeKeyIndex in Object.keys(types)) {
    const typeKey = Object.keys(types)[typeKeyIndex]
    typeSchema += `type ${typeKey} {
`
    const type = types[typeKey]
    if (!type) continue
    for (let fieldKeyIndex in Object.keys(type)) {
      const fieldKey = Object.keys(type)[fieldKeyIndex]
      const field = type[fieldKey]
      if (!field) continue
      if (typeof field === 'string'){
        typeSchema += `
  ${fieldKey}: ${field}
`
        if(field.resolver && typeof field.resolver === 'function') {
          resolvers[typeKey] = resolvers[typeKey] || {}
          resolvers[typeKey][fieldKey] = field.resolver
        }
        continue
      }
      let fieldLine = `
  ${fieldKey}`
      if (field.params && Object.keys(field.params).length) {
        fieldLine += '('
        for (let paramKeyIndex in Object.keys(field.params)) {
          const paramKey = Object.keys(field.params)[paramKeyIndex]
          const param = field.params[paramKey]
          if (!param) continue
          fieldLine += `${paramKey}: ${param}`
          if(parseInt(paramKeyIndex, 10) !== (Object.keys(field.params).length - 1)) {
            fieldLine += ', '
          }
        }
        fieldLine += ')'
        if(field.resolver && typeof field.resolver === 'function') {
          resolvers[typeKey] = resolvers[typeKey] || {}
          resolvers[typeKey][fieldKey] = field.resolver
        }
      }
      fieldLine += `: ${field.type}`
      typeSchema += `${fieldLine}
`
    }
    typeSchema += `
}
`
  }
  resolvers = Object.assign({}, scalars, resolvers)
  const typeDefs = [topLevelSchema, typeSchema]
  const schemaConfig = { typeDefs, resolvers }
  console.log(schemaConfig)
  const schema = makeExecutableSchema(schemaConfig)
  return { typeDefs, resolvers, schema }
  // build resolvers
}
