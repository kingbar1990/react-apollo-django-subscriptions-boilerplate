import React from 'react'

import Message from './Message'

const MessageList = ({ data, currentRoom, onLoadMore }) => {
  const handleScroll = ({ currentTarget }, onLoadMore) => {
    if (
      currentTarget.scrollTop + currentTarget.clientHeight >=
      currentTarget.scrollHeight
    ) {
      onLoadMore()
    }
  }

  return (
    <article className="feed" onScroll={e => handleScroll(e, onLoadMore)}>
      {data.messages.map(i => (
        <div className="content mt-3" key={i.id}>
          <Message {...i} currentRoom={currentRoom} />
        </div>
      ))}
    </article>
  )
}

export default MessageList
