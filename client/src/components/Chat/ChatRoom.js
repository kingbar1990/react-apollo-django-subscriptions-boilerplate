import React, { useState, useEffect, useRef } from 'react';
import Avatar from '@material-ui/core/Avatar';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Typography from '@material-ui/core/Typography';

//import dummyContents from 'dan-api/dummy/dummyContents';
//import Type from '../../styles/components/';
import ChatHeader from './ChatHeader';
import styles from './chatStyle-jss';
import { Query, graphql, withApollo, Subscription, useMutation } from "react-apollo";
import { getRoom, newMessageSubscription, readMessages, onFocusSubscription, deleteMessage } from "../../queries/index";
import { useQuery } from "@apollo/react-hooks";
import {flowRight as compose} from "lodash";
import { BACKEND_URL, MEDIA_URL } from '../../constants/index';
import CreateMessageForm from '../../components/Forms/CreateMessageForm/new';
import { Modal } from '@material-ui/core';
import StoredMessages from "./StoredMessages";
import _ from "lodash";

const ChatRoom = props => {
  const {
    classes,
    dataChat,
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

  function getAllLocalStorageItems() {
    var tempDict = {}
    var keys = Object.keys(localStorage);
    for (let i of keys){
      if(i.indexOf('message') !== -1) {
        let item = JSON.parse(localStorage.getItem(i));
        if(item["room"] === currentRoom[0]){
          tempDict[i] = item;
        }
      }
    }
    return tempDict;
  }
  
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

  const deleteStoredMessage = (message_id) => {
    localStorage.removeItem(message_id);
    var newDict = getAllLocalStorageItems();
    setStoredMessages(newDict);
  }

  const addToStoredMessages = (text, room, sender, avatar) => {
    let randomInt = Math.round(Math.random() * 10000000)
    localStorage.setItem(
      `message_${randomInt}`, 
      JSON.stringify({"text": text, "room": room, "sender": sender, "file": avatar}))
    var newDict = getAllLocalStorageItems();
    setStoredMessages(newDict);
  }

  const openModal = (imgSrc) => {
    setModalImg(`${BACKEND_URL}${MEDIA_URL}${imgSrc}`);
  }

  const closeModal = () => {
    setModalImg('');
  }

  const readRoomMessages = (roomId) => {
    props.readMessages({
      variables: {
        roomId: roomId
      },
    });
  };

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

  const clearMessageAction = () => {
    setMessageAction(null);
  }

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

  /*const resetInput = () => {
    const ctn = document.getElementById('roomContainer');
    setMessage('');
    _field.setState({ value: '' });
    setTimeout(() => {
      ctn.scrollTo(0, ctn.scrollHeight);
    }, 300);
  }*/

  /*sendMessageByEnter = (event, message) => {
    const { sendMessage } = props;
    if (event.key === 'Enter' && event.target.value !== '') {
      sendMessage(message.__html);
      this.resetInput();
    }
  }*/

  /*sendMessage = message => {
    const { sendMessage } = this.props;
    sendMessage(message.__html);
    this.resetInput();
  }*/
  
    /*const getChat = dataArray => dataArray.map(data => {
      const renderHTML = { __html: data.get('message') };
      return (
        <li className={data.get('from') === 'contact' ? classes.from : classes.to} key={data.get('id')}>
          <time dateTime={data.get('date') + ' ' + data.get('time')}>{data.get('date') + ' ' + data.get('time')}</time>
          {data.get('from') === 'contact' ? (
            <Avatar alt="avatar" src={"https://www.w3schools.com/howto/img_avatar.png"} className={classes.avatar} />
          ) : (
            <Avatar alt="avatar" src="https://www.w3schools.com/howto/img_avatar.png" className={classes.avatar} />
          )}
          <div className={classes.talk}>
            <p><span dangerouslySetInnerHTML={renderHTML} /></p>
          </div>
        </li>
      );
    })*/

    const handleSetMessageAction = (message, obj) => {
      if (obj.children[2].children.length > 1){
        var child = obj.children[2].children[1].children[0];
        setMessageAction([message, obj, child]);
      }
    }


    const getRoomData = (roomData) => {
      var counter = 0;
      if (roomData.room.messages.length > 0){
        return roomData.room.messages.map(message => {
          counter = 0;
          return (
            <li onClick={message.sender.id === me.id ? ((e) => handleSetMessageAction(message, e.currentTarget)) : undefined} style={{cursor: 'pointer'}} className={message.sender.id === me.id ? classes.to : classes.from} key={message.id}>
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
        })
      }
      else{
        return (
          <Typography display="block" variant="caption" className="text-center">{'You haven\'t made any conversation yet'}</Typography>
        )
      }
    }

    const typing = useRef();

    const deleteTyping = () => {
      if (typing.current) {
        typing.current.hidden = true;
      }
    };


    return (
      <Query 
        query={getRoom}
        variables={{firstUser: currentRoom[0], secondUser: currentRoom[1]}}
      >
        {({ loading, error, data, subscribeToMore, refetch }) => {
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
                    return(
                      <StoredMessages classes={classes} formatDate={formatDate} openModal={openModal} closeModal={closeModal} me={me} deleteStoredMessage={deleteStoredMessage} key={item} message_key={item} message={storedMessages[item]}/>
                    )
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

export default compose(
  withStyles(styles),
  graphql(readMessages, { name: "readMessages" })
)(ChatRoom);
