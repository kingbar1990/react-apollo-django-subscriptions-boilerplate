import React, { Fragment } from 'react'
import { MDBCard } from 'mdbreact'
import { Query } from 'react-apollo'

import { getRoom } from '../../queries'

import UserInfo from '../../components/UserProfile'
import CreateMessageForm from '../../components/Forms/CreateMessageForm'

const Room = props => {
  const currentRoom = props.match.params.id

  return (
    <Query query={getRoom} variables={{ id: currentRoom }}>
      {({ loading, error, data }) => {
        if (loading) return null
        if (error) return `Error! ${error.message}`

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
