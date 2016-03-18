angular.module('starter.controllers', [])

  .controller('GeneralCtrl', function() {

  })

  .controller('NetworkingCtrl', function($scope, $localstorage, $cordovaBarcodeScanner, $cordovaToast, $ionicTabsDelegate) {
    $ionicTabsDelegate.select(1);
    function isArray(arrayToCheck) {
      return Object.prototype.toString.call( arrayToCheck ) === '[object Array]';
    }
    $scope.qrview = 'profile';
    var self = $scope;

    $scope.emailContactDetails = function(){
      var csv = generateContactCsv($localstorage.getObject('contacts'));
      window.location.href = "mailto:?subject=Your ConnectJS Contacts.&body=" + csv;
    };

    function generateContactCsv(contacts) {
      var csvContacts = [];
      for (var i = 0; i < contacts.length; i++) {
        csvContacts.push(JSON.stringify(contacts[i]));
      }
      csvContacts.join("\n");
      return csvContacts;
    }

    function getLastName(vcard) {
      return vcard.split("\n")[1].split(';')[0].split(':')[1];
    }
    function getFirstName(vcard) {
      return vcard.split("\n")[1].split(';')[1];
    }
    function getEmail(vcard) {
      return vcard.split("\n")[2].split(':')[1];
    }
    function getOrg(vcard) {
      return vcard.split("\n")[3].split(':')[1];
    }
    function getTitle(vcard) {
      return vcard.split("\n")[4].split(':')[1];
    }


    $scope.scan = function() {
      $cordovaBarcodeScanner
        .scan()
        .then(function(barcodeData) {


          var contacts;
          if (isArray($localstorage.getObject('contacts'))) {
            contacts = $localstorage.getObject('contacts');
          } else {
            contacts = [];
          }
          var contactObject = {"Name":getFirstName(barcodeData.text) + ' ' + getLastName(barcodeData.text), "Email":getEmail(barcodeData.text), "Organization":getOrg(barcodeData.text), "Title":getTitle(barcodeData.text)};

          contacts.unshift(contactObject);
          $localstorage.setObject('contacts', contacts);
          $cordovaToast.showLongCenter(getFirstName(barcodeData.text) + ' ' + getLastName(barcodeData.text) + ' added to contacts list.');
          self.updateContactsData();

        }, function(error) {
          // An error occurred
        });
    };

    $scope.updateContactsData = function() {
      $scope.contacts = $localstorage.getObject('contacts');
    };

  })

  .controller('UpdateCtrl', function($scope, $ionicDeploy, Schedule, Speakers, Alerts, Sponsors, $localstorage) {


    $scope.doUpdate = function() {
      $ionicDeploy.update().then(function(res) {
        //console.log('Ionic Deploy: Update Success! ', res);
        alert('Update success!');
      }, function(err) {
        //console.log('Ionic Deploy: Update error! ', err);
        alert('Update failed!');
      }, function(prog) {
        //console.log('Ionic Deploy: Progress... ', prog);
      });
    };

    // Check Ionic Deploy for new code
    $scope.checkForUpdates = function() {
      //console.log('Ionic Deploy: Checking for updates');
      $ionicDeploy.check().then(function(hasUpdate) {
        //console.log('Ionic Deploy: Update available: ' + hasUpdate);
        if (hasUpdate === true) {
          alert('Update Available!');
        } else {
          alert('No Updates Available');
        }
        $scope.hasUpdate = hasUpdate;
      }, function(err) {
        //console.error('Ionic Deploy: Unable to check for updates', err);
      });
    };


    $scope.updateAppData = function() {
      $scope.syncAppData();
    };

    // TODO - change $localstorage.getObject to return a default array. Then we can eliminate these silly error handlers that add an array to the localstorage property.

    // This function checks for a userSchedule Array. If it exists, and it has anything added, it will then proceed
    // to generate the isAdded property on any sessions in the sessions array. This is how we track the ng-if property
    // in the schedule/myschedule view.
    $scope.syncAppData = function() {
      Schedule.fetchScheduleSessions().success(function(resp) {
        $localstorage.setObject('sessions', resp);
        if ($localstorage.getObject('userSchedule').length > 0) {
          var userSchedule = $localstorage.getObject('userSchedule');
          var sessions = $localstorage.getObject('sessions');
          for (var i = 0; i < userSchedule.length; i++) {
            for (var j = 0; j < sessions.length; j++) {
              if (userSchedule[i].sessionid == sessions[j].sessionid) {
                sessions[j].isAdded = true;
                break;
              }
            }
          }
          $localstorage.setObject('sessions', sessions);
        }
      }).error(function(err) {
        if ( Object.prototype.toString.call( $localstorage.getObject('sessions') ) !== '[object Array]' ) {
          $localstorage.setObject('sessions', []);
        }
      });

      Sponsors.fetchSponsors().success(function(resp) {
        console.log('Synced sponsors');
        $localstorage.setObject('sponsors', resp);
      }).error(function(err) {
        if ( Object.prototype.toString.call( $localstorage.getObject('sponsors') ) !== '[object Array]' ) {
          $localstorage.setObject('sponsors', []);
        }
      });

      Alerts.fetchAlerts().success(function(resp) {
        console.log('Synced alerts');
        $localstorage.setObject('alerts', resp);
      }).error(function(err) {
        if ( Object.prototype.toString.call( $localstorage.getObject('alerts') ) !== '[object Array]' ) {
          $localstorage.setObject('alerts', []);
        }
      });

      Speakers.fetchAllSpeakers().success(function(resp) {
        console.log('Synced speakers');
        $localstorage.setObject('speakers', resp);
      }).error(function(err) {
        if ( Object.prototype.toString.call( $localstorage.getObject('speakers') ) !== '[object Array]' ) {
          $localstorage.setObject('speakers', []);
        }
      });

      Speakers.fetchAllSpeakerSessions().success(function(resp) {
        console.log('Synced speaker sessions');
        $localstorage.setObject('speakerSessions', resp);
      }).error(function(err) {
        if ( Object.prototype.toString.call( $localstorage.getObject('speakerSessions') ) !== '[object Array]' ) {
          $localstorage.setObject('speakerSessions', []);
        }
      });

      Alerts.fetchTopAlert().success(function(alert) {
        if (alert[0]) {
          //console.log('Synced top alert');
          $localstorage.set('topAlert', alert[0]);
        }
      }).error(function(err) {
        //console.log('Failed to fetch top alert');
      });
    };

  })

  .controller('SessionDetailCtrl', function($stateParams, $scope, $localstorage, ScheduleFactory, $rootScope) {
    var sessionidScoped = $stateParams.sessionid;




    $scope.session = ScheduleFactory.fetchSessionBySessionID(sessionidScoped);

    $scope.addSession = function(sessionid) {
      ScheduleFactory.addSessionByID(sessionid);
      $scope.session = ScheduleFactory.fetchSessionBySessionID(sessionid);
      $rootScope.sessions = ScheduleFactory.fetchSessions();
    };


    $scope.removeSession = function(sessionid) {
      ScheduleFactory.removeSessionByID(sessionid);
      $scope.session = ScheduleFactory.fetchSessionBySessionID(sessionid);
      $rootScope.sessions = ScheduleFactory.fetchSessions();
    };

  })

  .controller('MapCtrl', function($scope, $ionicModal, $ionicScrollDelegate, $ionicSlideBoxDelegate) {

      $scope.allImages = [{
      src: 'templates/icons/cgmap.png'
    },
    {
      src: 'templates/icons/2.png'
    },
    {
      src: 'templates/icons/3.png'
    },
    {
      src: 'templates/icons/1.png'
    }];

    $scope.zoomMin = 1;
      $scope.showImages = function(index) {
      $scope.activeSlide = index;
        $scope.showModal('templates/modals/mapmodal.html');
      };

      $scope.showModal = function(templateUrl) {
        $ionicModal.fromTemplateUrl(templateUrl, {
          scope: $scope
        }).then(function(modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });
      };

      $scope.closeModal = function() {
        $scope.modal.hide();
        $scope.modal.remove();
      };

      $scope.updateSlideStatus = function(slide) {
        var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
        if (zoomFactor == $scope.zoomMin) {
          $ionicSlideBoxDelegate.enableSlide(true);
        } else {
          $ionicSlideBoxDelegate.enableSlide(false);
        }
      };
  })

  .controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, $state, $window, Alerts, $localstorage) {

    $scope.goToUpdates = function() {
      $state.go('tab.updates');
    };

    $scope.dash = {};
    if (!$localstorage.get('intro') ) {
      $localstorage.set('intro', true);
      $state.go('splash');
    }

    /*
    Alerts.fetchTopAlert().success(function(alert) {
      if (alert[0]) {
        $scope.dash.alert = alert[0];
        console.log(alert[0]);
        $localstorage.set('topAlert', alert[0]);
        console.log($localstorage.get('topAlert'));
        Alerts.fetchAlerts().success(function(alerts) {
          $localstorage.setObject('alerts', alerts);
        }).error(function(err) {
          //
        });
      }
    }).error(function(err) {
      if ($localstorage.get('topAlert')) {
        $scope.dash.alert = $localstorage.get('topAlert');
      } else {
        $scope.dash.alert = {'notificationmessage': 'No alerts to show at this time.'};
      }
      //console.log(err);
    });
    */

  })

  .controller('SplashCtrl', function($scope, $state, $ionicModal, $cordovaDialogs, $cordovaToast, $cordovaPush, Schedule, Alerts, Sponsors, Speakers, $localstorage, $ionicPlatform) {

    $scope.notifications = [];

    // call to register automatically upon device ready
    $ionicPlatform.ready().then(function (device) {
      $scope.register();
    });


    // Register
    $scope.register = function () {
      var config = null;

      if (ionic.Platform.isAndroid()) {
        config = {
          "senderID": "astral-gateway-108320" // REPLACE THIS WITH YOURS FROM GCM CONSOLE - also in the project URL like: https://console.developers.google.com/project/434205989073
        };
      }
      else if (ionic.Platform.isIOS()) {
        config = {
          "badge": "true",
          "sound": "true",
          "alert": "true"
        };
      }

      function getMobileOperatingSystem() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) ) return 'iOS';
        else if( userAgent.match( /Android/i ) ) return 'Android';
        else return 'unknown';
      }

      $cordovaPush.register(config).then(function (result) {
        console.log("Register success " + result);

        $cordovaToast.showShortCenter('Registered for push notifications');
        $scope.registerDisabled=true;
        // ** NOTE: Android regid result comes back in the pushNotificationReceived, only iOS returned here
        if (ionic.Platform.isIOS()) {
          $scope.regId = result;
          storeDeviceToken(result);
        }
      }, function (err) {
        console.log("Register error " + err);
      });
    };

    // Notification Received
    $scope.$on('$cordovaPush:notificationReceived', function (event, notification) {
      console.log(JSON.stringify([notification]));
      if (ionic.Platform.isAndroid()) {
        handleAndroid(notification);
      }
      else if (ionic.Platform.isIOS()) {
        handleIOS(notification);
        $scope.$apply(function () {
          $scope.notifications.push(JSON.stringify(notification.alert));
        });
      }
    });

    // Android Notification Received Handler
    function handleAndroid(notification) {
      // ** NOTE: ** You could add code for when app is in foreground or not, or coming from coldstart here too
      //             via the console fields as shown.
      console.log("In foreground " + notification.foreground  + " Coldstart " + notification.coldstart);
      if (notification.event == "registered") {
        $scope.regId = notification.regid;
        storeDeviceToken(notification.regid);
      }
      else if (notification.event == "message") {
        $cordovaDialogs.alert(notification.message, "Push Notification Received");
        $scope.$apply(function () {
          $scope.notifications.push(JSON.stringify(notification.message));
        });
      }
      else if (notification.event == "error")
        $cordovaDialogs.alert(notification.msg, "Push notification error event");
      else $cordovaDialogs.alert(notification.event, "Push notification handler - Unprocessed Event");
    }

    // IOS Notification Received Handler
    function handleIOS(notification) {
      // The app was already open but we'll still show the alert and sound the tone received this way. If you didn't check
      // for foreground here it would make a sound twice, once when received in background and upon opening it from clicking
      // the notification when this code runs (weird).
      if (notification.foreground == "1") {
        // Play custom audio if a sound specified.
        if (notification.sound) {
          var mediaSrc = $cordovaMedia.newMedia(notification.sound);
          mediaSrc.promise.then($cordovaMedia.play(mediaSrc.media));
        }

        if (notification.body && notification.messageFrom) {
          $cordovaDialogs.alert(notification.body, notification.messageFrom);
        }
        else $cordovaDialogs.alert(notification.alert, "Push Notification Received");

        if (notification.badge) {
          $cordovaPush.setBadgeNumber(notification.badge).then(function (result) {
            console.log("Set badge success " + result);
          }, function (err) {
            console.log("Set badge error " + err);
          });
        }
      }
    }

    // Stores the device token in a db using node-pushserver (running locally in this case)
    //
    // type:  Platform type (ios, android etc)
    function storeDeviceToken(result) {
      // Create a random userid to store with it
      $localstorage.set('deviceToken', result);
      var data = {
        registration: result,
        os: getMobileOperatingSystem(),
        event: 'connectjs'
      };


      $http.post('http://conjs.cloudapp.net:80/devices', JSON.stringify(data))
        .success(function (data, status) {
          console.log("Token stored, device is successfully subscribed to receive push notifications.");
        })
        .error(function (data, status) {
          console.log("Error storing device token." + data + " " + status);
        }
      );
    }

    function removeDeviceToken() {
      var tkn = {"token": $scope.regId};
      var token = $localstorage.get('deviceToken');
      $http.delete('http://conjs.cloudapp.net:80/devices', token)
        .success(function (data, status) {
          console.log("Token removed, device is successfully unsubscribed and will not receive push notifications.");
          // Clear the token.
          $localstorage.set('deviceToken', '');
        })
        .error(function (data, status) {
          console.log("Error removing device token." + data + " " + status);
        }
      );
    }

    $scope.unregister = function () {
      console.log("Unregister called");
      removeDeviceToken();
      $scope.registerDisabled=false;
    };

    $scope.slideVal = 1;
    var scope = $scope;

    $scope.syncAppData = function() {
      Schedule.fetchScheduleSessions().success(function(resp) {
        //console.log('Sycned schedule');
        $localstorage.setObject('sessions', resp);
      }).error(function(err) {
        $localstorage.setObject('sessions', []);
      });

      Sponsors.fetchSponsors().success(function(resp) {
        //console.log('Synced sponsors');
        $localstorage.setObject('sponsors', resp);
      }).error(function(err) {
        $localstorage.setObject('sponsors', []);
      });

      Alerts.fetchAlerts().success(function(resp) {
        //console.log('Synced alerts');
        $localstorage.setObject('alerts', resp);
      }).error(function(err) {
        $localstorage.setObject('alerts', []);
      });

      Speakers.fetchAllSpeakers().success(function(resp) {
        //console.log('Synced speakers');
        $localstorage.setObject('speakers', resp);
      }).error(function(err) {
        $localstorage.setObject('speakers', []);
      });

      Alerts.fetchTopAlert().success(function(alert) {
        if (alert[0]) {
          //console.log('Synced top alert');
          $localstorage.set('topAlert', alert[0]);
        }
      }).error(function(err) {
        $localstorage.set('topAlert', {});
      });
      if ( Object.prototype.toString.call( $localstorage.getObject('userSchedule') ) !== '[object Array]' ) {
        //console.log('creating temp array');
        $localstorage.setObject('userSchedule', []);
      }


    };
    $scope.syncAppData();
    $scope.goToDash = function() {
      $state.go('tab.dash');
    };
    $scope.next = function() {
      scope.slideVal = 2;
      $scope.$broadcast('slideBox.nextSlide');
    };
    $scope.previous = function() {
      scope.slideVal = 1;
      $scope.$broadcast('slideBox.prevSlide');
    };
  })

.controller('DashCtrl', function($scope) {})
.controller('ScheduleCtrl', function($scope, Schedule, $rootScope, $ionicPopover, $window, $localstorage, $state, ScheduleFactory) {

    var scope = $scope;
    $rootScope.sessions = ScheduleFactory.fetchSessions();
    $scope.currentView = 'schedule';

    $scope.goToSession = function(id) {
      $state.go('tab.sessionDetail', {'sessionid': id});
    };

    $scope.setView = function(view) {
        scope.currentView = view;
    };

    $scope.showSearch = function() {
      scope.search = true;
    };
    $scope.hideSearch = function() {
      scope.search = false;
    };

    $scope.addSession = function(index, id, $event) {
      if ($event.stopPropagation) $event.stopPropagation();
      if ($event.preventDefault) $event.preventDefault();
      $event.cancelBubble = true;
      $event.returnValue = false;
      $rootScope.sessions = ScheduleFactory.addSession(index, id);
    };

    $scope.removeSession = function(index, sessionid, $event) {
      if ($event.stopPropagation) $event.stopPropagation();
      if ($event.preventDefault) $event.preventDefault();
      $event.cancelBubble = true;
      $event.returnValue = false;
      $rootScope.sessions = ScheduleFactory.removeSession(index, sessionid);
    };

    // Toggle between My Schedule and Schedule View.
    $scope.scheduleView = 0;
    $scope.toggleSchedule = function(id) {
      scope.scheduleView = id;
    };

    // Toggle between days.
    $scope.dayFilterValue = 0;
    $scope.dayFilter = function(day) {
      scope.dayFilterValue = day;
    };

})

.controller('SpeakerDetailCtrl', function($scope, Speakers, $stateParams, $state, Schedule, $rootScope, $window, $localstorage, ScheduleFactory, SpeakerFactory) {
    var speakerid = $stateParams.speakerid;
    var speakers = $localstorage.getObject('speakers');

    $scope.goToSession = function(id) {
      $state.go('tab.sessionDetail', {'sessionid': id});
    };

    $scope.profile = SpeakerFactory.getSpeakerByID(speakerid);
    $scope.speakerSessions = SpeakerFactory.speakerSessions(speakerid);

    $scope.addSession = function(sessionid, $event) {
      if ($event.stopPropagation) $event.stopPropagation();
      if ($event.preventDefault) $event.preventDefault();
      $event.cancelBubble = true;
      $event.returnValue = false;
      ScheduleFactory.addSessionByID(sessionid);
      $scope.speakerSessions = SpeakerFactory.speakerSessions(speakerid);
    };

    $scope.removeSession = function(sessionid, $event) {
      if ($event.stopPropagation) $event.stopPropagation();
      if ($event.preventDefault) $event.preventDefault();
      $event.cancelBubble = true;
      $event.returnValue = false;
      ScheduleFactory.removeSessionByID(sessionid);
      $scope.speakerSessions = SpeakerFactory.speakerSessions(speakerid);
    };

  })

.controller('SpeakerCtrl', function($scope, Speakers, $state, $localstorage) {

  var scope = $scope;
  $scope.speakers = $localstorage.getObject('speakers');
  $scope.search = false;

  $scope.showSearch = function() {
    scope.search = true;
  };
  $scope.hideSearch = function() {
    scope.search = false;
  };
})

.controller('AlertsCtrl', function($scope, Alerts, $localstorage) {
  $scope.alerts = $localstorage.getObject('alerts');
})

.controller('SponsorsCtrl', function($scope, Sponsors, $localstorage) {
  $scope.sponsors = $localstorage.getObject('sponsors');
});
