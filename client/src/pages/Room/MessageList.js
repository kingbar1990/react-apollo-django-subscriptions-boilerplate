import React, { useRef, useEffect } from "react";

import Message from "./Message";
import StoredMessages from "./StoredMessages";

const MessageList = ({
  data,
  currentRoom,
  onLoadMore,
  me,
  readRoomMessages,
  storedMessages,
  deleteStoredMessage
}) => {
  useEffect(() => {
    chatEnd.current.scrollIntoView();
  });
  const handleScroll = ({ currentTarget }, onLoadMore) => {
    if (
      currentTarget.scrollTop + currentTarget.clientHeight >=
      currentTarget.scrollHeight
    ) {
      onLoadMore();
    }
  };

  const chatEnd = useRef();

  return (
    <article className="feed py-3" onScroll={e => handleScroll(e, onLoadMore)}>
      {data.messages.map(i => {
        return i.isDeleted ? null : (
          <div
            className={me.id === i.sender.id ? "content mb-3" : "mb-3"}
            key={i.id}
          >
            <Message
              {...i}
              currentRoom={currentRoom}
              me={me}
              readRoomMessages={readRoomMessages}
            />
          </div>
        );
      })}
      {Object.keys(storedMessages).map(item => {
        return(
          <div className="content mb-3">
            <StoredMessages deleteStoredMessage={deleteStoredMessage} key={item} message_key={item} message={storedMessages[item]}/>
          </div>
        )
      })}

      {/* dummy div for scroll page to end of a chat */}
      <div ref={chatEnd} />
    </article>
  );
};

export default MessageList;
