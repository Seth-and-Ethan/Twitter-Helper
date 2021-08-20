import React, { useEffect, useState } from "react";
import { checkAuth, setAuth } from '../../verifyLogin';
import { Redirect } from 'react-router-dom';
import NavBar from "../navBar/Navbar";

const SentimentAnalysis = () => {

    const [usernameState, setUsernameState] = useState("")

    return(
        <div>
            <NavBar></NavBar>
            
        </div>
    );
}

export default SentimentAnalysis;