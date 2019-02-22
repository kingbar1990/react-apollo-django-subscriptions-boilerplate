import React, { useState } from 'react'
import { MDBFooter } from 'mdbreact'
import { Mutation } from 'react-apollo'

import { createMessage, getRoom } from '../../../queries'

const CreateMessageForm = ({ currentRoom, users }) => {
  const [value, setValue] = useState('')

  return (
    <Mutation
      mutation={createMessage}
      variables={{
        text: value,
        sender: users[0].id,
        room: currentRoom
      }}
      update={(cache, { data: { createMessage } }) => {
        const data = cache.readQuery({
          query: getRoom,
          variables: { id: currentRoom }
        })
        cache.writeQuery({
          query: getRoom,
          data: {
            room: {
              messages: [...data.room.messages, createMessage.message],
              users: data.room.users,
              __typename: data.room.__typename
            }
          }
        })
      }}
      onCompleted={() => setValue('')}
    >
      {createTask => (
        <MDBFooter className="py-3">
          <input
            className="input-send rad"
            onChange={event => {
              setValue(event.target.value)
            }}
            value={value}
            placeholder="Type something"
          />
          <button className="btn-rounded rad" onClick={createTask}>
            Send
          </button>
        </MDBFooter>
      )}
    </Mutation>
  )
}

export default CreateMessageForm
