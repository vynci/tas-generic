'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('ChartCtrl', ['$scope', '$timeout', function ($scope, $timeout, ModalService) {

    var firstnames = ['Laurent', 'Blandine', 'Olivier', 'Max'];
    var lastnames = ['Renard', 'Faivre', 'Frere', 'Eponge'];
    var gender = ['Female', 'Male', 'Female', 'Male'];
    var id = 1;

    $scope.user = {
      'firstName' : '',
      'lastName' : '',
      'gender' : 'Male',
      'age' : ''
    }

    $scope.openModal = function () {
      $scope.user.firstName = '';
      $scope.user.lastName = '';
      $scope.user.gender = 'Male';
      $scope.user.age = '';
    };

    $scope.addUser = function(){

      var userData = {
        firstName : $scope.user.firstName,
        lastName : $scope.user.lastName,
        gender : $scope.user.gender,
        age : $scope.user.age,
        id : id
      };

      $scope.rowCollection.push(userData);

      id++;
    };

    $scope.rowCollection = [];

    //remove to the real data holder
    $scope.removeItem = function removeItem(row) {
      var index = $scope.rowCollection.indexOf(row);
      if (index !== -1) {
        $scope.rowCollection.splice(index, 1);
      }
    };
}]);
