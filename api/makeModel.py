from nltk.corpus import twitter_samples
from nltk import classify
from nltk import NaiveBayesClassifier
import pickle
from sentiment import cleanTweet
from random import shuffle

def getWords(tweet):
	words = cleanTweet(tweet)
	words_dictionary = dict([word, True] for word in words)	
	return words_dictionary

def makeModel():
    print("Making Model")
    all_tweets = twitter_samples.strings('tweets.20150430-223406.json')
    positive_tweets = twitter_samples.strings('positive_tweets.json')
    negative_tweets = twitter_samples.strings('negative_tweets.json')

    clean_positive_tweet_tokens = []
    clean_negative_tweet_tokens = []
    positive_word_set = []
    negative_word_set = []

    for tweet in positive_tweets:
      clean_positive_tweet_tokens.append(cleanTweet(tweet))
      positive_word_set.append((getWords(tweet), 'pos'))

    shuffle(positive_word_set)

    for tweet in negative_tweets:
      clean_negative_tweet_tokens.append(cleanTweet(tweet))
      negative_word_set.append((getWords(tweet), 'neg'))

    shuffle(negative_word_set)

    test_set = positive_word_set[:1000] + negative_word_set[:1000]
    train_set = positive_word_set[1000:] + negative_word_set[1000:]

    classifier = NaiveBayesClassifier.train(train_set)

    accuracy = classify.accuracy(classifier, test_set)
    print(accuracy)

    f = open('seeded_model.pickle', 'wb')
    pickle.dump(classifier, f)
    f.close()
    
    return