import React, { useEffect, useState } from "react";
import { checkAuth, setAuth } from '../../verifyLogin';
import { Redirect } from 'react-router-dom';
import './Login.scss'

const Login = () => {

    const [usernameState, setUsernameState] = useState("")
    const [passwordState, setPasswordState] = useState("")

    const handleLogin = () => {

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
              window.location.assign("/home")
            })
            .catch(error => {
              console.log(error);
              setError(true);
            })


            if (checkAuth()) {
                return (
                  <Redirect to='/home' />
                )
              }
    }

    return(
        <div>
        <div className="login">
            <div className="login__container">
            <div className="title">
            <h1>Login</h1>
            </div>
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