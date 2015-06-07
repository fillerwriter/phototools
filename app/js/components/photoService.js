angular.module('photoTools')
  .factory('photoService', ['$http', function($http) {
    var photoService = {};

    photoService.list = function() {
      return $http.get('/api/photo');
    };

    return photoService;
  }]);