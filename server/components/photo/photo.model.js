var db = require('../../bootstrap/database');
var Q = require('q');

var Photo = function() {
  var photoData;

  function myPhoto() {
    photoData = {};
  }

  myPhoto.load = function(id) {
    var deferred = Q.defer();
    var myObject = this;

    return db.query("SELECT data FROM photo WHERE data->>'id' = $1", [id])
      .then(function(data) {
        photoData = data[0].data;
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