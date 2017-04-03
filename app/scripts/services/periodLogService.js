app.service('periodLogService', function($q) {


	var getPeriodLogsByUser = function(id, min, max) {
		var defer = $q.defer();
		var EmployeeObject = Parse.Object.extend("PeriodLog");
		var query = new Parse.Query(EmployeeObject);

		if(id){
			query.equalTo("employeeId", id);
		}

		if(min && max){
			query.greaterThanOrEqualTo('periodDate', min);
			query.lessThan('periodDate', max);
			query.ascending('periodDate');
		}
		else{
			query.descending('periodDate');
		}

		query.limit(1000);

		query.find({
			success: function(results) {
				defer.resolve(results);
			},
			error: function(error) {
				defer.reject(error);
				alert("Error: " + error.code + " " + error.message);
			}
		});
		return defer.promise;
	};

	var getAll = function(quantity, page) {
		var defer = $q.defer();
		var PeriodLog = Parse.Object.extend("PeriodLog");
		var query = new Parse.Query(PeriodLog);
		var displayLimit = 500;

		query.descending('periodDate');

		query.limit(displayLimit);
		query.skip(page * displayLimit);
		query.find({
			success: function(results) {
				defer.resolve(results);
			},
			error: function(error) {
				defer.reject(error);
				alert("Error: " + error.code + " " + error.message);
			}
		});
		return defer.promise;
	};

	var getNumberOfLogs = function(id, min, max) {
		var defer = $q.defer();
		var PeriodLog = Parse.Object.extend("PeriodLog");
		var query = new Parse.Query(PeriodLog);

		query.count({
			success: function(results) {
				defer.resolve(results);
			},
			error: function(error) {
				defer.reject(error);
				alert("Error: " + error.code + " " + error.message);
			}
		});
		return defer.promise;
	};

	return {
		getNumberOfLogs : getNumberOfLogs,
		getAll : getAll,
		getPeriodLogsByUser : getPeriodLogsByUser
	};

});
