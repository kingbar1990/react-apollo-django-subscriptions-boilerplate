import React  from "react"
import { graphql, compose } from "react-apollo";
import ModalForm from "../../components/Forms/ModalForm";
import EditMessageForm from "../../components/Forms/EditMessageForm";
import {createMessage} from "../../queries/index"

const StoredMessages = ({message, deleteStoredMessage, message_key, createMessage}) => {

    const trySendMessage = () => {
        if(navigator.onLine){
            createMessage({
                variables: {
                    text: message.text,
                    sender: message.sender,
                    room: message.room,
                    file: message.file
                }
            })
            deleteStoredMessage(message_key);
        }
    }
    return(
        <article className="card-shadow rad shade" style={{borderRadius: "4rem"}}>
            <section className="flex-space">
                <p>{message.text}</p>
                <div className="d-flex">
                    <button
                    className="btn-rounded btn-primary rad"
                    onClick={() => trySendMessage()}
                    >
                    Try again
                    </button>
                    <button
                    className="btn-rounded rad btn-danger"
                    onClick={() => deleteStoredMessage(message_key)}
                    >
                    Delete
                    </button>
                </div>
            </section>
        </article>
    )
}

export default compose(
    graphql(createMessage, {name: "createMessage"})
)
(StoredMessages);