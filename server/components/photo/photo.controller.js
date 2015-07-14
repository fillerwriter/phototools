var db = require('../../bootstrap/database');
var AWS = require('aws-sdk');

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
          var key = (size == 'o') ? data[0].data.key : data[0].data.resized[size];

          var inputStream = s3.getObject({'Bucket': 'bjm-phototools', 'Key': key}).createReadStream();

          inputStream.on('data', function(chunk) {
            //console.log('got %d bytes of data', chunk.length);
          });

          return inputStream;
        }, function() {
          console.log("ERROR");
        });
    },
    upload: function(f) {
      var body = f;
      var slug = shortid.generate();
      var fileSlug = shortid.generate();
      var fileName = fileSlug + '.jpg';

      var s3obj = new AWS.S3({params: {Bucket: 'bjm-phototools', Key: fileName }});
      s3obj.upload({Body: body}).
        on('httpUploadProgress', function(evt) { console.log(evt); }).
        send(function(err, data) { console.log(err, data) });

      var resized = this.process(slug, body);

      var uploadData = {
        id: slug,
        key: fileName,
        resized: resized
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

    },
    // @TODO: Split into separate object
    process: function(slug, file) {
      var sizes = {
        "thumb": [250, 250],
        "s"    : [200, 200],
        "m"    : [640, 480],
        "l"    : [1024, 768],
        "xl"   : [2048, 1536]
      };

      var sizeFiles = {};

      var fileName = slug + '.jpg';
      var inputStream = gm(file, fileName);

      _.forEach(sizes, function(size, key) {
        var resizeSlug = shortid.generate();
        var s3obj = new AWS.S3({params: {Bucket: 'bjm-phototools', Key: resizeSlug + ".jpg" }});
        s3obj.upload({Body: inputStream.resize(size[0], size[1]).stream() }).
          on('httpUploadProgress', function(evt) { console.log(evt); }).
          send(function(err, data) { console.log(err, data) });

        sizeFiles[key] = resizeSlug + '.jpg';
      });

      return sizeFiles;
    }
  }
};

module.exports = PhotoController;