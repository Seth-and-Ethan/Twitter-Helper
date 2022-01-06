import pickle
import keys
import json
import os
from os.path import exists
from sentiment import cleanTweet
from makeModel import makeModel
import nltk
from nltk import classify
from flask import Flask, request, session, json, make_response, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
import pymysql
import mysql
from datetime import datetime, timedelta
import jwt
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
import requests
from requests_oauthlib import OAuth1Session

import tweepy as tw

app = Flask(__name__)
CORS(app)

file_exists = os.path.exists("seeded_model.pickle")

if not file_exists:
  makeModel()

f = open("seeded_model.pickle", "rb")
classifier = pickle.load(f)
f.close()

app.config['SECRET_KEY'] = keys.secret_key
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://' + keys.mysql_user + ':' + keys.mysql_password + '@' + keys.mysql_host + '/' + keys.mysql_db_name
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SQLALCHEMY_ECHO'] = True
TWITTER_REQUEST_TOKEN_URL = "https://api.twitter.com/oauth/request_token"
TWITTER_ACCESS_TOKEN_URL = "https://api.twitter.com/oauth/access_token"

auth = tw.OAuthHandler(keys.twitter_consumer_key, keys.twitter_consumer_secret_key)
# auth.set_access_token(keys.twitter_access_token, keys.twitter_access_token_secret)
twitterAPI = tw.API(auth, wait_on_rate_limit=True)

db = SQLAlchemy(app)

class Usercredentials(db.Model):
  username = db.Column(db.String(25), primary_key=True)
  password = db.Column(db.String(128))
  information = relationship("Userinfo", backref = "Usercredentials", passive_deletes = True, uselist=False)

class Userinfo(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  usercredentials_username = db.Column(db.String(25), db.ForeignKey('usercredentials.username', ondelete = "CASCADE"))
  oauth = db.Column(db.String(45))
  oauthsecret = db.Column(db.String(45))
  twitterData = relationship("Twitterdata", backref="Userinfo", passive_deletes=True, uselist=True)

class Twitterdata(db.Model):
  count = db.Column(db.Integer, primary_key = True)
  userinfo_ID = db.Column(db.Integer, db.ForeignKey('userinfo.id', ondelete = "CASCADE"))
  numTweet = db.Column(db.Integer)
  numFollower = db.Column(db.Integer)
  numFollowing = db.Column(db.Integer)
  dateRecorded = db.Column(db.DateTime)

@app.route("/request_token", methods=['POST'])
def request_oauth_token():
    request_token = OAuth1Session(
        client_key=keys.twitter_consumer_key, client_secret=keys.twitter_consumer_secret_key, callback_uri="http://localhost:8080/api/oauth"
    )
    data = request_token.get(TWITTER_REQUEST_TOKEN_URL)
    if data.status_code == 200:
        request_token = str.split(data.text, '&')
        oauth_token = str.split(request_token[0], '=')[1]
        oauth_callback_confirmed = str.split(request_token[2], '=')[1]
        print('success')
        return {
            "oauth_token": oauth_token,
            "oauth_callback_confirmed": oauth_callback_confirmed,
        }
    else:
        return {
            "oauth_token": None,
            "oauth_callback_confirmed": "false",
        }

@app.route("/access_token", methods = ['POST'])
def request_access_token():
    username = request.values.get('username')
    oauth_token = OAuth1Session(
        client_key=keys.twitter_consumer_key,
        client_secret=keys.twitter_consumer_secret_key,
        resource_owner_key=request.form["oauth_token"],
    )
    data = {"oauth_verifier": request.form["oauth_verifier"]}
    response = oauth_token.post(TWITTER_ACCESS_TOKEN_URL, data=data)
    access_token = str.split(response.text, '&')
    access_token_key = str.split(access_token[0], '=')[1]
    access_token_secret = str.split(access_token[1], '=')[1]

    userInfo = Userinfo.query.filter_by(usercredentials_username=username).first()

    if userInfo:
      userInfo.oauth = access_token_key
      userInfo.oauthsecret = access_token_secret
      db.session.commit()
    else:
      newUserInfo = Userinfo(usercredentials_username = username, oauth = access_token_key, oauthsecret = access_token_secret)
      db.session.merge(newUserInfo)
      db.session.commit()

    token = jwt.encode({
          'username': username,
          'expiration': str(datetime.utcnow() + timedelta(minutes=30)),
          'oauth': access_token_key,
          'oauthsecret': access_token_secret,
          }, app.config['SECRET_KEY'])

    print(token)
    return {'token': token}

def jsonify_tweepy(tweepy_object):
    json_str = json.dumps(tweepy_object._json)
    return json.loads(json_str)

def token_required(func):
  @wraps(func)
  def decorated(*args, **kwargs):
    token = request.values.get('token')
    if not token:
      return jsonify({'Alert!': 'Token is missing!'}), 403
    try:
      payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
    except:
      return jsonify({'Alert!': 'Invalid Token!'}), 403
    return func(*args, **kwargs)

  return decorated
  
@app.route('/', methods=['GET'])
def index():
  return "This returns something."

@app.route('/api/register', methods=['POST'])
def register_endpoint():
  if request.method == 'POST':
    username = request.form['username']
    password = request.form['password']

    hashed_password = generate_password_hash(password, method='sha256')

    user = Usercredentials.query.filter_by(username=username).first()

    if user:
       return make_response('Username taken!', 403)

    newUser = Usercredentials(username = username, password = hashed_password)

    db.session.merge(newUser)
    db.session.commit()
    
    token = jwt.encode({
      'username': request.form['username'],
      'expiration': str(datetime.utcnow() + timedelta(minutes=30)),
    }, app.config['SECRET_KEY'])

    return {'token': token}

@app.route('/api/login', methods=['GET', 'POST'])
def login_endpoint():
  if request.method == 'POST':
    username = request.form['username']
    password = request.form['password']

    user = Usercredentials.query.filter_by(username=username).first()

    if not user:
      return make_response('Unable to verify', 403, {'WWW-Authenticate': 'Basic realm: "Authentication failed!"'})

    hashed_password = generate_password_hash(password, method='sha256')
    
    if check_password_hash(user.password, password):
      info = Userinfo.query.filter_by(usercredentials_username=username).first()

      if info:
        token = jwt.encode({
        'username': username,
        'expiration': str(datetime.utcnow() + timedelta(minutes=30)),
        'oauth': info.oauth,
        'oauthsecret': info.oauthsecret
        }, app.config['SECRET_KEY'])
        print("returning the right one")
      else:
        token = jwt.encode({
        'username': username,
        'expiration': str(datetime.utcnow() + timedelta(minutes=30)),
        }, app.config['SECRET_KEY'])

      return {'token': token}

    return make_response('Unable to verify', 403, {'WWW-Authenticate': 'Basic realm: "Authentication failed!"'})

@app.route('/api/home', methods=['GET'])
def home_endpoint():
  token = request.values.get('token')
  decodedToken = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
  twitter_access_token = decodedToken['oauth']
  twitter_access_token_secret = decodedToken['oauthsecret']
  auth.set_access_token(twitter_access_token, twitter_access_token_secret)

  if request.method == 'GET':

      dataToReturn = {
          "handle": "",
          "numTweets": 0,
          "numFollowing": 0,
          "numFollowers": 0,
          "profilePicURL": "",
          "tweets": []
        }

      try:
        twitterUser = twitterAPI.me()
      except:
        print("ERROR")
        return make_response("Username doesn't exist!", 403)

      dataToReturn['handle'] = twitterUser.screen_name
      dataToReturn['numTweets'] = twitterUser.statuses_count
      dataToReturn['numFollowing'] = twitterUser.friends_count
      dataToReturn['numFollowers'] = twitterUser.followers_count

      twitterPic = twitterUser.profile_image_url

      twitterPic = twitterPic[:len(twitterPic) - 11] + '.jpg'
      dataToReturn['profilePicURL'] = twitterPic

      tweets = twitterAPI.user_timeline(screen_name=twitterUser.screen_name, 
                                  # 200 is the maximum allowed count
                                  count=20,
                                  include_rts = True,
                                  # Necessary to keep full_text 
                                  # otherwise only the first 140 words are extracted
                                  tweet_mode = 'extended'
                                  )

      tweetList = []
          # for info in tweets[:3]:
          #    print("ID: {}".format(info.id))
          #    print(info.created_at)
          #    print(info.full_text)
          #    print("\n")

      for info in tweets:
        tweetList.append(info._json['full_text'])

      dataToReturn['tweets']= tweetList

      return json.dumps(dataToReturn)

@app.route('/api/tweets', methods=['POST'])
def tweet_endpoint():
  userID = request.form['twitterHandle']
  numTweets = request.form['numTweets']

  try:
    numTweets = int(numTweets)
  except:
    return jsonify({'Alert!': 'Error somewhere!'}), 400

  if not userID == '' and numTweets > 0 and numTweets <= 200:
    tweets = twitterAPI.user_timeline(screen_name=userID, 
                            # 200 is the maximum allowed count
                            count=numTweets,
                            include_rts = True,
                            # Necessary to keep full_text 
                            # otherwise only the first 140 words are extracted
                            tweet_mode = 'extended'
                            )

    tweetList = []
    tweetTokenList = []

    for info in tweets:
      tweetList.append(info._json['full_text'])

    for tweet in tweetList:
      tweetTokenList.append(cleanTweet(tweet))

    positiveTweets = []
    negativeTweets = []

    for i in range(len(tweetTokenList)):
      result = classifier.classify(dict([token, True] for token in tweetTokenList[i]))
      if result == "neg":
        negativeTweets.append(tweetList[i])
      elif result == "pos":
        positiveTweets.append(tweetList[i])

    for tweets in positiveTweets:
      print(tweets)
    for tweets in negativeTweets:
      print(tweets)

    dataToReturn = {
      "positiveTweets": positiveTweets,
      "negativeTweets": negativeTweets
    }

    return json.dumps(dataToReturn)
  else:
    return jsonify({'Alert!': 'Error somewhere!'}), 400


