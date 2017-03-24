app.service('editReportRequests', function($q) {
	var getAll = function(min, max){
		var defer = $q.defer();
		var EditReportRequests = Parse.Object.extend("EditReportRequests");
		var query = new Parse.Query(EditReportRequests);

		query.descending('createdAt');

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


	return {
		getAll: getAll
	};

});
