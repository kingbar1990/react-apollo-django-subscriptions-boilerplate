import React, { useCallback } from 'react';
import { saveData } from "../../utils";
import {flowRight as compose} from "lodash";
import { graphql } from "react-apollo";
import { login } from "../../queries";

import * as actions from "../../constants";
import * as path from "../../constants/routes";
import { Helmet } from 'react-helmet';
import { withStyles } from '@material-ui/core/styles';
import LoginForm from '../../components/Forms/LoginForm/loginForm';
import styles from '../../components/Forms/LoginForm/user-jss';

const Login = (props) => {

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
        }
      });
  });

    const title = 'Login';
    const description = 'Description';
    const { classes } = props;
    return (
      <div className={classes.root} style={{minHeight: "100vh"}}>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="twitter:title" content={title} />
          <meta property="twitter:description" content={description} />
        </Helmet>
        <div className={classes.container}>
          <div className={classes.userFormWrap}>
            <LoginForm login={login} />
          </div>
        </div>
      </div>
    );
}


export default compose(
  withStyles(styles),
  graphql(login, { name: "login" })
)(Login);
