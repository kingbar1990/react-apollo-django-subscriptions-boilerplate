import React from "react";
import { ListGroupItem, MDBBadge } from "mdbreact";
import { NavLink } from "react-router-dom";
import { Query, graphql } from "react-apollo";

import { DASHBOARD } from "../../constants/routes";
import { getRooms, unviewedMessageSubscription, User } from "../../queries";

const Sidebar = props => {
  const subscribeToNewMessage = subscribeToMore => {
    subscribeToMore({
      document: unviewedMessageSubscription,
      variables: {
        userId: props.me.me.id
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return Object.assign({}, prev, {
          rooms: [...prev.rooms]
        });
      }
    });
  };
  return (
    <div className="sidebar-fixed position-fixed shade">
      <a href={DASHBOARD} className="sidebar">
        <h3 className="logo-wrapper">Current room</h3>
      </a>
      <Query query={getRooms} variables={{ userId: props.id }}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return "Loading...";
          if (error) return `Error! ${error.message}`;

          subscribeToNewMessage(subscribeToMore);

          return data.rooms.map(i => (
            <NavLink
              to={`/dashboard/${i.id}`}
              activeClassName="activeClass"
              key={i.id}
            >
              <ListGroupItem className="flex-space shade">
                {props.me.me.id === i.users[0].id
                  ? i.users[0].fullName
                  : i.users[1].fullName}
                <MDBBadge
                  color={i.unviewedMessages > 0 ? "red" : "elegant-color"}
                  pill
                >
                  {i.unviewedMessages}
                </MDBBadge>
              </ListGroupItem>
            </NavLink>
          ));
        }}
      </Query>
    </div>
  );
};

export default graphql(User, { name: "me" })(Sidebar);
