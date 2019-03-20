import React from "react"

import Message from "./Message"

const MessageList = ({ data, currentRoom, onLoadMore, me }) => {
  const handleScroll = ({ currentTarget }, onLoadMore) => {
    if (
      currentTarget.scrollTop + currentTarget.clientHeight >=
      currentTarget.scrollHeight
    ) {
      onLoadMore()
    }
  }
  return (
    <article className="feed py-3" onScroll={e => handleScroll(e, onLoadMore)}>
      {data.messages.map(i => {
        return (
          <div
            className={me.id === i.sender.id ? "content mb-3" : "md-3"}
            key={i.id}
          >
            <Message {...i} currentRoom={currentRoom} />
          </div>
        )
      })}
    </article>
  )
}

export default MessageList
