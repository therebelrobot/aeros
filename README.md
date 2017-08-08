# Aeros
Simplified GraphQL Schema generation, built on [`graphql-tools`](https://github.com/apollographql/graphql-tools)

## Overview

**Aeros** simplifies GraphQL schemas by colocating schema definition and resolvers in a single, lintable and testable, js file. This allows you to build and scale GraphQL schemas as you would the resources they talk to, without having to worry that your schemas and your resolvers aren't matching somewhere.

## Quickstart

All you need are two files: `schema.js` (the Aeros implementation) and `index.js` (in this example, a graphql-server-micro installation)

```bash
// install aeros
npm i -s aeros

// install supporting libraries for quickstart
npm i -s graphql-server-micro micro microrouter
```

```js
// schema.js
const Aeros = require('aeros')

const query = {
  user: {
    type: 'User',
    params: {
      id: 'String'
    },
    resolver: (_, { id }, ctx) => {
      return { id, email: 'janedoe@example.com', name: 'Jane Doe' }
    }
  }
}

const types = {
  User: {
    id: 'String!',
    email: 'String',
    name: 'String',
    address: {
      type: 'String',
      resolver: (user, _, ctx) => {
        return '350 Awesome St. Exampleville, CA'
      }
    }
  }
}

module.exports = Aeros({ query, types }).schema
```

```js
// index.js - taken from graphql-server-micro
const { microGraphiql, microGraphql } = require("graphql-server-micro")
const micro = require("micro")
const { send } = micro
const { get, post, router } = require("microrouter")
const schema = require("./schema")
 
const graphqlHandler = microGraphql({ schema });
const graphiqlHandler = microGraphiql({ endpointURL: "/graphql" });
 
const server = micro(
  router(
    get("/graphql", graphqlHandler),
    post("/graphql", graphqlHandler),
    get("/graphiql", graphiqlHandler),
    (req, res) => send(res, 404, "not found"),
  ),
);
 
server.listen(3000);
```

You should see a working graphiql interface on http://localhost:3000/graphiql.

## API Documentation

## Tutorials and Walkthroughs (for prototypical projects)

## Demos

## License

[MIT](https://tldrlegal.com/license/mit-license)
