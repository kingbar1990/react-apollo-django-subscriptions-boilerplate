import React, { Fragment } from 'react'
import { Query } from 'react-apollo'
import { Offline, Online } from 'react-detect-offline'

import NavBar from '../../components/NavBar'
import SideBar from '../../components/SideBar'
import OfflinePage from '../OfflinePage'

import { withAuth } from '../../hocs/PrivateRoute'
import { User } from '../../queries'

import '../../index.css'

const Main = props => (
  <Fragment>
    <Offline>
      <OfflinePage />
    </Offline>
    <Online>
      <div className="flexible-content">
        <Query query={User}>
          {({ loading, error, data }) => {
            if (loading) return 'Loading...'
            if (error) return `Error! ${error.message}`
            return <SideBar {...data.me} />
          }}
        </Query>
        <NavBar />
        {props.children}
      </div>
    </Online>
  </Fragment>
)

export default withAuth(Main)
