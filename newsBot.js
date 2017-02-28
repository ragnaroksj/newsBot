var Flint = require('node-flint');
var webhook = require('node-flint/webhook');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
app.use(bodyParser.json());

// flint options
var config = {
  webhookUrl: 'https://news-spark-bot.herokuapp.com/flint',
  token: 'M2RiMjJlNTMtNjQ1ZS00ZDI1LWJlYmUtNzRiOTllNjdmNjdlNmJlMjEyYWMtMWM4',
  port: process.env.port,
  removeWebhooksOnStart: false,
  maxConcurrent: 5,
  minTime: 50
};

var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ZDI2NmViYmQtMjM1ZS00NDJmLTlmZTctYjU0N2E1YWViOWY4ZDBhNjU5NDYtMGFi'
};

var options = {
   url: 'https://api.ciscospark.com/v1/messages',
   method: 'POST',
   headers: headers,
   form: {}
}

var newsSource = [
    'abc-news-au',
    'ars-technica',
    'associated-press',
    'bbc-news',
    'bbc-sport',
    'bild',
    'bloomberg',
    'business-in',
    'buzzfeed',
    'cnbc',
    'cnn',
    'daily-mail',
    'der-tagessp',
    'die-zeit',
    'engadget',
    'entertainment-weekly',
    'espn',
    'espn-cric-info',
    'financial-times',
    'focus',
    'football-italia',
    'fortune',
    'four-four-two',
    'fox-sports',
    'google-news',
    'gruenderszene',
    'hacker-news',
    'handelsblatt',
    'ign',
    'independent',
    'mashable',
    'metro',
    'mirror',
    'mtv-news',
    'mtv-news-uk',
    'national-geographic',
    'new-scientist',
    'newsweek',
    'new-york-magazine',
    'nfl-news',
    'polygon',
    'recode',
    'reddit-r-all',
    'reuters',
    'sky-news',
    'sky-sports-news',
    'spiegel-online',
    't3n',
    'talksport',
    'techcrunch',
    'techradar',
    'the-economist',
    'the-guardian-au',
    'the-guardian-uk',
    'the-hindu',
    'the-huffington-post',
    'the-lad-bible',
    'the-new-york-times',
    'the-next-web',
    'the-sport-bible',
    'the-telegraph',
    'the-times-of-india',
    'the-verge',
    'the-wall-street-journal',
    'the-washington-post',
    'time',
    'usa-today',
    'wired-de',
    'wirtschafts-woch'
];

var getTodayNews = function(bot, source, triggerSource) {
    var message = ' ';
    if (source !== null) {
        request.get(source, function(err, res, body) {
            if (!err && res.statusCode === 200) {
                JSON.parse(body).articles.map(function(article) {
                    message += '* [' + article.title + '](' + article.url + ') \n\n '
                });
                bot.say('markdown', message);
                
                request(options, function(err, res, body){
                    if (!err && res.statusCode === 200) {
                        console.log(body);
                    }
                });
            }
        });
    } else {
        message += 'Mention news bot and get news from following key word: \n\n';
        newsSource.map(function(newsSourceItem) {
            message += '* ' + newsSourceItem + ' \n\n '
        });
        bot.say('markdown', message);
    }
}

// init flint
var flint = new Flint(config);
flint.start();

flint.hears(/^news/i, function(bot, trigger) {
  var keyArray = trigger.args;
  if (
      keyArray.length !== 2 ||
      newsSource.indexOf(keyArray[1]) === -1
      ) {
          getTodayNews(bot, null);
      } else {
        var source = 'https://newsapi.org/v1/articles?source=' + keyArray[1] + '&apiKey=c3aa38b3d5ff44148502fdfcfab05d8d';
        getTodayNews(bot, source, trigger);
      }
});

flint.hears('help', function(bot) {
    getTodayNews(bot, null);
});

// define express path for incoming webhooks
app.post('/flint', webhook(flint));

// start express server
var server = app.listen(config.port, function () {
  flint.debug('Flint listening on port %s', config.port);
});

// gracefully shutdown (ctrl-c)
process.on('SIGINT', function() {
  flint.debug('stoppping...');
  server.close();
  flint.stop().then(function() {
    process.exit();
  });
});