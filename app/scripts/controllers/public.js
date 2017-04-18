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

    var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    $scope.displayedCollection = [{'attributes':{'firstName':'Vince', 'lastName': 'Elizaga', 'gender':'Male'}, 'time':'7:43 AM'},
      {'attributes':{'firstName':'Vince', 'lastName': 'Elizaga', 'gender':'Male'}, 'time':'7:43 AM'},
      {'attributes':{'firstName':'Vince', 'lastName': 'Elizaga', 'gender':'Male'}, 'time':'7:43 AM'},
      {'attributes':{'firstName':'Vince', 'lastName': 'Elizaga', 'gender':'Male'}, 'time':'7:43 AM'}
    ];

    $scope.detectedEmployee = {
      'firstName' : '',
      'lastName' : '',
      'position' : '',
      'age' : '',
      'avatar' : '"img/logo/logo_placeholder.png";'
    }

    var userLoginterval = 60;

    $scope.isFingerPrintDetected = false;
    $scope.isPublicTable = true;
    $scope.isFlashDriveEmpty = true;
    $scope.pmIdentifier = 'Afternoon Log';

    startTime();

    getSettings();

    getEditReportRequests();

    getMedia();

    function getEditReportRequests(){
      editReportRequests.getAll()
      .then(function(results) {
        // Handle the result
        $scope.editReportRequests = results;
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

        }
        getAll();
      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
      });
    };

    function getAll(){
      console.log('get All!');
      $scope.displayedCollectionAM = [];
      $scope.displayedCollectionPM = [];

      dailyLogService.getDailyLogs(true)
      .then(function(results) {
        // Handle the result
        var morning = [];
        var afternoon = [];

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

          // if(value.get('isCrossDate')){
          //   var x = formatCrossDateTime(value.get('time'));
          //   value.set('time', x);
          // }

          if(timeInDecimals >= $scope.cutoffTime){
            afternoon.push(value);
          }
          else{
            morning.push(value);
          }
        });

        $scope.displayedCollectionAM = morning;
        $scope.displayedCollectionPM = afternoon;

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
      tmp = tmp.split(':');
      tmp = tmp[0] + tmp[1];

      return tmp;
    }

    socket.on('notificationsFromServer', function(data){
      getEditReportRequests();
      if(stringContains(data, 'request-empty')){
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
