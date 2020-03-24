import React, { Component } from "react";
import {
  Navbar,
  NavbarBrand,
  MDBNavbarToggler,
  MDBNavItem,
  MDBNavLink,
  MDBCollapse,
  MDBNavbarNav
} from "mdbreact";
import IosMailOutline from "react-ionicons/lib/IosMailOutline";
import { Subscription, graphql } from "react-apollo";

import { NavLink } from "react-router-dom"
import {
  unviewedMessageSubscription,
  User,
  hasUnreadedMessagesSubscription
} from "../../queries";
import { DASHBOARD, PROFILE, HOME } from "../../constants/routes";
import "./index.css";

class NavBar extends Component {
  state = {
    open: false,
    collapseID: ""
  };

  handleClick = () => {
    this.setState({ open: !this.state.open });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  toggleCollapse = collapseID => () => {
    this.setState(state => {
      if (state.collapseID !== collapseID) {
        return { collapseID: collapseID };
      }
      return { collapseID: "" };
    });
  };

  handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  subscribeToNewMessage = subscribeToMore => {
    subscribeToMore({
      document: unviewedMessageSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        return Object.assign({}, prev, {
          rooms: [...prev.rooms]
        });
      }
    });
  };
  render() {
    return (
      <Navbar className="flexible-navbar" light expand="md" scrolling>
        <MDBNavLink className='mx-2' to={HOME}>Landing</MDBNavLink>
        <MDBNavbarToggler onClick={this.toggleCollapse("navbarCollapse13")} />
        <MDBCollapse
          id="navbarCollapse13"
          isOpen={this.state.collapseID}
          navbar
        >
          <MDBNavbarNav left>
            <MDBNavItem>
              <MDBNavLink className='mx-2' to={DASHBOARD}>Home</MDBNavLink>
            </MDBNavItem>
            <MDBNavItem>
              <MDBNavLink className='mx-2' to={PROFILE}>Profile</MDBNavLink>
            </MDBNavItem>
            {this.props.me.loading ? null : (
              <MDBNavItem>
                <MDBNavLink to={PROFILE}>
                  <Subscription subscription={hasUnreadedMessagesSubscription} variables={{userId:this.props.me.me.id}}>
                    {({ data, loading }) => {
                      return (!loading && data.hasUnreadedMessages) ||
                        (this.props.me.me.hasUnreadedMessages &&
                          data === undefined) ? (
                        <div
                          id="message-badge"
                          style={{ position: "relative" }}
                        >
                          <IosMailOutline fontSize="30px" color="#000000" />
                        </div>
                      ) : (
                        <IosMailOutline fontSize="30px" color="#000000" />
                      );
                    }}
                  </Subscription>
                </MDBNavLink>
              </MDBNavItem>
            )}
            <MDBNavItem>
              <MDBNavLink to={PROFILE} onClick={this.handleLogout}>
                Log out
              </MDBNavLink>
            </MDBNavItem>
          </MDBNavbarNav>
        </MDBCollapse>
      </Navbar>
    );
  }
}

export default graphql(User, { name: "me" })(NavBar);
