import React, { useEffect, useState, PureComponent } from "react";
import { checkAuth, setAuth } from "../../verifyLogin";
import { Redirect } from "react-router-dom";
import NavBar from "../navBar/Navbar";
import "./SentimentAnalysis.scss";

import { PieChart, Pie, Cell } from "recharts";

const SentimentAnalysis = () => {
  const tempData = [
    { name: "Positive Tweets", value: 0 },
    { name: "Negative Tweets", value: 0 },
  ];

  const COLORS = ["#0000FF", "#FF0000"];

  const [usernameState, setUsernameState] = useState("");
  const [numTweetsState, setNumTweetsState] = useState(0);
  const [numPositiveTweetsState, setPositiveNumTweetsState] = useState(0);
  const [numNegativeTweetsState, setNegativeNumTweetsState] = useState(0);
  const [tweets, setTweets] = useState([]);
  const [showTweets, setShowTweets] = useState(false);
  const [negativeTweets, setNegativeTweets] = useState([]);
  const [positiveTweets, setPositiveTweets] = useState([]);
  const [tweetData, setTweetData] = useState(tempData);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${percent * 100}%`}
      </text>
    );
  };

  const handleSubmit = () => {
    const formData = new FormData();

    formData.append("twitterHandle", usernameState);
    formData.append("numTweets", numTweetsState);

    fetch(
      `${process.env.API_URL}/api/tweets?token=${localStorage.getItem(
        "token"
      )}}`,
      {
        method: "POST",
        body: formData,
      }
    )
      .then((response) => response.json())
      .then((result) => {
        console.log("Success: ", result);
        setTweets(result.tweetsAnalyzed);
        setNegativeNumTweetsState(result.numNegative);
        setPositiveNumTweetsState(result.numPositive);
        setNumTweetsState(result.numTweets);
        setNegativeTweets(result.negativeTweets);
        setPositiveTweets(result.positiveTweets);
        setShowTweets(true);

        const newData = [
          { name: "Positive Tweets", value: result.percentPositive },
          { name: "Negative Tweets", value: result.percentNegative },
        ];
        setTweetData(newData);
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  };

  return (
    <div>
      <NavBar></NavBar>
      <div className="body">
        <h1>Tweet Sentiment Analysis</h1>
        <div className="SAContainer">
          <div className="SAInput">
            <label>Twitter Handle: </label>
            <input
              type="text"
              name="username"
              id="username"
              value={usernameState}
              onChange={(e) => setUsernameState(e.target.value)}
            />
          </div>
          <div className="SAInput">
            <label>Number of Tweets: </label>
            <input
              type="number"
              name="num"
              id="num"
              value={numTweetsState}
              onChange={(e) => setNumTweetsState(e.target.value)}
            />
          </div>
          <div className="sentimentButtonContainer">
            <input
              className="submitButton"
              type="button"
              value="Submit"
              onClick={handleSubmit}
            />
          </div>
        </div>
        <div className="allTweetContainer">
          <h3>Tweets</h3>
          <div className="tweets">
            {tweets.map((tweet, index) => (
              <p key={index}>{tweet}</p>
            ))}
          </div>
        </div>
        {showTweets && (
          <div>
            <div className="tweetInfo">
              <div className="column1">
                <h2>Tweet Analysis</h2>
                <h3>Tweets Retrieved: {numTweetsState}</h3>
                <div className="percentages">
                  <div>
                    <label>Percent Positive: </label>
                    {tweetData[0].value}%
                  </div>
                  <div>
                    <label>Percent Negative: </label>
                    {tweetData[1].value}%
                  </div>
                </div>
              </div>
              <div className="column2">
                <PieChart width={165} height={165}>
                  <Pie
                    data={tweetData}
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={82.5}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tweetData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </div>
            <div className="positiveNegativeContainer">
              <div className="SATweetContainer">
                <h3>Positive Tweets</h3>
                <p>Number of Positive Tweets: {numPositiveTweetsState}</p>
                <div className="tweets">
                  {positiveTweets.map((tweet, index) => (
                    <p key={index}>{tweet}</p>
                  ))}
                </div>
              </div>
              <div className="SATweetContainer">
                <h3>Negative Tweets</h3>
                <p>Number of Positive Tweets: {numNegativeTweetsState}</p>
                <div className="tweets">
                  {negativeTweets.map((tweet, index) => (
                    <p key={index}>{tweet}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalysis;
