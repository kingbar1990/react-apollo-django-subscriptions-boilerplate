import React from 'react'
import { Query } from 'react-apollo'
import { MDBContainer } from 'mdbreact'

import NavBar from '../../components/NavBar'
import SideBar from '../../components/SideBar'

import { withAuth } from '../../hocs/PrivateRoute'
import { User } from '../../queries'

import '../../index.css'

const Main = props => (
  <div className="flexible-content">
    <Query query={User}>
      {({ loading, error, data }) => {
        if (loading) return 'Loading...'
        if (error) return `Error! ${error.message}`
        return <SideBar {...data.me} />
      }}
    </Query>
    <main className="main-container">
      <NavBar />
      <MDBContainer>{props.children}</MDBContainer>
    </main>
  </div>
)

export default withAuth(Main)
