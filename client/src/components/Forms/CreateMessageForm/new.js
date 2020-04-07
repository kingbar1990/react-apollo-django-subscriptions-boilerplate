import React, { useState, useEffect } from "react";
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Send from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';
import MessageField from '../../Chat/MessageField';
import { MDBFooter } from "mdbreact";
import { Mutation, graphql, useMutation} from "react-apollo";
import { flowRight as compose }  from 'lodash';
import { DATA_PER_PAGE } from "../../../constants/index"
import { getBase64, debounce } from "../../../utils";
import { createMessage, getRoom, getType, onFocus } from "../../../queries";
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import { CircularProgress } from '@material-ui/core';
import imageCompression from "browser-image-compression";
import CloseIcon from '@material-ui/icons/Close';


const CreateMessageForm = (props) => {
    const {
        classes,
        currentRoom,
        users,
        data,
        inputOnFocus,
        setInputOnFocus,
        readRoomMessages,
        addToStoredMessages,
        onFocusQuery
    } = props;
    
    const [value, setValue] = useState("");
    const [files, setFiles] = useState({});
    const [error, setError] = useState("");
    const [typingStatus, setTypingStatus] = useState(false);

    const handleClearFiles = () => {
        setFiles({});
    }
    
    const handleFileChange = async (e) => {
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
          var fileImage = e.target.files[0];
          var options = {
            maxSizeMB: 1, 
            maxWidthOrHeight: 1280,
            useWebWorker: true
          }
      
          if (types.indexOf(fileImage.type) !== -1 &&  fileImage.size >= 1048576){
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
              for(let i of Object.keys(files)){
                if (i > max) max = i;
              }
              var obj = Object.assign({}, files);
              var size = fileImage['size'] / 1024;
              if (size < 1024){
                  size = `${Math.round(size)} kb`
              }else{
                  size = `${Math.round(size/1024)} mb`
              }
              obj[max+1] = {'image': file, 'name': fileImage['name'], 'size': size} 
            setFiles(obj);
          }
          );
    }

    const changeTypingStatus = status => {
        onFocusQuery.refetch({
          roomId: currentRoom.id,
          focused: status
        });
      };


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
                setError("No Internet Connection!");
                addToStoredMessages(value, currentRoom.users[0].id, users[0].id, files);
                setValue("");
                setFiles({});
                }
                else{
                setError("Message not sent :( Please try again");
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
                        <span style={{display: 'inline', width: '40px'}} className="image-upload">
                            <label htmlFor="file-input" className='mb-0'>
                                <PhotoCameraIcon className='mr-2' style={{color: '#ccc', cursor: 'pointer'}} />
                            </label>
                            <input onChange={handleFileChange} id="file-input" multiple type="file" style={{display: 'none' }}/>
                        </span>
                        <MessageField
                        files={files}
                        onClick={() => readRoomMessages(currentRoom.id)}
                        onChange={handleInputChange}
                        placeholder="Type a message"
                        fieldType="input"
                        onKeyPress={(e) => { if (e.key === 'Enter'){  createTask()}}}
                        value={value}
                        />
                        <Tooltip id="tooltip-send" onClick={() => { createTask();}} title="Send" style={{width: '50px'}}>
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
                                            <div className='mx-2 mt-2'>
                                                <img src={files[item]['image']} style={{width: "70px", height: "60px", borderRadius: '7px'}} />
                                                <p className='text-center mb-0 mt-1'>{files[item]['name'].substring(0, 10)}</p>
                                                <p className='text-center mb-0' style={{opacity: '0.5'}}>
                                                    {files[item]['size']}
                                                </p>
                                            </div>
                                        );
                                    })}
                                <CircularProgress id='imageUploadLoading' style={{display:'none', margin: '15px'}} />
                                <CloseIcon onClick={handleClearFiles} className='ml-auto' style={{width:'40px', height:'40px', cursor: 'pointer'}} />
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