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
      refetchQueries={[
        {
          query: getRoom,
          variables: { id: currentRoom }
        }
      ]}
    >
      {createTask => (
        <MDBFooter className="my-3">
          <input
            onChange={event => {
              setValue(event.target.value)
            }}
            value={value}
          />
          <button onClick={createTask}>Send</button>
        </MDBFooter>
      )}
    </Mutation>
  )
}

export default CreateMessageForm
