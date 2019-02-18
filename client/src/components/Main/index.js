import React from 'react'
import { MDBContainer } from 'mdbreact'

import NavBar from '../../components/NavBar'
import SideBar from '../../components/SideBar'
import Footer from '../../components/Footer'

import { withAuth } from '../../hocs/PrivateRoute'

import '../../index.css'

const Dashboard = ({ children }) => (
  <div className="flexible-content">
    <SideBar />
    <main className="main-container">
      <NavBar />
      <MDBContainer>{children}</MDBContainer>
      <Footer />
    </main>
  </div>
)

export default withAuth(Dashboard)
