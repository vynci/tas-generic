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
      
    var currentEmployee = ''; 
    function getAll(){
      employeeService.getEmployees()
      .then(function(results) {
        // Handle the result
        console.log(results);
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
    
    $scope.modal = {
        title : '',
        mode : '',
        isUpdate : false
    }

    $scope.openModal = function () {
      $scope.modal.title = 'Add User';
      $scope.modal.mode = 'Create';
      $scope.modal.isUpdate = false;
      
      $scope.user.firstName = '';
      $scope.user.lastName = '';
      $scope.user.gender = 'Male';
      $scope.user.age = '';
      $scope.previewImage = '';
    };
    
    $scope.editModal = function (id) {
      console.log(id);
      $scope.modal.title = 'Edit User';
      $scope.modal.mode = 'Update';
      $scope.modal.isUpdate = true;    

      currentEmployee = '';
      $scope.previewImage = '';
      employeeService.getEmployee(id)
        .then(function(result) {
            // Handle the result
            console.log(result);
            $scope.user.firstName = result[0].get('firstName');
            $scope.user.lastName = result[0].get('lastName');
            $scope.user.gender = result[0].get('gender');
            $scope.user.age = result[0].get('age');
            $scope.previewImage = result[0].get('avatarUrl');
            
            currentEmployee = result[0];
        }, function(err) {
            // Error occurred
            console.log(err);
        }, function(percentComplete) {
            console.log(percentComplete);
      });

    };

    $scope.updateUser = function(){
        console.log('update!');
        currentEmployee.set("firstName", $scope.user.firstName);
        currentEmployee.set("lastName", $scope.user.lastName);
        currentEmployee.set("gender", $scope.user.gender);
        currentEmployee.set("age", $scope.user.age);

        currentEmployee.save(null, {
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
    }

    $scope.addUser = function(){

        $http.post("http://localhost:1337/parse/files/image.jpg", $scope.uploadFile, {
            withCredentials: false,
            headers: {
                'X-Parse-Application-Id': '123',
                'X-Parse-REST-API-Key': 'arp2',
                'Content-Type': 'image/jpeg'
            },
            transformRequest: angular.identity
        }).then(function(data) {
            console.log(data.data.url);
            var Employee = Parse.Object.extend("Employee");
            var employee = new Employee();

            employee.set("firstName", $scope.user.firstName);
            employee.set("lastName", $scope.user.lastName);
            employee.set("gender", $scope.user.gender);
            employee.set("age", $scope.user.age);
            employee.set("avatarUrl", data.data.url);

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
