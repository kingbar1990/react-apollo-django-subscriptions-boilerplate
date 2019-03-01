import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import { MDBContainer } from 'mdbreact'

import * as actions from '../../constants'
import * as path from '../../constants/routes'

import { LoginForm } from '../../components/Forms/LoginForm'
import { login } from '../../queries'
import { saveData } from '../../utils'

class Login extends Component {
  constructor() {
    super()
    this.state = {
      username: '',
      password: '',
      error: ''
    }
  }

  handleInput = e => this.setState({ [e.target.id]: e.target.value })

  login = (values, { setErrors }) => {
    const { username, password } = values
    this.props
      .login({
        variables: {
          username: username,
          password: password
        }
      })
      .then(response => {
        if (!response.data.login.error) {
          const token = response.data.login.token

          saveData(actions.TOKEN, token)
          this.props.history.push(path.DASHBOARD)
        } else {
          let errors = {}
          response.data.login.error.validationErrors.map(error => {
            if (error['field'] === '__all__') {
              errors['username'] = error['messages'].join(' ')
              errors['password'] = error['messages'].join(' ')
            } else {
              errors[error] = error['messages']
            }
            return null
          })
          setErrors(errors)
        }
      })
  }

  render() {
    return (
      <MDBContainer>
        <LoginForm
          handleInput={this.handleInput}
          login={this.login}
          error={this.state.error}
        />
      </MDBContainer>
    )
  }
}

export default graphql(login, { name: 'login' })(Login)
