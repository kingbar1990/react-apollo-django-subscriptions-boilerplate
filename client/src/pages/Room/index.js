import React, { useState, useRef, useEffect } from "react";
import { Query, Subscription, graphql, compose } from "react-apollo";
import { MDBContainer } from "mdbreact";
import _ from "lodash";

import {
  getRoom,
  newMessageSubscription,
  unviewedMessageSubscription,
  User,
  readMessages,
  onFocusSubscription
} from "../../queries";

import { DATA_PER_PAGE } from "../../constants";
import UserInfo from "../../components/UserProfile";
import CreateMessageForm from "../../components/Forms/CreateMessageForm";
import MessageList from "./MessageList";

const Room = props => {
  const [inputOnFocus, setInputOnFocus] = useState(false);
  const [lastPollingTime, setLastPollingTime] = useState(0);

  const currentRoom = props.match.params.id;
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
            messages: [...prev.room.messages, newMessage],
            users: prev.room.users,
            __typename: prev.room.__typename
          }
        });
      }
    });
  };
  
  const readRoomMessages = () => {
    props.readMessages({
      variables: {
        roomId: currentRoom,
      }
    });
  };

  useEffect(() => {
    readRoomMessages();
  }, []);

  const typing = useRef();

  const deleteTyping = () => {
    if (typing.current) {
      typing.current.hidden = true;
    }
  };

  const testThrottle = _.throttle(deleteTyping, 10000);

  return (
    <Query
      query={getRoom}
      variables={{ id: currentRoom, first: DATA_PER_PAGE }}
    >
      {({ loading, error, data, subscribeToMore, fetchMore }) => {
        if (loading) return null
        if (error) return `Error! ${error.message}`
        subscribeToNewMessage(subscribeToMore, currentRoom);
        return (
          <MDBContainer>
            <CreateMessageForm
              currentRoom={currentRoom}
              setInputOnFocus={setInputOnFocus}
              inputOnFocus={inputOnFocus}
              {...data.room}
            />
            <MessageList
              me={props.me.me}
              data={data.room}
              currentRoom={currentRoom}
              readRoomMessages={readRoomMessages}
              onLoadMore={() =>
                fetchMore({
                  variables: {
                    id: currentRoom,
                    first: DATA_PER_PAGE,
                    skip: data.room.messages.length
                  },
                  updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult) return prev;
                    return Object.assign({}, prev, {
                      room: {
                        messages: [
                          ...prev.room.messages,
                          ...fetchMoreResult.room.messages
                        ],
                        users: prev.room.users,
                        __typename: prev.room.__typename
                      }
                    });
                  }
                })
              }
            />
            <div className="bar-right position-fixed shade">
              <UserInfo profile={data.room.users[0]} />
            </div>
            <Subscription subscription={onFocusSubscription} variables={{roomId: currentRoom}}>
              {({ data, loading }) => {
                testThrottle();
                if (typing.current) {
                  typing.current.hidden = false;
                }
                return !loading && data.onFocus && !inputOnFocus ? (
                  <em
                    className="grey-text"
                    id="typing"
                    ref={typing}  
                    hidden={false}
                  >
                    Typing...
                  </em>
                ) : (
                  ""
                );
              }}
            </Subscription>
          </MDBContainer>
        );
      }}
    </Query>
  );
};

export default compose(
  graphql(User, { name: "me" }),
  graphql(readMessages, { name: "readMessages" })
)(Room);
