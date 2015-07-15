var db = require('../../bootstrap/database');
var AWS = require('aws-sdk');
var Q = require('q');

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
            url: '/api/file/' + rawData.id
          };
        }, function() {
          console.log("ERROR");
        });
    },
    file: function(id, size) {
      var photo = require("./photo.model")();
      var size = (size) ? size : 'o';

      return photo.load(id)
        .then(function() {
          var photoKey = photo.photoKeyFromSize(size);
          return s3.getObject({'Bucket': 'bjm-phototools', 'Key': photoKey}).createReadStream();
        });
    },
    upload: function(f) {
      var body = f;
      var slug = shortid.generate();
      var fileSlug = shortid.generate();
      var fileName = fileSlug + '.jpg';

      var deferred = Q.defer();
      var self = this;

      var s3obj = new AWS.S3({params: {Bucket: 'bjm-phototools'}});
      var s3Request = s3obj.upload({Key: fileName, Body: body, "Content-Type": "image/jpeg"});

      s3Request.send(function(err) {
        var newStream = s3.getObject({'Bucket': 'bjm-phototools', 'Key': fileName}).createReadStream();
        var resized = self.process(slug, newStream);

        var uploadData = {
          id: slug,
          key: fileName,
          resized: resized
        };

        db.query("INSERT INTO photo (data) VALUES ('" + JSON.stringify(uploadData) + "')")
          .then(function() {
            deferred.resolve(uploadData);
          }, function(err) {
            console.log("Error", err);
            deferred.error(err);
          });
      });

      return deferred.promise;
    },
    save: function() {

    },
    // @TODO: Split into separate object
    process: function(slug, file) {
      // @TODO: Sizes should be it's own requirable object.
      var sizes = {
        "thumb": [250, 250],
        "s"    : [200, 200],
        "m"    : [640, 480],
        "l"    : [1024, 768],
        "xl"   : [2048, 1536]
      };

      var sizeFiles = {};

      var fileName = slug + '.jpg';
      var inputStream = gm(file);

      _.forEach(sizes, function(size, key) {
        var resizeSlug = shortid.generate();
        var s3obj = new AWS.S3({params: {Bucket: 'bjm-phototools', Key: resizeSlug + ".jpg" }});
        s3obj.upload({Body: inputStream.resize(size[0], size[1]).stream(), "Content-Type": "image/jpeg" }).
          on('httpUploadProgress', function(evt) { console.log(evt); }).
          send(function(err, data) { console.log(err, data) });

        sizeFiles[key] = resizeSlug + '.jpg';
      });

      return sizeFiles;
    }
  }
};

module.exports = PhotoController;