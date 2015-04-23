(function() {
  'use strict';
  var alert, alertMsgs, capitalizeFirstLetter, carouselNormalization, clearInput, getChromeStorage, initGamepad, inputs, isEmpty, mapToKeyName, set, setMode, shortcuts, supportGamepad, update, validate,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  shortcuts = {};

  alertMsgs = {
    success: "<strong>Yatta!</strong> Shortcuts saved successfully.",
    missing_shortcut: "<strong>Oh Snap, Linden!</strong> Looks like you didn't set all the needed shortcuts.",
    duplicate_shortcut: "<strong>Great Scott!</strong> Looks some of your shortcuts are duplicates."
  };

  inputs = [];

  supportGamepad = false;

  carouselNormalization = function() {
    var heights, items, normalizeHeights, tallest;
    items = $('#shortcuts-carousel .item');
    heights = [];
    tallest = 0;
    if (items.length) {
      normalizeHeights = function() {
        items.each(function() {
          return heights.push($(this).height());
        });
        tallest = Math.max.apply(null, heights);
        return items.each(function() {
          return $(this).css('min-height', tallest + 'px');
        });
      };
      normalizeHeights();
      return $(window).on('resize orientationchange', function() {
        tallest = 0;
        heights.length = 0;
        items.each(function() {
          return $(this).css('min-height', '0');
        });
        return normalizeHeights();
      });
    }
  };

  capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  isEmpty = function(variable) {
    return !(variable != null ? variable.length : void 0);
  };

  mapToKeyName = function(code) {
    var key, name;
    name = KeyboardJS.key.name(code);
    if ($.isArray(name)) {
      if (code === 91 || code === 92) {
        key = name[2];
      } else if ((code >= 48 && code <= 57) || (code >= 96 && code <= 111)) {
        key = name[name.length - 1];
      } else if ((code >= 186 && code <= 192) || (code >= 219 && code <= 222)) {
        key = name[name.length - 1];
      } else {
        key = name[0];
      }
    } else {
      key = name;
    }
    return key;
  };

  clearInput = function() {
    return $(this).closest('div').find('input').val('');
  };

  alert = function(type, msg) {
    var $alert;
    if (!msg) {
      msg = type;
    }
    $('.alert-wrapper').prepend("<div class='alert alert-" + type + " alert-dismissable center-block top in animated slideInDown'><button type='button' class='close' aria-label='Close' data-dismiss='alert'><span aria-hidden='true'>&times;</span></button><span>" + alertMsgs[msg] + "</span></div>");
    $alert = $('.alert-wrapper').children().first();
    return setTimeout(function() {
      return $alert.alert('close');
    }, 5000);
  };

  update = function(event) {
    event.preventDefault();
    return setTimeout(function() {
      var k, key, keys, keysString, v, _ref;
      keys = [];
      _ref = KeyboardJS.activeKeys();
      for (k in _ref) {
        v = _ref[k];
        if (!(KeyboardJS.key.code(v))) {
          continue;
        }
        key = KeyboardJS.key.code(v);
        if (key.length && __indexOf.call(keys, key) < 0) {
          keys.push(key);
        }
      }
      keys = keys.map(mapToKeyName);
      keysString = keys.join(' + ');
      return $(event.target).val(keysString);
    }, 0);
  };

  validate = function(event) {
    var input, val, values, _i, _len;
    event.preventDefault();
    values = [];
    for (_i = 0, _len = inputs.length; _i < _len; _i++) {
      input = inputs[_i];
      val = $(input).val();
      if (isEmpty(val)) {
        return alert('danger', 'missing_shortcut');
      } else if (__indexOf.call(values, val) >= 0) {
        return alert('danger', 'duplicate_shortcut');
      }
      values.push(val);
    }
    return set();
  };

  set = function() {
    var input, _i, _len;
    $('#save').button('loading');
    for (_i = 0, _len = inputs.length; _i < _len; _i++) {
      input = inputs[_i];
      shortcuts[$(input).attr('name')] = $(input).val();
    }
    return chrome.storage.sync.set(shortcuts, function() {
      $('#save').button('reset');
      return alert('success');
    });
  };

  setMode = function(event) {
    return chrome.storage.sync.set({
      navMode: $(this).children('input').attr('id')
    });
  };

  getChromeStorage = function() {
    var input, _i, _len;
    for (_i = 0, _len = inputs.length; _i < _len; _i++) {
      input = inputs[_i];
      shortcuts[$(input).attr('name')] = $(input).val();
    }
    return chrome.storage.sync.get(shortcuts, function(items) {
      var _j, _len1;
      for (_j = 0, _len1 = inputs.length; _j < _len1; _j++) {
        input = inputs[_j];
        $(input).val(items[$(input).attr('name')]);
      }
      return $('body').removeClass('loading');
    });
  };

  initGamepad = function() {
    var gamepad;
    gamepad = new Gamepad();
    if (!gamepad.init()) {
      return;
    }
    $('.no-gamepad-support').addClass('hidden');
    $('.gamepad-support').removeClass('hidden');
    $('.gamepad-status-disconnected').removeClass('hidden');
    gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
      console.log("CONNECTED", device);
      $('.gamepad-status').addClass('hidden');
      return $('.gamepad-status-connected').removeClass('hidden');
    });
    gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
      console.log("DISCONNECTED", device);
      $('.gamepad-status').addClass('hidden');
      return $('.gamepad-status-disconnected').removeClass('hidden');
    });
    gamepad.bind(Gamepad.Event.UNSUPPORTED, function(device) {
      console.log("UNSUPPORTED", device);
      $('.gamepad-status').addClass('hidden');
      return $('.gamepad-status-unsupported').removeClass('hidden');
    });
    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
      return console.log("BUTTON_DOWN", e);
    });
    gamepad.bind(Gamepad.Event.BUTTON_UP, function(e) {
      return console.log("BUTTON_UP", e);
    });
    gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
      return console.log("AXIS_CHANGED", e);
    });
    return supportGamepad = !!gamepad.init();
  };

  $(document).ready(function() {
    inputs = $(".keyboard-input");

    /*
    Init Components
     */
    initGamepad();
    getChromeStorage();
    $('[data-toggle="tooltip"]').tooltip();
    carouselNormalization();

    /*
    Register Event Handlers
     */
    inputs.on('keydown', update);
    $(".mode-btns .btn").click(setMode);
    $('form').submit(validate);
    return $('.clear-input').click(clearInput);
  });

}).call(this);
