import React, { useEffect, useState } from "react";
import NavBar from "../navBar/Navbar";
import { getUserId } from "../../verifyLogin";
import { getRequestToken } from "../../twitterTokens";
import "./Home.scss"

const Home = () => {

    const [twitterHandleState, setTwitterHandle] = useState("")
    const [numTweets, setNumTweets] = useState()
    const [numFollowing, setNumFollowing] = useState()
    const [numFollowers, setNumFollowers] = useState()
    const [profilePicURL, setProfilePic] = useState("")
    const [tweets, setTweets] = useState([])

    useEffect(() => {
    fetch(`${process.env.API_URL}/api/home?token=${localStorage.getItem('token')}`,
    {
      method: 'GET',
    }
    )
    .then((response) => {
      if(response.status == 403){
        getRequestToken()
      }
      return response.json()
    })
    .then((result) => {
      console.log('Success: ', result);
      setTwitterHandle(result.handle)
      setNumFollowers(result.numFollowers)
      setNumFollowing(result.numFollowing)
      setNumTweets(result.numTweets)
      setProfilePic(result.profilePicURL)
      setTweets(result.tweets)
    })
    .catch((error) => {
      console.log('Error: ', error.response.data);
    })
  }, [])

    return(
        <div>
            <NavBar></NavBar>
            <div className="twitterHeader">
              <img className= "picture" src= {profilePicURL}></img>
              <h1 className="handle">{twitterHandleState}</h1>
            </div>
            <div className="twitterInfoContainer">
              <div className="twitterInfo">
                <p>Following: {numFollowing}</p>
              </div>
              <div className="twitterInfo">
                <p>Followers: {numFollowers}</p>
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
        </div>
    );
}

export default Home;