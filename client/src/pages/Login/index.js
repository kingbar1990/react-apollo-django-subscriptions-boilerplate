import React, { useState, useCallback } from "react";
import { graphql } from "react-apollo";

import { Container } from "reactstrap";
import { LoginForm } from "../../components/Forms/LoginForm";

import { login } from "../../queries";
import { saveData } from "../../utils";

import * as actions from "../../constants";
import * as path from "../../constants/routes";

const Login = props => {
  const [state] = useState({ error: "" });
  const login = useCallback((values, { setErrors }) => {
    const { username, password } = values;
    props
      .login({
        variables: {
          username: username,
          password: password
        }
      })
      .then(response => {
        if (!response.data.login.error) {
          const token = response.data.login.token;
          saveData(actions.TOKEN, token);
          window.location.href = `${actions.FRONTEND_URL}${path.ROOM}`
        } else {
          let errors = {};
          response.data.login.error.validationErrors.map(error => {
            if (error["field"] === "__all__") {
              errors["username"] = error["messages"].join(" ");
              errors["password"] = error["messages"].join(" ");
            } else {
              errors[error] = error["messages"];
            }
            return null;
          });
          setErrors(errors);
        }
      });
  });

  return (
    <Container>
      <LoginForm login={login} error={state.error} />
    </Container>
  );
};

export default graphql(login, { name: "login" })(Login);
