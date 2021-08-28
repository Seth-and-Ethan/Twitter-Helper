import React from "react";
import { Route, Redirect } from 'react-router-dom';
import jwt_decode from "jwt-decode";

export const getUserId = () => {
  let token = localStorage.getItem('token');
  let decodedToken = jwt_decode(token);
  return decodedToken['username'];
}

export const getOauth = () => {
  let token = localStorage.getItem('token');
  let decodedToken = jwt_decode(token);
  return decodedToken['oauth'];
}

export const setAuth = (res) => {
  localStorage.setItem('token', res['token'])
}

export const destroyAuth = () => {
  localStorage.setItem('token', '')
}

export const checkLogin = () => {
  let token = localStorage.getItem('token');

  if (!token || token == '') {
    return false;
  }


  try {
    let decodedToken = jwt_decode(token);
    let expirationMS = new Date(decodedToken['expiration']).getTime();
    let currentMS = new Date().getTime();

    if (!(decodedToken['username'] && decodedToken['expiration'])) {
      return false; 
    } else if (currentMS > expirationMS) {
      return false;
    }

  } catch (e) {
    return false;
  }

  return true
}

export const checkAuth = () => {
  let token = localStorage.getItem('token');

  if (!token || token == '') {
    return false;
  }


  try {
    let decodedToken = jwt_decode(token);
    let expirationMS = new Date(decodedToken['expiration']).getTime();
    let currentMS = new Date().getTime();

    if (!(decodedToken['oauth'] && decodedToken['expiration'])) {
      return false; 
    } else if (currentMS > expirationMS) {
      return false;
    }

  } catch (e) {
    return false;
  }

  return true
}

export const PrivateRoute = ({component, ...rest}) => {
  const Component = component;
  return (
    <Route {...rest} render={props => (
      checkLogin() ? (
        <Component {...props} />
      ) : (
        <Redirect to='/login' />
      )
    )} />
  )
};

export const PrivateRouteWithAuth = ({component, ...rest}) => {
  const Component = component;
  return (
    <Route {...rest} render={props => (
      checkAuth() ? (
        <Component {...props} />
      ) : (
        <Redirect to='/login' />
      )
    )} />
  )
};
