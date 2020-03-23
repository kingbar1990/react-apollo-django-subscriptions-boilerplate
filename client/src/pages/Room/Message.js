import React, { useState, useEffect } from "react";
import { Mutation } from "react-apollo";
import MdDoneAll from "react-ionicons/lib/MdDoneAll";
import MdCheckmark from "react-ionicons/lib/MdCheckmark";
import { BACKEND_URL, DATA_PER_PAGE } from "../../constants";
import { getRoom, deleteMessage } from "../../queries";

import ModalForm from "../../components/Forms/ModalForm";
import EditMessageForm from "../../components/Forms/EditMessageForm";

const Message = props => {
  const [modal, setModal] = useState();
  const imageFormats = ['jpeg', 'png', 'gif', 'tiff']
  useEffect(() => {
    if (!props.seen && props.sender.id !== props.me.id) {
      props.readRoomMessages();
    }
  }, []);
  return (
    <article className="card-shadow rad shade" style={{borderRadius: "4rem"}}>
      <section className="flex-space">
        <p>{props.text}</p>
        {props.me.id === props.sender.id ? (
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
                });

                const del = data.room.messages.find(i => i.id === props.id);
                const index = data.room.messages.indexOf(del);
                data.room.messages.splice(index, 1);

                cache.writeQuery({
                  query: getRoom,
                  data: {
                    room: {
                      messages: data.room.messages,
                      users: data.room.users,
                      __typename: data.room.__typename
                    }
                  }
                });
              }}
            >
              {deleteMessage => (
                <button className="btn-rounded rad" onClick={deleteMessage}>
                  Delete
                </button>
              )}
            </Mutation>
          </div>
        ) : null}
      </section>
      {props.file && 
      (( imageFormats.find(format => props.file.indexOf(format) != -1)) ? (
          <div className="width" style={{margin: "10px auto"}}>
            <a href={`${BACKEND_URL}/media/${props.file}`}>
              <img
                src={`${BACKEND_URL}/media/${props.file}`}
                alt={props.id}
                style={{width:"100px", height:"100px", borderRadius: "5px"}}
              />
            </a>
          </div>
        ):
        (
          <div>
            <span>File: </span><a href={`${BACKEND_URL}/media/${props.file}`} style={{color: 'blue'}}>{props.file.split('/').slice(-1)[0]}</a>
          </div>
        )
      )}
         
      <ModalForm
        title={"Edit message"}
        isActive={props.id === modal}
        closeModal={setModal}
      >
        <EditMessageForm
          {...props}
          currentRoom={props.currentRoom}
          closeModal={setModal}
        />
      </ModalForm>
      <section className="flex-space" id="2">
        <div>
          {props.sender.id === props.me.id ? (
            props.seen ? (
              <MdDoneAll fontSize="25px" color="#43853d" />
            ) : (
              <MdCheckmark fontSize="25px" color="#43853d" />
            )
          ) : null}

          <span className="mr-3">{props.sender.fullName}</span>
          <time className="grey-text">
            {new Date(props.time).toDateString()}
          </time>
        </div>
        
      </section>
    </article>
  );
};

export default Message;
