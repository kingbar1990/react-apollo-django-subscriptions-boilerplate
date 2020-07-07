import React, { Fragment } from "react";

import NavBar from "../../components/NavBar";
import { withAuth } from "../../hocs/PrivateRoute";

import "../../index.css";

const Main = props => (
  <Fragment>
    <NavBar />
      {props.children}
  </Fragment>
);

export default withAuth(Main);
