import React, { lazy, Suspense } from "react";
import { withRouter, Switch, Route } from "react-router";

import * as path from "./constants/routes";

import Register from "./pages/Login/Register";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login/newLogin";
import Main from "./components/Main";
import Loader from "./components/Loader";
import ThemeWrapper, {AppContext } from "./ThemeWrapper";

const Room = lazy(() => import("./pages/Room"));
const Profile = lazy(() => import("./pages/Profile"));
const ConfirmEmail = lazy(() => import("./pages/ConfirmEmail"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Chat = lazy(() => import("./pages/Chat"));

const App = props => (
  <ThemeWrapper color={"skyBlueTheme"} mode={"light"}>
    <AppContext.Consumer>
      {(changeMode) => (
        <Switch>
          <Route exact path={path.SIGN_UP} component={Register} />
          <Route exact path={path.SIGN_IN} render={props => <Login changeMode={changeMode} {...props} />} />
          <Main {...props}>
            <Suspense fallback={<Loader />}>
              <Route
                exact
                path={path.DASHBOARD}
                render={props => <Dashboard {...props} />}
              />
              <Route exact path={path.ROOM} render={props => <Chat changeMode={changeMode} {...props} />} />
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
      )}
    </AppContext.Consumer>
  </ThemeWrapper>
);

export default withRouter(App);
