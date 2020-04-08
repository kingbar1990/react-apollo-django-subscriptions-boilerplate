import React, { useState } from "react";
import {
  Navbar,
  MDBNavbarToggler,
  MDBNavItem,
  MDBNavLink,
  MDBCollapse,
  MDBNavbarNav
} from "mdbreact";
import IosMailOutline from "react-ionicons/lib/IosMailOutline";
import { Subscription, graphql } from "react-apollo";

import {
  User,
  hasUnreadedMessagesSubscription
} from "../../queries";
import { PROFILE, SIGN_IN, ROOM } from "../../constants/routes";
import "./index.css";

const NavBar = (props) => {
  const [collapseID, setCollapseId] = useState("");

  const toggleCollapse = varCollapseID => () => {
    if (collapseID !== varCollapseID){
      setCollapseId(varCollapseID);
    }
    else{
      setCollapseId("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <Navbar className="flexible-navbar" light expand="md" scrolling style={{height: "70px"}}>
      <MDBNavbarToggler onClick={toggleCollapse("navbarCollapse13")} />
      <MDBCollapse
        id="navbarCollapse13"
        isOpen={collapseID}
        navbar
      >
        <MDBNavbarNav left>
          <MDBNavItem>
            <MDBNavLink className='mx-2' to={ROOM}>Home</MDBNavLink>
          </MDBNavItem>
          <MDBNavItem>
            <MDBNavLink className='mx-2' to={PROFILE}>Profile</MDBNavLink>
          </MDBNavItem>
          {props.me.loading ? null : (
            <MDBNavItem>
              <MDBNavLink to={ROOM}>
                <Subscription subscription={hasUnreadedMessagesSubscription} variables={{userId:props.me.me.id}}>
                  {({ data, loading }) => {
                    return (!loading && data.hasUnreadedMessages) ||
                      (props.me.me.hasUnreadedMessages &&
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
            <MDBNavLink to={SIGN_IN} onClick={handleLogout}>
              Log out
            </MDBNavLink>
          </MDBNavItem>
        </MDBNavbarNav>
      </MDBCollapse>
    </Navbar>
  );
}

export default graphql(User, { name: "me" })(NavBar);
