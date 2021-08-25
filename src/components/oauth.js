import React, { useEffect, useState } from "react";
import { Redirect, Link } from 'react-router-dom';

const oauths = () => {

    useEffect(() => {
        console.log("test")
        const querystring = window.location.search;
        const urlParams = new URLSearchParams(querystring)
        oauth_token = urlParams.get('oauth_token')
        oauth_verifier = urlParams.get('oauth_verifier')

        const formData = new FormData();
        formData.append("oauth_token", oauth_token)
        formData.append("oauth_verifier", oauth_verifier)


        fetch(`${process.env.API_URL}/request_token`, {
            method: 'POST',
            body: formData
          })
            .then(res => {
              return res.json();
            })
            .then(res => {
              console.log(res)
            })
            .catch(error => {
              console.log(error);
            })
      }, [])



    return(
        <div>
        </div>
    );
}

export default oauths