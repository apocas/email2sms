var request = require('request'),
  Postman = require('./lib/postman'),
  config = require('./config.json');

var postman = new Postman(config.email);

var handler = function(mail) {
  var found = false;
  for (var i = 0; i < config.authorized.length; i++) {
    var sender = mail.from[0].address.toLowerCase();
    var auth = config.authorized[i].toLowerCase();
    if ((auth.indexOf('@') === 0 && sender.indexOf(auth) > -1) || auth == sender) {
      found = true;
      break;
    }
  }

  if (found === true) {
    var data = mail.subject.split(config.split);
    if (data.length == 2 && ignored(data[1]) === false) {
      sendSMS(data[0], data[1]);
    } else {
      console.log('SMS invalid or ignored: ' + mail.subject + ' - ' + data);
    }
  }
};

postman.start(handler);

function ignored(message) {
  for (var i = 0; i < config.ignore.length; i++) {
    var ignore = config.ignore[i].toLowerCase();
    if (message.toLowerCase().indexOf(ignore) > -1) {
      return true;
    }
  }

  return false;
}

function sendSMS(number, message) {
  console.log('-------------------');
  console.log(number);
  console.log(message);
  var serverOptions = {
    uri: 'http://' + config.infobip.username +
      ':' + config.infobip.password + '@' + config.infobip.url,
    method: 'POST',
    headers: {},
    body: {
      "from": config.from,
      "to": "+351" + number,
      "text": message
    },
    json: true
  };

  request(serverOptions, function(err, res, body) {
    if(err) {
      console.log('SMS failed!' + number + ' -> ' + message);
    } else {
      console.log('SMS sent!');
    }
  });
}
