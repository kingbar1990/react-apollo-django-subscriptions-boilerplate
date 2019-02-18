import React from 'react'
import { Mutation } from 'react-apollo'

import { createTask } from '../../../queries'

const CreateTaskForm = () => {
  let input

  return (
    <Mutation mutation={createTask}>
      {(createTask, { data }) => (
        <form
          onSubmit={e => {
            e.preventDefault()
            createTask({ variables: { type: input.value } })
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
