import React  from "react"
import { graphql } from "react-apollo";
import {createMessage} from "../../queries/index"
import { flowRight as compose }  from 'lodash';
import Avatar from '@material-ui/core/Avatar';
import { BACKEND_URL, MEDIA_URL } from '../../constants/index';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';


const StoredMessages = (props) => {
    const {
        message,
        deleteStoredMessage,
        message_key,
        createMessage,
        openModal,
        classes,
        room,
        types
    } = props;

    var counter = 0;

    // Count images in attached files
    var messageImagesLength = 0;
    if (message.files){
        for(let i in message.files){
            if (types.find(item => message.files[i].name.split('.')[1].indexOf(item) !== -1)){
              messageImagesLength += 1;
            }
        }
    }

    // Get list of attached files
    const getArrayFiles = () => {
        var arr = []
        if (message.files){
            for (let i of Object.keys(message.files)){
                arr.push(message.files[i].image);
            }
        }
        return arr;
    }

    // Try to resend message
    const trySendMessage = () => {
        if(navigator.onLine){
            createMessage({
                variables: {
                    text: message.text,
                    sender: message.sender,
                    room: room.id,
                    files: getArrayFiles()
                }
            })
            deleteStoredMessage(message_key);
        }
    }
    
    return (
        <li className={classes.to} key={message.id}>
            <div className='d-flex justify-content-between' style={{fontSize:'12px', position: 'absolute', bottom:'-30px', right:'50px'}}>
                <p onClick={() => deleteStoredMessage(message_key)} style={{color: '#9db3cf', cursor: 'pointer'}} className='mr-4'>Delete</p>
                <p onClick={() => trySendMessage()} style={{color: '#fc8789', cursor: 'pointer'}}>Failed to send, click to retry</p>
            </div>
            {message.sender.avatar ? (
                <Avatar alt="avatar" src={`${BACKEND_URL}${MEDIA_URL}${message.sender.avatar}`} className={classes.avatar} />
            ):
                <Avatar alt="avatar" src="https://www.w3schools.com/howto/img_avatar.png"  className={classes.avatar} />
            }
        <div className={classes.talk}>
            <div className='ml-auto' style={{width: 'max-content'}}>
            {message.files && Object.keys(message.files).map(item => {
                item = message.files[item];
                var type = types.find(qwe => item.name.split('.')[1].indexOf(qwe) !== -1);
                if (counter === 0 && messageImagesLength > 4 && type){
                    counter += 1;
                    return(
                        <div className='mb-1'  style={{overflow: 'hidden', height:'120px', display: 'block'}}>
                        <img onClick={() => openModal(item.image, 'offline')} style={{cursor: 'pointer', borderRadius: '11px 11px', height:'auto', minHeight:'120px', width:'337px'}} src={item.image} />
                        </div>
                    )
                }
                else if(counter !== 0 && messageImagesLength === 5 && type){
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
                            <img onClick={() => openModal(item.image, 'offline')} style={imgStyle} src={item.image} />
                        </div>
                    )
                }
                else if (type){
                    counter += 1;
                    return(
                        <div style={{overflow: 'hidden', display: 'inline-block'}}>
                            <img onClick={() => openModal(item.image, 'offline')} style={{cursor:'pointer', margin: '0 3px', borderRadius:'5px', height:'120px', minWidth: '80px', maxWidth: '150px', width:'auto'}} src={item.image} />
                        </div>
                    )
                }
            })}
            {message.files && Object.keys(message.files).map(item => {
                    item = message.files[item];
                    var type = types.find(qwe => item.name.split('.')[1].indexOf(qwe) !== -1);
                    if (type === undefined){
                      return (
                        <div key={item.name} className='p-1 my-1 ml-auto' style={{borderRadius: '7px', width: 'max-content', overflow: 'hidden'}}>
                          <a className='file-link' href='#'>
                            <InsertDriveFileIcon style={{width:'18px', height:'18px'}} className='mr-2 mb-1' />
                            {item.name}
                          </a>
                        </div>
                      )
                    }
                  })}
            </div>
            {message.text && (
            <p>
                <span style={{backgroundColor: '#fc8789'}}>{message.text}</span>
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