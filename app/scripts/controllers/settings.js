'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('SettingsCtrl', function($scope, $http, settingsService, $window, $state, $timeout) {
    var currentUser = Parse.User.current();
    var oldWifiCredentials = {};
    if(!currentUser){
      $state.go('login');
    }

    var settingId = currentUser.get('settingId');
    $scope.defaultProfPic = "img/logo/logo_placeholder.png";
    $scope.sortLists=[{id:0, name:"Text"},{id:1,name:"Number"},{id:2,name:"Date"},{id:3,name:"Boolean"}];

    $scope.settings = {};

    $scope.timeSettings = {
      currentTime :'',
      lateTime: '',
      tmpLateTime : {
        hours : 0,
        minutes : 0
      },
      tmpLateTimePM : {
        hours : 0,
        minutes : 0
      },

      cutoffTime : {
        hours : 0,
        minutes : 0
      }
    };

    $scope.userTableFormat = {};

    getSettings();

    function getSettings(){
      settingsService.getSetting(settingId)
      .then(function(results) {
        // Handle the result
        $scope.settings = results[0];
        $scope.applicationVersion = $scope.settings.get('version');
        $scope.isDTRHeaderCustomizable = $scope.settings.get('isDTRHeaderCustomizable');
        $scope.previewImage1 = $scope.settings.get('primaryPhoto');
        $scope.previewImage2 = $scope.settings.get('secondaryPhoto');
        $scope.previewImage3 = $scope.settings.get('coverImage');
        $scope.companyName = $scope.settings.get('companyName');
        $scope.companyNameSubtitle1 = $scope.settings.get('companyNameSubtitle1');
        $scope.companyNameSubtitle2 = $scope.settings.get('companyNameSubtitle2');
        $scope.inCharge = $scope.settings.get('inCharge');

        $scope.colorThemes = $scope.settings.get('colorThemes');
        $scope.displayedCollection = $scope.settings.get('userTable');

        $scope.timeSettings.lateTime = $scope.settings.get('lateTime');
        $scope.timeSettings.lateTime = $scope.timeSettings.lateTime.split(':');
        $scope.timeSettings.tmpLateTime.hours = parseInt($scope.timeSettings.lateTime[0]);
        $scope.timeSettings.tmpLateTime.minutes = parseInt($scope.timeSettings.lateTime[1]);

        $scope.timeSettings.lateTimePM = $scope.settings.get('lateTimePM');
        $scope.timeSettings.lateTimePM = $scope.timeSettings.lateTimePM.split(':');
        $scope.timeSettings.tmpLateTimePM.hours = parseInt($scope.timeSettings.lateTimePM[0]);
        $scope.timeSettings.tmpLateTimePM.minutes = parseInt($scope.timeSettings.lateTimePM[1]);


        var settingsCutoffTime = $scope.settings.get('cutoffTime');
        settingsCutoffTime = [(settingsCutoffTime > 0) ? Math.floor(settingsCutoffTime) : Math.ceil(settingsCutoffTime), settingsCutoffTime % 1];

        $scope.timeSettings.cutoffTime.minutes = Math.round(settingsCutoffTime[1]*100);
        $scope.timeSettings.cutoffTime.hours = parseInt(settingsCutoffTime[0]);

        $scope.timeSettings.backupTime = $scope.settings.get('backupTime');

        $scope.isShowTotalTime = $scope.settings.get('isShowTotalTime');
        $scope.enableOvertimeOption = $scope.settings.get('enableOvertimeOption');
        $scope.enableDateRange = $scope.settings.get('enableDateRange');
        $scope.isTwoLogsEnable = $scope.settings.get('isTwoLogsEnable');
        $scope.isCutOffTime = $scope.settings.get('isCutOffTime');

        if($scope.isShowTotalTime){
          $scope.isShowTotalTime = "true";
        } else {
          $scope.isShowTotalTime = "false";
        }

        if($scope.isDTRHeaderCustomizable){
          $scope.isDTRHeaderCustomizable = "true";
        } else {
          $scope.isDTRHeaderCustomizable = "false";
        }

        if($scope.enableOvertimeOption){
          $scope.enableOvertimeOption = "true";
        } else {
          $scope.enableOvertimeOption = "false";
        }

        if($scope.enableDateRange){
          $scope.enableDateRange = "true";
        } else {
          $scope.enableDateRange = "false";
        }

        if($scope.isTwoLogsEnable){
          $scope.isTwoLogsEnable = "true";
        } else {
          $scope.isTwoLogsEnable = "false";
        }

        if($scope.isCutOffTime){
          $scope.isCutOffTime = "true";
        } else {
          $scope.isCutOffTime = "false";
        }

        $scope.wifiCredentials = {
          ssid : $scope.settings.get('ssid'),
          wifiPassword: $scope.settings.get('wifiPassword')
        };
        oldWifiCredentials = {
          ssid : $scope.settings.get('ssid'),
          wifiPassword: $scope.settings.get('wifiPassword')
        };

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };

    $scope.timeChange = function(){
      console.log($scope.timeSettings.currentTime);
      console.log($scope.timeSettings.lateTime);
    }

    $scope.updateAvatarPrimary = function(){
      console.log($scope.uploadFilePrimary);
      if($scope.uploadFilePrimary){
        $http.post("http://172.24.1.1:1337/parse/files/image.jpg", $scope.uploadFilePrimary, {
          withCredentials: false,
          headers: {
            'X-Parse-Application-Id': 'myAppId',
            'X-Parse-REST-API-Key': 'myRestAPIKey',
            'Content-Type': 'image/jpeg'
          },
          transformRequest: angular.identity
        }).then(function(data) {
          console.log(data.data.url);
          var Settings = Parse.Object.extend("Settings");
          var settings = new Settings();

          settings.id = settingId;

          settings.set("primaryPhoto", data.data.url);

          settings.save(null, {
            success: function(result) {
              // Execute any logic that should take place after the object is saved.
              console.log(result);
            },
            error: function(gameScore, error) {
              // Execute any logic that should take place if the save fails.
              // error is a Parse.Error with an error code and message.
            }
          });
        },function(err){
          alert('Picture should not exceed 2mb, Please Try again.');
        });

      }
    }

    $scope.updateAvatarSecondary = function(){
      console.log($scope.uploadFileSecondary);
      if($scope.uploadFileSecondary){
        $http.post("http://172.24.1.1:1337/parse/files/image.jpg", $scope.uploadFileSecondary, {
          withCredentials: false,
          headers: {
            'X-Parse-Application-Id': 'myAppId',
            'X-Parse-REST-API-Key': 'myRestAPIKey',
            'Content-Type': 'image/jpeg'
          },
          transformRequest: angular.identity
        }).then(function(data) {
          console.log(data.data.url);
          var Settings = Parse.Object.extend("Settings");
          var settings = new Settings();

          settings.id = settingId;

          settings.set("secondaryPhoto", data.data.url);

          settings.save(null, {
            success: function(result) {
              // Execute any logic that should take place after the object is saved.
              console.log(result);
            },
            error: function(gameScore, error) {
              // Execute any logic that should take place if the save fails.
              // error is a Parse.Error with an error code and message.
            }
          });
        },function(err){
          alert('Picture should not exceed 2mb, Please Try again.');
        });

      }
    }

    $scope.updateCoverImage = function(){
      if($scope.uploadFileCover){
        $http.post("http://172.24.1.1:1337/parse/files/image.jpg", $scope.uploadFileCover, {
          withCredentials: false,
          headers: {
            'X-Parse-Application-Id': 'myAppId',
            'X-Parse-REST-API-Key': 'myRestAPIKey',
            'Content-Type': 'image/jpeg'
          },
          transformRequest: angular.identity
        }).then(function(data) {
          console.log(data.data.url);
          var Settings = Parse.Object.extend("Settings");
          var settings = new Settings();

          settings.id = settingId;

          settings.set("coverImage", data.data.url);

          settings.save(null, {
            success: function(result) {
              // Execute any logic that should take place after the object is saved.
              console.log(result);
            },
            error: function(gameScore, error) {
              // Execute any logic that should take place if the save fails.
              // error is a Parse.Error with an error code and message.
            }
          });
        },function(err){
          alert('Picture should not exceed 2mb, Please Try again.');
        });

      }
    }

    $scope.updateAdminProfile = function(){
      console.log(currentUser);
      console.log($scope.adminProfile.newPassword);
      if(currentUser && $scope.adminProfile.newPassword){
        if($scope.adminProfile.newPassword === $scope.adminProfile.confirmPassword){
          currentUser.set("password", $scope.adminProfile.newPassword);

          currentUser.save(null, {
            success: function(result) {
              // Execute any logic that should take place after the object is saved.
              console.log(result);
              alert('Admin Password Updated.');
              $scope.notificationAlert = 'Admin Password Updated.';
              $timeout(function() {
                $scope.notificationAlert = null;
              }, 3000);
            },
            error: function(gameScore, error) {
              // Execute any logic that should take place if the save fails.
              // error is a Parse.Error with an error code and message.
            }
          });
        }

      }
    }

    $scope.updateBackupTime = function(){
      var Settings = Parse.Object.extend("Settings");
      var settings = new Settings();

      settings.id = settingId;

      settings.set("backupTime", $scope.timeSettings.backupTime);

      settings.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          console.log(result);
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
        }
      });
    }


    $scope.updateApplicationProfile = function(){
      if($scope.companyName){
        var Settings = Parse.Object.extend("Settings");
        var settings = new Settings();

        settings.id = settingId;

        settings.set("companyName", $scope.companyName);
        settings.set("companyNameSubtitle1", $scope.companyNameSubtitle1);
        settings.set("companyNameSubtitle2", $scope.companyNameSubtitle2);
        settings.set("inCharge", $scope.inCharge);

        if($scope.isShowTotalTime === "true"){
          settings.set("isShowTotalTime", true);
        } else{
          settings.set("isShowTotalTime", false);
        }

        if($scope.isDTRHeaderCustomizable === "true"){
          settings.set("isDTRHeaderCustomizable", true);
        } else{
          settings.set("isDTRHeaderCustomizable", false);
        }

        if($scope.enableOvertimeOption === "true"){
          settings.set("enableOvertimeOption", true);
        } else{
          settings.set("enableOvertimeOption", false);
        }

        if($scope.enableDateRange === "true"){
          settings.set("enableDateRange", true);
        } else{
          settings.set("enableDateRange", false);
        }

        if($scope.isTwoLogsEnable === "true"){
          settings.set("isTwoLogsEnable", true);
        } else{
          settings.set("isTwoLogsEnable", false);
        }

        if($scope.isCutOffTime === "true"){
          settings.set("isCutOffTime", true);
        } else{
          settings.set("isCutOffTime", false);
        }


        var tmpHours = $scope.timeSettings.tmpLateTime.hours.toString();
        var tmpMinutes = $scope.timeSettings.tmpLateTime.minutes.toString();

        var tmpHoursPM = $scope.timeSettings.tmpLateTimePM.hours.toString();
        var tmpMinutesPM = $scope.timeSettings.tmpLateTimePM.minutes.toString();

        $scope.timeSettings.lateTime = tmpHours + ':' + tmpMinutes;
        $scope.timeSettings.lateTimePM = tmpHoursPM + ':' + tmpMinutesPM;

        settings.set("lateTime", $scope.timeSettings.lateTime);
        settings.set("lateTimePM", $scope.timeSettings.lateTimePM);

        var cutoffTime = $scope.timeSettings.cutoffTime.hours + $scope.timeSettings.cutoffTime.minutes / 100;

        settings.set("cutoffTime", parseFloat(cutoffTime));

        settings.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            console.log(result);
            $window.location.reload();
          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
          }
        });
      }
    }

    $scope.updateWifiCredentials = function(){
      if(oldWifiCredentials.ssid !== $scope.wifiCredentials.ssid || oldWifiCredentials.wifiPassword !== $scope.wifiCredentials.wifiPassword){

        if($scope.wifiCredentials.wifiPassword.length >= 8){
          var data = {
            oldSSID : oldWifiCredentials.ssid,
            oldPassword : oldWifiCredentials.wifiPassword,
            newSSID : $scope.wifiCredentials.ssid,
            newPassword: $scope.wifiCredentials.wifiPassword
          };

          settingsService.updateWifiCredentials(data)
          .then(function(results) {
            // Handle the result
            if(results.message === "wifi credentials set!"){
              var Settings = Parse.Object.extend("Settings");
              var settings = new Settings();

              settings.id = settingId;

              settings.set("ssid", $scope.wifiCredentials.ssid);
              settings.set("wifiPassword", $scope.wifiCredentials.wifiPassword);

              settings.save(null, {
                success: function(result) {
                  // Execute any logic that should take place after the object is saved.
                  console.log(result);
                },
                error: function(gameScore, error) {
                  // Execute any logic that should take place if the save fails.
                  // error is a Parse.Error with an error code and message.
                }
              });
            }
          }, function(err) {
            // Error occurred
            console.log(err);
          }, function(percentComplete) {
            console.log(percentComplete);
          });
        }
        else{
          alert('WIFI Password must be at least 8 characters');
        }


      }
    }

    $scope.rebootDevice = function(){
      $timeout(function() {
        $state.go('login');
      }, 3000);
      settingsService.reboot()
      .then(function(results) {
        // Handle the result
      }, function(err) {
        // Error occurred
        console.log(err);
        $window.location.reload();
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    }

    $scope.powerOffDevice = function(){
      $timeout(function() {
        $state.go('login');
      }, 3000);
      settingsService.powerOff()
      .then(function(results) {
        // Handle the result
      }, function(err) {
        // Error occurred
        console.log(err);
        $window.location.reload();
      }, function(percentComplete) {
        console.log(percentComplete);
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
        $scope.notificationAlert = 'System Time Synchronized.';
        $timeout(function() {
          $scope.notificationAlert = null;
        }, 3000);
        // Handle the result
      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    }

    $scope.updateColorThemes = function(){
      console.log($scope.colorThemes);
      if($scope.colorThemes){
        var Settings = Parse.Object.extend("Settings");
        var settings = new Settings();

        settings.id = settingId;

        settings.set("colorThemes", $scope.colorThemes);

        settings.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            console.log(result);
            $window.location.reload();
          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
          }
        });
      }
    }

    $scope.addUserTableField = function(){

      if($scope.userTableFormat){
        var Settings = Parse.Object.extend("Settings");
        var settings = new Settings();

        settings.id = settingId;
        $scope.userTableFormat.type = $scope.userTableFormat.type.name;
        $scope.displayedCollection.push($scope.userTableFormat);

        settings.set("userTable", $scope.displayedCollection);

        settings.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            console.log(result);
            getSettings();
          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
          }
        });
      }
    }

    $scope.deleteUserField = function(){
      var Settings = Parse.Object.extend("Settings");
      var settings = new Settings();

      settings.id = settingId;

      settings.set("userTable", $scope.userTableResult);

      settings.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          $scope.userTableResult = [];
          console.log(result);
          getSettings();
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    $scope.selectUserField = function(userField){
      var result = [];
      console.log($scope.displayedCollection);
      angular.forEach($scope.displayedCollection, function(value, key) {
        if(value.field !== userField.field){
          this.push(value);
        }

      }, result);
      console.log(result);
      $scope.userTableResult = result;
    }

    $scope.backupDatabase = function(process){
      settingsService.backup(process)
      .then(function(results) {
        $scope.notificationAlert = 'System ' + process + ' success.';
        $timeout(function() {
          $scope.notificationAlert = null;
        }, 3000);
        // Handle the result
      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    }
});
