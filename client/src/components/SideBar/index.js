import React from 'react'
import { ListGroup, ListGroupItem } from 'mdbreact'
import { NavLink } from 'react-router-dom'
import { Subscription, Query } from 'react-apollo'

import { DASHBOARD } from '../../constants/routes'
import { countSeconds, getRooms } from '../../queries'

const Sidebar = () => (
  <div className="sidebar-fixed position-fixed">
    <a href={DASHBOARD} className="sidebar">
      <h3 className="logo-wrapper">Current room</h3>
    </a>
    <Subscription subscription={countSeconds}>
      {({ data, loading }) => <p>Online: {!loading && data.countSeconds}</p>}
    </Subscription>
    <ListGroup className="list-group-flush">
      <Query query={getRooms}>
        {({ loading, error, data }) => {
          if (loading) return 'Loading...'
          if (error) return `Error! ${error.message}`

          return data.rooms.map(i => (
            <NavLink
              to={`/dashboard/${i.id}`}
              activeClassName="activeClass"
              key={i.id}
            >
              <ListGroupItem>{i.lastMessage.text}</ListGroupItem>
            </NavLink>
          ))
        }}
      </Query>
    </ListGroup>
  </div>
)

export default Sidebar
