'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('PublicCtrl', function($scope, socket, dailyLogService, settingsService, $state, editReportRequests, $window) {

    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    $scope.displayedCollection = [
      {'attributes':{'firstName':'Vince', 'lastName': 'Elizaga', 'position':'Teacher', 'time':'7:43 AM'}},
      {'attributes':{'firstName':'Vince', 'lastName': 'Elizaga', 'position':'Teacher', 'time':'7:43 AM'}},
      {'attributes':{'firstName':'Vince', 'lastName': 'Elizaga', 'position':'Teacher', 'time':'7:43 AM'}},
      {'attributes':{'firstName':'Vince', 'lastName': 'Elizaga', 'position':'Teacher', 'time':'7:43 AM'}},
      {'attributes':{'firstName':'Vince', 'lastName': 'Elizaga', 'position':'Teacher', 'time':'7:43 AM'}},
      {'attributes':{'firstName':'Vince', 'lastName': 'Elizaga', 'position':'Teacher', 'time':'7:43 AM'}}
    ];

    $scope.detectedEmployee = {
      'firstName' : '',
      'lastName' : '',
      'position' : '',
      'age' : '',
      'avatar' : '"img/logo/logo_placeholder.png";'
    }

    $scope.logoStyle = {};
    $scope.clockColor = {};
    $scope.clockStyle = {
      outer : {
        'color' : 'white',
      }                    
    }

    $scope.isAlarmAM = false;
    $scope.isAlarmPM = false;

    $scope.editReportRequests = [];
    var isCutOffTime = false;
    var userLoginterval = 60;

    $scope.isFingerPrintDetected = false;
    $scope.isPublicTable = true;
    $scope.isFlashDriveEmpty = true;
    $scope.pmIdentifier = 'Afternoon Log';
    $scope.windowWidth = window.width;

    startTime();

    getSettings();

    getEditReportRequests();

    getMedia();

    detectScreenSize();

    function detectScreenSize() {
      if($scope.windowWidth <= 1024) {
        $scope.logoStyle = {
          primaryPhoto : {
            height : '100px'
          },
          secondaryPhoto : {
            height : '100px'
          }
        };

        $scope.clockStyle = {
          inner : {
            'font-size': '60px'
          },
          outer : {
            'color' : 'white',
            'font-size' : '1em'
          }                    
        }

        $scope.dateStyle = {
          inner : {
            'font-size': '30px'
          }          
        }

        $scope.logListStyle = {
          logFont : {
            'font-size' : '14px'
          }
        }

        $scope.iconStyle = {
          flash : {
            'font-size' : '30px'
          }
        }        
      }
    }

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

    function getMedia(){
      settingsService.getMedia()
      .then(function(results) {
        if(results.status === 200){
          $scope.isFlashDriveEmpty = false;
        }else{
          alert('Backup System: Flash-drive not found!');
        }
      }, function(err) {
        // Error occurred
        alert('Backup System: Flash-drive not found!');
        console.log(err);
      });
    }

    $scope.redirectToLogin = function(){
      $state.go('login');
    }

    $scope.extraLogCheck = function(time){
      if(stringContains(time, 'Extra')){
        return 'log-bold';
      }else{
        return '';
      }
    }

    function getSettings(){
      settingsService.getSetting()
      .then(function(results) {
        // Handle the result
        if(results[0].get('firstBoot')){
          $state.go('guide');
        }

        else{
          $scope.settings = results[0];
          userLoginterval = $scope.settings.get('userLogInterval') || 60;
          $scope.primaryPhoto = $scope.settings.get('primaryPhoto');
          $scope.secondaryPhoto = $scope.settings.get('secondaryPhoto');
          isCutOffTime = $scope.settings.get('isCutOffTime');
          $scope.cutoffTime = $scope.settings.get('cutoffTime');
          $scope.coverImage = {
            "background-image": "url(" + $scope.settings.get('coverImage') + ")",
            "height" : $window.screen.height + 'px'
          };
          var colorThemes = $scope.settings.get('colorThemes');

          $scope.clockColor = {
            background: {'background-color': colorThemes.clockBackground},
            text: {color: colorThemes.clockText}
          }

          $scope.clockStyle.outer.color = colorThemes.clockText;
          $scope.enableAlarm = $scope.settings.get('enableAlarm') || false;

          checkAlarm($scope.settings.get('alarmBuzzer') || []);
        }
        getAll();
      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
      });
    };

    function checkAlarm(list) {
        angular.forEach(list, function(value, key) {
          console.log(value);
          if(value.hour >= 12) {
            $scope.isAlarmPM = true;
          }

          if(value.hour < 12) {
            $scope.isAlarmAM = true;
          }
        });      
    }

    function getAll(){
      console.log('get All!');
      $scope.displayedCollectionAM = [];
      $scope.displayedCollectionPM = [];

      dailyLogService.getDailyLogs(true)
      .then(function(results) {
        angular.forEach(results, function(value, key) {
          var tmp = value.get('time');
          tmp = tmp.split(' ');

          var isPm = stringContains(tmp[1], 'PM');

          tmp = tmp[0];

          tmp = tmp.split(':');

          var h = parseInt(tmp[0]);
          var m = parseInt(tmp[1]);

          if(isPm){
            h = h + 12;
          } else {
            if(h === 12){
              h = 0;
            }
          }

          var timeInDecimals = h + m/100;

          if(value.get('isCrossDate')){
            var x = formatCrossDateTime(value.get('time'));
            value.set('time', x);

            var timeInDecCrossDate = x.split(' ');
            timeInDecCrossDate = timeInDecCrossDate[0];
            timeInDecCrossDate = parseInt(timeInDecCrossDate);

            if(timeInDecCrossDate >= 1200){
              $scope.displayedCollectionPM.push(value);
            }
            else{
              $scope.displayedCollectionAM.push(value);
            }

          }else{
            var cutOffTimeToBeUsed = 12;

            if(isCutOffTime){
              cutOffTimeToBeUsed = $scope.cutoffTime
            }

            if(timeInDecimals >= cutOffTimeToBeUsed){
              $scope.displayedCollectionPM.push(value);
            }
            else{
              $scope.displayedCollectionAM.push(value);
            }
          }

        });

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
      });
    };

    function formatCrossDateTime(data){
      // 4:41:13 PM- Log-In
      var tmp = data;
      tmp = tmp.split('-');

      var logType = tmp[1] + '-' + (tmp[2] || '');

      tmp = tmp[0];

      var time = tmp;

      if(stringContains(time, 'M')){
        var hours = Number(time.match(/^(\d+)/)[1]);
        var minutes = Number(time.match(/:(\d+)/)[1]);
        var AMPM = time.match(/\s(.*)$/)[1];
        if(AMPM == "PM" && hours<12) hours = hours+12;
        if(AMPM == "AM" && hours==12) hours = hours-12;
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if(hours<10) sHours = "0" + sHours;
        if(minutes<10) sMinutes = "0" + sMinutes;
        tmp = sHours + '' + sMinutes;
      }

      return tmp + ' -' + (logType || '');
    }

    function startTime() {
      var today = new Date();
      var day = today.getDay();
      var dateDay = today.getDate();
      var month = today.getMonth();
      var year = today.getFullYear();

      var h = today.getHours();

      var period = 'PM';

      if(h < 12){
        period = 'AM';
      }

      if(h >= 18){
        $scope.pmIdentifier = 'Evening Log';
      }else{
        $scope.pmIdentifier = 'Afternoon Log';
      }

      var m = today.getMinutes();
      var s = today.getSeconds();
      h = checkAMPM(h);
      m = checkTime(m);
      s = checkTime(s);

      $scope.time = h + ":" + m + ":" + s + ' ' + period;
      $scope.currentDate = dayNames[day] + ', ' + monthNames[month] + ' ' + dateDay + ', ' + year;
      $scope.$apply();

      var t = setTimeout(startTime, 1000);

    }

    function checkTime(i) {
      if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
    }

    function checkAMPM(h) {
      var tmp;
      if(h > 12){
        h = h - 12;
      }

      if(h === 0){
        h = 12;
      }
      return h;
    }

    function stringContains(data, compare){
      return data.indexOf(compare) > -1;
    }

    function parseCrossDateTime(data){
      var tmp = data;
      tmp = tmp.split(' ');
      tmp = tmp[0];
      tmp = tmp.split('h');
      tmp = tmp[0];

      return tmp;
    }

    socket.on('notificationsFromServer', function(data){
      console.log(data);
      // getEditReportRequests();
      if(stringContains(data, 'request-empty')){
        console.log('im empty here');
        $scope.showNotifcations = false;
      }else if(stringContains(data, 'log-interval')){
        $scope.isUserInterval = true;
        $scope.timeLeft = data.split(':');
        $scope.timeLeft = userLoginterval - parseInt($scope.timeLeft[1]);
        setTimeout(function(){
          $scope.isUserInterval = false
        },1500);

        $scope.showNotifcations = false;
      }
      else{
        $scope.showNotifcations = true;
      }
    });

    socket.on('fromPublicServer', function(data){
      if(typeof data === 'object'){

        if(data.departArrive){
          $scope.detectedEmployee = {
            'firstName' : data.firstName,
            'lastName' : data.lastName,
            'position' : data.position,
            'avatar' : data.avatarUrl,
            'time' : $scope.time,
            'arrivalAM' : data.departArrive.arrivalAM,
            'departureAM' : data.departArrive.departureAM,
            'arrivalPM' : data.departArrive.arrivalPM,
            'departurePM' : data.departArrive.departurePM
          }
        }else{
          $scope.detectedEmployee = {
            'firstName' : data.firstName,
            'lastName' : data.lastName,
            'position' : data.position,
            'avatar' : data.avatarUrl,
            'time' : $scope.time,
            'loginDate' : parseCrossDateTime(data.currentPeriodLog.loginDate),
            'logoutDate' : parseCrossDateTime(data.currentPeriodLog.logoutDate),
          }
        }

        $scope.isFingerPrintDetected = true;
        getAll();
        setTimeout(function(){
          $scope.isFingerPrintDetected = false;
        },3500);
      }
    });

    $scope.$on("$destroy", function(){
      socket.removeAllListeners("fromPublicServer");
    });
  });
