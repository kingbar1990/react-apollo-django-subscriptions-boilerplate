import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient } from 'apollo-client'
import { BrowserRouter } from 'react-router-dom'
import { HttpLink, createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider } from 'react-apollo'
import { setContext } from 'apollo-link-context'
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

import 'bootstrap-css-only/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'

import App from './App'
import { TOKEN } from './constants'
import './index.css'
import * as serviceWorker from './serviceWorker'

const cache = new InMemoryCache()

const httpLink = new createHttpLink({
  uri: 'http://localhost:8000/graphql/'
})

const token = localStorage.getItem('token') ? JSON.parse(localStorage.getItem('token')).token : ''
if (token){
  document.cookie = 'authorization=' + token + ';' 
}
else {
  document.cookie = 'authorization=' + '';
}

const wsLink = new WebSocketLink({
  uri: `ws://localhost:8000/subscriptions?token=СЮДОЙ ТОКЕН`,
  options: {
    reconnect: true,
    connectionParams: () => {
      return {
        authToken: token
      }
    }
  }
})


const authLink = setContext((_, { headers }) => {
  let data = ''
  try {
    const token = localStorage.getItem(TOKEN);
    data = token ? JSON.parse(token).token : ''
  } catch (error) {}
  return {
    headers: {
      ...headers,
      Authorization: `Bearer ${data}`
    }
  }
})

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink)
)

const client = new ApolloClient({
  cache,
  link
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('root')
)

serviceWorker.register()
