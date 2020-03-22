import React from "react"
import { Query, compose, graphql } from "react-apollo"
import { MDBListGroup, MDBListGroupItem, MDBContainer } from "mdbreact"

import { getUsers, createRoom, User, onlineUsersSubsciption } from "../../queries"

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
          props.history.push(`dashboard/${response.data.createRoom.room.id}`)
        } else {
          console.log(response.data.createRoom.room.error)
        }
      })
  }
  const subscribeToOnlineUsers = subscribeToMore => {
    subscribeToMore({
      document: onlineUsersSubsciption,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return Object.assign({}, prev, {
          users: [...subscriptionData.data.onlineUsers]
        });
      }
    });
  };
  return (
    <MDBContainer>
      <h1 className="mt-3">Choose people</h1>
      <MDBListGroup className="styles-card">
        <Query query={getUsers}>
          {({ loading, error, data, subscribeToMore }) => {
            if (loading) return "Loading..."
            if (error) return `Error! ${error.message}`
            console.log(data);
            subscribeToOnlineUsers(subscribeToMore);

            return data.users.map(i => {
              console.log(props.data.me);
              if (props.data.me && i.id !== props.data.me.id) {
                return (
                  <MDBListGroupItem key={i.id} onClick={() => createRoom(i.id)}>
                    {i.online ? (<span class='dot-online'></span>) : (<span class='dot-offline'></span>)}{i.fullName} 
                  </MDBListGroupItem>
                )
              }
              return null
            })
          }}
        </Query>
      </MDBListGroup>
    </MDBContainer>
  )
}

export default compose(
  graphql(User),
  graphql(createRoom)
)(Dashboard)
