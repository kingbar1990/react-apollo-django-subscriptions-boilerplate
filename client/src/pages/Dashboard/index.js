import React, { Fragment } from "react"
import { Subscription } from "react-apollo"

import { countSeconds } from "../../queries"

import GetTasks from "../../components/Statistics/GetTasks"
import GetUsers from "../../components/Statistics/GetUsers"

const Main = () => (
  <Fragment>
    <GetUsers />
    <GetTasks />
    <Subscription subscription={countSeconds}>
      {({ data: { countSeconds }, loading }) => (
        <h4>New comment: {!loading && countSeconds.data}</h4>
      )}
    </Subscription>
  </Fragment>
)

export default Main
