import React from 'react';
import { Helmet } from 'react-helmet';
import { withStyles } from '@material-ui/core/styles';
import styles from '../../components/Forms/LoginForm/user-jss';
import RegisterForm from "../../components/Forms/LoginForm/registerForm";
import { graphql } from "react-apollo";
import { register } from "../../queries";
import {flowRight as compose} from "lodash";
import { saveData } from "../../utils";
import * as actions from "../../constants";
import * as path from "../../constants/routes";


const Register = (props) => {
    const submitForm = (values, {setErrors}) => {
        const { fullName, email, password1, password2 } = values;
        props
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
            props.history.push(path.ROOM);
            } else {
            let errors = {};
            response.data.register.error.validationErrors.map(
                error => (errors[error["field"]] = error["messages"].join(" "))
            );
            setErrors(errors);
            }
        });
    }

    const title = 'Register';
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
            <RegisterForm register={submitForm} />
        </div>
        </div>
    </div>
    );
}

export default compose(
    withStyles(styles),
    graphql(register, { name: "register" })
)(Register);
