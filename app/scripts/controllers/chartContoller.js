'use strict';
/**
* @ngdoc function
* @name sbAdminApp.controller:MainCtrl
* @description
* # MainCtrl
* Controller of the sbAdminApp
*/
angular.module('sbAdminApp')
.controller('ChartCtrl', ['$scope', '$timeout', '$http', 'employeeService', 'socket', '$modalStack', 'settingsService', '$state', 'periodLogService', function ($scope, $timeout, $http, employeeService, socket, $modalStack, settingsService, $state, periodLogService, $window) {
  var currentUser = Parse.User.current();
  if(!currentUser){
    $state.go('login');
  }

  var settingId = currentUser.get('settingId');
  var fingerPrintIdPool = [];
  var idToBeDeleted = '';
  var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
  ];
  var dateNow = new Date();  

  $scope.mothSelectNames = monthNames;
  $scope.totalUsers = null;
  // $scope.uploadFile = {};
  $scope.isScanFinger = true;
  $scope.defaultProfPic = "img/logo/logo_placeholder.png";
  $scope.scanStatus = 'Scan';

  $scope.sortLists=[{id:0, name:"Id"},{id:1,name:"firstName"},{id:2,name:"lastName"},{id:3,name:"gender"},{id:4,name:"age"}]

  $scope.changedValue=function(item){
    if(item.name === 'Id'){
      getAll('fingerPrintId');
    }
    getAll(item.name);
  }
  
  $scope.selectedDateFrom = {
    year : dateNow.getFullYear(),
    month : monthNames[dateNow.getMonth()]
  };  

  $scope.selectedDateTo = {
    year : dateNow.getFullYear(),
    month : monthNames[dateNow.getMonth()]
  };    

  var currentEmployee = '';
  function getAll(sort){
    employeeService.getEmployees(sort, 500)
    .then(function(results) {
      // Handle the result
      $scope.rowCollection = results;
      $scope.totalUsers = results.length;

      return results;
    }, function(err) {
      // Error occurred
      console.log(err);
    }, function(percentComplete) {
      console.log(percentComplete);
    });
  };

  getAll();

  getSettings();

  function getSettings(){
    settingsService.getSetting(settingId)
    .then(function(results) {
      // Handle the result
      console.log(results);
      $scope.settings = results[0];
      console.log($scope.settings);

      $scope.userTable = $scope.settings.get('userTable');
      $scope.userInfo = {}
      fingerPrintIdPool = $scope.settings.get('fingerPrintIdPool');
      $scope.enableRFID = $scope.settings.get('enableRFID');
      $scope.secondaryPassword = $scope.settings.get('secondaryPassword');

      if($scope.enableRFID ){
        $scope.isScanFinger = false;
      }
      console.log(fingerPrintIdPool);

    }, function(err) {
      // Error occurred
      console.log(err);
    }, function(percentComplete) {
      console.log(percentComplete);
    });
  };

  $scope.user = {
    'firstName' : '',
    'lastName' : '',
    'gender' : 'Male',
    'isCrossDate' : 'false',
    'userRegularDays' : 'Monday-Friday',
    'saturdays' : 'As Required',
    'regularTime' : {
      morningTimeIn : {
        hours: 8,
        minutes:0
      },
      morningTimeOut : {
        hours: 12,
        minutes:0
      },
      afternoonTimeIn : {
        hours: 13,
        minutes:0
      },
      afternoonTimeOut : {
        hours: 17,
        minutes:0
      }
    },
    'age' : ''
  }

  $scope.modal = {
    title : '',
    mode : '',
    isUpdate : false
  }

  $scope.deleteSelected = function(){
    var delay = 0;
    $scope.isDeleteProgress = true;
    (function myLoop (i) {
      if($scope.rowCollection[i-1].get('isSelected')){
        setTimeout(function () {
          currentEmployee = $scope.rowCollection[i-1];
          $scope.deleteUser();
          if (--i){
            myLoop(i);
          }else{
            $scope.isDeleteProgress = false;
            $scope.isDeleteCompleted = true;
          }
        }, 5000)
      }else{
        if (--i) myLoop(i);
      }

    })($scope.rowCollection.length);

  }

  $scope.selectedUser = function(user, status, isAll){
    console.log(user);
    console.log(status);
    if(!isAll){
      user.set('isSelected', status);
    }else{
      angular.forEach($scope.rowCollection, function(value, key) {
        value.set('isSelected', status);
      });
    }

  };

  $scope.openModal = function () {
    $scope.modal.title = 'Add User';
    $scope.modal.mode = 'Create';
    $scope.modal.isUpdate = false;
    
    $scope.isConfirmDeleteLogsByUser = false;
    $scope.isDeleteLogsByUser = false;
    $scope.isSecondaryPasswordInvalid = false;
    $scope.isSecondaryPasswordValid = false;
    $scope.confirmSecondaryPassword = '';    

    $scope.user.employeeId = '';
    $scope.user.firstName = '';
    $scope.user.lastName = '';
    $scope.user.gender = 'Male';
    $scope.user.isCrossDate = 'false';
    $scope.user.age = '';
    $scope.user.position = '';
    $scope.previewImage = '';
    $scope.scanStatus = 'Scan';
    $scope.buttonScanStatus = 'btn-info';
    $scope.rfidButtonScanStatus = 'btn-warning';
    $scope.rfidScanStatus = null;
    $scope.detectedRFID = null;
    $scope.rfidDetectStatus = null;
    $scope.deleteConfirmation = false;
    $scope.user.userRegularDays = 'Monday-Friday';
    $scope.user.saturdays = 'As Required';
    $scope.user.regularTime = {
      morningTimeIn : {
        hours: 8,
        minutes:0
      },
      morningTimeOut : {
        hours: 12,
        minutes:0
      },
      afternoonTimeIn : {
        hours: 13,
        minutes:0
      },
      afternoonTimeOut : {
        hours: 17,
        minutes:0
      }
    };

  };

  $scope.editModal = function (id) {
    $scope.modal.title = 'Edit User';
    $scope.modal.mode = 'Update';
    $scope.modal.isUpdate = true;
    $scope.isConfirmDeleteLogsByUser = false;
    $scope.isDeleteLogsByUser = false;
    $scope.isSecondaryPasswordInvalid = false;
    $scope.isSecondaryPasswordValid = false;
    $scope.confirmSecondaryPassword = '';

    currentEmployee = '';
    $scope.previewImage = '';
    $scope.scanStatus = 'Change Fingerprint';
    $scope.rfidButtonScanStatus = 'btn-warning';
    $scope.rfidScanStatus = 'Change RFID';
    $scope.rfidScanStatus = null;
    $scope.detectedRFID = null;
    $scope.rfidDetectStatus = null;
    $scope.isRFIDDetected = false;
    $scope.deleteConfirmation = false;
    $scope.isCurrentFingerDeleted = false;
    employeeService.getEmployee(id)
    .then(function(result) {
      // Handle the result
      $scope.user.employeeId = result[0].get('employeeId');
      $scope.user.firstName = result[0].get('firstName');
      $scope.user.lastName = result[0].get('lastName');
      $scope.user.gender = result[0].get('gender');
      $scope.user.age = result[0].get('age');
      $scope.user.position = result[0].get('position');
      $scope.user.fingerPrintId = result[0].get('fingerPrintId');
      $scope.detectedRFID = result[0].get('rfId');
      $scope.previewImage = result[0].get('avatarUrl');

      $scope.user.isCrossDate = result[0].get('isCrossDate');

      if($scope.user.isCrossDate){
        $scope.user.isCrossDate = "true";
      }else{
        $scope.user.isCrossDate = "false";
      }
      
      $scope.user.regularTime = result[0].get('regularTime');
      $scope.user.userRegularDays = result[0].get('userRegularDays');
      $scope.user.saturdays = result[0].get('saturdays');
      currentEmployee = result[0];

      periodLogService.getNumberOfLogsByUser(id)
      .then(function(results) {
        $scope.totalLogsOfCurrentEmployee = results;
      }, function(err) {
        // Error occurred
        console.log(err);
      });

    }, function(err) {
      // Error occurred
      console.log(err);
    }, function(percentComplete) {
      console.log(percentComplete);
    });

  };

  $scope.updateUser = function(){
    console.log($scope.uploadFile);
    currentEmployee.set("employeeId", $scope.user.employeeId);
    currentEmployee.set("firstName", $scope.user.firstName);
    currentEmployee.set("lastName", $scope.user.lastName);
    currentEmployee.set("gender", $scope.user.gender);
    currentEmployee.set("age", $scope.user.age);
    currentEmployee.set("position", $scope.user.position);
    currentEmployee.set("rfId", $scope.user.rfId);

    if($scope.user.isCrossDate === 'true'){
      currentEmployee.set("isCrossDate", true);
    }else{
      currentEmployee.set("isCrossDate", false);
    }

    currentEmployee.set("regularTime", $scope.user.regularTime);
    currentEmployee.set("userRegularDays", $scope.user.userRegularDays);
    currentEmployee.set("saturdays", $scope.user.saturdays);

    if($scope.isCurrentFingerDeleted){
      var fingerPrintId = fingerPrintIdPool[0];
      removeA(fingerPrintIdPool, fingerPrintId);
      currentEmployee.set("fingerPrintId", fingerPrintId.toString());
    }

    if($scope.uploadFile){
      $http.post("http://172.24.1.1:1337/parse/files/image.jpg", $scope.uploadFile, {
        withCredentials: false,
        headers: {
          'X-Parse-Application-Id': 'myAppId',
          'X-Parse-REST-API-Key': 'myRestAPIKey',
          'Content-Type': 'image/jpeg'
        },
        transformRequest: angular.identity
      }).then(function(data) {

        currentEmployee.set("avatarUrl", data.data.url);

        currentEmployee.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            $scope.user.rfId = null;
            $scope.uploadFile = null;
            getAll();

            var Settings = Parse.Object.extend("Settings");
            var settings = new Settings();

            settings.id = settingId;

            settings.set("fingerPrintIdPool", fingerPrintIdPool);

            settings.save(null, {
              success: function(result) {
                // Execute any logic that should take place after the object is saved.
                $scope.userTableResult = [];

                getSettings();

              },
              error: function(gameScore, error) {
                // Execute any logic that should take place if the save fails.
                // error is a Parse.Error with an error code and message.
              }
            });
          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
          }
        });
      },function(err){
        alert('Picture should not exceed 300kb, Please Try again.');
      });

    } else{
      currentEmployee.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          getAll();

          var Settings = Parse.Object.extend("Settings");
          var settings = new Settings();

          settings.id = settingId;

          settings.set("fingerPrintIdPool", fingerPrintIdPool);

          settings.save(null, {
            success: function(result) {
              // Execute any logic that should take place after the object is saved.
              $scope.userTableResult = [];
              console.log(result);
              getSettings();
              $window.location.reload();
            },
            error: function(gameScore, error) {
              // Execute any logic that should take place if the save fails.
              // error is a Parse.Error with an error code and message.
            }
          });
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
        }
      });
    }


  }

  $scope.manualDeleteUserFromSensor = function(){
    console.log($scope.detectedFingerPrintId);

    employeeService.getEmployeeByFingerPrintId($scope.detectedFingerPrintId)
    .then(function(result) {
      // Handle the result

      var detectedEmployee = result[0];

      var Settings = Parse.Object.extend("Settings");
      var settings = new Settings();

      settings.id = settingId;

      fingerPrintIdPool.push(parseInt($scope.detectedFingerPrintId));

      settings.set("fingerPrintIdPool", fingerPrintIdPool);

      console.log(fingerPrintIdPool);

      settings.save(null, {
        success: function(result) {
          getSettings();
          idToBeDeleted = parseInt($scope.detectedFingerPrintId);
          socket.emit('toPublicServer', 'm:delete');

        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
        }
      });

      if(result.length){
        var detectedEmployee = result[0];
        detectedEmployee.set("fingerPrintId", "");

        detectedEmployee.save(null, {
          success: function(result) {

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

  $scope.deleteUser = function(){
    idToBeDeleted = parseInt(currentEmployee.get('fingerPrintId'));

    currentEmployee.destroy({
      success: function(myObject) {
        $scope.modal.title = 'This User no longer exists.';
        $scope.modal.mode = 'Create';
        $scope.modal.isUpdate = false;

        $scope.user.employeeId = '';
        $scope.user.firstName = '';
        $scope.user.lastName = '';
        $scope.user.gender = 'Male';
        $scope.user.isCrossDate = 'false';
        $scope.user.age = '';
        $scope.user.position = '';
        $scope.previewImage = '';
        $scope.scanStatus = 'Scan';
        $scope.buttonScanStatus = 'btn-info';
        $scope.user.userRegularDays = 'Monday-Friday';
        $scope.user.saturdays = 'As Required';
        $scope.user.regularTime = {
          morningTimeIn : {
            hours: 8,
            minutes:0
          },
          morningTimeOut : {
            hours: 12,
            minutes:0
          },
          afternoonTimeIn : {
            hours: 13,
            minutes:0
          },
          afternoonTimeOut : {
            hours: 17,
            minutes:0
          }
        };

        $modalStack.dismissAll();
        getAll();

        var Settings = Parse.Object.extend("Settings");
        var settings = new Settings();

        settings.id = settingId;

        fingerPrintIdPool.push(parseInt(currentEmployee.get('fingerPrintId')));

        settings.set("fingerPrintIdPool", fingerPrintIdPool);

        settings.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            $scope.userTableResult = [];
            console.log(result);
            getSettings();
            socket.emit('toPublicServer', 'm:delete');

            var DailyLogObject = Parse.Object.extend("DailyLog");
            var query = new Parse.Query(DailyLogObject);

            query.equalTo("employeeId", currentEmployee.id);
            query.find().then(function (users) {
              users.forEach(function(user) {
                user.destroy({
                  success: function() {
                    // SUCCESS CODE HERE, IF YOU WANT
                    console.log('daily log deleted');
                  },
                  error: function() {
                    // ERROR CODE HERE, IF YOU WANT
                    console.log('daily log error delete');
                  }
                });
              });
            }, function (error) {
              response.error(error);
            });

            var PeriodLogObject = Parse.Object.extend("PeriodLog");
            var queryPeriod = new Parse.Query(PeriodLogObject);

            queryPeriod.equalTo("employeeId", currentEmployee.id);
            queryPeriod.find().then(function (users) {
              users.forEach(function(user) {
                user.destroy({
                  success: function() {
                    // SUCCESS CODE HERE, IF YOU WANT
                    console.log('period log deleted');
                  },
                  error: function() {
                    // ERROR CODE HERE, IF YOU WANT
                    console.log('period log error delete');
                  }
                });
              });
            }, function (error) {
              response.error(error);
            });

          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
          }
        });
      },
      error: function(myObject, error) {
        // The delete failed.
        // error is a Parse.Error with an error code and message.
      }
    });
  }

  $scope.confirmDelete = function(){
    $scope.deleteConfirmation = true;
  }

  $scope.cancelDelete = function(){
    $scope.deleteConfirmation = false;
  }

  $scope.convertToMB = function(size){
    var value = size/1000;

    if(value){
      return value.toFixed(2);
    }else{
      return 0;
    }
  }

  $scope.checkFileSize = function(size){
    if(size > 2000000){
      return 'log-bold';
    } else{
      return '';
    }
  }

  $scope.addUser = function(){
    if($scope.uploadFile){
      $http.post("http://172.24.1.1:1337/parse/files/image.jpg", $scope.uploadFile, {
        withCredentials: false,
        headers: {
          'X-Parse-Application-Id': 'myAppId',
          'X-Parse-REST-API-Key': 'myRestAPIKey',
          'Content-Type': 'image/jpeg'
        },
        transformRequest: angular.identity
      }).then(function(data) {
        var Employee = Parse.Object.extend("Employee");
        var employee = new Employee();
        var fingerPrintId = fingerPrintIdPool[0];

        removeA(fingerPrintIdPool, fingerPrintId);

        employee.set("employeeId", $scope.user.employeeId);
        employee.set("firstName", $scope.user.firstName);
        employee.set("lastName", $scope.user.lastName);
        employee.set("gender", $scope.user.gender);
        employee.set("age", $scope.user.age);
        employee.set("position", $scope.user.position);
        employee.set("avatarUrl", data.data.url);
        employee.set("fingerPrintId", fingerPrintId.toString());
        employee.set("rfId", $scope.user.rfId);
        employee.set("currentPeriodLog", {"id":null,"date":null,"sequence":0,"totalTime":0});

        if($scope.user.isCrossDate === 'true'){
          employee.set("isCrossDate", true);
        }else{
          employee.set("isCrossDate", false);
        }

        employee.set("regularTime", $scope.user.regularTime);
        employee.set("userRegularDays", $scope.user.userRegularDays);
        employee.set("saturdays", $scope.user.saturdays);

        employee.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            $scope.uploadFile = null;
            $scope.user.rfId = null;
            getAll();

            var Settings = Parse.Object.extend("Settings");
            var settings = new Settings();

            settings.id = settingId;

            settings.set("fingerPrintIdPool", fingerPrintIdPool);

            settings.save(null, {
              success: function(result) {
                // Execute any logic that should take place after the object is saved.
                $scope.userTableResult = [];
                getSettings();
              },
              error: function(gameScore, error) {
                // Execute any logic that should take place if the save fails.
                // error is a Parse.Error with an error code and message.
              }
            });
          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
          }
        });
      },function(err){
        alert('Picture should not exceed 300kb, Please Try again.');
      });

    }

    else {
      var Employee = Parse.Object.extend("Employee");
      var employee = new Employee();
      var fingerPrintId = $scope.totalUsers + 1

      var fingerPrintId = fingerPrintIdPool[0];

      removeA(fingerPrintIdPool, fingerPrintId);

      employee.set("employeeId", $scope.user.employeeId);
      employee.set("firstName", $scope.user.firstName);
      employee.set("lastName", $scope.user.lastName);
      employee.set("gender", $scope.user.gender);
      employee.set("age", $scope.user.age);
      employee.set("position", $scope.user.position);
      employee.set("avatarUrl", $scope.defaultProfPic);
      employee.set("fingerPrintId", fingerPrintId.toString());
      employee.set("rfId", $scope.user.rfId);
      employee.set("currentPeriodLog", {"id":null,"date":null,"sequence":0,"totalTime":0});

      if($scope.user.isCrossDate === 'true'){
        employee.set("isCrossDate", true);
      }else{
        employee.set("isCrossDate", false);
      }

      employee.set("regularTime", $scope.user.regularTime);
      employee.set("userRegularDays", $scope.user.userRegularDays);
      employee.set("saturdays", $scope.user.saturdays);      

      employee.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          $scope.user.rfId = null;
          getAll();

          var Settings = Parse.Object.extend("Settings");
          var settings = new Settings();

          settings.id = settingId;

          settings.set("fingerPrintIdPool", fingerPrintIdPool);

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
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
        }
      });
    }

  };

  $scope.scanFinger = function(){
    console.log('Scan Finger');
    socket.emit('toPublicServer', 'm:enroll');
    $scope.isScanFinger = false;
  }

  $scope.updateFingerPrintInit = function(){
    console.log('Delete Old FingerPrint');
    $scope.isCurrentFingerDeleted = false;
    idToBeDeleted = $scope.user.fingerPrintId;
    console.log(idToBeDeleted);

    if(idToBeDeleted){
      console.log('not empty');
      var Settings = Parse.Object.extend("Settings");
      var settings = new Settings();

      settings.id = settingId;

      fingerPrintIdPool.push(parseInt(idToBeDeleted));

      settings.set("fingerPrintIdPool", fingerPrintIdPool);

      settings.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          $scope.userTableResult = [];
          getSettings();
          socket.emit('toPublicServer', 'm:delete');

        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
        }
      });
    } else {
      $scope.isCurrentFingerDeleted = true;
      $scope.scanStatus = 'Click to Continue';
      $scope.buttonScanStatus = 'btn-success';
    }
  }

  $scope.updateFingerPrintGo = function(){
    console.log('Update Scan Finger');
    socket.emit('toPublicServer', 'm:enroll');
  }

  socket.on('fromPublicServer', function(data){
    console.log(data);

    var tmp = fingerPrintIdPool[0];

    if(stringContains(data, 'rfid:')){
      processRFID(data);
    }

    if(stringContains(data, 'm:enroll')){
      console.log(tmp);
      socket.emit('toPublicServer', tmp.toString());
    }

    if(stringContains(data, 'm:delete')){
      console.log(tmp);
      socket.emit('toPublicServer', idToBeDeleted.toString());
    }

    if(stringContains(data, 'Deleted!')){
      $scope.isCurrentFingerDeleted = true;
      socket.emit('toPublicServer', idToBeDeleted.toString());
      $scope.scanStatus = 'Click to Continue';
      $scope.buttonScanStatus = 'btn-success';
    }

    if(stringContains(data, 'command:place.finger.1')){
      $scope.scanStatus = 'Please Place Finger';
      $scope.buttonScanStatus = 'btn-warning';
    }

    if(stringContains(data, 'command:remove.finger')){
      $scope.scanStatus = 'Please Remove Finger';
    }

    if(stringContains(data, 'command:place.finger.2')){
      $scope.scanStatus = 'Place Same Finger Again';
    }

    if(stringContains(data, 'Ok.status:prints.matched.success')){
      $scope.scanStatus = 'Prints Matched';
    }

    if(stringContains(data, 'Ok.status:print')){
      console.log('print stored');
      $scope.buttonScanStatus = 'btn-success';
      $scope.scanStatus = 'Print Successfully Stored!';
    }

    if(stringContains(data, 'status.prints.matched.failed')){
      $scope.buttonScanStatus = 'btn-danger';
      $scope.scanStatus = 'Prints Not Matched.';
      alert('Prints Not Matched. Please Try Again.');
      socket.emit('toPublicServer', tmp.toString());
    }

    if(stringContains(data, 'found:')){
      console.log(tmp);
      var tmpData = data;
      tmpData = tmpData.split(":");
      $scope.isDetectedFingerPrint = true;
      $scope.detectedFingerPrintId = tmpData[1].toString();
    }
  });

  $scope.pairRFID = function(){
    employeeService.getEmployeeByRFID($scope.detectedRFID)
    .then(function(results) {
      if(results.length === 0){
        $scope.user.rfId = $scope.detectedRFID;
        $scope.rfidButtonScanStatus = 'btn-success';
        $scope.rfidScanStatus = 'RFID Pairing Successful'
        $scope.isRFIDDouble = false;
      }else{
        $scope.rfidDetectStatus = 'RFID already used, Please try other RFID.'
        $scope.isRFIDDetected = false;
        $scope.detectedRFID = null;
        $scope.isRFIDDouble = true;
      }
    }, function(err) {
      // Error occurred
      console.log(err);
    });
  }

  $scope.unpairRFID = function(){
    $scope.user.rfId = '';
    $scope.detectedRFID = '';
  }

  $scope.activateDeleteLogsByUser = function(){
    $scope.isDeleteLogsByUser = true;
  }

  $scope.deleteLogsByUser = function(){
    $scope.isConfirmDeleteLogsByUser = true;
  }

  $scope.confirmDeleteLogsByUser = function(){
    if($scope.secondaryPassword === $scope.confirmSecondaryPassword){

      settingsService.backup('export')
      .then(function(results) {
        var PeriodLogObject = Parse.Object.extend("PeriodLog");
        var queryPeriod = new Parse.Query(PeriodLogObject);
        var monthTo = monthNames.indexOf($scope.selectedDateTo.month);
        monthTo = monthNames[monthTo + 1];

        var yearTo = $scope.selectedDateTo.year;
        
        if(monthTo === undefined){
          monthTo = 'January';
          yearTo = yearTo + 1;
        }

        var min = new Date($scope.selectedDateFrom.month + ' ' + $scope.selectedDateFrom.year);
        var max = new Date(monthTo + ' ' + yearTo);

        queryPeriod.limit(100000);
        queryPeriod.equalTo("employeeId", currentEmployee.id);
        queryPeriod.greaterThanOrEqualTo('periodDate', min);
        queryPeriod.lessThan('periodDate', max);

        queryPeriod.find().then(function (log) {
          var logCount = log.length;
          var cnt = 0;

          if(logCount === 0){
            alert('Current Employee have no logs to delete. Please close this pop-up window');
          }

          log.forEach(function(log) {                  
            log.destroy({
              success: function() {
                // SUCCESS CODE HERE, IF YOU WANT
                cnt = cnt + 1;             
                if(cnt === (logCount - 1)){
                  alert('User Logs have been deleted. Please close this pop-up window');
                }               
              },
              error: function() {
                // ERROR CODE HERE, IF YOU WANT
                console.log('period log error delete');
              }
            });         
          });
        }, function (error) {
          response.error(error);
        });
      }, function(err) {
        // Error occurred
        console.log(err);
        alert('Something went wrong with the backup process');
      }, function(percentComplete) {
        console.log(percentComplete);
      }); 
    }else{
      $scope.isSecondaryPasswordInvalid = true;
    }
   
  }

  $scope.cancelDeleteLogsByUser = function(){
    $scope.isConfirmDeleteLogsByUser = false;
    $scope.isDeleteLogsByUser = false;
    $scope.isSecondaryPasswordInvalid = false;
    $scope.isSecondaryPasswordValid = false;
  }

  function processRFID(data){
    console.log(data);
    var tmp = data.split(':');
    $scope.detectedRFID = tmp[1];
    $scope.isRFIDDetected = true;
    $scope.rfidButtonScanStatus = 'btn-warning';
    $scope.rfidScanStatus = null
    $scope.rfidDetectStatus = null;
  }

  $scope.closeModal = function(){
    console.log('Close Modal');
    socket.emit('toPublicServer', 'x');
  }

  $scope.$on("$destroy", function(){
    socket.removeAllListeners("fromPublicServer");
  });

  function stringContains(data, compare){
    return data.indexOf(compare) > -1;
  }

  function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
      what = a[--L];
      while ((ax= arr.indexOf(what)) !== -1) {
        arr.splice(ax, 1);
      }
    }
    return arr;
  }

}]);
