angular.module('twitter.services', [])

.factory('TwitterService', function($cordovaOauth, $cordovaOauthUtility, $http, $resource, $q, $rootScope, $window) {

  // 1
  var twitterKey = null;
  var clientId = 'MkfgWym9imKYwlqEJfmUuneOr';
  var clientSecret = 'wPZC34fKJm3GHr9Xd91Q9Aq1zcx2PnKgZsWdYxTXyM0LY9WpTk';

  // 2
  function storeUserToken(data) {
    window.localStorage.setItem(twitterKey, JSON.stringify(data));
  }

  function getStoredToken() {
    return window.localStorage.getItem(twitterKey);
  }

  // 3
  function createTwitterSignature(method, url) {
    var token = angular.fromJson(getStoredToken());
    var oauthObject = {
      oauth_consumer_key: clientId,
      oauth_nonce: $cordovaOauthUtility.createNonce(10),
      oauth_signature_method: "HMAC-SHA1",
      oauth_token: token.oauth_token,
      oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
      oauth_version: "1.0"
    };
    var signatureObj = $cordovaOauthUtility.createSignature(method, url, oauthObject, {}, clientSecret, token.oauth_token_secret);
    $http.defaults.headers.common.Authorization = signatureObj.authorization_header;
  }

  return {
    // 4
    initialize: function() {
      console.log('init');
      var deferred = $q.defer();
      var token = getStoredToken();

      if (token !== null) {
        console.log('token ' + token);
        deferred.resolve(true);
      } else {
        console.log('cordovaauth');
        $cordovaOauth.twitter(clientId, clientSecret).then(function(result) {
          console.log(result);
          storeUserToken(result);
          deferred.resolve(true);
        }, function(error) {
          console.log(error);
          deferred.reject(false);
        });
      }
      return deferred.promise;
    },
    // 5
    isAuthenticated: function() {
      return getStoredToken() !== null;
    },
    // 6
    getHomeTimeline: function() {
      var home_tl_url = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
      createTwitterSignature('GET', home_tl_url);
      return $resource(home_tl_url).query();
    },
    tweet: function (_message) {

                    var deferred = $q.defer();
                    return deferred.promise
                        .then(function () {
                                console.log("in tweet verified success");

                                tUrl = 'https://api.twitter.com/1.1/statuses/update.json';
                                tParams = {
                                    'status': _message,
                                    'trim_user': 'true'
                                };
                                return TwitterService.apiPostCall({
                                    url: tUrl,
                                    params: tParams
                                });

                            }, function (_error) {
                                deferred.reject(JSON.parse(_error.text));
                                console.log("in tweet " + _error.text);
                            }
                        );
                },
                apiPostCall: function (_options) {
                    console.log('api post call');
                    var deferred = $q.defer();

                    oauth = oauth || OAuth(options);

                    oauth.post(_options.url, _options.params,
                        function (data) {
                            deferred.resolve(JSON.parse(data.text));
                        },
                        function (error) {
                            console.log("in apiPostCall reject " + error.text);
                            deferred.reject(JSON.parse(error.text));
                        }
                    );
                    return deferred.promise;
                },
    updateUserStatus: function(userStatus) {
      var post_status_uri = 'https://api.twitter.com/1.1/statuses/update.json?status=';
      var qValue = userStatus;
      var req = {
        method: 'POST',
        url: post_status_uri + qValue,
        headers: {
        }
      };
      // make request with the token
      $http(req).success(function(data, status, headers, config) {
        def.resolve(data);
      }).error(function(data, status, headers, config) {
        def.resolve(false);
      });
      return def.promise;
    },
    storeUserToken: storeUserToken,
    getStoredToken: getStoredToken,
    createTwitterSignature: createTwitterSignature
  };
})
.factory('Base64', function(){
    var self = this;
    self.encode = function (input) {
      // Converts each character in the input to its Unicode number, then writes
      // out the Unicode numbers in binary, one after another, into a string.
      // This string is then split up at every 6th character, these substrings
      // are then converted back into binary integers and are used to subscript
      // the "swaps" array.
      // Since this would create HUGE strings of 1s and 0s, the distinct steps
      // above are actually interleaved in the code below (ie. the long binary
      // string, called "input_binary", gets processed while it is still being
      // created, so that it never gets too big (in fact, it stays under 13
      // characters long no matter what).

      // The indices of this array provide the map from numbers to base 64
      var swaps = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","+","/"];
      var input_binary = "";      // The input string, converted to Unicode numbers and written out in binary
      var output = "";        // The base 64 output
      var temp_binary;        // Used to ensure the binary numbers have 8 bits
      var index;      // Loop variable, for looping through input
      for (index=0; index < input.length; index++){
        // Turn the next character of input into astring of 8-bit binary
        temp_binary = input.charCodeAt(index).toString(2);
        while (temp_binary.length < 8){
          temp_binary = "0"+temp_binary;
        }
        // Stick this string on the end of the previous 8-bit binary strings to
        // get one big concatenated binary representation
        input_binary = input_binary + temp_binary;
        // Remove all 6-bit sequences from the start of the concatenated binary
        // string, convert them to a base 64 character and append to output.
        // Doing this here prevents input_binary from getting massive
        while (input_binary.length >= 6){
          output = output + swaps[parseInt(input_binary.substring(0,6),2)];
          input_binary = input_binary.substring(6);
        }
      }
      // Handle any necessary padding
      if (input_binary.length == 4){
        temp_binary = input_binary + "00";
        output = output + swaps[parseInt(temp_binary,2)];
        output = output + "=";
      }
      if (input_binary.length == 2){
        temp_binary = input_binary + "0000";
        output = output + swaps[parseInt(temp_binary,2)];
        output = output + "==";
      }
      // Output now contains the input in base 64
      return output;
    };

    self.decode = function (input) {
      // Takes a base 64 encoded string "input", strips any "=" or "==" padding
      // off it and converts its base 64 numerals into regular integers (using a
      // string as a lookup table). These are then written out as 6-bit binary
      // numbers and concatenated together. The result is split into 8-bit
      // sequences and these are converted to string characters, which are
      // concatenated and output.
      input = input.replace("=","");      // Padding characters are redundant
      // The index/character relationship in the following string acts as a
      // lookup table to convert from base 64 numerals to Javascript integers
      var swaps = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var output_binary = "";
      var output = "";
      var temp_bin = "";
      var index;
      for (index=0; index < input.length; index++) {
        temp_bin = swaps.indexOf(input.charAt(index)).toString(2);
        while (temp_bin.length < 6) {
          // Add significant zeroes
          temp_bin = "0"+temp_bin;
        }
        while (temp_bin.length > 6) {
          // Remove significant bits
          temp_bin = temp_bin.substring(1);
        }
        output_binary = output_binary + temp_bin;
        while (output_binary.length >= 8) {
          output = output + String.fromCharCode(parseInt(output_binary.substring(0,8),2));
          output_binary = output_binary.substring(8);
        }
      }
      return output;
    };

    return self;
  })

.factory('TwitterREST', function($http, $q, Base64){

    var self = this;
    var authorization = null;
    var consumerKey = "MkfgWym9imKYwlqEJfmUuneOr";
    var consumerSecret = "wPZC34fKJm3GHr9Xd91Q9Aq1zcx2PnKgZsWdYxTXyM0LY9WpTk";
    var twitterTokenURL = "https:/\/api.twitter.com/oauth2/token";
    //https://api.twitter.com/1.1/search/tweets.json
    var twitterStreamURL = "https://api.twitter.com/1.1/search/tweets.json?q="; //url query, this one is for hash tags
    var qValue = "%40connect_js"; //hash tag %23 is for #
    var numberOfTweets = "&count=20";

    self.sync = function (qValue) {
      if (!qValue) {
        qValue = "%40connect_js";
      }
      var def = $q.defer();
      //get authorization token
      self.getAuthorization().then(function(){
        var req1 = {
          method: 'GET',
          url: twitterStreamURL+qValue+numberOfTweets,
          headers: {
            'Authorization': 'Bearer '+authorization.access_token,
            'Content-Type': 'application/json'
          },
          cache:true
        };
        // make request with the token
        $http(req1).
          success(function(data, status, headers, config) {
            def.resolve(data);
          }).
          error(function(data, status, headers, config) {

            def.resolve(false);
          });
      });
      return def.promise;
    };

    self.getAuthorization = function () {
      var def = $q.defer();
      var base64Encoded;

      var combined = encodeURIComponent(consumerKey) + ":" + encodeURIComponent(consumerSecret);

      base64Encoded = Base64.encode(combined);

      // Get the token
      $http.post(twitterTokenURL,"grant_type=client_credentials", {headers: {'Authorization': 'Basic ' + base64Encoded, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}}).
        success(function(data, status, headers, config) {
          authorization = data;
          if (data && data.token_type && data.token_type === "bearer") {
            def.resolve(true);
          }
        }).
        error(function(data, status, headers, config) {
          def.resolve(false);
        });
      return def.promise;
    };

    return self;
  });
