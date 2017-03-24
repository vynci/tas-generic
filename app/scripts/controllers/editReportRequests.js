'use strict';
/**
* @ngdoc function
* @name sbAdminApp.controller:MainCtrl
* @description
* # MainCtrl
* Controller of the sbAdminApp
*/
angular.module('sbAdminApp')
.controller('EditReportsCtrl', function($scope,$position, socket, employeeService, dailyLogService, periodLogService, settingsService, $state, holidayService, lodash, $timeout, editReportRequests) {
	console.log('Edit Report Logs!');

	$scope.isAuthenticated = false;
	$scope.currentUser = {
		password : ''
	};

	var currentUser = Parse.User.current();
	if(!currentUser){
		$state.go('login');
	}

	var settingId = currentUser.get('settingId');

	getAll();

	getSettings();

	function getSettings(){
		settingsService.getSetting(settingId)
		.then(function(results) {
			// Handle the result
			$scope.settings = results[0];
			$scope.secondaryPassword = $scope.settings.get('secondaryPassword');

			$scope.isSecondaryPassword = $scope.settings.get('isSecondaryPassword');

		}, function(err) {
			// Error occurred
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	};

	function getAll(){
		editReportRequests.getAll()
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

	$scope.login = function(){
		if($scope.currentUser.password === $scope.secondaryPassword){
			$scope.isAuthenticated = true;
		} else{
			alert('Invalid Password! Please contact admin for assistance.');
			$scope.isAuthenticated = false;
		}

	}

	$scope.confirmAction = function(action, requestLog){
		$scope.confirmType = action;
		$scope.currentRequest = requestLog;
		console.log($scope.currentRequest.attributes);
	}

	$scope.requestTypeColor = {
		Delete : 'red',
		Update : 'orange',
		New : 'green'
	}

	$scope.requestAction = function(){
		console.log($scope.confirmType);
		if($scope.confirmType === 'accept'){
			var PeriodLog = Parse.Object.extend("PeriodLog");
			var periodLog = new PeriodLog();

			if($scope.currentRequest.get('periodLogId')){
				periodLog.id = $scope.currentRequest.get('periodLogId');
			}else{
				periodLog.set('periodDate', $scope.currentRequest.get('periodDate'));
				periodLog.set('employeeId', $scope.currentRequest.get('employeeId'));
				periodLog.set('name', $scope.currentRequest.get('employeeName'));
			}

			periodLog.set("arrivalAM", $scope.currentRequest.get('arrivalAM'));
			periodLog.set("arrivalPM", $scope.currentRequest.get('arrivalPM'));
			periodLog.set("departureAM", $scope.currentRequest.get('departureAM'));
			periodLog.set("departurePM", $scope.currentRequest.get('departurePM'));
			periodLog.set("extraLogPool", $scope.currentRequest.get('extraLogPool'));
			periodLog.set("totalTime", $scope.currentRequest.get('totalTime'));

			if($scope.currentRequest.get('requestType') === 'Delete'){
				periodLog.destroy({
					success : function(){
						$scope.currentRequest.destroy({
							success : function(){
								getAll();
							},
							error : function(){
							}
						});
					},
					error : function(){
					}
				});
			} else{
				periodLog.save(null, {
					success: function(result) {
						// Execute any logic that should take place after the object is saved.
						$scope.currentRequest.destroy({
							success : function(){
								getAll();
							},
							error : function(){
							}
						});
					},
					error: function(gameScore, error) {
						console.log(error);
						alert('This log has already been deleted or does not anymore exist. Please click on "Reject" button to clear this current request.');
					}
				});
			}
		}else{
			$scope.currentRequest.destroy({
				success : function(){
					getAll();
				},
				error : function(){
				}
			});
		}

	}

	$scope.convertDate = function(date){
		//
		date = new Date(date);
		date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

		var tmp = date.toString();
		tmp = tmp.split(' ');

		return tmp[0] + ' ' + tmp[1] + ' ' + tmp[2] + ' ' + tmp[3];
	}

});
