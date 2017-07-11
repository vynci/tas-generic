'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('MainCtrl', function($scope,$position, socket, employeeService, $modalStack, dailyLogService, $state, settingsService, editReportRequests) {
    var currentUser = Parse.User.current();
    if(!currentUser){
      $state.go('login');
    }

    var settingId = currentUser.get('settingId');

    $scope.count = {
      'checkIn' : 0,
      'checkOut' : 0,
      'late' : 0,
      'newUsers' : 0
    }

    $scope.users = {
      late : [],
      newUsers: [],
      checkedIn : [],
      checkedOut : []
    }

    $scope.editReportRequests = [];

    $scope.isTimeColumnHide = false;

    function stringContains(data, compare){
      return data.indexOf(compare) > -1;
    }

    $scope.displayedCollection = [];



    getSettings();
    getEditReportRequests();

    function getSettings(){
      settingsService.getSetting(settingId)
      .then(function(results) {
        // Handle the result
        $scope.settings = results[0];

        $scope.lateTime = $scope.settings.get('lateTime');
        $scope.lateTimePM = $scope.settings.get('lateTimePM');

        var tmp = $scope.lateTime.split(':');
        $scope.lateTime = {
          hours : parseInt(tmp[0]),
          minutes : parseInt(tmp[1])
        }

        var tmp2 = $scope.lateTimePM.split(':');
        $scope.lateTimePM = {
          hours : parseInt(tmp2[0]),
          minutes : parseInt(tmp2[1])
        }
        getAll();

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };


    function getEditReportRequests(){
      editReportRequests.getAll()
      .then(function(results) {
        // Handle the result
        angular.forEach(results, function(value, key) {
          if(!value.get('isArchive')){
            $scope.editReportRequests.push(value);
          }
        });
      }, function(err) {
        // Error occurred
        console.log(err);
      });
    };

    function getAll(){

      $scope.count = {
        'checkIn' : 0,
        'checkOut' : 0,
        'late' : 0,
        'newUsers' : 0
      }

      $scope.users = {
        late : [],
        newUsers: [],
        checkedIn : [],
        checkedOut : []
      }

      dailyLogService.getDailyLogs(true)
      .then(function(results) {
        // Handle the result

        $scope.displayedCollection = results;

        angular.forEach(results, function(value, key) {

          var tmp = value.get('time');
          tmp = tmp.split(' ');
          var logType = tmp[2];
          var time = tmp[0];
          var meridian = tmp[1];
          meridian = meridian.split('-');

          meridian = meridian[0];

          if(meridian === 'AM' && logType === 'In'){

            var hours = time.split(':');
            var minutes = parseInt(hours[1]);
            hours = parseInt(hours[0]);

            if(hours >= $scope.lateTime.hours && hours){
              if(minutes > $scope.lateTime.minutes) {

                $scope.users.late.push(value);
                $scope.count.late++;
              }
            }
          }

          if(meridian === 'PM' && logType === 'In'){

            var hoursPM = time.split(':');
            var minutesPM = parseInt(hoursPM[1]);
            hoursPM = parseInt(hoursPM[0]);

            if(hoursPM === 12){
              hoursPM = 0;
            }

            if(hoursPM >= $scope.lateTimePM.hours && hoursPM){
              console.log('late PM! 1');
              if(minutesPM > $scope.lateTimePM.minutes) {
                console.log('late PM! 2');
                $scope.users.late.push(value);
                $scope.count.late++;
              }
            }
          }
        });
        getAllEmployees();

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };

    function getAllEmployees(sort){
      employeeService.getEmployees(sort, 500)
      .then(function(results) {
        // Handle the result
        $scope.count.newUsers = results.length;
        angular.forEach(results, function(value, key) {
          var tmp = value.attributes.isCheckedIn;
          value.set('idNumber', '000' + value.get('fingerPrintId'));
          value.set('isHide', true);

          if(tmp){
            $scope.count.checkIn++;
            $scope.users.checkedIn.push(value);
            console.log('check-in inc');
          } else{
            console.log('check-out inc');
            $scope.users.checkedOut.push(value);
            $scope.count.checkOut++;
          }
        });
      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };

    $scope.notifications = {
      newUsers : function(){
        $scope.modal = {
          title : 'New Users',
          body : []
        }
        $state.go('dashboard.chart');
      },
      checkIn : function(){
        $scope.modal = {
          title : 'Currently Checked-In',
          body : $scope.users.checkedIn
        }
        $scope.isTimeColumnHide = true;
      },
      checkout : function(){
        $scope.modal = {
          title : 'Currently Checked-Out',
          body : $scope.users.checkedOut
        }
        $scope.isTimeColumnHide = true;
      },
      lateUsers : function(){
        console.log($scope.users.late);
        $scope.modal = {
          title : 'Late Users',
          body : $scope.users.late
        }
        $scope.isTimeColumnHide = false;
      },

    }

    $scope.extraLogCheck = function(time){
      if(stringContains(time, 'Extra')){
        return 'log-bold';
      }else{
        return '';
      }
    }

    socket.on('fromPublicServer', function(data){
      //console.log(data);
      if(typeof data === 'object'){
        getAll();
      }
    });

    $scope.$on("$destroy", function(){
      socket.removeAllListeners("fromPublicServer");
    });
  });
