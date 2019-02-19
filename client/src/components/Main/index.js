import React from 'react'
import { MDBContainer } from 'mdbreact'

import NavBar from '../../components/NavBar'
import SideBar from '../../components/SideBar'

import { withAuth } from '../../hocs/PrivateRoute'

import '../../index.css'

const Main = props => (
  <div className="flexible-content">
    <SideBar />
    <main className="main-container">
      <NavBar />
      <MDBContainer>{props.children}</MDBContainer>
    </main>
  </div>
)

export default withAuth(Main)
