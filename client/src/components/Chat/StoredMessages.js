import React  from "react"
import { graphql } from "react-apollo";
import {createMessage} from "../../queries/index"
import { flowRight as compose }  from 'lodash';
import Avatar from '@material-ui/core/Avatar';
import { BACKEND_URL, MEDIA_URL } from '../../constants/index';


const StoredMessages = (props) => {
    const {
        message,
        deleteStoredMessage,
        message_key,
        createMessage,
        me,
        openModal,
        closeModal,
        formatDate,
        classes
    } = props;

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
    
    var counter = 0;
    return (
        <li className={message.sender.id === me.id ? classes.to : classes.from} key={message.id}>
        <time dateTime={message.time}>{formatDate(message.time)}</time>
            {message.sender.avatar ? (
            <Avatar alt="avatar" src={`${BACKEND_URL}${MEDIA_URL}${message.sender.avatar}`} className={classes.avatar} />
            ):
            <Avatar alt="avatar" src="https://www.w3schools.com/howto/img_avatar.png"  className={classes.avatar} />
            }
        <div className={classes.talk}>
            <div className='ml-auto' style={{width: 'max-content'}}>
            {message.files.map(item => {
                if (counter === 0 && message.files.length > 4){
                counter += 1;
                return(
                    <div className='mb-1'  style={{overflow: 'hidden', height:'120px', display: 'block'}}>
                    <img onClick={() => openModal(item.file)} style={{cursor: 'pointer', borderRadius: '11px 11px', height:'auto', minHeight:'120px', width:'337px'}} src={`${BACKEND_URL}${MEDIA_URL}${item.file}`} />
                    </div>
                )
                }
                else if(counter !== 0 && message.files.length === 5){
                counter += 1;
                var imgStyle = {cursor: 'pointer', height:'100px', minWidth: '85px', width:'auto'}
                if (counter === 2){
                    imgStyle['borderBottomLeftRadius'] = '11px';
                }
                else if (counter === 5) {
                    imgStyle['borderBottomRightRadius'] = '11px';
                }
                return(
                    <div style={{padding: '0 3px', overflow: 'hidden', width: '85px', display: 'inline-block'}}>
                    <img onClick={() => openModal(item.file)} style={imgStyle} src={`${BACKEND_URL}${MEDIA_URL}${item.file}`} />
                    </div>
                )
                }
                else {
                counter += 1;
                return(
                    <div style={{overflow: 'hidden', display: 'inline-block'}}>
                    <img onClick={() => openModal(item.file)} style={{cursor:'pointer', margin: '0 3px', borderRadius:'5px', height:'120px', minWidth: '80px', maxWidth: '150px', width:'auto'}} src={`${BACKEND_URL}${MEDIA_URL}${item.file}`} />
                    </div>
                )
                }
            })}
            </div>
            {message.text && (
            <p>
                <span>{message.text}</span>
            </p>
            )}
            
        </div>
        </li>
    )
}

export default compose(
    graphql(createMessage, {name: "createMessage"})
)
(StoredMessages);