import React, { useState, useEffect, useMutation } from "react";
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Send from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';
import MessageField from '../../Chat/MessageField';
import { MDBFooter } from "mdbreact";
import { Mutation, graphql} from "react-apollo";
import { flowRight as compose }  from 'lodash';
import { DATA_PER_PAGE } from "../../../constants/index"
import { getBase64, debounce } from "../../../utils";
import { createMessage, getRoom, getType, onFocus } from "../../../queries";


const CreateMessageForm = (props) => {
    const {
        classes,
        currentRoom,
        users,
        data,
        inputOnFocus,
        setInputOnFocus,
        readRoomMessages,
    } = props;
    
    const [value, setValue] = useState("");
    const [avatar, setAvatar] = useState("");
    const [error, setError] = useState("");


    const handleInputChange = (e) => {
        let value = e.target.value;
        setValue(value);
        let valueBool = value.length > 0;
        setInputOnFocus(valueBool);
    };

    return (
        <Mutation
            mutation={createMessage}
            variables={{
                text: value,
                sender: users[0].id,
                room: currentRoom.id,
            }}
            update={(cache, { data: { createMessage } }) => {
                const data = cache.readQuery({
                query: getRoom,
                variables: { id: currentRoom.id, first: DATA_PER_PAGE }
                });
                cache.writeQuery({
                    query: getRoom,
                    data: {
                        room: {
                            id: data.room.id,
                            messages: [...data.room.messages, createMessage.message],
                            users: data.room.users,
                            __typename: data.room.__typename
                        }
                    }
                });
            }}
            onError={() => {
                if (!navigator.onLine){
                setError("No Internet Connection!");
                }
                else{
                setError("Message not sent :( Please try again");
                }
            }}
            onCompleted={() => {
                setValue("");
                setAvatar("");
            }}
            >
            {createTask => (
                <Paper className={classes.writeMessage}>
                    <MessageField
                    onClick={() => readRoomMessages(currentRoom.id)}
                    onChange={handleInputChange}
                    placeholder="Type a message"
                    fieldType="input"
                    onKeyPress={(e) => { if (e.key === 'Enter') createTask() }}
                    value={value}
                    />
                    <Tooltip id="tooltip-send" onClick={createTask} title="Send">
                        <div>
                            <IconButton mini="true" color="secondary" disabled={value === ''} aria-label="send" className={classes.sendBtn}>
                                <Send />
                            </IconButton>
                        </div> 
                    </Tooltip>
                </Paper>
            )}
        </Mutation>
    )
}
export default CreateMessageForm;