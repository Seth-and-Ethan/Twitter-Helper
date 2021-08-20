import React, { useEffect, useState } from "react";
import './Register.scss'

const Register = () => {

    return(
        <div>
        <div className="register">
            <div className="register__container">
            <div className="title">
            <h1>Register</h1>
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
                        <div className ="in">
                            <label>Confirm Password:</label>
                                <input className="add"
                                    type="password"
                                    name="pass"
                                    id="pass"
                                />
                        </div>
                </div>
                <div className="button">
                    <input 
                        className="registerButton"
                        type= "button" 
                        value="Register"
                    />
                </div>
            </div>

        </div>
        </div>
    );
}

export default Register;