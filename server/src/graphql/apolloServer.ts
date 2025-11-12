import { ApolloServer } from 'apollo-server-express'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import { createContext } from './context'

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

export const createApolloServer = (): ApolloServer => {
  return new ApolloServer({
    schema,
    context: createContext,
    formatError: (error) => {
      const status = (error.extensions?.exception as any)?.status || (error.extensions as any)?.status || 500
      return {
        message: error.message,
        extensions: {
          status,
        },
      }
    },
  })
}

export { schema }

