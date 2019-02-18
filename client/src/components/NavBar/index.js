import React, { Component } from 'react'
import {
  Navbar,
  NavbarBrand,
  MDBNavbarToggler,
  MDBNavItem,
  MDBNavLink,
  MDBCollapse,
  MDBNavbarNav
} from 'mdbreact'

import { DASHBOARD, PROFILE } from '../../constants/routes'

export default class NavBar extends Component {
  state = {
    open: false,
    collapseID: ''
  }

  handleClick = () => {
    this.setState({ open: !this.state.open })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  toggleCollapse = collapseID => () => {
    this.setState(state => {
      if (state.collapseID !== collapseID) {
        return { collapseID: collapseID }
      }
      return { collapseID: '' }
    })
  }

  handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  render() {
    return (
      <Navbar className="flexible-navbar" light expand="md" scrolling>
        <NavbarBrand href="/">Landing</NavbarBrand>
        <MDBNavbarToggler onClick={this.toggleCollapse('navbarCollapse13')} />
        <MDBCollapse
          id="navbarCollapse13"
          isOpen={this.state.collapseID}
          navbar
        >
          <MDBNavbarNav left>
            <MDBNavItem>
              <MDBNavLink to={DASHBOARD}>Home</MDBNavLink>
            </MDBNavItem>
            <MDBNavItem>
              <MDBNavLink to={PROFILE}>Profile</MDBNavLink>
            </MDBNavItem>
            <MDBNavItem>
              <MDBNavLink to={PROFILE} onClick={this.handleLogout}>
                Log out
              </MDBNavLink>
            </MDBNavItem>
          </MDBNavbarNav>
        </MDBCollapse>
      </Navbar>
    )
  }
}
