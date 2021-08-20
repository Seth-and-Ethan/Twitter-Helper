import React, { useEffect, useState } from "react";
import './Login.scss'

const Login = () => {

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
                    />
                </div>
                <div className= "in">
                    <label>Password:</label>
                        <input className="add"
                            type="password"
                            name="pass"
                            id="pass"
                        />
                </div>
                </div>
                <div className="button">
                    <input 
                        className="loginButton"
                        type= "button" 
                        value="Login"
                    />
                </div>
            </div>

        </div>
        </div>
    );
}

export default Login;