import React, { useState, useRef } from 'react';
import Avatar from '@material-ui/core/Avatar';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Typography from '@material-ui/core/Typography';
import ChatHeader from './ChatHeader';
import styles from './chatStyle-jss';
import { Query, graphql, Subscription, useMutation } from "react-apollo";
import { getRoom, newMessageSubscription, readMessages, onFocusSubscription, deleteMessage } from "../../queries/index";
import {flowRight as compose} from "lodash";
import { BACKEND_URL, MEDIA_URL, VIDEO_TYPES, IMAGE_TYPES, VIDEO_REGULAR_LINKS } from '../../constants/index';
import CreateMessageForm from '../../components/Forms/CreateMessageForm/index';
import { Modal } from '@material-ui/core';
import StoredMessages from "./StoredMessages";
import _ from "lodash";
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import ReactPlayer from 'react-player';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Card from '@material-ui/core/Card';


const ChatRoom = props => {
  const {
    classes,
    chatSelected,
    dataContact,
    showMobileDetail,
    remove,
    hideDetail,
    currentRoom,
    me
  } = props;

  const [modalImg, setModalImg] = useState('');
  const [inputOnFocus, setInputOnFocus] = useState(false);
  const [storedMessages, setStoredMessages] = useState(Object.assign({}, getAllLocalStorageItems()))
  const [messageAction, setMessageAction] = useState(null);
  const [deleteMes, {data: deleteMessageData}] = useMutation(deleteMessage);

  // Retrieve all unsent messages from local storage
  function getAllLocalStorageItems() {
    var tempDict = {}
    var keys = Object.keys(localStorage);
    for (let i of keys){
      if(i.indexOf('message') !== -1) {
        let item = JSON.parse(localStorage.getItem(i));
          tempDict[i] = item;
      }
    }
    return tempDict;
  }

  // Delete stored message from Local Storage 
  const deleteStoredMessage = (message_id) => {
    localStorage.removeItem(message_id);
    var newDict = getAllLocalStorageItems();
    setStoredMessages(newDict);
  }

  // Add message to Local Storage (called if no connection during sending)
  const addToStoredMessages = (text, room, sender, files) => {
    let randomInt = Math.round(Math.random() * 10000000)
    localStorage.setItem(
      `message_${randomInt}`, 
      JSON.stringify({"text": text, "room": room.id, "sender": sender, "files": files}))
    var newDict = getAllLocalStorageItems();
    setStoredMessages(newDict);
  }


  // Delete selected message from dialog
  const handleDeleteMessage = async () => {
    const result = await deleteMes({
      variables: {
        messageId: messageAction[0].id
      }
    })
    if (result.data.deleteMessage.success){
      messageAction[1].remove();
      setMessageAction(null);
    }
  }

  // Open modal window with selected image
  const openModal = (imgSrc, status) => {
    if (status == 'online'){
      setModalImg(`${BACKEND_URL}${MEDIA_URL}${imgSrc}`);
    }
    else if (status == 'offline'){
      setModalImg(imgSrc);
    }
    else if (status = 'external') {
      setModalImg(imgSrc);
    }
  }

  // Close modal window
  const closeModal = () => {
    setModalImg('');
  }

  // Mark unread messaged in chat as read
  const readRoomMessages = (roomId) => {
    if (navigator.onLine){
      props.readMessages({
        variables: {
          roomId: roomId
        },
      });
    }
  };

  // Subscribtion to retrieve new messages
  const subscribeToNewMessage = (subscribeToMore, room_id) => {
    subscribeToMore({
      document: newMessageSubscription,
      variables: {
        channelId: room_id
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newMessage = subscriptionData.data.newMessage;
        const userFromRoom = prev.room.users.find(({ id }) => id === newMessage.sender.id);
        const exists = prev.room.messages.find(
          ({ id }) => id === newMessage.id
        );
        if (exists || !userFromRoom) return prev;
        return Object.assign({}, prev, {
          room: {
            id: newMessage.room.id,
            messages: [...prev.room.messages, newMessage],
            users: prev.room.users,
            __typename: prev.room.__typename
          }
        });
      }
    });
  };

  // Select message and show block with edit/delete buttons
  const handleSetMessageAction = (message, obj, child) => {
    if (obj.children[2].children.length > 1 && child.className !== 'message-image' && child.className !== 'message-link' && child.className !== 'file-link' && child.parentNode.className !== 'videoPlayer'
      && child.className.indexOf('preventEdit') === -1){
      var child = obj.children[2].children[1].children[0];

      if (messageAction && JSON.stringify(messageAction[0]) == JSON.stringify(message)){
        setMessageAction(null);
      } 
      else {
        setMessageAction([message, obj, child]);
      }
    }
  }

  // Unselect message and hide block with edit/delete buttons
  const clearMessageAction = () => {
    setMessageAction(null);
  }

  // Format date
  const formatDate = (date) => {
    date = new Date(date);
    const months = {
      0: 'January',
      1: 'February',
      2: 'March',
      3: 'April',
      4: 'May',
      5: 'June',
      6: 'July',
      7: 'August',
      8: 'September',
      9: 'October',
      10: 'November',
      11: 'December'
    }
    let year = date.getFullYear();
    let month = months[date.getMonth()]  
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    return month + ', ' + day + ' ' + year + ' ' + hours + ':' + minutes; 
  }

  // Convert size integer to string like '2mb' or '328kb'...
  const getSizeString = (size) => {
    size = size / 1024
    if (size < 1024){
      size = `${Math.round(size)} kb`;
    }
    else{
        size = `${Math.round(size/1024)} mb`;
    }
    return size;
  }

  // Format file name
  const formatFileName = (name) => {
    name = name.split('/')[1];
    name = name.replace(name.match(/\d+/gi)[0], '.');
    return name;
  }

  // Find links in text and put them into <a> tag
  const renderMessageText = (text) => {
    var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    var matches = text.match(expression);
    if (matches) {
      for (let i of matches){
        text = text.replace(i, `<a target='_blank' class='message-link' style='color:blue' href=${i}>${i}</a>`)
      }
    }
    return text;
  }

  // Render HTML code with messages
  const getRoomData = (roomData) => {
    var counter = 0;
    var messageImagesLength = 0;
    var messageSideClass = '';
    if (roomData.room.messages.length > 0){
      return roomData.room.messages.map(message => {
        counter = 0;
        messageSideClass = message.sender.id === me.id ? 'ml-auto' : 'mr-auto';
        messageImagesLength = 0;
        for(let i of message.files){
          if (IMAGE_TYPES.find(item => i.file.split('/')[1].indexOf(item) !== -1)){
            messageImagesLength += 1;
          }
        }
        return (
          <li onClick={message.sender.id === me.id ? ((e) => handleSetMessageAction(message, e.currentTarget, e.target)) : undefined} style={{cursor: 'pointer'}} className={message.sender.id === me.id ? classes.to : classes.from} key={message.id}>
            <time dateTime={message.time}>{formatDate(message.time)}</time>
              {message.sender.avatar ? (
                <Avatar alt="avatar" src={`${BACKEND_URL}${MEDIA_URL}${message.sender.avatar}`} className={classes.avatar} />
              ):
                <Avatar alt="avatar" src="https://www.w3schools.com/howto/img_avatar.png"  className={classes.avatar} />
              }
            <div className={classes.talk + ' message-content'}>
              <div className={messageSideClass} style={{width: 'max-content'}}>
                {message.files.map(item => {
                  var type = IMAGE_TYPES.find(qwe => item.file.split('/')[1].indexOf(qwe) !== -1)
                  if (counter === 0 && messageImagesLength > 4 && type){
                    counter += 1;
                    return(
                      <div className='mb-1' key={item.file}  style={{overflow: 'hidden', height:'120px', display: 'block'}}>
                        <img className='message-image' onClick={() => openModal(item.file, 'online')} style={{cursor: 'pointer', borderRadius: '11px 11px', height:'auto', minHeight:'120px', width:'337px'}} src={`${BACKEND_URL}${MEDIA_URL}${item.file}`} />
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
                      <div key={item.file} style={{padding: '0 3px', overflow: 'hidden', width: '85px', display: 'inline-block'}}>
                        <img className='message-image' onClick={() => openModal(item.file, 'online')} style={imgStyle} src={`${BACKEND_URL}${MEDIA_URL}${item.file}`} />
                      </div>
                    )
                  }
                  else if(type){
                    counter += 1;
                    return(
                      <div key={item.file} style={{overflow: 'hidden', minWidth: '80px', maxWidth: '150px', display: 'inline-block'}}>
                        <img className='message-image' onClick={() => openModal(item.file, 'online')} style={{cursor:'pointer', margin: '0 3px', borderRadius:'5px', height:'120px', width:'auto'}} src={`${BACKEND_URL}${MEDIA_URL}${item.file}`} />
                      </div>
                    )
                  }
                })}
                {message.files.map(item => {
                  var type = IMAGE_TYPES.find(qwe => item.file.split('/')[1].indexOf(qwe) !== -1);
                  if (type === undefined){
                    type = VIDEO_TYPES.find(qwe => item.file.split('/')[1].indexOf(qwe) !== -1);
                    if (type === undefined){
                      return (
                        <div key={item.file} className={`p-1 my-1 ${messageSideClass}`} style={{borderRadius: '7px', width: 'max-content', overflow: 'hidden'}}>
                          <a className='file-link' href={`${BACKEND_URL}${MEDIA_URL}${item.file}`}>
                            <InsertDriveFileIcon style={{width:'18px', height:'18px'}} className='mr-2 mb-1' />
                            {item.file.split('/')[1]}
                          </a>
                        </div>
                      )
                    }
                    else{
                      return (
                        <Card className='p-3'>
                          <a className='file-link' href={`${BACKEND_URL}${MEDIA_URL}${item.file}`} download={formatFileName(item.file)}>
                            <div className='preventEdit d-flex'>
                              <div className='preventEdit'>
                                <CloudDownloadIcon />
                              </div>
                              <div>
                                <p className='preventEdit mb-0 mt-0 ml-2' style={{top: '-7px'}}>{formatFileName(item.file)}
                                  <span className='preventEdit' style={{opacity: '0.5'}}>{getSizeString(item.size)}</span>
                                </p>
                              </div>
                            </div>
                          </a>
                          <ReactPlayer 
                            style={{borderRadius:'5px'}} 
                            width={432} 
                            height={243} 
                            controls={true} 
                            className='videoPlayer' 
                            url={`${BACKEND_URL}${MEDIA_URL}${item.file}`} 
                          />
                        </Card>
                      )
                    }
                  }
                })}
              </div>
              <p style={message.text ? {} : {display: 'none'}}>
                <span dangerouslySetInnerHTML={{__html: renderMessageText(message.text)}}></span>
                {(message.text && message.text.match(VIDEO_REGULAR_LINKS['youtube'])) &&
                (
                  <>
                    <ReactPlayer 
                      config={{
                        youtube: {
                          playerVars: { showinfo: 1 }
                        }
                      }} 
                      width={432} 
                      height={243} 
                      controls={true} 
                      className={`videoPlayer ${messageSideClass} mt-2`}
                      url={`${message.text.match(VIDEO_REGULAR_LINKS['youtube'])}`} 
                    />
                  </>
                )}
                {(message.text && message.text.match(/https?[://.\w]+\.(jpg|png|gif|jpeg|pjpeg|svg+xml|tiff|vnd.microsoft.icon|vnd.wap.wbmp|webp)+/)) &&
                (
                  <Card style={{minWidth: '80px', maxWidth: '250px', maxHeight:'150px', overflow:'hidden'}} className={`preventEdit p-3 mt-2 ${messageSideClass}`}>
                    <img 
                      className='preventEdit' 
                      src={message.text.match(/https?[://.\w]+\.(jpg|png|gif|jpeg|pjpeg|svg+xml|tiff|vnd.microsoft.icon|vnd.wap.wbmp|webp)+/)[0]}
                      onClick={(e) => { console.log(e.currentTarget.src); openModal(e.currentTarget.src, 'external') }} 
                    />
                  </Card>
                )}
              </p>
            </div>
          </li>
        )
      })
    }
    else{
      return (
        <Typography display="block" variant="caption" className="text-center">{'You haven\'t made any conversation yet'}</Typography>
      )
    }
  }

  // Reference ling for text 'typing...'
  const typing = useRef();

  // Remove 'typing...' text
  const deleteTyping = () => {
    if (typing.current) {
      typing.current.hidden = true;
    }
  };

  if (currentRoom) {
    return (
      <Query 
        query={getRoom}
        variables={{firstUser: currentRoom[0], secondUser: currentRoom[1]}}
      >
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return 'Loading...';
          if (error) return `Error ${error}`;
          readRoomMessages(data.room.id);
          subscribeToNewMessage(subscribeToMore, data.room.id);
          return (
            <>
            <Modal 
              open={Boolean(modalImg)}
              onClose={closeModal}
            >
            <img className='img-fluid' style={{width: '600px', border: 'none', outline: 'none', borderRadius: '5px', maxHeight: '90vh', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} src={modalImg} />
            </Modal>
              <div style={{paddingBottom: "12px"}} className={classNames(classes.root, classes.content, showMobileDetail ? classes.detailPopup : '')}>
                <ChatHeader
                  dataContact={dataContact}
                  chatSelected={chatSelected}
                  remove={remove}
                  room={data.room}
                  showMobileDetail={showMobileDetail}
                  hideDetail={hideDetail}
                  me={me}
                />
                <ul className={classes.chatList} id="roomContainer">
                  {getRoomData(data)}
                  {Object.keys(storedMessages).map(item => {
                    if(data.room.users.find(user => user.id == storedMessages[item].room)){
                      return(
                        <StoredMessages types={IMAGE_TYPES} room={data.room} classes={classes} formatDate={formatDate} openModal={openModal} closeModal={closeModal} me={me} deleteStoredMessage={deleteStoredMessage} key={item} message_key={item} message={storedMessages[item]}/>
                      )
                    }
                  })}
                  <Subscription subscription={onFocusSubscription} variables={{roomId: data.room.id}}>
                    {({ data, loading }) => {
                      deleteTyping();
                      return !loading && data.onFocus ? (
                        <li className="grey-text ml-3 mb-3"
                        id="typing"
                        ref={typing}  
                        hidden={false}>
                          <span style={{color: '#b3b3b3'}}>Typing...</span>
                        </li>
                      ) : (
                        ""
                      );
                    }}
                  </Subscription>
                </ul>
                <CreateMessageForm
                  addToStoredMessages={addToStoredMessages}
                  classes={classes} 
                  me={me}
                  types={IMAGE_TYPES}
                  currentRoom={data.room} 
                  setInputOnFocus={setInputOnFocus} 
                  inputOnFocus={inputOnFocus}
                  messageAction={messageAction}
                  handleDeleteMessage={handleDeleteMessage}
                  readRoomMessages={readRoomMessages}
                  clearMessageAction={clearMessageAction}
                  {...data.room}
                />
              </div>
            </>
          )
        }}
      </Query>
    );
  }
  else {
    return (
      <>
      </>
    );
  }
}

export default compose(
  withStyles(styles),
  graphql(readMessages, { name: "readMessages" })
)(ChatRoom);
