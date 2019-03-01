import React from 'react'
import { Query, Subscription } from 'react-apollo'
import { MDBContainer } from 'mdbreact'

import {
  getRoom,
  newMessageSubscription,
  unviewedMessageSubscription
} from '../../queries'

import { DATA_PER_PAGE } from '../../constants'
import UserInfo from '../../components/UserProfile'
import CreateMessageForm from '../../components/Forms/CreateMessageForm'
import MessageList from './MessageList'

const Room = props => {
  const currentRoom = props.match.params.id

  const subscribeToNewMessage = subscribeToMore => {
    subscribeToMore({
      document: newMessageSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newMessage = subscriptionData.data.newMessage
        const exists = prev.room.messages.find(({ id }) => id === newMessage.id)
        if (exists) return prev

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
    <Query
      query={getRoom}
      variables={{ id: currentRoom, first: DATA_PER_PAGE }}
    >
      {({ loading, error, data, subscribeToMore, fetchMore }) => {
        if (loading) return null
        if (error) return `Error! ${error.message}`

        subscribeToNewMessage(subscribeToMore)

        return (
          <MDBContainer>
            <CreateMessageForm currentRoom={currentRoom} {...data.room} />
            <MessageList
              data={data.room}
              currentRoom={currentRoom}
              onLoadMore={() =>
                fetchMore({
                  variables: {
                    id: currentRoom,
                    first: DATA_PER_PAGE,
                    skip: data.room.messages.length
                  },
                  updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult) return prev
                    return Object.assign({}, prev, {
                      room: {
                        messages: [
                          ...prev.room.messages,
                          ...fetchMoreResult.room.messages
                        ],
                        users: prev.room.users,
                        __typename: prev.room.__typename
                      }
                    })
                  }
                })
              }
            />
            <div className="bar-right position-fixed shade">
              <UserInfo profile={data.room.users[0]} />
            </div>
            <Subscription subscription={unviewedMessageSubscription}>
              {({ data, loading }) =>
                !loading && data.notifications.typing ? (
                  <em className="grey-text">Typing...</em>
                ) : (
                  ''
                )
              }
            </Subscription>
          </MDBContainer>
        )
      }}
    </Query>
  )
}

export default Room
