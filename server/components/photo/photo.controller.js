var db = require('../../bootstrap/database');
var AWS = require('aws-sdk');

var fs = require('fs');
var zlib = require('zlib');

var _ = require('lodash');

var shortid = require('shortid');
var gm = require('gm');

AWS.config.loadFromPath('./config/aws-cred.json');
var s3 = new AWS.S3();

var PhotoController = function() {
  return {
    list: function() {
      return db.query("SELECT data FROM photo")
        .then(function(data) {
          return _.map(data, function(d) {return d.data});
        });
    },
    get: function(id) {
      return db.query("SELECT data FROM photo WHERE data->>'id' = $1", [id])
        .then(function(data) {
          var rawData = data[0].data;
          return {
            title: rawData.title,
            url: '/file/' + rawData.id
          };
        }, function() {
          console.log("ERROR");
        });
    },
    file: function(id, size) {
      return db.query("SELECT data FROM photo WHERE data->>'id' = $1", [id])
        .then(function(data) {
          console.log("load data", data);
          var inputStream = s3.getObject({'Bucket': 'bjm-phototools', 'Key': data[0].data.key}).createReadStream();

          inputStream.on('data', function(chunk) {
            //console.log('got %d bytes of data', chunk.length);
          });

          if (size == 'o') {
            return inputStream;
          }

          var outputStream = gm(inputStream).resize(200, 200).stream();
          return outputStream;
        }, function() {
          console.log("ERROR");
        });
    },
    upload: function(f) {
      var body = f;
      var slug = shortid.generate();
      var fileSlug = shortid.generate();

      var s3obj = new AWS.S3({params: {Bucket: 'bjm-phototools', Key: fileSlug + '.jpg' }});
      s3obj.upload({Body: body}).
        on('httpUploadProgress', function(evt) { console.log(evt); }).
        send(function(err, data) { console.log(err, data) });

      var uploadData = {
        id: slug,
        key: fileSlug + '.jpg'
      };

      console.log(JSON.stringify(uploadData));

      return db.query("INSERT INTO photo (data) VALUES ('" + JSON.stringify(uploadData) + "')")
        .then(function(data) {
          return uploadData;
        }, function(err) {
          console.log("Error", err);
        });
    },
    save: function() {

    }
  }
};

module.exports = PhotoController;