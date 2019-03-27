import React, { lazy, Suspense } from "react";
import { withRouter, Switch, Route } from "react-router";

import * as path from "./constants/routes";

import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Main from "./components/Main";
import Loader from "./components/Loader";

const Room = lazy(() => import("./pages/Room"));
const Profile = lazy(() => import("./pages/Profile"));
const ConfirmEmail = lazy(() => import("./pages/ConfirmEmail"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

const App = props => (
  <Switch>
    <Route exact path={path.HOME} component={Login} />
    <Route exact path={path.SIGN_UP} component={SignUp} />
    <Route exact path={path.SIGN_IN} component={Login} />
    <Main {...props}>
      <Suspense fallback={<Loader />}>
        <Route
          exact
          path={path.DASHBOARD}
          render={props => <Dashboard {...props} />}
        />
        <Route exact path={path.ROOM} render={props => <Room {...props} />} />
        <Route path={path.PROFILE} render={props => <Profile {...props} />} />
        <Route
          path={path.CONFIRM_EMAIL}
          render={props => <ConfirmEmail {...props} />}
        />
        <Route
          path={path.RESET_PASSWORD}
          render={props => <ResetPassword {...props} />}
        />
      </Suspense>
    </Main>
  </Switch>
);

export default withRouter(App);
