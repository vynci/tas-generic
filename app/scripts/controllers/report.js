'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('ReportCtrl', function($scope,$position, socket, employeeService, dailyLogService, periodLogService, settingsService, $state, holidayService, lodash, $timeout, $q) {

    var currentUser = Parse.User.current();
    if(!currentUser){
      $state.go('login');
    }

    var settingId = currentUser.get('settingId');

    var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    var dateNow = new Date();

    $scope.filterObjectList = function(userInput) {
      var filter = $q.defer();
      var normalisedInput = userInput.toLowerCase();

      var filteredArray = $scope.sortLists.filter(function(employee) {
        var employeeName = employee.readableName.toLowerCase().indexOf(normalisedInput) === 0;
        return employeeName;
      });

      filter.resolve(filteredArray);
      return filter.promise;
    };

    $scope.totalUnderTimeList = {};

    $scope.mothSelectNames = monthNames;

    $scope.selectedDate = {
      year : dateNow.getFullYear(),
      month : monthNames[dateNow.getMonth()]
    };

    $scope.fromSelectedDate = {
      day : 1,
      year : dateNow.getFullYear(),
      month : monthNames[dateNow.getMonth()]
    }

    console.log($scope.fromSelectedDate);

    $scope.toSelectedDate = {
      day : 1,
      year : dateNow.getFullYear(),
      month : monthNames[dateNow.getMonth()]
    }

    console.log($scope.toSelectedDate);

    $scope.Math = window.Math;
    $scope.tmpId = false;
    $scope.displayedCollection = [];
    $scope.sortLists = [];
    $scope.totalTime = 0;
    $scope.totalTimeMins = 0;
    $scope.reportMonth = '';
    $scope.regularDays = 0;

    $scope.batchReportList = [];

    $scope.hideEditModal = false;

    var dateRange = {
      min : '',
      max : ''
    }

    $scope.employeeInfo = {
      'name' : ''
    };

    $scope.parseMinutes = function(value){
      var minutes = value.toString();

      if(minutes.length > 1){
        minutes = minutes
      }else{
        minutes = "0" + minutes;
      }

      return minutes;
    };

    $scope.checkInCharge = function(inChargeName, employeeName){
      var inCharge = inChargeName;
      

      if(inCharge.toLowerCase() === employeeName.toLowerCase()){
        inCharge = $scope.secondaryInCharge;
      }

      return inCharge;
    }

    $scope.checkWeekend = function(day, month, year, currentLog){
      var result = currentLog;      
      var dateNow = new Date(month + ' ' + day + ' ' + year);

      if(currentLog === '-' || currentLog === undefined || currentLog === ''){
        if(dateNow.getDay() === 6) {
          result = 'Saturday';
          if($scope.selectedDate.month === 'February') {
            if(day > 29) {
              result = '-';
            }
          }
        }else if(dateNow.getDay() === 0){
          result = 'Sunday';
        }

        $scope.currentHolidays.forEach(function(data){
          var startDate = data.get('startTime');
          startDate = startDate.getDate();

          if(day === startDate){
            result =  'holiday';
          }
        });        
      }

      return result;
    };

    $scope.checkWeekendStyle = function(day, month, year, currentLog){
      var result = '';      
      var dateNow = new Date(month + ' ' + day + ' ' + year);

      if(currentLog !== '-'){
        if(dateNow.getDay() === 6 || dateNow.getDay() === 0){
          result =  'weekend-indicator';
        }
      }

      $scope.currentHolidays.forEach(function(data){
        var startDate = data.get('startTime');
        startDate = startDate.getDate();

        if(day === startDate){
          result =  'weekend-indicator';
        }

      });

      return result;
    };

    $scope.calcUnderTimeHours = function(hour){

      var tmp = hour / 60;
      var remainder = hour % 60;


      tmp = Math.floor(tmp);

      if(remainder === 0){
        tmp = 8 - tmp;
      } else {
        tmp = 7 - tmp;
      }

      if(tmp < 0){
        tmp = 0;
      }

      if(hour === undefined){
          tmp = '-';
      }

      return tmp;
    }

    $scope.calcUnderTimeMins = function(min){
      var tmp = min % 60;

      if(tmp !== 0){
        tmp = 60 - tmp;
      }

      if(min === undefined){
        tmp = '-';
      }

      return tmp;
    }

    $scope.calcTotalTime = function(data){
      var totalTime = 0;

      angular.forEach(data, function(value, key) {
        if(value.attributes.totalTime){
          $scope.totalTime = $scope.totalTime + (parseInt(value.attributes.totalTime) / 60);
          $scope.totalTimeMins = $scope.totalTimeMins + (parseInt(value.attributes.totalTime) % 60);
        }

      });
    }

    $scope.calcRowUndertime = function(row, regularTime, type, index){
      var result = '-';

      if((row.arrivalAM && row.arrivalAM !== '-') || (row.arrivalPM && row.arrivalPM !== '-')) {
        var arrivalAM = row.arrivalAM;
        var arrivalPM = row.arrivalPM;
        var regularMorningTimeOut = regularTime.morningTimeOut;
        var regularAfternoonTimeOut = regularTime.afternoonTimeOut;
        
        var timeStart = new Date("01/01/2007 " + arrivalAM);
        var timeEnd = new Date("01/01/2007 " + regularMorningTimeOut.hours + ':' + regularMorningTimeOut.minutes);
        var timePreEnd = new Date("01/01/2007 " + row.departureAM);
        var timeDiff = timeEnd - timeStart;

        var timeStartB = new Date("01/01/2007 " + arrivalPM);
        var timeEndB = new Date("01/01/2007 " + regularAfternoonTimeOut.hours + ':' + regularAfternoonTimeOut.minutes);
        var timePreEndB = new Date("01/01/2007 " + row.departurePM);
        var timeDiffB = timeEndB - timeStartB;

        if(timePreEnd < timeEnd) {
          timeDiff = timePreEnd - timeStart;
        }
        if(timePreEndB < timeEndB) {
          timeDiffB = timePreEndB - timeStartB;
        }

        timeDiffB = 240 - (timeDiffB / 60000) 
        timeDiff = 240 - (timeDiff / 60000);

        timeDiff = timeDiff + timeDiffB;

        if(timeDiff < 0) {
          timeDiff = 0;
        }

        var timeDiffHours = Math.floor(timeDiff / 60);
        var timeDiffMinutes = timeDiff % 60;

        if(type === 'hour') {
          result = timeDiffHours.toString();
          if(result.length === 1) {
            result = '0' + result;
          }
        } else {
          result = timeDiffMinutes.toString();
          if(result.length === 1) {
            result = '0' + result;
          }
        }
      }

      return result;
    }

    $scope.calcRowTotalHours = function(minutes){
      var sign ='';
      if(minutes < 0){
        sign = '-';
      }

      var hours = Math.floor(Math.abs(minutes) / 60);

      if(minutes === undefined || minutes === null){
        hours = '-'
      }

      if($scope.isShowTotalTime === false){
        if(minutes === undefined || minutes === null){
          hours = '-';
        }else{
          hours = '';
        }
      }

      return hours;
    }

    $scope.calcRowTotalMins = function(minutes){
      var sign = '';
      if(minutes < 0){
        sign = '-';
      }

      var minute = Math.abs(minutes) % 60;

      if(minutes === undefined || minutes === null){
        minute = '-';
      }

      if($scope.isShowTotalTime === false){
        if(minutes === undefined || minutes === null){
          minute = '-';
        }else{
          minute = '';
        }

      }

      return minute;
    }

    function generateReportTemplate(employeeId, date, employeeName, isCrossDate){
      var arr = [];
      var endDay = 31;

      for(var i=0; i<endDay; i++ ){
        var blankEntry = {
          attributes : {
            date : {
              day : i + 1,
              month : monthNames[date.getMonth()],
              year : date.getFullYear()
            },
            employeeName : employeeName,
            employeeId : employeeId,
            arrivalAM : '-',
            arrivalPM : '-',
            departureAM : '-',
            departurePM : '-',
            loginDate : '-',
            logoutDate : '-',
            isCrossDate : isCrossDate
          }
        };
        arr.push(blankEntry);
      }

      return arr;
    }


    function minutesToHours(minutes) {
      var sign ='';
      if(minutes < 0){
        sign = '-';
      }

      var hours = Math.floor(Math.abs(minutes) / 60);
      var minutes = Math.abs(minutes) % 60;

      return {
        hours : parseInt(hours),
        minutes: parseInt(minutes)
      };
    }

    $scope.parseTotalInPrint = function(data){
      var tmp = Math.floor(data.hours) + ' hrs ' + data.mins + ' mins';

      if(!$scope.isShowTotalTime){
        tmp = '';
      }

      return tmp;

    }

    $scope.changeDate = function(data){
      dateRange.min = $scope.dates.minDate.toDate();
      dateRange.max = $scope.dates.maxDate.toDate();

      $scope.reportMonth = monthNames[dateRange.min.getMonth()];

    }

    $scope.dates = {
      today: moment.tz('UTC').hour(12).startOf('h'), //12:00 UTC, today.
      minDate: moment.tz('UTC').add(0, 'd').hour(12).startOf('h'), //12:00 UTC, four days ago.
      maxDate: moment.tz('UTC').add(15, 'd').hour(12).startOf('h'), //12:00 UTC, in four days.
    };
    dateRange.min = $scope.dates.minDate.toDate();
    dateRange.max = $scope.dates.maxDate.toDate();

    $scope.changedValue=function(item){
      console.log(item);
      if(item !== null){
        $scope.tmpId = item.id;
        $scope.employeeInfo.name = item.name;
        $scope.employeeInfo.employeeId = item.employeeId;
        $scope.employeeInfo.regularTime = item.regularTime;
        $scope.employeeInfo.userRegularDays = item.userRegularDays;
        $scope.employeeInfo.saturdays = item.saturdays;
      }
      else{
        $scope.tmpId = false;
      }

    }

    $scope.changeDateEvent = function(data){
      console.log(data);
    }

    $scope.changeReportRow = function(data){
      if($scope.enableUndertime) {
        var dateNow = new Date();
        var selectedDate = new Date($scope.selectedDate.month + ' ' + $scope.selectedDate.year);

        $scope.hideEditModal = true;
        if($scope.enableUndertimeEdit) {
          $scope.hideEditModal = false;
        }

        if(dateNow.getMonth() > selectedDate.getMonth()) {
          $scope.hideEditModal = false;
        }
        if(dateNow.getFullYear() > selectedDate.getFullYear()) {
          $scope.hideEditModal = false;
        }
      }

      $scope.secondaryPasswordResponse = '';
      $scope.secondaryPasswordResponseClass = '';
      $scope.secondaryPasswordCredential = '************';

      if($scope.isSecondaryPassword){
        $scope.disableEdit = true;
      }else{
        $scope.disableEdit = false;
      }

      $scope.deleteConfirmation = false;
      $scope.showDeleteButton = true;
      $scope.currentPeriodLog = {
        id : data.id,
        employeeId : data.attributes.employeeId
      };
      if(data.id){
        console.log('existing!');
        console.log(data);
        if(data.className === 'Holiday'){
          console.log(data.attributes);
          $scope.showDeleteButton = false;
          var holidayDate = data.sortDate;
          var createdAt = new Date(monthNames[holidayDate.getMonth()] + ' ' + holidayDate.getDate() + ' ' + holidayDate.getFullYear());

          if(createdAt.getTimezoneOffset() !== 0){
            createdAt.setDate(createdAt.getDate() + 1);
          }          

          var PeriodLog = Parse.Object.extend("PeriodLog");
          var periodLog = new PeriodLog();
          periodLog.set('periodDate', createdAt);
          periodLog.set('employeeId', data.attributes.employeeId);
          periodLog.set('name', data.attributes.employeeName);
          $scope.editReportRow = periodLog;

          $scope.newReportData = {
            isValid : true,
            arrivalAM : '',
            arrivalPM : '',
            departureAM : '',
            departurePM : '',
            totalTime : minutesToHours(0),
            periodDate : periodLog.attributes.periodDate,
            employee : {
              id : data.attributes.employeeId,
              name : data.attributes.employeeName || data.attributes.name,
              isCrossDate : data.attributes.isCrossDate || false
            }
          }

          console.log($scope.newReportData);

        }else{
          $scope.editReportRow = data;
          $scope.newReportData = {
            isValid : true,
            periodLogId : $scope.editReportRow.id,
            arrivalAM : $scope.editReportRow.get('arrivalAM'),
            arrivalPM : $scope.editReportRow.get('arrivalPM'),
            departureAM : $scope.editReportRow.get('departureAM'),
            departurePM : $scope.editReportRow.get('departurePM'),
            loginDate : $scope.editReportRow.get('loginDate'),
            logoutDate : $scope.editReportRow.get('logoutDate'),
            totalTime : minutesToHours(parseInt($scope.editReportRow.get('totalTime')) || 0),
            extraLogPool : $scope.editReportRow.get('extraLogPool'),
            periodDate : data.attributes.periodDate,
            employee : {
              id : data.attributes.employeeId,
              name : data.attributes.employeeName || data.attributes.name,
              isCrossDate : data.attributes.isCrossDate || false
            }
          }
        }
      } else{
        $scope.showDeleteButton = false;
        var createdAt = new Date(data.attributes.date.month + ' ' + data.attributes.date.day + ' ' + data.attributes.date.year);

        if(createdAt.getTimezoneOffset() !== 0){
          createdAt.setDate(createdAt.getDate() + 1);
        }        

        var PeriodLog = Parse.Object.extend("PeriodLog");
        var periodLog = new PeriodLog();
        periodLog.set('periodDate', createdAt);
        periodLog.set('employeeId', data.attributes.employeeId);
        periodLog.set('name', data.attributes.employeeName);
        $scope.editReportRow = periodLog;

        $scope.newReportData = {
          periodDate : createdAt,
          employee : {
            id : data.attributes.employeeId,
            name : data.attributes.employeeName || data.attributes.name,
            isCrossDate : data.attributes.isCrossDate || false
          },
          isValid : true,
          arrivalAM : '',
          arrivalPM : '',
          departureAM : '',
          departurePM : '',
          loginDate : '',
          logoutDate : '',
          totalTime : minutesToHours(0)
        }
        console.log($scope.newReportData);
      }

    }

    $scope.updateReportRow = function(isRequest, isDelete){
      console.log($scope.newReportData);
      console.log($scope.newReportData.periodDate);
      if(isRequest){
        var EditReportRequests = Parse.Object.extend("EditReportRequests");
        var query = new EditReportRequests();

        var hours = $scope.newReportData.totalTime.hours * 60;
        var totalTime = hours + $scope.newReportData.totalTime.minutes;

        if($scope.newReportData.periodLogId){
          if(isDelete){
            query.set("requestType", 'Delete');
          }else{
            query.set("requestType", 'Update');
          }

        }else{
          query.set("requestType", 'New');
        }

        query.set("periodLogId", $scope.newReportData.periodLogId);
        query.set("periodDate", $scope.newReportData.periodDate);
        query.set("employeeId", $scope.newReportData.employee.id);
        query.set("employeeName", $scope.newReportData.employee.name);
        query.set("arrivalAM", $scope.newReportData.arrivalAM);
        query.set("arrivalPM", $scope.newReportData.arrivalPM);
        query.set("departureAM", $scope.newReportData.departureAM);
        query.set("departurePM", $scope.newReportData.departurePM);
        query.set("loginDate", $scope.newReportData.loginDate);
        query.set("logoutDate", $scope.newReportData.logoutDate);
        query.set("extraLogPool", $scope.newReportData.extraLogPool);
        query.set("totalTime", totalTime.toString());

        query.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            console.log(result);
            socket.emit('notifications', 'edit-request');
            $scope.generateLogs();

          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
          }
        });
      } else{
        var periodLog = $scope.editReportRow;
        console.log(periodLog.className);

        var hours = $scope.newReportData.totalTime.hours * 60;
        var totalTime = hours + $scope.newReportData.totalTime.minutes;

        periodLog.set("arrivalAM", $scope.newReportData.arrivalAM);
        periodLog.set("arrivalPM", $scope.newReportData.arrivalPM);
        periodLog.set("departureAM", $scope.newReportData.departureAM);
        periodLog.set("departurePM", $scope.newReportData.departurePM);
        periodLog.set("loginDate", $scope.newReportData.loginDate);
        periodLog.set("logoutDate", $scope.newReportData.logoutDate);
        periodLog.set("extraLogPool", $scope.newReportData.extraLogPool);

        periodLog.set("isCrossDate", $scope.newReportData.employee.isCrossDate);

        periodLog.set("totalTime", totalTime.toString());

        console.log(periodLog.attributes);

        periodLog.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            console.log(result);
            $scope.generateLogs();

          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
          }
        });
      }
    }

    $scope.removeExtraLogs = function(index, data){
      $scope.newReportData.extraLogPool.splice(index, 1);
    }

    $scope.authorizeSecondaryPassword = function(){
      if($scope.secondaryPasswordCredential === $scope.secondaryPassword){
        $scope.disableEdit = false;
        $scope.secondaryPasswordResponse = 'Secondary Password Authentication Successful.';
        $scope.secondaryPasswordResponseClass = 'alert-success';
      } else {
        $scope.disableEdit = true;
        $scope.secondaryPasswordResponseClass = 'alert-danger';
        $scope.secondaryPasswordResponse = 'Secondary Password Authentication Failed, Invalid Password.'
      }
    }

    getAllEmployees();

    function getAllEmployees(sort){
      employeeService.getEmployees(sort, 500)
      .then(function(results) {
        // Handle the result
        $scope.sortLists.push({
          id : 'all',
          name : 'All Employees',
          readableName : 'All Employees'
        });
        angular.forEach(results, function(value, key) {
          var tmp = {
            id : value.id,
            name : value.attributes.firstName + ' ' +value.attributes.lastName,
            readableName : value.attributes.firstName + ' ' +value.attributes.lastName,
            regularTime : value.attributes.regularTime,
            userRegularDays : value.attributes.userRegularDays,
            saturdays : value.attributes.saturdays,
            employeeId: value.attributes.employeeId,
            isCrossDate : value.get('isCrossDate')
          };
          $scope.sortLists.push(tmp);
        });

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };

    getSettings();

    function getSettings(){
      settingsService.getSetting(settingId)
      .then(function(results) {
        // Handle the result
        $scope.settings = results[0];

        $scope.inCharge = $scope.settings.get('inCharge');
        $scope.secondaryInCharge = $scope.settings.get('secondaryInCharge');
        $scope.isShowTotalTime = $scope.settings.get('isShowTotalTime');
        $scope.isShowWaterMark = $scope.settings.get('isShowWaterMark');
        $scope.enableUndertime = $scope.settings.get('enableUndertime');
        $scope.enableUndertimeEdit = $scope.settings.get('enableUndertimeEdit');
        $scope.enableDateRange = $scope.settings.get('enableDateRange');
        $scope.appLogo = $scope.settings.get('primaryPhoto');
        $scope.companyName = $scope.settings.get('companyName');
        $scope.companyNameSubtitle1 = $scope.settings.get('companyNameSubtitle1');
        $scope.companyNameSubtitle2 = $scope.settings.get('companyNameSubtitle2');
        $scope.isTwoLogsEnable = $scope.settings.get('isTwoLogsEnable');
        $scope.isDTRHeaderCustomizable = $scope.settings.get('isDTRHeaderCustomizable');

        $scope.disableEdit = false;
        $scope.secondaryPassword = $scope.settings.get('secondaryPassword');

        $scope.isSecondaryPassword = $scope.settings.get('isSecondaryPassword');

        if($scope.isSecondaryPassword){
          $scope.disableEdit = true;
        }

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };



    function getLogByUser(id, min, max, isPrintAll, employeeName, employeeId, isCrossDate, regularTime, userRegularDays, saturdays){
      periodLogService.getPeriodLogsByUser(id, min, max)
      .then(function(results) {
        // Handle the result
        var data = results;
        var regularDays = generateReportTemplate(id, min, employeeName, isCrossDate, regularTime, userRegularDays, saturdays);

        angular.forEach(data, function(value, key) {
          value.sortDate = value.get('periodDate');

          if(value.get('arrivalAM') && value.get('arrivalPM') && value.get('departureAM') && value.get('departurePM') ){
          } else {
            //alert('There is an erroneous log.');
          }

          var tmpDay = value.get('periodDate');

          tmpDay = new Date(tmpDay);
          tmpDay.setMinutes(tmpDay.getMinutes() + tmpDay.getTimezoneOffset());

          tmpDay = tmpDay.getDate();

          regularDays[tmpDay - 1] = value;
        });


        holidayService.getHoliday(min, max)
        .then(function(results) {
          $scope.totalTime = 0;
          $scope.totalTimeMins = 0;

          $scope.currentHolidays = results;

          $scope.regularDays = data.length

          angular.forEach(results, function(value, key) {
            value.set('arrivalAM', 'holiday');
            value.set('arrivalPM', 'holiday');
            value.set('departureAM', 'holiday');
            value.set('departurePM', 'holiday');
            value.set('totalTime', '480');
            value.set('employeeName', employeeName);
            value.set('employeeId', id);
            value.set('regularTime', regularTime);
            value.set('userRegularDays', userRegularDays);
            value.set('saturdays', saturdays);

            if(isCrossDate){
              value.set('loginDate', 'holiday');
              value.set('logoutDate', 'holiday');
              value.set('isCrossDate', true);
            }

            value.sortDate = value.get('startTime');

            var tmpDay = value.get('startTime');
            tmpDay = tmpDay.getDate();

            if(!regularDays[tmpDay - 1].id){
              regularDays[tmpDay - 1] = value;
            }

          });

          var totalTimeHours = 0;
          var totalTimeMins = 0;
          var tmpTotalTime = 0;

          angular.forEach(regularDays, function(value, key) {
            if(value.attributes.totalTime){
              tmpTotalTime = tmpTotalTime + parseInt(value.attributes.totalTime);
            }
          });

          totalTimeHours = minutesToHours(tmpTotalTime).hours;
          totalTimeMins = minutesToHours(tmpTotalTime).minutes;

          $scope.batchReportList.push({
            employeeId : employeeId,
            name : employeeName,
            dataLogs : regularDays,
            regularTime : regularTime,
            userRegularDays : userRegularDays,
            saturdays : saturdays,
            isCrossDate : isCrossDate || false,
            totalUnderTime : 0,
            totalUnderTimeObj : {
              hours : 0,
              minutes : 0
            },
            totalTime : {
              hours : totalTimeHours,
              mins : totalTimeMins
            }
          });

        }, function(err) {
          // Error occurred
          console.log(err);
        }, function(percentComplete) {

        });

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {

      });
    };

    $scope.itemObjectSelected = function(item) {
      if(item !== null){
        $scope.tmpId = item.id;
        $scope.employeeInfo.name = item.name;
        $scope.employeeInfo.employeeId = item.employeeId;
        $scope.employeeInfo.isCrossDate = item.isCrossDate;
        $scope.employeeInfo.regularTime = item.regularTime;
        $scope.employeeInfo.userRegularDays = item.userRegularDays;
        $scope.employeeInfo.saturdays = item.saturdays;
      }
      else{
        $scope.tmpId = false;
      }
    };

    $scope.generateLogs = function(){
      var min, max;

      if($scope.enableDateRange){
        var toSelectedDay = $scope.toSelectedDate.day + 1;

        min = new Date($scope.fromSelectedDate.month + " " + $scope.fromSelectedDate.day + " " + $scope.fromSelectedDate.year);
        max = new Date($scope.toSelectedDate.month + " " + toSelectedDay + " " + $scope.toSelectedDate.year);
      }
      else{
        var tmp = lodash.indexOf($scope.mothSelectNames, $scope.selectedDate.month);
        min = new Date($scope.selectedDate.month + " 1 " + $scope.selectedDate.year);
        max = new Date($scope.mothSelectNames[tmp + 1] + " 1 " + $scope.selectedDate.year);

        if($scope.selectedDate.month === 'December'){
          var tmpYear = $scope.selectedDate.year;
          tmpYear = parseInt(tmpYear);
          tmpYear = tmpYear + 1;

          max = new Date($scope.mothSelectNames[0] + " 1 " + tmpYear);
        }
      }

      $scope.batchReportList = [];

      if($scope.tmpId === 'all'){
        angular.forEach($scope.sortLists, function(value, key) {
          if(value.id !== 'all'){
            console.log(value);
            getLogByUser(value.id, min, max, true, value.name, value.employeeId, value.isCrossDate, value.regularTime, value.userRegularDays, value.saturdays);
          }
        });

      } else {
        console.log($scope.employeeInfo);
        getLogByUser($scope.tmpId, min, max, false, $scope.employeeInfo.name, $scope.employeeInfo.employeeId, $scope.employeeInfo.isCrossDate, $scope.employeeInfo.regularTime, $scope.employeeInfo.userRegularDays, $scope.employeeInfo.saturdays);
      }
    }

    $scope.confirmDelete = function(){
      $scope.deleteConfirmation = true;
    }

    $scope.cancelDelete = function(){
      $scope.deleteConfirmation = false;
    }

    $scope.deletePeriodLog = function(){
      var PeriodLog = Parse.Object.extend("PeriodLog");
      var periodLog = new PeriodLog();

      periodLog.id = $scope.currentPeriodLog.id;

      periodLog.destroy({
        success: function(myObject) {
          employeeService.getEmployee($scope.currentPeriodLog.employeeId)
          .then(function(result) {
            // Handle the result
            result[0].set("currentPeriodLog", {
              id: null,
              date: null,
              sequence: 0,
              totalTime : 0
            });

            result[0].save(null, {
              success: function(gameScore) {
                $scope.generateLogs();

              },
              error: function(gameScore, error) {
                // Execute any logic that should take place if the save fails.
                // error is a Parse.Error with an error code and message.
                alert('error deleting log');
              }
            });
          }, function(err) {
            // Error occurred
            alert('error deleting log');
          }, function(percentComplete) {
            console.log(percentComplete);
          });

        },
        error: function(myObject, error) {
          // The delete failed.
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    $scope.splitTime = function(time){
      var result = '-';

      if(time){
        if(time === '-' || time === 'holiday'){
          if(time === 'holiday'){
            result = 'holiday';
          }
        }else{
          result = time.split(' ');
          result = result[0];
        }
      }
      return result;
    }

    $scope.splitDate = function(date){
      var result = '-';

      if(date){
        if(date === '-' || date === 'holiday'){
          if(date === 'holiday'){
            result = 'holiday';
          }
        }else{
          result = date.split(' ');
          result = result[1];
        }
      }

      return result;
    }

    $scope.printDiv = function(divName) {

      var printContents = document.getElementById(divName).innerHTML;
      var popupWin = window.open('', '_blank', 'width=760,height=768');
      var watermark = '<div style="position:absolute; z-index:0; background:white; min-height:50%; min-width:50%; opacity:0.1;"><p id="bg-text" style="color:lightgrey; font-size:60px; transform:rotate(300deg); -webkit-transform:rotate(300deg); margin-bottom:30px;">{{companyName}}</p></div>';
      var test = '<div class="container"><div class="row"><div class="col-xs-6" style="padding-left:0px; padding-right:40px;">'+ printContents +'</div><div class="col-xs-6" style="padding-left:40px; padding-right:0px;">' + printContents + '</div></div></div>';
      popupWin.document.open();
      popupWin.document.write('<html><head><link href="bower_components/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet"><link rel="stylesheet" href="styles/main.css"><link rel="stylesheet" href="styles/sb-admin-2.css"></head><body onload="window.print()">'+ test +'</body></html>');

      popupWin.document.close();
    };
  });
