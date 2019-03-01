import React, { Component } from 'react'
import { graphql } from 'react-apollo'

import * as actions from '../constants'
import { verifyToken } from '../queries'

export const withAuth = ProtectedRoute => {
  class PrivateRoute extends Component {
    async componentWillMount() {
      try {
        const token = JSON.parse(window.localStorage.getItem('token')).token
        const auth = await this.props.authorization({
          variables: {
            token: token
          }
        })
        return auth
      } catch (error) {
        window.localStorage.removeItem(actions.TOKEN)
        return this.props.history.push('/login')
      }
    }
    render() {
      return <ProtectedRoute {...this.props} />
    }
  }
  return graphql(verifyToken, {
    name: 'authorization'
  })(PrivateRoute)
}
