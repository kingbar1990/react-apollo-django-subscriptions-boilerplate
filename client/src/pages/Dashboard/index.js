import React, { Fragment } from 'react'

import Room from '../../components/Room'
import UserInfo from '../../components/UserProfile'

const user = {
  avatar: '',
  fullName: 'User',
  email: 'Email'
}

const Main = () => (
  <Fragment>
    <Room />
    <div className="bar-right position-fixed">
      <UserInfo profile={user} />
    </div>
  </Fragment>
)

export default Main
