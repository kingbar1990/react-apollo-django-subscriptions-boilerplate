import React, { Component } from "react";
import { graphql } from "react-apollo";
import { MDBContainer } from "mdbreact";

import * as actions from "../../constants";
import * as path from "../../constants/routes";

import { SignUpForm } from "../../components/Forms/SignUpForm";
import { register } from "../../queries";
import { saveData } from "../../utils";

class SignUp extends Component {
  constructor() {
    super();
    this.state = {
      fullName: "",
      email: "",
      password1: "",
      password2: "",
      error: ""
    };
  }

  handleInput = e => this.setState({ [e.target.id]: e.target.value });

  register = (values, { setErrors }) => {
    const { fullName, email, password1, password2 } = values;
    this.props
      .register({
        variables: {
          fullName: fullName,
          email: email,
          password1: password1,
          password2: password2
        }
      })
      .then(response => {
        if (response.data.register.success) {
          const token = response.data.register.token;

          saveData(actions.TOKEN, token);
          this.props.history.push(path.DASHBOARD);
        } else {
          let errors = {};
          response.data.register.error.validationErrors.map(
            error => (errors[error["field"]] = error["messages"].join(" "))
          );
          setErrors(errors);
        }
      });
  };

  render() {
    return (
      <MDBContainer>
        <SignUpForm
          handleInput={this.handleInput}
          register={this.register}
          error={this.state.error}
        />
      </MDBContainer>
    );
  }
}

export default graphql(register, { name: "register" })(SignUp);
