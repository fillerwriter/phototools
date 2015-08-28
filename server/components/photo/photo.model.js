var db = require('../../bootstrap/database');
var Q = require('q');

var Photo = function() {
  var photoData;
  var photoId;

  function myPhoto() {
    photoData = {};
  }

  myPhoto.load = function(id) {
    console.log(id);
    var deferred = Q.defer();
    var myObject = this;

    return db.one("SELECT * FROM photo WHERE data->>'id' = $1", [id])
      .then(function(data) {
        photoData = data[0].data;
        photoId = id;

        deferred.resolve(myObject);
      }, function(err) {
        deferred.reject(new Error(err));
      });
  };

  myPhoto.save = function() {
    // @TODO: verify
    var deferred = Q.defer();
    var myObject = this;

    var query = (photoId) ? "UPDATE photo SET data = '" + JSON.stringify(photoData) + "' WHERE data->>'id' = $1" : "INSERT INTO photo (data) VALUES ('" + JSON.stringify(photoData) + "')";

    return db.one(query, [id])
      .then(function(data) {
        deferred.resolve(myObject);
      }, function(err) {
        deferred.reject(new Error(err));
      });

  };

  myPhoto.key = function() {
    return photoData.key;
  };

  myPhoto.title = function() {
    return photoData.title;
  };

  myPhoto.photoKeyFromSize = function(size) {
    var validatedSize = (size) ? size : 'o';
    return (validatedSize == "o") ? photoData.key : photoData.resized[validatedSize];
  };

  return myPhoto;
};

module.exports = Photo;