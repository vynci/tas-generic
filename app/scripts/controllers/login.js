'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('LoginCtrl', function($scope,$position,$state,$rootScope) {
      
    var currentUser = Parse.User.current();
    console.log(currentUser);
    if (currentUser) {
        // do stuff with the user
      Parse.User.logOut().then(
        function() {

        }, function(error) {
          alert('error : ' + error.message);
        }
      );        
    } else {
        $rootScope.isLogged = true;
        $state.go('dashboard.home');
    }

    $scope.currentUser = {
        
    };
    $scope.login = function(){

        Parse.User.logIn($scope.currentUser.username, $scope.currentUser.password, {
        success: function(user) {
            // Do stuff after successful login.
            $rootScope.isLogged = true;
            $state.go('dashboard.home');
        },
        error: function(user, error) {
            // The login failed. Check error to see why.
            console.log(error);
            alert('error : ' + error.message);

        }
        });
    }
  });
