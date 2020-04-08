import React, { Fragment, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { Formik, Form, Field } from "formik";
import Button from '@material-ui/core/Button';
import { NavLink } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ArrowForward from '@material-ui/icons/ArrowForward';
import Paper from '@material-ui/core/Paper';
import Hidden from '@material-ui/core/Hidden';
import { Checkbox } from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import styles from './user-jss';
import { ContentDivider } from '../../Divider/index';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

const LinkBtn = React.forwardRef(function LinkBtn(props, ref) { // eslint-disable-line
  return <NavLink to={props.to} {...props} innerRef={ref} />; // eslint-disable-line
});

// eslint-disable-next-line
const LoginForm = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(true);
  };

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

    const {
      classes,
      pristine,
      submitting,
      deco,
      login
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
              <Button size="small" className={classes.buttonLink} component={LinkBtn} to="/register">
                <ArrowForwardIcon className='mr-2'/> 
                Create new account
              </Button>
            </div>
          </Hidden>
          <Typography variant="h4" className={classes.title} gutterBottom>
            Sign In
          </Typography>
          <Typography variant="caption" className={classes.subtitle} gutterBottom align="center">
            Lorem ipsum dolor sit amet
          </Typography>
          <section className={classes.socmedLogin}>
            
            <ContentDivider content="Or sign in with email" />
          </section>
          <section className={classes.formWrap}>
            <Formik 
            initialValues ={{
              username: "",
              password: ""
            }}
            onSubmit={login}
            >
              {() => (
                  <Form>
                    <div>
                      <FormControl className={classes.formControl}>
                      <Field
                          name="username"
                          component={TextField}
                          placeholder="Your Email"
                          label="Your Email"
                          required
                          className={classes.field}
                        />
                      </FormControl>
                    </div>
                    <div>
                      <FormControl className={classes.formControl}>
                        <Field
                          name="password"
                          component={TextField}
                          type={showPassword ? 'text' : 'password'}
                          label="Your Password"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="Toggle password visibility"
                                  onClick={handleClickShowPassword}
                                  onMouseDown={handleMouseDownPassword}
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                          required
                          className={classes.field}
                        />
                      </FormControl>
                    </div>
                    <div className={classes.optArea}>
                      <FormControlLabel className={classes.label} control={<Field name="checkbox" component={Checkbox} />} label="Remember" />
                    </div>
                    <div className={classes.btnArea}>
                      <Button variant="contained" color="primary" size="large" type="submit">
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

export default withStyles(styles)(LoginForm);
