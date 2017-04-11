'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('ConfigCtrl', function($scope,$position,$state,$rootScope, settingsService) {

    var currentUser = Parse.User.current();
    $scope.secondaryPassword = {};
    console.log('COnfigh!');
    getSettings();

    $scope.superAdmin = {
      password : ''
    }

    $scope.configPassword = {
      value : ''
    }

    $scope.isAuthenticated = false;

    function getSettings(){
      settingsService.getSetting()
      .then(function(results) {
        // Handle the result
        $scope.settings = results[0];

        $scope.applicationVersion = $scope.settings.get('version');
        $scope.userLogInterval = {
          value : $scope.settings.get('userLogInterval')
        };
        $scope.settingsProductId = {
          value : $scope.settings.get('productId')
        };
        $scope.settingsFirstBoot = $scope.settings.get('firstBoot');
        $scope.settingsConfigPassword = $scope.settings.get('configPassword');

        $scope.isSecondaryPassword = {
          value : $scope.settings.get('isSecondaryPassword')
        };
        $scope.enableRFID = {
          value : $scope.settings.get('enableRFID')
        };
        $scope.hardwareType = {
          value : $scope.settings.get('hardwareType')
        };
        $scope.secondaryPasswordFromDatabase = $scope.settings.get('secondaryPassword');
        var forgotSecondaryPasswordPool = $scope.settings.get('forgotSecondaryPasswordPool');

        $scope.secretKey = {
          first : forgotSecondaryPasswordPool[0],
          second : forgotSecondaryPasswordPool[1],
          third : forgotSecondaryPasswordPool[2],
        };

        if($scope.isSecondaryPassword.value){
          $scope.isSecondaryPassword.value = "true";
        } else {
          $scope.isSecondaryPassword.value = "false";
        }

        if($scope.enableRFID.value){
          $scope.enableRFID.value = "true";
        } else {
          $scope.enableRFID.value = "false";
        }

        getMedia();

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };

    function getMedia(){
      settingsService.getMedia()
      .then(function(results) {
        console.log(results);

        if(results.status === 200){
          $scope.mediaFileList = results.message;
          $scope.isFlashDrivePresent = true;
        }else{
          $scope.isFlashDrivePresent = false;
        }
        // Handle the result
      }, function(err) {
        // Error occurred
        alert('Flash-drive not found!');
        console.log(err);
      });
    }

    $scope.login = function(){
      if($scope.superAdmin.password === 'gregorian0525'){
        $scope.isAuthenticated = true;
      }else{
        alert('Invalid Config Password!');
      }
    }

    $scope.updateUserLogInterval = function(){
      console.log($scope.userLogInterval);
      $scope.settings.set("userLogInterval", $scope.userLogInterval.value);

      $scope.settings.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          alert('User Log Interval: successfully updated!');
          getSettings();
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          alert('update error!');
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    $scope.synchronizeTime = function(){
      // Sat May 28 00:16:11 PHT 2016

      var data = new Date();
      data = data.toString();
      data = data.split(' ');
      data = data[0] + ' ' + data[1] + ' ' + data[2] + ' ' + data[4] + ' UTC ' + data[3];

      settingsService.updateSystemTime(data)
      .then(function(results) {
        alert('successfully synch!');
        getSettings();
        // Handle the result
      }, function(err) {
        // Error occurred
        alert('update error!');
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    }

    $scope.reformatFingerPrint = function(){
      settingsService.reformatFingerPrint()
      .then(function(results) {
        alert('Successfully Formatted! Please wait at least 30 seconds, after doing any activity on the application.');
        getSettings();
        // Handle the result
      }, function(err) {
        // Error occurred
        alert('update error!');
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    }

    $scope.setToFirstBoot = function(){

      $scope.settings.set("firstBoot", true);

      $scope.settings.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          alert('successfully updated!');
          getSettings();
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          alert('update error!');
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    $scope.forgotSecondaryPassword = function(){
      console.log('reset!');

      $scope.settings.set("secondaryPassword", 'admin2');

      $scope.settings.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          alert('successfully reset to "admin2"!');
          getSettings();
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          alert('update error!');
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    $scope.updateSecondaryPassword = function(){

      if($scope.isSecondaryPassword.value === "true"){
        $scope.settings.set("isSecondaryPassword", true);
      } else{
        $scope.settings.set("isSecondaryPassword", false);
      }

      $scope.settings.set("forgotSecondaryPasswordPool", [$scope.secretKey.first, $scope.secretKey.second, $scope.secretKey.third]);

      $scope.settings.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          alert('successfully updated!');
          getSettings();
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          alert('update error!');
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    $scope.updateEnableRFID = function(){

      if($scope.enableRFID.value === "true"){
        $scope.settings.set("enableRFID", true);
      } else{
        $scope.settings.set("enableRFID", false);
      }

      $scope.settings.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          alert('successfully updated!');
          getSettings();
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          alert('update error!');
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    $scope.updateHardwareType = function(){

      if($scope.hardwareType.value === "generic"){
        $scope.settings.set('hardwareType', 'generic');
        $scope.settings.set("isDTRHeaderCustomizable", true);
        $scope.settings.set('enableOvertimeOption', true);
        $scope.settings.set('isCutOffTime', false);
      } else{
        $scope.settings.set('hardwareType', 'deped');
        $scope.settings.set('isCutOffTime', true);
        $scope.settings.set("isDTRHeaderCustomizable", false);
        $scope.settings.set('enableOvertimeOption', false);
        $scope.settings.set('enableDateRange', false);
        $scope.settings.set('isShowTotalTime', false);
        $scope.settings.set('isTwoLogsEnable', false);
      }

      $scope.settings.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          alert('successfully updated!');
          getSettings();
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          alert('update error!');
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    $scope.resetSecondaryPassword = function(){

      if($scope.productIdCredentials === $scope.settingsProductId.value){
        $scope.settings.set("secondaryPassword", 'admin1');

        $scope.settings.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            $scope.passwordResetStatus = 'Successfully Reset to admin1';
            alert('Successfully Reset to admin1');
            console.log(result);
          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
          }
        });
      }else{
        $scope.passwordResetStatus = 'Invalid Product Id.';
      }

    }


    $scope.saveSettings = function(){
      console.log($scope.configPassword);
      if($scope.settingsConfigPassword === $scope.configPassword.value){
        $scope.settings.set("productId", $scope.settingsProductId.value);

        $scope.settings.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            alert('successfully updated!');
            getSettings();
          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
            alert('update error!');
          }
        });
      }
      else{
        alert('Invalid Password');
      }

    }
});
