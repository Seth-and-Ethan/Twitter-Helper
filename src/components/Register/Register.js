import React, { useEffect, useState } from "react";
import './Register.scss'
import { checkAuth, setAuth } from '../../verifyLogin';
import { Redirect, Link } from 'react-router-dom';

const Register = () => {

    const getRequestToken = () => {
            fetch(`${process.env.API_URL}/request_token`, {
                method: 'POST',
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

    const [usernameState, setUsernameState] = useState("")
    const [passwordState, setPasswordState] = useState("")
    const [confirmPasswordState, setConfirmPasswordState] = useState("")

    const handleSubmit = () => {

        if(passwordState === confirmPasswordState && usernameState !== ''){
            const formData = new FormData();

            formData.append('username', usernameState)
            formData.append('password', passwordState)

            fetch(`${process.env.API_URL}/api/register`,
            {
              method: 'POST',
              body: formData,
            }
          )
            .then(res => {
              if(!res.ok) {
                console.log(res)
                console.log(res.status)
              }
              if (res.status === 403) {
                alert("Username taken!");
                throw Error('Could not fetch the data for that resource');
              }
              return res.json();
            })
            .then(res => {
              setAuth(res)
              getRequestToken()
            })
            .catch((error) => {
              console.error('Error: ', error);
            })


        }
        else if (passwordState !== confirmPasswordState){
            alert("Passwords do not match")
        }
        else if (passwordState === ''){
            alert("Password can not be blank")
        }

        };

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
                                value = {passwordState}
                                onChange={(e)=>setPasswordState(e.target.value)}
                            />
                    </div>
                        <div className ="in">
                            <label>Confirm Password:</label>
                                <input className="add"
                                    type="password"
                                    name="pass"
                                    id="pass"
                                    value = {confirmPasswordState}
                                    onChange={(e)=>setConfirmPasswordState(e.target.value)}
                                />
                        </div>
                </div>
                <div className="button">
                    <input 
                        className="registerButton"
                        type= "button" 
                        value="Register"
                        onClick={handleSubmit}
                    />
                </div>
            </div>

        </div>
            <div className="loginLink">
                    <label>Already have an account? Click{'\u00A0'}</label>
                        <Link to="/login">here</Link>
            </div>
        </div>
    );
}

export default Register;