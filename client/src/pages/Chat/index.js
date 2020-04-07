import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Query, graphql } from "react-apollo"
import { flowRight as compose }  from 'lodash';
import { getUsers, User, onlineUsersSubsciption } from "../../queries/index";
//import { bindActionCreators } from 'redux';
//import { connect } from 'react-redux';
//import contactData from '../../data/ContactData';
//import chatData from '../../data/ChatData';
import { Helmet } from 'react-helmet';
//import brand from 'dan-api/dummy/brand';
import  ContactList  from "../../components/Contact/ContactList";
import   ChatRoom   from "../../components/Chat/ChatRoom";
//import { fetchAction, searchAction } from 'dan-actions/ContactActions';
/*import {
  fetchChatAction,
  showChatAction,
  sendAction,
  hideDetailAction,
  deleteAction
} from 'dan-actions/ChatActions';*/

import styles from '../../components/Contact/contact-jss';

const Chat = (props) => {
  /*useEffect = () => {
    //const { fetchChatData, fetchContactData } = this.props;
    //fetchChatData(chatData);
    //fetchContactData(contactData);
  }*/
    //const title = brand.name + ' - Chat App';
    const title = 'Chat App'
    const description = 'Chat Description'
    //const description = brand.desc;
    const [currentRoom, setCurrentRoom] = useState(null);
    
    const changeRoom = (firstUser, secondUser) => {
      setCurrentRoom([firstUser, secondUser]);
    }

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

    const {
      classes,
      //dataContact,
      showDetail,
      hideDetail,
      keyword,
      search,
      //dataChat,
      chatSelected,
      sendMessage,
      remove,
      showMobileDetail
    } = props;
    if (props.me.me !== undefined){
    return (
      <Query query={getUsers}>
        {({loading, error, data, subscribeToMore}) => {
          if (loading) return 'Loading ...';
          if (error) return `Error ${error}`;
          const users = data.users.filter(item => item.id !== props.me.me.id);
          const firstDialog = [users[0].id, props.me.me.id];
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


const reducerContact = 'contact';
const reducerChat = 'chat';
const mapStateToProps = state => ({
  force: state, // force state from reducer
  dataContact: state.getIn([reducerContact, 'contactList']),
  dataChat: state.getIn([reducerChat, 'activeChat']),
  chatSelected: state.getIn([reducerChat, 'chatSelected']),
  showMobileDetail: state.getIn([reducerChat, 'showMobileDetail']),
  keyword: state.getIn([reducerContact, 'keywordValue']),
});

const dispatchToProps = dispatch => ({
  //fetchContactData: bindActionCreators(fetchAction, dispatch),
  //hideDetail: () => dispatch(hideDetailAction),
  //fetchChatData: bindActionCreators(fetchChatAction, dispatch),
  //showDetail: bindActionCreators(showChatAction, dispatch),
  //search: bindActionCreators(searchAction, dispatch),
  //sendMessage: bindActionCreators(sendAction, dispatch),
  //remove: () => dispatch(deleteAction),
});

/*const ChatMapped = connect(
  mapStateToProps,
  dispatchToProps
)(Chat);*/

export default compose(
  withStyles(styles),
  graphql(User, {name: 'me'}),
)(Chat);
