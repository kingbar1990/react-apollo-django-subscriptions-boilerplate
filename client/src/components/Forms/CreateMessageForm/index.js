import React, { useState } from 'react'
import { MDBFooter } from 'mdbreact'
import { Mutation, graphql } from 'react-apollo'

import { getBase64 } from '../../../utils'
import { createMessage, getRoom, getType } from '../../../queries'

const CreateMessageForm = ({ currentRoom, users, data }) => {
  const [value, setValue] = useState('')
  const [avatar, setAvatar] = useState('')
  const [error, setError] = useState('')

  const handleImageChange = e => {
    if (!e.target.files) {
      return
    }
    let file = e.target.files[0]
    if (file.size <= 1048576) {
      getBase64(file)
        .then(image => (file = image))
        .then(() => setAvatar(file))
    } else {
      return setError('max size 1MB')
    }
  }

  const handleInputChange = e => {
    setValue(e.target.value)
    data.refetch({
      id: currentRoom,
      skip: false
    })
  }

  return (
    <Mutation
      mutation={createMessage}
      variables={{
        text: value,
        sender: users[0].id,
        room: currentRoom,
        file: avatar
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
      onCompleted={() => {
        setValue('')
        setAvatar('')
      }}
    >
      {createTask => (
        <MDBFooter className="py-3 shade">
          <section className="flex-space">
            {error && <div className="invalid-feedback d-block">{error}</div>}
            {avatar && <span className="btn-rounded rad">Preview</span>}
            <label htmlFor="avatar" className="label btn-rounded rad">
              Attach
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </section>
          <section>
            <input
              className="input-send rad"
              onChange={handleInputChange}
              value={value}
              placeholder="Type something"
            />
            <button className="btn-rounded rad" onClick={createTask}>
              Send
            </button>
          </section>
        </MDBFooter>
      )}
    </Mutation>
  )
}

export default graphql(getType, {
  options: props => ({ variables: { id: props.currentRoom, skip: true } })
})(CreateMessageForm)
