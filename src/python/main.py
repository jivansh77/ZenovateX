from textblob import TextBlob
import tweepy
import sys

# bearer token: AAAAAAAAAAAAAAAAAAAAAG1byAEAAAAAyddPoJ62vImUF89RUw4hyR1sb7U%3Dq4rqLjsphL59mNJenIgQEg24Dru8rgjjmY17YeQJxP2dkGV4X7

# acces token: 1772930941251379200-GTIV1ogxSMxdqgajy5WvMF8a6o8jtu

# access token secret: K5hLyhmgoAbaxoAmn3rl1BAUmuBV7czXkYq8TuPVIlyOL

# api key: 80XGZCpt9l78GtdWwYM2OA53E
# api sectre key: JCQxMgOsiIjTnK6khKubfuqI7FmeqU2iCIu7VgRBpPtXMi6pAp

api_key = '80XGZCpt9l78GtdWwYM2OA53E'
api_key_secret = 'JCQxMgOsiIjTnK6khKubfuqI7FmeqU2iCIu7VgRBpPtXMi6pAp'
access_token = '1772930941251379200-GTIV1ogxSMxdqgajy5WvMF8a6o8jtu'
access_token_secret = 'K5hLyhmgoAbaxoAmn3rl1BAUmuBV7czXkYq8TuPVIlyOL'

# auth_handler = tweepy.OAuthHandler(consumer_key=api_key, consumer_secret=api_key_secret)
# auth_handler.set_access_token(access_token, access_token_secret)

# api = tweepy.API(auth_handler)

# search_term = 'stocks'
# tweet_amount = 20

# tweets = tweepy.Cursor(api.search_tweets, q=search_term, lang='en').items(tweet_amount)

# for tweet in tweets:
#     print(tweet.text)


client = tweepy.Client(bearer_token='AAAAAAAAAAAAAAAAAAAAAG1byAEAAAAAiXQDcT4mtQGYQIQPaKb%2BqMbaWKI%3DhiOIVXw2gJkVmKVDDCaadzg2TF6Sq4IqIqBIgnKZ4V2wuIvttW')

import time

search_term = 'stocks'
tweet_amount = 10

polarity = 0
positive=0
negative=0
neutral=0 

# Error handling for tweet processing
try:
    response = client.search_recent_tweets(query=search_term, max_results=tweet_amount, tweet_fields=['text', 'created_at'])
    if response.data is None:
        print("No tweets found")
    else:
        for tweet in response.data:
            try:
                final_text = tweet.text.replace('RT', '')
                if final_text.startswith('@'):
                    position = final_text.index(':')
                    final_text = final_text[position+2:]
                if final_text.startswith('@'):
                    position = final_text.index(' ')
                    final_text = final_text[position+2:]
                print(final_text)
                analysis = TextBlob(final_text)
                tweet_polarity = analysis.polarity
                if tweet_polarity>0 :
                    positive += 1
                elif tweet_polarity<0:
                    negative +=1
                else:
                    neutral+=1
                polarity += tweet_polarity
            except (ValueError, AttributeError) as e:
                print(f"Error processing tweet: {e}")
                continue

    print(f"Final polarity score: {polarity}")

except tweepy.errors.TooManyRequests:
    print("Rate limit reached. Waiting for 30 seconds...")
    time.sleep(30)
except Exception as e:
    print(f"An error occurred: {e}")
