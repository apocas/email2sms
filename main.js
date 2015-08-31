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
    if (data.length == 2) {
      sendSMS(data[0], data[1]);
    }
  }
};

postman.start(handler);

function sendSMS(number, message) {
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
