import React, { Fragment } from "react"
import { MDBCard } from "mdbreact";
import { Subscription } from "react-apollo"

import { countSeconds } from "../../queries"

import GetTasks from "../../components/Statistics/GetTasks"
import GetUsers from "../../components/Statistics/GetUsers"

const stylesOnCard = { width: "22rem", marginTop: "1rem" };

const Main = () => (
  <Fragment>
    <GetUsers />
    <GetTasks />
    <Subscription subscription={countSeconds}>
      {({ data, loading }) => (
        <MDBCard className="card-body" style={stylesOnCard}>
          <h3>Subscriptions: {!loading && data.countSeconds}</h3>
        </MDBCard>
      )}
    </Subscription>
  </Fragment>
)

export default Main
