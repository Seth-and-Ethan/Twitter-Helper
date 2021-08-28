import React, { useEffect, useState } from "react";
import NavBar from "../navBar/Navbar";
import { getUserId } from "../../verifyLogin";
import { getRequestToken } from "../../twitterTokens";

const Home = () => {

    const [twitterHandleState, setTwitterHandle] = useState("")
    const [numTweets, setNumTweets] = useState()
    const [numFollowing, setNumFollowing] = useState()
    const [numFollowers, setNumFollowers] = useState()
    const [profilePicURL, setProfilePic] = useState("")

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
    })
    .catch((error) => {
      console.log('Error: ', error.response.data);
    })
  }, [])

    return(
        <div>
            <NavBar></NavBar>
            <p>{twitterHandleState}</p>
            <p>{numTweets}</p>
            <p>{numFollowing}</p>
            <p>{numFollowers}</p>
            <img src= {profilePicURL}></img>
        </div>
    );
}

export default Home;