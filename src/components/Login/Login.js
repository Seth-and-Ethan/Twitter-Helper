import React, { useEffect, useState } from "react";
import { checkAuth, checkLogin, setAuth, getOauth } from '../../verifyLogin';
import { Redirect, Link } from 'react-router-dom';
import './Login.scss'
import { getRequestToken } from "../../twitterTokens";

const Login = () => {


    const [usernameState, setUsernameState] = useState("")
    const [passwordState, setPasswordState] = useState("")

    const handleLogin = () => {

        // fetch(`${process.env.API_URL}/request_token`, {
        //     method: 'GET',
        //   })
        //     .then(res => {
        //       return res.json();
        //     })
        //     .then(res => {
        //       console.log(res)
        //       window.location.assign(`https://api.twitter.com/oauth/authenticate?oauth_token=${res.oauth_token}`)
        //     })
        //     .catch(error => {
        //       console.log(error);
        //     })

        const formData = new FormData();
        formData.append("username", usernameState)
        formData.append("password", passwordState)

        console.log(usernameState)
        console.log(passwordState)

        fetch(`${process.env.API_URL}/api/login`, {
            method: 'POST',
            body: formData,
          })
            .then(res => {
              if(!res.ok) {
                alert("Invalid username/password!");
                throw Error('Could not fetch the data for that resource');
              }
              if (res.status != 200) {
                alert("Invalid username/password!");
              }
              return res.json();
            })
            .then(res => {
              setAuth(res)
              if (checkAuth())
                window.location.assign("/home")
              else
                getRequestToken()
            })
            .catch(error => {
              console.log(error);
              setError(true);
            })


    }

    return(
      <div>
      <div className="login">
          <div className="login__container">
          <div className="title">
          <h1>Login</h1>
          </div>
          <form onSubmit={handleLogin}>
              <div className="formbox">
              <div className= "in">
                  <label>Username:</label>
                  <input className="usernameInput"
                      type="text"
                      name="username"
                      id="username"
                      value={usernameState}
                      onChange={(e)=>setUsernameState(e.target.value)}
                  />
              </div>
              <div className= "in">
                  <label>Password:</label>
                      <input className="add"
                          type="password"
                          name="pass"
                          id="pass"
                          value={passwordState}
                          onChange={(e)=>setPasswordState(e.target.value)}
                      />
              </div>
              </div>
              <div className="button">
                  <input 
                      className="loginButton"
                      type= "submit" 
                      value="Login"
                  />
              </div>
            </form>
          </div>
          <div className="registerLink">
                <label>Don't have an Account? Create one{'\u00A0'}</label>
                  <Link to="/register">here</Link>
          </div>
          <div className="GuestLink">
                <label>or continue as guest{'\u00A0'}</label>
                  <Link to="/guest">here</Link>
          </div>

      </div>
      </div>
  );
}

export default Login;