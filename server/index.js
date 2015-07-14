var hapi = require('hapi');
var AWS = require('aws-sdk');
var gm = require('gm');
var bunyan = require('bunyan');

var server = new hapi.Server({
  connections: {
    router: {
      stripTrailingSlash: true
    }
  }
});

server.connection({ port: 8000 });

var config = {
  register: require('hapi-bunyan'),
  options: {
    logger: bunyan.createLogger({ name: 'phototools', level: 'debug' }),
    payload: {
      maxBytes: 10485760
    }
  }
};

server.register(config, function(err) {
  if (err) throw err;
});

server.route(require('./bootstrap/routes'));

server.start();
