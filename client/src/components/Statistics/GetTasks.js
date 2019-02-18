import React from 'react'
import { MDBCard } from 'mdbreact'
import { graphql, Query } from 'react-apollo'

import { getTasks } from '../../queries'

const GetTasks = () => {
  return (
    <Query query={getTasks} variables={{ page: 1 }}>
      {({ loading, error, data }) => {
        if (loading) return null
        if (error) return `Error! ${error.message}`
        const tasks = data.tasks.objects

        return (
          <MDBCard className="card-body mt-3">
            {tasks.map(i => (
              <div key={i.id}>
                <h4>{i.assignedTo.fullName}</h4>
                <p>{i.name}</p>
              </div>
            ))}
          </MDBCard>
        )
      }}
    </Query>
  )
}

export default graphql(getTasks, { options: { fetchPolicy: 'no-cache' } })(
  GetTasks
)
