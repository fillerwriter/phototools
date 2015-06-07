angular.module('photoTools')
  .directive('photo', ['photoService', function(photoService) {
    return {
      templateUrl: "components/photo/photo.html",
      link: function(scope, element, attr) {
        photoService.list()
          .success(function(data) {
            scope.data = data;
          });
      }
    };
  }]);