import React, { useRef, useEffect } from "react"

import Message from "./Message"

const MessageList = ({ data, currentRoom, onLoadMore, me }) => {
  useEffect(() => {
    chatEnd.current.scrollIntoView()
  })

  const handleScroll = ({ currentTarget }, onLoadMore) => {
    if (
      currentTarget.scrollTop + currentTarget.clientHeight >=
      currentTarget.scrollHeight
    ) {
      onLoadMore()
    }
  }

  const chatEnd = useRef()

  return (
    <article className="feed py-3" onScroll={e => handleScroll(e, onLoadMore)}>
      {data.messages.map(i => {
        return (
          <div
            className={me.id === i.sender.id ? "content mb-3" : "mb-3"}
            key={i.id}
          >
            <Message {...i} currentRoom={currentRoom} me={me} />
          </div>
        )
      })}

      {/* dummy div for scroll page to end of a chat */}
      <div ref={chatEnd} />
    </article>
  )
}

export default MessageList
