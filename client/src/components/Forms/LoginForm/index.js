import React from "react";
import { Formik, Form, Field } from "formik";
import { Button, MDBCard, MDBCol } from "mdbreact";
import { ReactstrapInput } from "reactstrap-formik";
import { Link } from "react-router-dom";

import { LoginSchema } from "./validation";

export const LoginForm = ({ login }) => (
  <MDBCol
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh"
    }}
  >
    <MDBCard style={{ width: "22rem" }}>
      <Formik
        initialValues={{
          username: "",
          password: ""
        }}
        validationSchema={LoginSchema}
        onSubmit={login}
      >
        {() => (
          <div className="card">
            <div className="card-header">Login</div>
            <div className="card-body">
              <Form>
                <Field
                  name="username"
                  type="email"
                  component={ReactstrapInput}
                  label="Email"
                />
                <Field
                  name="password"
                  type="password"
                  component={ReactstrapInput}
                  label="Password"
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    margin: "15px auto 15px auto"
                  }}
                >
                  <Button type="submit">Login</Button>
                </div>
                <div
                  className="center"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    margin: "15px auto 15px auto"
                  }}
                >
                  <span>Don't have account? </span>
                  <Link to="/signup" style={{ color: "blue" }}>
                    Sign up!
                  </Link>
                </div>
              </Form>
            </div>
          </div>
        )}
      </Formik>
    </MDBCard>
  </MDBCol>
);
