import React, { Fragment } from "react";
import { Query } from "react-apollo";

import NavBar from "../../components/NavBar";
import SideBar from "../../components/SideBar";
import Chat from "../../pages/Chat/index";
import { withAuth } from "../../hocs/PrivateRoute";
import { User } from "../../queries";

import "../../index.css";

const Main = props => (
  <Fragment>
    <NavBar />
    {props.children}
  </Fragment>
);

export default withAuth(Main);
