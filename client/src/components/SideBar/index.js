import React from 'react'
import { ListGroup, ListGroupItem, Fa } from 'mdbreact'
import { NavLink } from 'react-router-dom'
import { Subscription } from 'react-apollo'

import { DASHBOARD, PROFILE } from '../../constants/routes'
import { countSeconds } from '../../queries'

const Sidebar = () => (
  <div className="sidebar-fixed position-fixed">
    <a href={DASHBOARD} className="sidebar">
      <h3 className="logo-wrapper">Current room</h3>
    </a>
    <Subscription subscription={countSeconds}>
      {({ data, loading }) => <p>Online: {!loading && data.countSeconds}</p>}
    </Subscription>
    <ListGroup className="list-group-flush">
      <NavLink exact={true} to={DASHBOARD} activeClassName="activeClass">
        <ListGroupItem>
          <Fa icon="pie-chart" className="mr-3" />
          Dashboard
        </ListGroupItem>
      </NavLink>
      <NavLink to={PROFILE} activeClassName="activeClass">
        <ListGroupItem>
          <Fa icon="user" className="mr-3" />
          Profile
        </ListGroupItem>
      </NavLink>
    </ListGroup>
  </div>
)

export default Sidebar
