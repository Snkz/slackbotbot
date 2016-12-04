var Botkit = require('botkit')
var fs = require('fs');
var os = require('os');

var config = JSON.parse(fs.readFileSync("config.json"));
var controller = Botkit.slackbot({
  debug: config.debug
});

var bot = controller.spawn({
  token: config.token,
  send_via_rtm: config.send_via_rtm,
  retry: config.retry
}).startRTM();

controller.hears(['identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention,ambient', function(bot, message) {
  bot.reply(message,':karen: I am slackbotbot');
});

controller.hears(['karen'], 'direct_message,direct_mention,ambient',function(bot,message) {
  bot.reply(message, ':karen::heart:');
});

controller.hears(['pokemon', 'pikachu'],'direct_mention,direct_message,ambient',function(bot,message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'abdi',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction', err);
        }
    });
});

controller.hears(['nick'], 'direct_mention,direct_message,ambient',function(bot,message) {
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'nick',
  }, function(err, res) {
    if (err) {
      bot.botkit.log('Failed to add emoji reaction', err);
    }
  });
});

controller.hears(['slackbot (.*)', '(.*) slackbot'], 'direct_message,direct_mention,mention,ambient', function(bot, message) {
  var phrase = message.match[1];
  controller.storage.users.get(message.user, function(err, user) {
    if (!user) {
      user = {
        id: message.user,
      };
    }
    user.phrase = phrase;

    controller.storage.users.save(user, function(err, id) {
      if (err) {
        console.log("ERROR:", err);
      }

      bot.startConversation(message, function(err, convo) {
        convo.ask('Was that an insult?', [
            {
              pattern: bot.utterances.yes,
              callback: function(response, convo) {
                convo.say('Well ' + phrase + ' yourself..');
                convo.next();
              }
            },
            {
              pattern: bot.utterances.no,
              default: true,
              callback: function(response, convo) {
                convo.say('Cool');
                convo.say('Well ' + phrase + ' to you too!'); 
                convo.next();
              }
            }
        ])
      });
    });
  });
});

controller.hears(['hello', 'hi', 'yo', 'ey', 'heya'], 'direct_message,direct_mention,mention,ambient', function(bot, message) {
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'karen',
  }, function(err, res) {
    if (err) {
      bot.botkit.log('Failed to add emoji reaction', err);
    }
  });

  controller.storage.users.get(message.user, function(err, user) {
    bot.startConversation(message, function(err, convo) {
      if (user && user.phrase) {
        convo.say('Hello again human.'); 
        convo.say(user.phrase);
        convo.say(':D'); 
        user.phrase = null;
        controller.storage.users.save(user, function(err, id) {});
      } else {
        convo.say('Hello human. I am slackbot, karen lover. Nice to meet you.');
      }
      convo.next();
    });
  });
});



