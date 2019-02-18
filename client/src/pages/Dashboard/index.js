import React, { Fragment } from 'react'

import GetTasks from '../../components/Statistics/GetTasks'
import UserInfo from '../../components/UserProfile'

const user = {
  avatar: '',
  fullName: 'User',
  email: 'Email'
}

const Main = () => (
  <Fragment>
    <GetTasks />
    <div className="bar-right position-fixed">
      <UserInfo profile={user} />
    </div>
  </Fragment>
)

export default Main
