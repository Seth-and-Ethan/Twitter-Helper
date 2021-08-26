import React, { useEffect, useState } from "react";
import { checkAuth, setAuth } from '../../verifyLogin';
import { Redirect, Link } from 'react-router-dom';
import './Login.scss'

const Login = () => {

    const [usernameState, setUsernameState] = useState("")
    const [passwordState, setPasswordState] = useState("")

    const handleLogin = () => {


        fetch(`${process.env.API_URL}/request_token`, {
            method: 'GET',
          })
            .then(res => {
              return res.json();
            })
            .then(res => {
              console.log(res)
              window.location.assign(`https://api.twitter.com/oauth/authenticate?force_login=true&oauth_token=${res.oauth_token}`)
            })
            .catch(error => {
              console.log(error);
            })

    }

    return(
        <div>
        <div className="login">
            <div className="login__container">
            <div className="title">
            <h1>Login</h1>
            </div>
                <div className="formbox">
                </div>
                <div className="button">
                    <input 
                        className="loginButton"
                        type= "button" 
                        value="Login"
                        onClick={handleLogin}
                    />
                </div>
            </div>
  

        </div>
        </div>
    );
}

export default Login;