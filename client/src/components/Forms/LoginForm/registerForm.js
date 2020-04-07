import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { Formik, Form, Field } from "formik";
import { TextField } from 'formik-material-ui';
import { Checkbox } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ArrowForward from '@material-ui/icons/ArrowForward';
import AllInclusive from '@material-ui/icons/AllInclusive';
import Brightness5 from '@material-ui/icons/Brightness5';
import People from '@material-ui/icons/People';
import Icon from '@material-ui/core/Icon';
import Hidden from '@material-ui/core/Hidden';
import styles from './user-jss';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import { SignupSchema } from "./registerValidation";

// validation functions
const required = value => (value === null ? 'Required' : undefined);
const email = value => (
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? 'Invalid email'
    : undefined
);

const passwordsMatch = (value, allValues) => {
  if (value !== allValues.get('password')) {
    return 'Passwords dont match';
  }
  return undefined;
};

const LinkBtn = React.forwardRef(function LinkBtn(props, ref) { // eslint-disable-line
  return <NavLink to={props.to} {...props} innerRef={ref} />; // eslint-disable-line
});


const RegisterForm = (props) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = event => {
        event.preventDefault();
    };

    const {
    classes,
    handleSubmit,
    pristine,
    submitting,
    deco,
    register
    } = props;

    return (
    <Fragment>
        <Hidden mdUp>
        <NavLink to="/" className={classNames(classes.brand, classes.outer)}>
        </NavLink>
        </Hidden>
        <Paper className={classNames(classes.paperWrap, deco && classes.petal)}>
        <Hidden smDown>
            <div className={classes.topBar}>
            <NavLink to="/" className={classes.brand}>
            </NavLink>
            <Button size="small" className={classes.buttonLink} component={LinkBtn} to="/login">
                <ArrowForwardIcon className='mr-2'/> 
                Already have account ?
            </Button>
            </div>
        </Hidden>
        <Typography variant="h4" className={classes.title} gutterBottom>
            Register
        </Typography>
        <Typography variant="caption" className={classes.subtitle} gutterBottom align="center">
            Lorem ipsum dolor sit amet
        </Typography>
        <section className={classes.formWrap}>
            <Formik
            initialValues={{
                fullName: "",
                email: "",
                password1: "",
                password2: ""
            }}
            validationSchema={SignupSchema}
            onSubmit={register}
            >
                {() => (
                    <Form>
                        <div>
                        <FormControl className={classes.formControl}>
                            <Field
                            name="fullName"
                            component={TextField}
                            placeholder="Username"
                            label="Username"
                            required
                            className={classes.field}
                            />
                        </FormControl>
                        </div>
                        <div>
                        <FormControl className={classes.formControl}>
                            <Field
                            name="email"
                            component={TextField}
                            placeholder="Your Email"
                            label="Your Email"
                            required
                            validate={[required, email]}
                            className={classes.field}
                            />
                        </FormControl>
                        </div>
                        <div>
                        <FormControl className={classes.formControl}>
                            <Field
                            name="password1"
                            component={TextField}
                            type="password"
                            label="Your Password"
                            required
                            validate={[required, passwordsMatch]}
                            className={classes.field}
                            />
                        </FormControl>
                        </div>
                        <div>
                        <FormControl className={classes.formControl}>
                            <Field
                            name="password2"
                            component={TextField}
                            type="password"
                            label="Re-type Password"
                            required
                            validate={[required, passwordsMatch]}
                            className={classes.field}
                            />
                        </FormControl>
                        </div>
                        <div className={classes.btnArea}>
                        <Button variant="contained" color="primary" type="submit">
                            Continue
                            <ArrowForward className={classNames(classes.rightIcon, classes.iconSmall)} disabled={submitting || pristine} />
                        </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </section>
        </Paper>
    </Fragment>
    );
}

RegisterForm.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  deco: PropTypes.bool.isRequired,
};

export default withStyles(styles)(RegisterForm);
