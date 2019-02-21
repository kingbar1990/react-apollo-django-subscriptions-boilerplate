import React, { useState } from 'react'
import { Mutation } from 'react-apollo'

import { updateMessage } from '../../../queries'

const EditMessageForm = props => {
  const [value, setValue] = useState(props.text)

  return (
    <Mutation
      mutation={updateMessage}
      variables={{
        text: value,
        sender: props.sender.id,
        room: props.currentRoom,
        messageId: props.id
      }}
      onCompleted={props.closeModal}
    >
      {updateMessage => (
        <div className="card-body">
          <input
            onChange={event => {
              setValue(event.target.value)
            }}
            value={value}
          />
          <button onClick={updateMessage}>Save</button>
        </div>
      )}
    </Mutation>
  )
}

export default EditMessageForm
