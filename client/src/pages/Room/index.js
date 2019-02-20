import React, { Fragment } from 'react'
import { MDBCard } from 'mdbreact'
import { Query } from 'react-apollo'

import { getRoom, newMessageSubscription } from '../../queries'

import UserInfo from '../../components/UserProfile'
import CreateMessageForm from '../../components/Forms/CreateMessageForm'

const Room = props => {
  const currentRoom = props.match.params.id

  const subscribeToNewMessage = subscribeToMore => {
    subscribeToMore({
      document: newMessageSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newMessage = subscriptionData.data.newMessage

        return Object.assign({}, prev, {
          room: {
            messages: [...prev.room.messages, newMessage],
            users: prev.room.users,
            __typename: prev.room.__typename
          }
        })
      }
    })
  }

  return (
    <Query query={getRoom} variables={{ id: currentRoom }}>
      {({ loading, error, data, subscribeToMore }) => {
        if (loading) return null
        if (error) return `Error! ${error.message}`

        subscribeToNewMessage(subscribeToMore)

        return (
          <Fragment>
            <CreateMessageForm currentRoom={currentRoom} {...data.room} />
            {data.room.messages.map(i => (
              <MDBCard className="card-body mt-3" key={i.id}>
                <h4>{i.text}</h4>
                <p>{i.sender.fullName}</p>
                <i>{i.time}</i>
              </MDBCard>
            ))}
            <div className="bar-right position-fixed">
              <UserInfo profile={data.room.users[1]} />
            </div>
          </Fragment>
        )
      }}
    </Query>
  )
}

export default Room
