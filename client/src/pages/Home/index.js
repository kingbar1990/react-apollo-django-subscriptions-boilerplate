import React from 'react'
import { Link } from 'react-router-dom'

import * as path from '../../constants/routes'

const Home = () => (
  <div className="app">
    <h1>Home Page</h1>
    <p>
      <Link to={path.SIGN_IN}>login</Link>
    </p>
    <p>
      <Link to={path.SIGN_UP}>signup</Link>
    </p>
    <p>
      <Link to={path.DASHBOARD}>dashboard</Link>
    </p>
  </div>
)

export default Home
