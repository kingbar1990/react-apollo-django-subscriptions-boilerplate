import React from 'react'
import { MDBFooter } from 'mdbreact'
import { Mutation } from 'react-apollo'

import { createMessage } from '../../../queries'

const CreateMessageForm = ({ currentRoom, users }) => {
  let input

  return (
    <MDBFooter>
      <Mutation mutation={createMessage}>
        {createTask => (
          <form
            className="my-3"
            onSubmit={() => {
              createTask({
                variables: {
                  text: input.value,
                  sender: users[0].id,
                  room: currentRoom
                }
              })
              input.value = ''
            }}
          >
            <input
              ref={node => {
                input = node
              }}
            />
            <button type="submit">Send</button>
          </form>
        )}
      </Mutation>
    </MDBFooter>
  )
}

export default CreateMessageForm
