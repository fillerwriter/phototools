module.exports = [
  {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: 'app'
      }
    }
  },
  {
    method: 'GET',
    path: '/api/photo',
    handler: function(request, reply) {
      var photoController = require('../components/photo/photo.controller')();
      reply( photoController.list() );
    }
  },
  {
    method: 'POST',
    path: '/api/photo',
    config: {
      payload: {
        output: 'stream',
        maxBytes: 5000000
      }
    },
    handler: function(request, reply) {
      var photoController = require('../components/photo/photo.controller')();
      reply( photoController.upload(request.payload.file) );
    }
  },
  {
    method: 'GET',
    path: '/api/photo/{id}',
    handler: function(request, reply) {
      var photoController = require('../components/photo/photo.controller')();
      reply( photoController.get(request.params.id) );
    }
  },
  {
    method: 'GET',
    path: '/api/file/{id}/{size?}',
    handler: function(request, reply) {
      var photoController = require('../components/photo/photo.controller')();
      var size = (request.params.size) ? request.params.size : 'o';
      reply( photoController.file(request.params.id, size) );
    }
  },
  {
    method: 'GET',
    path: '/api/helper/shortcode',
    handler: function(request, reply) {
      var shortid = require('shortid');
      reply(shortid.generate());
    }
  }
];