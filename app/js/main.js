var photoToolsApp = angular.module('photoTools', ['ngRoute']);

photoToolsApp
  .controller('TestController', function($scope, $routeParams) {
    console.log($scope);
    console.log("HI");
  })
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('media/:mediaId', {
      'controller': 'TestController'
    });
    $locationProvider.html5Mode(true);
    console.log($locationProvider);
  }]);