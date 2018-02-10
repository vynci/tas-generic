app.service('settingsService', function($q, $http) {


	var getSetting = function(id){
		var defer = $q.defer();
		var Settings = Parse.Object.extend("Settings");
		var query = new Parse.Query(Settings);

		if(id){
			query.equalTo("objectId", id);
		}

		query.find({
			success: function(results) {
				console.log(results);
				defer.resolve(results);
			},
			error: function(error) {
				defer.reject(error);
				alert("Error: " + error.code + " " + error.message);
			}
		});
		return defer.promise;
	};

	var getMedia = function(userId) {
		console.log('getMedia');
		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/media-usb")
		.success(function(data) {
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to Reboot");
		});
		return def.promise;
	}

	var updateSoftware = function(userId) {
		console.log('update Software');
		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/software-upgrade")
		.success(function(data) {
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to Reboot");
		});
		return def.promise;
	}

	var modifyDBSchema = function(className, field, type) {
		var def = $q.defer();

		var payload = {
			"className": className,
			"fields":{}
		}

		payload.fields[field] = {
			type : type
		};

		$http.put("http://172.24.1.1:1337/parse/schemas/" + className, payload)
		.success(function(data) {
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to modify schema");
		});
		return def.promise;
	}

	var reboot = function(userId) {
		console.log('rebooting');
		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/device/reboot")
		.success(function(data) {
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to Reboot");
		});
		return def.promise;
	}

	var powerOff = function(userId) {
		console.log('powering off');
		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/device/power-off")
		.success(function(data) {
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to Power Off");
		});
		return def.promise;
	}

	var adminPasswordReset = function(userId) {
		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/admin/reset-password")
		.success(function(data) {
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to reset password");
		});
		return def.promise;
	}

	var reformatFingerPrint = function(userId) {
		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/admin/reformat-fingerprint")
		.success(function(data) {
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to reset password");
		});
		return def.promise;
	}

	var updateWifiCredentials = function(data){

		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/wifi-settings/" + data.oldSSID + "/" + data.newSSID + "/" + data.oldPassword + "/" + data.newPassword)
		.success(function(data) {
			console.log(data);
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to Reboot");
		});
		return def.promise;
	}

	var updateSystemTime = function(data){

		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/system-time/" + data)
		.success(function(data) {
			console.log(data);
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to Set Time");
		});
		return def.promise;
	}

	var testAlarm = function(){

		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/test-alarm")
		.success(function(data) {
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to Set Time");
		});
		return def.promise;
	}	

	var backup = function(process){

		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/backup/" + process)
		.success(function(data) {
			console.log(data);
			def.resolve(data);
		})
		.error(function() {
			def.reject("backup process failed");
		});
		return def.promise;
	}

	return {
		getSetting: getSetting,
		reboot : reboot,
		updateWifiCredentials : updateWifiCredentials,
		updateSystemTime : updateSystemTime,
		backup : backup,
		adminPasswordReset : adminPasswordReset,
		powerOff : powerOff,
		reformatFingerPrint : reformatFingerPrint,
		getMedia : getMedia,
		updateSoftware : updateSoftware,
		modifyDBSchema : modifyDBSchema,
		testAlarm : testAlarm
	};

});
