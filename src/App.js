import React, { useState } from "react";
import { BrowserRouter, Route, Switch, Link, Redirect } from 'react-router-dom';
import { PrivateRoute } from "./verifyLogin"
import Home from './components/Home/Home';
import Login from './components/Login/Login'
import Register from './components/Register/Register'

const App = () => {

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
        <Route path="/home" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;