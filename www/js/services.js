angular.module('starter.services', [])

  .factory('ScheduleFactory', function($localstorage) {
    return {
      addSession: function(index, sessionid) {
        var sessions = $localstorage.getObject('sessions');
        var userSchedule = $localstorage.getObject('userSchedule');
        sessions[index].isAdded = true;
        userSchedule.push({'sessionid': sessionid});
        $localstorage.setObject('userSchedule', userSchedule);
        $localstorage.setObject('sessions', sessions);
        return sessions;
      },
      removeSession: function(index, sessionid) {
        var sessions = $localstorage.getObject('sessions');
        var userSchedule = $localstorage.getObject('userSchedule');
        sessions[index].isAdded = false;
        for (var i = 0; i < userSchedule.length;i++) {
          if (userSchedule[i].sessionid == sessionid) {
            userSchedule.splice(i, 1);
            $localstorage.setObject('userSchedule', userSchedule);
          }
        }
        $localstorage.setObject('sessions', sessions);
        return sessions;
      },
      addSessionByID: function(sessionid) {
        var sessions = $localstorage.getObject('sessions');
        var userSchedule = $localstorage.getObject('userSchedule');
        for (var i = 0; i < sessions.length; i++) {
          if (sessions[i].sessionid == sessionid) {
            sessions[i].isAdded = true;
            break;
          }
        }
        userSchedule.push({'sessionid': sessionid});
        $localstorage.setObject('userSchedule', userSchedule);
        $localstorage.setObject('sessions', sessions);
        return sessions;
      },
      removeSessionByID: function(sessionid) {
        var sessions = $localstorage.getObject('sessions');
        var userSchedule = $localstorage.getObject('userSchedule');
        for (var i = 0; i < sessions.length; i++) {
          if (sessions[i].sessionid == sessionid) {
            console.log('session found');
            sessions[i].isAdded = false;
            $localstorage.setObject('sessions', sessions);
            break;
          }
        }
        for (var j = 0; j < userSchedule.length;j++) {
          if (userSchedule[j].sessionid == sessionid) {
            userSchedule.splice(j, 1);
            $localstorage.setObject('userSchedule', userSchedule);
            break;
          }
        }
        return sessions;
      },
      fetchUserSchedule: function() {
        return $localstorage.getObject('userSchedule');
      },
      fetchSessions: function() {
        return $localstorage.getObject('sessions');
      },
      fetchSessionBySessionID: function(sessionid) {
        var sessions = $localstorage.getObject('sessions');
        for (var i = 0; i < sessions.length; i++) {
          if (sessions[i].sessionid == sessionid) {
            return sessions[i];
          }
        }
        return null;
      },
      fetchSessionByIndex: function(index) {
        var sessions = $localstorage.getObject('sessions');
        return sessions[index];
      }
    };
  })

  .factory('SpeakerFactory', function($localstorage) {
    return {
      getAllSpeakers: function() {
        return $localstorage.getObject('speakers');
      },
      speakerSessions: function(speakerid) {

        var sessionSpeaker = $localstorage.getObject('speakerSessions');
        var keys = [];

        // First get all of the speaker's sessions.
        for (var i = 0; i < sessionSpeaker.length; i++) {
          if (sessionSpeaker[i].speakerid == speakerid) {
            keys.push(sessionSpeaker[i]);
          }
        }
        // Then build the session object
        var sessions = $localstorage.getObject('sessions');
        var speakerSessionsObject = [];
        for (var j = 0; j < keys.length; j++) {
          for (var k = 0; k < sessions.length; k++) {
            if (sessions[k].sessionid == keys[j].sessionid) {
              speakerSessionsObject.push(sessions[k]);
              break;
            }
          }
        }
        return speakerSessionsObject;
      },
      getSpeakerByIndex: function(index) {
        return $localstorage.getObject('speakers')[index];
      },
      getSpeakerByID: function(id) {
        var speakers = $localstorage.getObject('speakers');
        for (var i = 0; i < speakers.length; i++) {
          if (speakers[i].speakerid == id) {
            return speakers[i];
          }
        }
      }
    };
  })

  .factory('Schedule', function($http) {
    return {
      fetchScheduleSessions: function() {
        return $http({
          url: 'api/sessions',
          method: 'GET'
        });
      },
      addSession: function(id) {
        return $http({
          url: 'api/schedule/' + id,
          method: 'POST'
        });
      },
      removeSession: function(id) {
        return $http({
          url: 'api/schedule/' + id,
          method: 'DELETE'
        });
      },
      fetchUserSchedule: function() {
        return $http({
          url: 'api/schedule',
          method: 'GET'
        });
      }
    };
  })

  .factory('Alerts', function($http) {
    return {
      fetchAlerts: function() {
        return $http({
          url: 'api/alerts',
          method: 'GET'
        });
      },
      fetchTopAlert: function() {
        return $http({
          url: 'api/alerts/top',
          method: 'GET'
        });
      }
    };
  })

  .factory('Sponsors', function($http) {
    return {
      fetchSponsors: function() {
        return $http({
          url: 'api/sponsors',
          method: 'GET'
        });
      }
    };
  })

  // TODO: disconnect this interceptor.
  .factory('authInterceptor', function ($rootScope, $q, $window) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.token = $window.sessionStorage.token;
      }
      return config;
    },
    response: function (response) {
      if (response.status === 401) {
        // handle the case where the user is not authenticated
      }
      return response || $q.when(response);
    }
  };
})

  .factory('Speakers', function($http) {
    return {

      //Search for someone on Perspyre.
      fetchSpeaker: function (speakerID) {
        return $http({
          //url: 'api/speakers/' + speakerID,
          url: 'api/speakers/' + speakerID,
          method: 'GET'
        });
      },
      fetchSpeakerSessions: function(speakerID) {
        return $http({
          url: 'api/speakers/' + speakerID + '/sessions',
          method: 'GET'
        });
      },
      fetchAllSpeakerSessions: function() {
        return $http({
          url: 'api/speakersessions',
          method: 'GET'
        });
      },
      fetchAllSpeakers: function() {
        return $http({
          //url: 'api/speakers',
          url: 'api/speakers',
          method: 'GET'
        });
      }
    };
  })

  // TODO: remove error handlers on api fetches and return an array in getObject
  .factory('$localstorage', ['$window', function($window){
		return {
			set: function(key, value) {
				$window.localStorage[key] = value;
			},
			get: function(key, defaultValue) {
				return $window.localStorage[key] || defaultValue;
			},
			setObject: function(key, value) {
				$window.localStorage[key] = JSON.stringify(value);
			},
			getObject: function(key) {
				return JSON.parse($window.localStorage[key] || '{}');
			}
		};
	}]);
