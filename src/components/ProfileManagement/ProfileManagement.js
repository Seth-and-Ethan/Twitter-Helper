import React, { useEffect, useState } from "react";
import NavBar from "../navBar/Navbar";
import { getUserId } from "../../verifyLogin";

const ProfileManagement = () => {

    const [twitterHandleState, setTwitterHandle] = useState("")

        useEffect(() => {
        fetch(`${process.env.API_URL}/api/profile?token=${localStorage.getItem('token')}&username=${getUserId()}`,
        {
          method: 'GET',
        }
        )
        .then((response) => response.json())
        .then((result) => {
          console.log('Success: ', result);

          setTwitterHandle(result.handle)
        })
        .catch((error) => {
          console.log('Error: ', error.response.data);
        })
      }, [])

      const handleSubmit = () => {

        const formData = new FormData();

        formData.append('twitterHandle', twitterHandleState)


        fetch(`${process.env.API_URL}/api/profile?token=${localStorage.getItem('token')}&username=${getUserId()}`,
        {
          method: 'POST',
          body: formData,
        }
      )
        .then(res => {
          if(!res.ok) {
            alert("Username does not exist")
            throw Error("Could not fetch the data for that resource");
          }
          console.log("test")
          return res
        })
        .then(res => {
          console.log("Success: ", res);
          alert("Success")
          window.location.assign("/home")
        })
        .catch((error) => {
          console.error('Error: ', error);
        })
      }



    return(
        <div>
            <NavBar></NavBar>
            <div>
                    <label>Twitter Handle: </label>
                    <input
                        type="text"
                        name="handle"
                        id="handle"
                        value = {twitterHandleState}
                        onChange={(e)=>setTwitterHandle(e.target.value)}
                    />
             </div>
             <div className="button">
                    <input 
                        className="loginButton"
                        type= "button" 
                        value="Submit"
                        onClick={handleSubmit}
                    />
                </div>

        </div>
    );
}

export default ProfileManagement;