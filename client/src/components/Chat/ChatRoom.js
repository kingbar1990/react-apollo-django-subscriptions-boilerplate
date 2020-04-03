import React, { useState, useEffect } from 'react';
import Avatar from '@material-ui/core/Avatar';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Typography from '@material-ui/core/Typography';

//import dummyContents from 'dan-api/dummy/dummyContents';
//import Type from '../../styles/components/';
import ChatHeader from './ChatHeader';
import styles from './chatStyle-jss';
import { Query, graphql, withApollo } from "react-apollo";
import { getRoom, newMessageSubscription, readMessages } from "../../queries/index";
import { useQuery } from "@apollo/react-hooks";
import {flowRight as compose} from "lodash";
import { BACKEND_URL, MEDIA_URL } from '../../constants/index';
import CreateMessageForm from '../../components/Forms/CreateMessageForm/new';


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

  const [inputOnFocus, setInputOnFocus] = useState(false);
  
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

    const getRoomData = (roomData) => {
      if (roomData.room.messages.length > 0){
        return roomData.room.messages.map(message => {
          return (
            <li className={message.sender.id === me.id ? classes.to : classes.from} key={message.id}>
              <time dateTime={message.time}>{formatDate(message.time)}</time>
                {message.sender.avatar ? (
                  <Avatar alt="avatar" src={`${BACKEND_URL}${MEDIA_URL}${message.sender.avatar}`} className={classes.avatar} />
                ):
                <Avatar alt="avatar" src={"https://www.w3schools.com/howto/img_avatar.png"} className={classes.avatar} />
                }
              <div className={classes.talk}>
                <p>
                  <span>{message.text}</span>
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
            <div className={classNames(classes.root, classes.content, showMobileDetail ? classes.detailPopup : '')}>
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
              </ul>
              <CreateMessageForm
                classes={classes} 
                currentRoom={data.room} 
                setInputOnFocus={setInputOnFocus} 
                inputOnFocus={inputOnFocus}
                readRoomMessages={readRoomMessages}
                {...data.room}
              />
              </div>
          )
        }}
      </Query>
    );
  }

export default compose(
  withStyles(styles),
  graphql(readMessages, { name: "readMessages" })
)(ChatRoom);
