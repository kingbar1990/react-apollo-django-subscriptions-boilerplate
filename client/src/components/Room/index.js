import React from 'react'
import { MDBCard } from 'mdbreact'
import { graphql, Query } from 'react-apollo'

import { getMessages } from '../../queries'

const Room = () => {
  return (
    <Query query={getMessages} variables={{ page: 1 }}>
      {({ loading, error, data }) => {
        if (loading) return null
        if (error) return `Error! ${error.message}`

        return data.messages.objects.map(i => (
          <MDBCard className="card-body mt-3" key={i.id}>
            <h4>{i.text}</h4>
            <p>{i.sender.fullName}</p>
            <p>{i.recipient.fullName}</p>
            <i>{i.time}</i>
          </MDBCard>
        ))
      }}
    </Query>
  )
}

export default graphql(getMessages)(Room)
