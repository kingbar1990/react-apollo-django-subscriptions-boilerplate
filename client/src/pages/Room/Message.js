import React, { useState } from 'react'
import { Mutation } from 'react-apollo'

import { BACKEND_URL, DATA_PER_PAGE } from '../../constants'
import { getRoom, deleteMessage } from '../../queries'

import ModalForm from '../../components/Forms/ModalForm'
import EditMessageForm from '../../components/Forms/EditMessageForm'

const Message = props => {
  const [modal, setModal] = useState()

  return (
    <article className="card-shadow rad shade">
      <section className="flex-space">
        <p>{props.text}</p>
        <div className="d-flex">
          <button
            className="btn-rounded rad"
            onClick={() => setModal(props.id)}
          >
            Edit
          </button>
          <Mutation
            mutation={deleteMessage}
            variables={{ messageId: parseInt(props.id) }}
            update={cache => {
              const data = cache.readQuery({
                query: getRoom,
                variables: { id: props.currentRoom, first: DATA_PER_PAGE }
              })

              const del = data.room.messages.find(i => i.id === props.id)
              const index = data.room.messages.indexOf(del)
              data.room.messages.splice(index, 1)

              cache.writeQuery({
                query: getRoom,
                data: {
                  room: {
                    messages: data.room.messages,
                    users: data.room.users,
                    __typename: data.room.__typename
                  }
                }
              })
            }}
          >
            {deleteMessage => (
              <button className="btn-rounded rad" onClick={deleteMessage}>
                Delete
              </button>
            )}
          </Mutation>
        </div>
      </section>
      <ModalForm
        title={'Edit message'}
        isActive={props.id === modal}
        closeModal={setModal}
      >
        <EditMessageForm
          {...props}
          currentRoom={props.currentRoom}
          closeModal={setModal}
        />
      </ModalForm>
      <section className="flex-space">
        <div>
          <span className="mr-3">{props.sender.fullName}</span>
          <time className="grey-text">
            {new Date(props.time).toDateString()}
          </time>
        </div>
        {props.file && (
          <div className="width">
            <img
              src={`${BACKEND_URL}/media/${props.file}`}
              alt={props.id}
              className="preview rad"
            />
          </div>
        )}
      </section>
    </article>
  )
}

export default Message
