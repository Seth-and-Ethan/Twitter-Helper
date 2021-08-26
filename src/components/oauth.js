import React, { useEffect, useState } from "react";
import { Redirect, Link, useParams } from 'react-router-dom';
import { checkAuth, setAuth } from '../verifyLogin';

const oauths = () => {

    useEffect(() => {

      if(!checkAuth()){
        const queryString = window.location.search;

        const urlParams = new URLSearchParams(queryString);

        const oauth = urlParams.get('oauth_token')
        const oauthVerifier = urlParams.get('oauth_verifier')


        const formData = new FormData();
        formData.append("oauth_token", oauth)
        formData.append("oauth_verifier", oauthVerifier)

        fetch(`${process.env.API_URL}/access_token`, {
            method: 'POST',
            body: formData
          })
            .then(res => {
              return res.json();
            })
            .then(res => {
              console.log(res)
              setAuth(res)
              window.location.replace("/home")

            })
            .catch(error => {
              console.log(error);
            })
      }

      }, [])

      if(checkAuth()){
        window.location.replace("/home")
      }



    return(
        <div>
        </div>
    );
}

export default oauths