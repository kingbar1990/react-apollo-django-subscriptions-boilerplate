import React from 'react'
import { Mutation } from 'react-apollo'

import { createMessage } from '../../../queries'

const CreateTaskForm = () => {
  let input

  return (
    <Mutation mutation={createMessage}>
      {createTask => (
        <form
          onSubmit={() => {
            createTask({
              variables: {
                text: input.value,
                sender: '1',
                recipient: '2',
                room: '2'
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
  )
}

export default CreateTaskForm
