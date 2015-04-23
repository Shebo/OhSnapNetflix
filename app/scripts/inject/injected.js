(function() {
  'use strict';
  var EventHandler, NetflixData, NetflixHomeData, NetflixInnerData, TransmissionHandler, Utils, fetchConstants, msg, netflixData, pagesTypes,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Utils = (function() {
    function Utils() {}

    Utils.rawAjax = function(url, callback) {
      var request;
      request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          return callback(request.responseText);
        }
      };
      return request.send();
    };

    Utils.parseURL = function(url) {
      var object, parser, queries, query, searchObject, split, _i, _len;
      parser = document.createElement('a');
      searchObject = {};
      parser.href = url;
      queries = parser.search.replace(/^\?/, '').split('&');
      for (_i = 0, _len = queries.length; _i < _len; _i++) {
        query = queries[_i];
        split = query.split('=');
        searchObject[split[0]] = split[1];
      }
      return object = {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash
      };
    };

    return Utils;

  })();


  /*
  Inner page
  
  netflix.contextData = {
  
      -------------API Inner page Constants---------------
  
      "serverDefs": {
          "data": {
              "cluster": "shakti-prod",
              "instance": "i-12d4b0c5",
              "region": "us-east-1",
              "cacheBust": false,
              "production": true,
              "API_BASE_URL": "/shakti",
              "BUILD_IDENTIFIER": "2a2d7eaa",                                     # special uniqe in api url
              "ICHNAEA_ROOT": "/ichnaea",
              "ICHNAEA_PROXY_ROOT": "/ichnaea",
              "host": "www.netflix.com",
              "SHAKTI_API_ROOT": "http://www.netflix.com/api/shakti",
              "API_ROOT": "http://www.netflix.com/api",
              "DVD_CO": "http://dvd.netflix.com/",
              "CDN_HOST": "http://cdn1.nflxext.com"
          }
      },
  
      ---------------User Auth Inner page Constants---------------
  
      "userInfo": {
          "data": {
              "authURL": "1428341996324.YOCOmtnuZuuaksensOkYkD1wgVk=",            # authenticated string
              "countryOfSignup": "US",
              "isDVD": false,
              "pinEnabled": false,
              "guid": "ENJOB4M54FBBNFVJSE2KOHQFOA",
              "masquerade": false
          }
      }
   */


  /*
  HOME
  
  netflix.constants.page = {
      ESN: "NFCDCH-02-AJP0KJ4GUCUN1R4XPWT72EUDFA2PMK",
      MEMBER_GUID: "UEAOTKNXQRGILDUALBYMYT3Q7E",
      ibob: true,
      listBoxshotPlayId: 11802981,
      merchMdxJs: "http://cdn-0.nflximg.com/en_us/ffe/player/html/mdx_cros_v2_2.0000.115.011.js",
      resPullFreq: 10,
      siteSection: "watchnow",
      stringgroups: Object,
      usableListRowItems: 0,
      xsrf: "1428343163018.WirYQY0wVyaqx34YUxe4W823/o0="
  
  
  netflix.BobMovieManager.constructBobFetchUrl($('#b070153380_0')) # jquery object of movie's a tag as param. returns a full URL with BOB details and HTML
  
  netflix.XSRFSafeLink = {
      getXsrfToken()                            # authenticated string
      urlWithXSRF()                             # add authenticated string to url
      getQueryString()                          # build CDN url from relative path
   */


  /*
  
  Netflix Url Structre:
  
  Example         : http://www.netflix.com/WiPlayer?movieid=60031274&trkid=13462293&tctx=2%2C39%2Cd1487862-5adb-435f-ba7e-7e8fd456495d-14962475
  Decoded Example : http://www.netflix.com/WiPlayer?movieid=60031274&trkid=13462293&tctx=2,39,d1487862-5adb-435f-ba7e-7e8fd456495d-14962475
  
  Structred Example: {port}://{domain}/{player}?movieid={movieid}&trkid={trkid}&tctx={movieIndex},{listIndex},{REQUEST_ID}
  Parts:
      port: 'http'
      domain: 'www.netflix.com'
      player: 'WiPlayer'
      movieid: '60031274' # Netflix's movie ID, first segment in data-uitrack attribute of the movie's href
      trkid: '13462293' # ??? track ID, second segment in data-uitrack attribute of the movie's href
      movieIndex: 2 # index of movie in a list, third segment in data-uitrack attribute of the movie's href
      listIndex: 39 # index of list in a page, fourth segment in data-uitrack attribute of the movie's href (in home page 0 can be billboard)
      REQUEST_ID: 'd1487862-5adb-435f-ba7e-7e8fd456495d-14962475' # netflix.constants.page.REQUEST_ID
   */

  EventHandler = (function() {
    function EventHandler() {
      this._safeDispatch = __bind(this._safeDispatch, this);
      this.dispatch = __bind(this.dispatch, this);
    }

    EventHandler.prototype.dispatch = function(type, action, info) {
      var dispatchInterval;
      if (info == null) {
        info = void 0;
      }
      if (typeof $ !== "undefined" && $ !== null) {
        return this._safeDispatch(type, action, info);
      } else {
        return dispatchInterval = setInterval(function() {
          if (typeof $ !== "undefined" && $ !== null) {
            clearInterval(dispatchInterval);
            return this._safeDispatch(type, action, info);
          }
        }, 10);
      }
    };

    EventHandler.prototype._safeDispatch = function(type, action, info) {
      $.event.trigger({
        type: type,
        action: action,
        info: info
      });
      return false;
    };

    return EventHandler;

  })();

  TransmissionHandler = (function(_super) {
    __extends(TransmissionHandler, _super);

    function TransmissionHandler() {
      this._recieve = __bind(this._recieve, this);
      this.transmit = __bind(this.transmit, this);
      this.source = 'MajorTom';
      window.addEventListener('message', this._recieve);
    }

    TransmissionHandler.prototype.transmit = function(target, type, action, data) {
      if (data == null) {
        data = null;
      }
      return window.postMessage({
        sender: this.source,
        recipient: target,
        action: action,
        type: type,
        data: data
      }, '*');
    };

    TransmissionHandler.prototype._recieve = function(event) {
      var msg;
      msg = event.data;
      this.dispatch(msg.type, msg.action, msg.data);
      if (msg.recipient === this.source) {
        if (msg.type === 'OSN:Constants' && msg.action === 'fetch') {
          return fetchConstants();
        }
      }
    };

    return TransmissionHandler;

  })(EventHandler);

  pagesTypes = {
    home: "WiHome",
    genre: "WiGenre",
    movie: "WiMovie",
    player: "WiPlayer",
    player: "WiPlayer",
    search: "WiSearch",
    role: "WiRoleDisplay"
  };

  NetflixData = (function() {
    function NetflixData() {
      this.obj = {
        domain: 'www.netflix.com',
        pages: pagesTypes
      };
    }

    return NetflixData;

  })();

  NetflixHomeData = (function(_super) {
    __extends(NetflixHomeData, _super);

    function NetflixHomeData() {
      this._initServerDefs = __bind(this._initServerDefs, this);
      NetflixHomeData.__super__.constructor.apply(this, arguments);
      this.obj.isSecure = netflix.XSRFSafeLink.isSecure();
      this.obj.authURL = netflix.XSRFSafeLink.getXsrfToken();
      this._initServerDefs();
    }

    NetflixHomeData.prototype._initServerDefs = function() {
      var url;
      url = Utils.parseURL(document.getElementById("instantSearchTemplate").innerHTML.match(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"/i)[1]);
      return Utils.rawAjax("" + (this.obj.isSecure ? "https" : "http") + "://" + this.obj.domain + "/" + this.obj.pages.genre + "?agid=" + url.searchObject.agid, (function(_this) {
        return function(request) {
          var serverDefs;
          serverDefs = /"serverDefs":{"data":({.*?}),"/gi;
          _this.obj.serverDefs = JSON.parse(serverDefs.exec(request)[1]);
          _this.obj.APIRoot = _this.obj.serverDefs.SHAKTI_API_ROOT.replace("" + (_this.obj.isSecure ? "https" : "http") + "://" + _this.obj.domain + "/", "");
          return _this.obj.APIKey = _this.obj.serverDefs.BUILD_IDENTIFIER;
        };
      })(this));
    };

    return NetflixHomeData;

  })(NetflixData);

  NetflixInnerData = (function(_super) {
    __extends(NetflixInnerData, _super);

    function NetflixInnerData() {
      NetflixInnerData.__super__.constructor.apply(this, arguments);
      this.obj.isSecure = location.protocol === "https:";
      this.obj.authURL = netflix.contextData.userInfo.data.authURL;
      this.obj.serverDefs = netflix.contextData.serverDefs;
      this.obj.APIRoot = this.obj.serverDefs.SHAKTI_API_ROOT;
      this.obj.APIKey = this.obj.serverDefs.BUILD_IDENTIFIER;
    }

    return NetflixInnerData;

  })(NetflixData);

  msg = new TransmissionHandler;

  if (window.location.pathname.match("WiHome")) {
    netflixData = new NetflixHomeData;
  } else if (window.location.pathname.match("WiGenre")) {
    netflixData = new NetflixInnerData;
  }

  fetchConstants = function() {
    var dataFetcherInterval;
    return dataFetcherInterval = setInterval(function() {
      if (netflixData.obj.serverDefs) {
        clearInterval(dataFetcherInterval);
        return msg.transmit('GroundControl', 'OSN:Constants', 'update', netflixData.obj);
      }
    }, 10);
  };

  jQuery(document).ready(function($) {
    var eventsss, k, v, _results;
    eventsss = {
      EVENT_TERM_CHANGED: "instantSearchTermChanged",
      EVENT_LOAD_FINISHED: "instantSearchLoadFinished",
      EVENT_NEEDS_MORE: "instantSearchNeedsMore",
      EVENT_CONTENT_COMPLETE: "instantSearchContentComplete",
      EVENT_RESULT_RCVD: "instantSearchResultReceived",
      EVENT_RESULT_SHOWN: "instantSearchResultShown",
      EVENT_NO_GALLERY_RESULTS: "instantSearchNoGalleryResults",
      EVENT_HAS_DVD_UPSELL: "instantSearchHasDVDUpsell",
      EVENT_FETCH: "instantSearchFetch",
      EVENT_RENDERED: "instantSearchRendered"
    };
    document.addEventListener("uiModalViewChanged", function(e) {
      return console.log(e);
    });
    $(document).on("uiModalViewChanged", (function(_this) {
      return function(e) {
        return console.log(e);
      };
    })(this));
    document.addEventListener("instantSearchContentComplete", function(e) {
      return console.log(e);
    });
    $(document).on("instantSearchContentComplete", (function(_this) {
      return function(e) {
        return console.log(e);
      };
    })(this));
    document.addEventListener("instantSearchFetch", function(e) {
      return console.log(e);
    });
    $(document).on("instantSearchFetch", (function(_this) {
      return function(e) {
        return console.log(e);
      };
    })(this));
    _results = [];
    for (k in eventsss) {
      v = eventsss[k];
      console.log(v);
      document.addEventListener(v, function(e) {
        return console.log(e);
      }, false);
      _results.push($(document).on(v, (function(_this) {
        return function(e) {
          return console.log(e);
        };
      })(this)));
    }
    return _results;
  });

}).call(this);
