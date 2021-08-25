import React, { useState } from "react";
import { BrowserRouter, Route, Switch, Link, Redirect } from 'react-router-dom';
import { PrivateRoute } from "./verifyLogin"
import Home from './components/Home/Home';
import Login from './components/Login/Login'
import LoginTwo from './components/LoginTwo/Login'
import Register from './components/Register/Register'
import SentimentAnalysis from "./components/SentimentAnalysis/SentimentAnalysis";
import ProfileManagement from "./components/ProfileManagement/ProfileManagement";
import oauths from "./components/oauth";

const App = () => {

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
        <PrivateRoute path="/home" component={Home} />
        <PrivateRoute path="/analysis" component={SentimentAnalysis} />
        <PrivateRoute path="/profile" component={ProfileManagement} />
        <Route path="/login" component={Login} />
        <Route path="/loginTwo" component={LoginTwo} />
        <Route path="/register" component={Register} />
        <Route path="/api/oauth" component={oauths}/>
      </Switch>
    </BrowserRouter>
  );
};

export default App;