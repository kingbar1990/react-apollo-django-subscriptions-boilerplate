import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { MDBContainer } from 'mdbreact'

import * as path from '../../constants/routes'
import { islogin } from '../../actions'

import { LoginForm } from '../../components/Forms/LoginForm'
import { login } from '../../queries'

class Login extends Component {
  constructor() {
    super()
    this.state = {
      username: '',
      password: '',
      error: ''
    }
  }

  handleInput = e => {
    this.setState({ [e.target.id]: e.target.value })
  }

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

          this.props.islogin(token, true)
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

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      islogin
    },
    dispatch
  )

export default compose(
  connect(
    null,
    mapDispatchToProps
  ),
  graphql(login, { name: 'login' })
)(Login)
