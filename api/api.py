import keys
import json
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

import tweepy as tw

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = keys.secret_key
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://' + keys.mysql_user + ':' + keys.mysql_password + '@' + keys.mysql_host + '/' + keys.mysql_db_name
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SQLALCHEMY_ECHO'] = True

auth = tw.OAuthHandler(keys.twitter_consumer_key, keys.twitter_consumer_secret_key)
auth.set_access_token(keys.twitter_access_token, keys.twitter_access_token_secret)
twitterAPI = tw.API(auth, wait_on_rate_limit=True)

db = SQLAlchemy(app)

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

class Usercredentials(db.Model):
  username = db.Column(db.String(25), primary_key=True)
  password = db.Column(db.String(128))
  information = relationship("Userinfo", backref = "Usercredentials", passive_deletes = True, uselist=False)

class Userinfo(db.Model):
  id = db.Column(db.Integer, primary_key = True)
  usercredentials_username = db.Column(db.String(20), db.ForeignKey('usercredentials.username', ondelete = "CASCADE"))
  twitterhandle = db.Column(db.String(15))
  twitterData = relationship("Twitterdata", backref="Userinfo", passive_deletes=True, uselist=True)

class Twitterdata(db.Model):
  count = db.Column(db.Integer, primary_key = True)
  userinfo_ID = db.Column(db.Integer, db.ForeignKey('userinfo.id', ondelete = "CASCADE"))
  numTweet = db.Column(db.Integer)
  numFollower = db.Column(db.Integer)
  numFollowing = db.Column(db.Integer)
  dateRecorded = db.Column(db.DateTime)

@app.route('/', methods=['GET'])
def index():
  return "This returns something."

@app.route('/api/register', methods=['GET', 'POST'])
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
      token = jwt.encode({
      'username': request.form['username'],
      'expiration': str(datetime.utcnow() + timedelta(minutes=30)),
      }, app.config['SECRET_KEY'])

      return {'token': token}

    return make_response('Unable to verify', 403, {'WWW-Authenticate': 'Basic realm: "Authentication failed!"'})

@app.route('/api/tweets', methods=['POST'])
def test_endpoint():
  userID = request.form['twitterHandle']
  numTweets = request.form['numTweets']

  try:
    numTweets = int(numTweets)
  except:
    return jsonify({'Alert!': 'Error somewhere!'}), 400

  if not userID == '' and numTweets > 0:
    tweets = twitterAPI.user_timeline(screen_name=userID, 
                            # 200 is the maximum allowed count
                            count=numTweets,
                            include_rts = False,
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

    for tweet in tweetList:
      print(tweet)

    return json.dumps(tweetList)
  else:
    return jsonify({'Alert!': 'Error somewhere!'}), 400

# @app.route('/api/userinfotest', methods=['GET'])
# def userinfo_test_endpoint():
#   # newUserInfo = Userinfo(usercredentials_username = "seth", twitterhandle = "Test2", )
#   # db.session.merge(newUserInfo)
#   # db.session.commit()

#   newTwitterData = Twitterdata(userinfo_ID = 9, numTweet = 1, numFollower = 5, numFollowing = 5, dateRecorded = datetime.now())
#   db.session.merge(newTwitterData)
#   db.session.commit()
#   return "success"

@app.route('/api/profile', methods=['GET','POST'])
def profile_endpoint():
  username = request.values.get('username')
  if request.method == 'GET':

    dataToReturn = {
        "handle": ""
      }

    user = Userinfo.query.filter_by(usercredentials_username = username).first()

    if user:
      print(user.twitterhandle)
      dataToReturn["handle"] = user.twitterhandle

    return json.dumps(dataToReturn)

  if request.method == 'POST':
    twitterhandle = request.form['twitterHandle']

    try:
      twitterUser = twitterAPI.get_user(twitterhandle)
    except:
      return make_response("Username doesn't exist!", 403)

    user = Userinfo.query.filter_by(usercredentials_username = username).first()

    if user: #Updates userinfo row
      user.twitterhandle = twitterhandle
      print("Updating User")
    else: #Makes new userinfo row
      newUserInfo = Userinfo(usercredentials_username = username, twitterhandle = twitterhandle)
      print("Making new User")
      db.session.merge(newUserInfo)

    db.session.commit()
    return "success"

@app.route('/api/home', methods=['GET'])
def home_endpoint():
  username = request.values.get('username')
  if request.method == 'GET':

    dataToReturn = {
        "handle": "",
        "numTweets": 0,
        "numFollowing": 0,
        "numFollowers": 0,
        "profilePicURL": ""
      }

    user = Userinfo.query.filter_by(usercredentials_username = username).first()

    if user:

      try:
        twitterUser = twitterAPI.get_user(user.twitterhandle)
      except:
        return make_response("Username doesn't exist!", 403)

      dataToReturn["handle"] = user.twitterhandle
      dataToReturn['numTweets'] = twitterUser.statuses_count
      dataToReturn['numFollowing'] = twitterUser.friends_count
      dataToReturn['numFollowers'] = twitterUser.followers_count

      twitterPic = twitterUser.profile_image_url
      twitterPic = twitterPic[:len(twitterPic) - 11]
      twitterPic = twitterPic + '.jpg'


      dataToReturn['profilePicURL'] = twitterPic

    return json.dumps(dataToReturn)


