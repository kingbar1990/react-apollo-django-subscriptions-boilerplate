import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Query, graphql } from "react-apollo"
import { flowRight as compose }  from 'lodash';
import { getUsers, User, onlineUsersSubsciption } from "../../queries/index";
import { Helmet } from 'react-helmet';
import  ContactList  from "../../components/Contact/ContactList";
import   ChatRoom   from "../../components/Chat/ChatRoom";

import styles from '../../components/Contact/contact-jss';

const Chat = (props) => {
  const {
    classes,
    showDetail,
    hideDetail,
    keyword,
    search,
    chatSelected,
    sendMessage,
    remove,
    showMobileDetail
  } = props;

  const title = 'Chat App'
  const description = 'Chat Description'
  const [currentRoom, setCurrentRoom] = useState(null);
  
  // Change current room
  const changeRoom = (firstUser, secondUser) => {
    setCurrentRoom([firstUser, secondUser]);
  }

  // Subscribe to get info about new users online statuses
  const subscribeToOnlineUsers = subscribeToMore => {
    subscribeToMore({
      document: onlineUsersSubsciption,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return Object.assign({}, prev, {
          users: [...subscriptionData.data.onlineUsers]
        });
      }
    });
  };

    
  if (props.me.me !== undefined){
    return (
      <Query query={getUsers}>
        {({loading, error, data, subscribeToMore}) => {
          if (loading) return 'Loading ...';
          if (error) return `Error ${error}`;
          const users = data.users.filter(item => item.id !== props.me.me.id);
          const firstDialog = users.length > 0 ? [users[0].id, props.me.me.id] : null;
          subscribeToOnlineUsers(subscribeToMore);
          return (
            <div style={{height: "calc(100vh - 70px)"}}>
              <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="twitter:title" content={title} />
                <meta property="twitter:description" content={description} />
              </Helmet>
              <div className={classes.root}  style={{paddingBottom: "15px"}} style={{height: "calc(100vh - 70px)", marginBottom: "0"}}>
                <ContactList
                  total={users.length}
                  itemSelected={chatSelected}
                  dataContact={users}
                  currentRoom={currentRoom || firstDialog}
                  changeRoom={changeRoom}
                  showDetail={showDetail}
                  search={search}
                  me={props.me.me}
                  keyword={keyword}
                />
                <ChatRoom
                  showMobileDetail={showMobileDetail}
                  dataChat={""}
                  me={props.me.me}
                  chatSelected={chatSelected}
                  dataContact={""}
                  currentRoom={currentRoom || firstDialog}
                  sendMessage={sendMessage}
                  remove={remove}
                  hideDetail={hideDetail}
                />
              </div>
            </div>
          )
        }}
      </Query>
    );
  }
  else{
    return 'Loading...'
  }
}

export default compose(
  withStyles(styles),
  graphql(User, {name: 'me'}),
)(Chat);
