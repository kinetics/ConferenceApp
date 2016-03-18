angular.module('twitter.controllers', [])

  .controller('TwitterCtrl', function($scope, TwitterService, $ionicPlatform, TwitterREST, $ionicModal, $ionicPopover, TwitterLib ) {

    $scope.syncItem = '@connect_js';
    $scope.showModal = function(modal) {
      $ionicModal.fromTemplateUrl(modal, {
        scope: $scope
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.showTweet = function(index) {
      $scope.activeSlide = index;
      $scope.showModal('templates/modals/singletweetmodal.html');
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


    $scope.clear = function() {
      $scope.formData.message = '';
    };

    $ionicModal.fromTemplateUrl('templates/modals/post-tweet.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.postTweetModal = modal;
    });
    $scope.postView = '@connect_js';
    $scope.formData = {};
    TwitterREST.sync().then(function(tweets){
      console.log(tweets);
      $scope.tweets = tweets.statuses;
    }, function(err) {
      console.log(err);
    });

    $scope.innapBrowser = function (value) {
      window.open(value, '_blank');
    };

    $scope.postNewTweet = function() {
      TwitterLib.init().then(function (_data) {
                $scope.openModal();
            }, function error(_error) {
                alert(JSON.stringify(_error));
            });
    };

    $scope.addLocation = function() {
      console.log('location');
    };

    $scope.doTweet = function(message) {
        console.log('hello');
            message = message + ' @connect_js';
            TwitterLib.tweet(message).then(function (_data) {
              console.log(_data);
              alert("tweet success");
              $scope.closePostTweetModal();
            },function(err) {
              console.log(JSON.stringify(err));
              if (err.errors[0].code === 187) {
                alert("Cannot post duplicates to Twitter.");
              } else if (err.errors[0].code === 186) {
                alert("Post is over character limit.");
              }
              else  {
                  alert("Something broke.");
              }
            });
        };

    $scope.openPopover = function($event) {
      $scope.popover.show($event);
    };

    $scope.twitterSync = function(symbolCode, symbol, tag) {
      TwitterREST.sync(symbolCode + tag).then(function(tweets){
        console.log(tweets);
        $scope.syncItem = symbol + tag;
        $scope.tweets = tweets.statuses;
        $scope.popover.hide();
      }, function(err) {
        console.log(err);
      });
    };

    $scope.postTweet = function(tweet) {
      console.log(tweet);
    };

    $ionicPopover.fromTemplateUrl('templates/popovers/popover.tpl.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });


    // 1
    $scope.correctTimestring = function(string) {
      return new Date(Date.parse(string));
    };
    // 2
    $scope.showHomeTimeline = function() {
      $scope.home_timeline = TwitterService.getHomeTimeline();
    };
    // 3
    $scope.doRefresh = function() {
      $scope.showHomeTimeline();
      $scope.$broadcast('scroll.refreshComplete');
    };


    $scope.postType = $scope.postView;

    $scope.openModal = function() {
      $scope.postTweetModal.show();
    };
    $scope.closePostTweetModal = function() {
      $scope.postTweetModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });

  });
