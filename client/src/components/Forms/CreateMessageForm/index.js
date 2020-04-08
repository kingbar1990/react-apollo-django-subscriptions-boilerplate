import React, { useState, useRef } from "react";
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Send from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';
import MessageField from '../../Chat/MessageField';
import { Mutation, graphql, useMutation} from "react-apollo";
import { flowRight as compose }  from 'lodash';
import { DATA_PER_PAGE } from "../../../constants/index"
import { getBase64 } from "../../../utils";
import { createMessage, getRoom, onFocus, updateMessage } from "../../../queries";
import { CircularProgress } from '@material-ui/core';
import imageCompression from "browser-image-compression";
import CloseIcon from '@material-ui/icons/Close';
import { Button } from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import EditIcon from '@material-ui/icons/Edit';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';


// Styles for buttons Edit/Delete message
const buttonDeleteStyles = {
    borderRadius: '10px',
    backgroundColor: '#e87173',
    fontWeight: '400',
    textTransform: 'none',
    display: 'block'
}
const buttonEditStyles = Object.assign({}, buttonDeleteStyles, {backgroundColor: '#6ea7f4'})


const CreateMessageForm = (props) => {
    const {
        classes,
        currentRoom,
        users,
        setInputOnFocus,
        readRoomMessages,
        addToStoredMessages,
        onFocusQuery,
        messageAction,
        handleDeleteMessage,
        clearMessageAction,
        me,
    } = props;

    const types = [
        'image/gif', 
        'image/jpeg',
        'image/pjpeg',
        'image/png',
        'image/svg+xml',
        'image/tiff',
        'image/vnd.microsoft.icon',
        'image/vnd.wap.wbmp',
        'image/webp'
      ]

    const [editMessage, {data: editMessageData}] = useMutation(updateMessage);
    const fileInput = useRef(null);
    const [value, setValue] = useState("");
    const [files, setFiles] = useState({});
    const [typingStatus, setTypingStatus] = useState(false);

    // Remove file from attached files
    const handleRemoveFile = (item) => {
        var tempFilesObj = Object.assign({}, files);
        delete tempFilesObj[item];
        setFiles(tempFilesObj);
    }

    // Add text of selected message to input
    const handleEditMessage = () => {
        setValue(messageAction[2].innerHTML);
    }

    // Send edited message to Back-End
    const editMessageComplete = async () => {
        await editMessage({
            variables: {
                text: value,
                sender: me.id,
                room: currentRoom.id,
                messageId: messageAction[0].id
            }
        })
        setValue("");
        clearMessageAction();
    }
    
    // Compress image if its size > 1mb
    const handleFileChange = async (e) => {
          var fileImage = e.target.files[0];
          var options = {
            maxSizeMB: 1, 
            maxWidthOrHeight: 1280,
            useWebWorker: true
          }
          fileInput.current.value = '';

          var type = types.indexOf(fileImage.type)  === -1 ? 'file' : 'image';
          if (type === 'image' &&  fileImage.size >= 1048576){
              var loading = document.getElementById("imageUploadLoading")
              if (loading) loading.style.display = "block";
            fileImage = await imageCompression(fileImage, options);
            var ima = await getBase64(fileImage);
            var koef = 1;
            if (ima.length * 2.1 > 1048576){
              do {
                koef *= 0.8;
                options = {
                  maxSizeMB: koef,
                  maxWidthOrHeight: 1280,
                  useWebWorker: true
                }
                fileImage = await imageCompression(fileImage, options);
                ima = await getBase64(fileImage);
              } while (ima.length *2.1 > 1048576)
            }
            loading = document.getElementById("imageUploadLoading");
            if(loading) loading.style.display = "none";
          }

        await getBase64(fileImage).then((file) =>  {
            var max = 0;
            var obj = Object.assign({}, files);
            var size = fileImage['size'] / 1024;
            for(let i of Object.keys(files)){
                if (i > max) max = i;
            }
            if (size < 1024){
                size = `${Math.round(size)} kb`;
            }else{
                size = `${Math.round(size/1024)} mb`;
            }
            obj[max+1] = {'image': file, 'name': fileImage['name'], 'size': size, 'type': type};
            setFiles(obj);
        });
    }

    // Send request to backend with typing status
    const changeTypingStatus = status => {
        onFocusQuery.refetch({
          roomId: currentRoom.id,
          focused: status
        });
      };

    // Set typing status if user begin or finish typing
    const handleInputChange = (e) => {
        let value = e.target.value;
        setValue(value);
        let valueBool = value.length > 0;
        if (typingStatus !== valueBool){
            setInputOnFocus(valueBool);
            changeTypingStatus(valueBool);
            setTypingStatus(valueBool);
        }
    };

    // Get list of attached files
    const getArrayFiles = () => {
        var arr = []
        for (let i of Object.keys(files)){
            arr.push(files[i]['image']);
        }
        return arr;
    }

    return (
        <Mutation
            mutation={createMessage}
            variables={{
                text: value,
                sender: users[0].id,
                room: currentRoom.id,
                files: getArrayFiles()
            }}
            update={  (cache, { data: { createMessage } }) => {
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
                    var penpal = currentRoom.users.find(item => item.id !== me.id);
                    addToStoredMessages(value, penpal, users[0], files);
                    setValue("");
                    setFiles({});
                }
            }}
            onCompleted={() => {
                setValue("");
                setFiles({});
            }}
            >
            {createTask => {
                return (
                    <Paper className={classes.writeMessage} 
                    style={{
                        flexWrap: 'wrap',
                        borderRadius: '0',
                        bottom: '0',
                        minHeight: '0',
                        position: 'absolute',
                        width: '100%',
                        margin: '0'
                    }}
                    >
                        {messageAction && (
                            <div style={{display: 'flex', borderBottom: '1px solid #e8e8e8', flexBasis: '100%'}}>
                            <Button onClick={handleDeleteMessage} style={buttonDeleteStyles} className='m-2 px-3 py-1' variant="contained" color='secondary'>
                                <DeleteOutlineIcon />
                                Delete
                            </Button>
                            <Button onClick={handleEditMessage} style={buttonEditStyles} className='m-2 px-3 py-1' variant='contained' color='primary'>
                                <EditIcon />
                                Edit
                            </Button>
                            <CloseIcon onClick={clearMessageAction} className='ml-auto' style={{display: 'block', width:'40px', height:'40px', cursor: 'pointer'}} />
                            </div>
                        )}
                        <span style={{display: 'inline', width: '40px'}} className="image-upload">
                            <label htmlFor="file-input" className='mb-0'>
                                <AttachFileIcon className='mr-2' style={{color: '#ccc', cursor: 'pointer'}} />
                            </label>
                            <input onChange={handleFileChange} ref={fileInput} id="file-input" multiple type="file" style={{display: 'none' }}/>
                        </span>
                        <MessageField
                        onClick={() => readRoomMessages(currentRoom.id)}
                        onChange={handleInputChange}
                        placeholder="Type a message"
                        fieldType="input"
                        onKeyPress={(e) => { if (e.key === 'Enter'){ messageAction ? editMessageComplete() : createTask()}}}
                        value={value}
                        />
                        <Tooltip id="tooltip-send" onClick={() => {messageAction ? editMessageComplete() : createTask();}} title="Send" style={{width: '50px'}}>
                            <div>
                                <IconButton mini="true" color="secondary" disabled={value === '' && Object.keys(files).length === 0} aria-label="send" className={classes.sendBtn}>
                                    <Send />
                                </IconButton>
                            </div> 
                        </Tooltip>
                        {Object.keys(files).length > 0 && (
                            <>
                                <div style={{flexBasis: "100%", height:'0', width:'calc(100% + 32px)'}}></div>
                                <div className='d-flex' style={{borderTop: '1px solid #e8e8e8', width: '100%', padding: '5px'}}>
                                    {Object.keys(files).map(item => {
                                        return (
                                            <div className='mx-3 mt-2 text-center' style={{position: 'relative'}}>
                                                <CloseIcon onClick={() => handleRemoveFile(item)} className='ml-auto' style={{position:'absolute', top: '-12px', right: '-18px', width:'18px', height:'18px' , cursor: 'pointer'}} />
                                                {files[item]['type'] == 'image' ? (
                                                    <img src={files[item]['image']} style={{width: "70px", height: "60px", borderRadius: '7px'}} />
                                                ):
                                                (
                                                    <InsertDriveFileIcon style={{width: "70px", height: "60px", borderRadius: '7px'}}/>
                                                )
                                                }
                                                <p className='text-center mb-0 mt-1'>{files[item]['name'].substring(0, 10)}</p>
                                                <p className='text-center mb-0' style={{opacity: '0.5'}}>
                                                    {files[item]['size']}
                                                </p>
                                            </div>
                                        );
                                    })}
                                <CircularProgress id='imageUploadLoading' style={{display:'none', margin: '15px'}} />
                            </div>
                            </>
                        )}
                    </Paper>
                )
            }}
        </Mutation>
    )
}


export default compose(
    graphql(onFocus, {name: "onFocusQuery"})
)(CreateMessageForm);