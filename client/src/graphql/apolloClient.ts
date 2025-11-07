import { ApolloClient, InMemoryCache, createHttpLink, split, ApolloLink, Observable } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getMainDefinition } from '@apollo/client/utilities'
import { SubscriptionClient } from 'subscriptions-transport-ws'

// HTTP link для queries и mutations
const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
})

// WebSocket link для subscriptions (используем subscriptions-transport-ws для совместимости с Apollo Server v3)
const wsClient = new SubscriptionClient('ws://localhost:3000/graphql', {
  reconnect: true,
  connectionParams: () => {
    const token = localStorage.getItem('accessToken')
    return {
      authorization: token ? `Bearer ${token}` : '',
    }
  },
})

// Создаем WebSocket link для Apollo Client v4
const wsLink = new ApolloLink((operation) => {
  return new Observable((observer) => {
    const subscription = wsClient.request(operation).subscribe({
      next: (data) => observer.next(data),
      error: (err) => {
        observer.error(err)
      },
      complete: () => observer.complete(),
    })
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  })
})

// Auth link для добавления токена в заголовки
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('accessToken')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

// Split link: WebSocket для subscriptions, HTTP для остального
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink)
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})
