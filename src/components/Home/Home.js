import React, { useEffect, useState } from "react";
import NavBar from "../navBar/Navbar";
import { getUserId } from "../../verifyLogin";

const Home = () => {

    const [twitterHandleState, setTwitterHandle] = useState("")
    const [numTweets, setNumTweets] = useState(0)
    const [numFollowing, setNumFollowing] = useState(0)
    const [numFollowers, setNumFollowers] = useState(0)

    useEffect(() => {
    fetch(`${process.env.API_URL}/api/home?token=${localStorage.getItem('token')}&username=${getUserId()}`,
    {
      method: 'GET',
    }
    )
    .then((response) => response.json())
    .then((result) => {
      console.log('Success: ', result);
      

    })
    .catch((error) => {
      console.log('Error: ', error.response.data);
    })
  }, [])

    return(
        <div>
            <NavBar></NavBar>
        </div>
    );
}

export default Home;