import React from 'react'
import { ListGroupItem, MDBBadge } from 'mdbreact'
import { NavLink } from 'react-router-dom'
import { Subscription, Query } from 'react-apollo'

import { DASHBOARD } from '../../constants/routes'
import { countSeconds, getRooms } from '../../queries'

const Sidebar = props => (
  <div className="sidebar-fixed position-fixed">
    <a href={DASHBOARD} className="sidebar">
      <h3 className="logo-wrapper">Current room</h3>
    </a>
    <Subscription subscription={countSeconds}>
      {({ data, loading }) => <p>Online: {!loading && data.countSeconds}</p>}
    </Subscription>
    <Query query={getRooms} variables={{ userId: props.id }}>
      {({ loading, error, data }) => {
        if (loading) return 'Loading...'
        if (error) return `Error! ${error.message}`

        return data.rooms.map(i => (
          <NavLink
            to={`/dashboard/${i.id}`}
            activeClassName="activeClass"
            key={i.id}
          >
            <ListGroupItem className="flex-space">
              {i.users[1].fullName}
              <MDBBadge color="elegant-color" pill>
                {i.unviewedMessages}
              </MDBBadge>
            </ListGroupItem>
          </NavLink>
        ))
      }}
    </Query>
  </div>
)

export default Sidebar
