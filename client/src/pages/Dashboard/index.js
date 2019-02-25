import React from 'react'
import { Query, compose, graphql } from 'react-apollo'
import { MDBListGroup, MDBListGroupItem } from 'mdbreact'

import { getUsers, createRoom, User } from '../../queries'

const Dashboard = props => {
  const createRoom = recipient => {
    props
      .mutate({
        variables: {
          users: [props.data.me.id, recipient]
        }
      })
      .then(response => {
        if (!response.data.createRoom.room.error) {
          props.history.push(response.data.createRoom.room.id)
        } else {
          console.log(response.data.createRoom.room.error)
        }
      })
  }

  return (
    <article className="mt-3">
      <h1>Choose people</h1>
      <MDBListGroup className="styles-card">
        <Query query={getUsers}>
          {({ loading, error, data }) => {
            if (loading) return 'Loading...'
            if (error) return `Error! ${error.message}`
            return data.users.map(i => (
              <MDBListGroupItem key={i.id} onClick={() => createRoom(i.id)}>
                {i.fullName}
              </MDBListGroupItem>
            ))
          }}
        </Query>
      </MDBListGroup>
    </article>
  )
}

export default compose(
  graphql(User),
  graphql(createRoom)
)(Dashboard)
