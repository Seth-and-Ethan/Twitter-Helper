import React, { useEffect, useState } from "react";
import { checkAuth, setAuth } from '../../verifyLogin';
import { Redirect } from 'react-router-dom';
import NavBar from "../navBar/Navbar";
import "./SentimentAnalysis.scss"

const SentimentAnalysis = () => {

    const [usernameState, setUsernameState] = useState("")
    const [numTweetsState, setNumTweetsState] = useState(0)
    const [tweets, setTweets] = useState([])
    const [negativeTweets, setNegativeTweets] = useState([])
    const [positiveTweets, setPositiveTweets] = useState([])

    const handleSubmit = () => {
        const formData = new FormData();

        formData.append('twitterHandle', usernameState)
        formData.append('numTweets', numTweetsState)

        fetch(
            `${process.env.API_URL}/api/tweets?token=${localStorage.getItem('token')}}`,
            {
              method: "POST",
              body: formData,
            }
          )
            .then((response) => response.json())
            .then((result) => {
              console.log("Success: ", result);
              setTweets(result.tweetsAnalyzed)
              setNegativeTweets(result.negativeTweets)
              setPositiveTweets(result.positiveTweets)
            })
            .catch((error) => {
              console.error("Error: ", error);
            });
        };

    return(
        <div>
            <NavBar></NavBar>
            <div className="SAContainer">
                <div className = "SAInput">
                    <label>Twitter Handle: </label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value = {usernameState}
                        onChange={(e)=>setUsernameState(e.target.value)}
                    />
                </div>
                <div className = "SAInput"> 
                    <label>Number of Tweets: </label>
                    <input
                        type="number"
                        name="num"
                        id="num"
                        value = {numTweetsState}
                        onChange={(e)=>setNumTweetsState(e.target.value)}
                    />
                </div>
                <div className="sentimentButtonContainer">
                    <input 
                        className="submitButton"
                        type= "button" 
                        value="Submit"
                        onClick={handleSubmit}
                    />
                </div>
            </div>
            <div className= "tweetContainer">
              <h2>Tweets</h2>
              <div className = "tweets">
              {tweets.map((tweet, index) => (
              <p key={index}>{tweet}</p>
              ))}
              </div>
            </div>
            <div className= "tweetContainer">
              <h2>Positive Tweets</h2>
              <div className = "tweets">
              {positiveTweets.map((tweet, index) => (
              <p key={index}>{tweet}</p>
              ))}
              </div>
            </div>
            <div className= "tweetContainer">
              <h2>Negative Tweets</h2>
              <div className = "tweets">
              {negativeTweets.map((tweet, index) => (
              <p key={index}>{tweet}</p>
              ))}
              </div>
            </div>
        </div>
    );
}

export default SentimentAnalysis;