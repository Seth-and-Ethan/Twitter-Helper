export const getRequestToken = () => {
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

export const getAccessToken = () => {
    fetch(`${process.env.API_URL}/access_token?username=${getUserId()}`, {
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
