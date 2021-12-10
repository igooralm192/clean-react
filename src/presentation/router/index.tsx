import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

type Props = {
  makeLogin: React.FC
}

const Router: React.FC<Props> = ({ makeLogin }) => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/login' component={makeLogin}/>
      </Switch>
    </BrowserRouter>
  )
}

export default Router