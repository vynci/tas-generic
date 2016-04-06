'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('ChartCtrl', ['$scope', '$timeout', '$http', 'employeeService', function ($scope, $timeout, $http, employeeService) {

    function getAll(){
      employeeService.getEmployees()
      .then(function(results) {
        // Handle the result

        $scope.rowCollection = results;
        return results;
      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };

    getAll();
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

      var Employee = Parse.Object.extend("Employee");
      var employee = new Employee();

      employee.set("firstName", $scope.user.firstName);
      employee.set("lastName", $scope.user.lastName);
      employee.set("gender", $scope.user.gender);
      employee.set("age", $scope.user.age);

      employee.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          getAll();
          console.log(result);
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
        }
      });
    };

    //remove to the real data holder
    $scope.removeItem = function removeItem(row) {
      var index = $scope.rowCollection.indexOf(row);
      if (index !== -1) {
        $scope.rowCollection.splice(index, 1);
      }
    };
}]);
