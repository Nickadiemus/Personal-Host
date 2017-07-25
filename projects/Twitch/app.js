(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("initialize.js", function(exports, require, module) {
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  // do your setup here
  console.log('Initialized app');
  var $ = require('main.js');
});

});

require.register("main.coffee", function(exports, require, module) {


});

;require.register("main.js", function(exports, require, module) {
"use strict";

var channels = ["freecodecamp", "shroud", "esl_csgo", "sacriel", "nickadiemus"];

var channelsAll = [];
var getData = function getData() {
  channels.forEach(function (channel) {
    function makeURL(type, name) {
      return 'https://wind-bow.gomix.me/twitch-api/' + type + '/' + name + '?callback=?';
    };
    var twitchItem = {
      "Name": "",
      "Status": "",
      "ImageURL": "",
      "Link": ""
    };
    function setLogo(logo) {
      twitchItem.ImageURL = logo;
    }
    function setLink(link) {
      twitchItem.Link = link;
    }
    function setName(name) {
      twitchItem.Name = name;
    }
    function setStatus(status) {
      twitchItem.Status = status;
    }
    $.getJSON(makeURL('streams', channel), function (data) {
      var status, name;
      name = channel;
      if (data.stream === null) {
        status = "Offline";
      } else {
        status = data.stream.game;
      };
      $.getJSON(makeURL('channels', channel), function (data) {
        setName(name);
        setStatus(status);
        setLogo(data.logo);
        setLink(data.url);
        channelsAll.push(twitchItem);
        console.log(twitchItem);
      });
    });
  });
};

var clearData = function clearData(_clearData) {
  return $("#displaySection").html("");
};

$(document).ready(function () {
  getData();
  console.log(channelsAll);

  $("#all").on("click", function () {
    clearData();
    for (var i = 0; i < channelsAll.length; i++) {
      $("#displaySection").append("<div class =\"bodyDisplay row row-span\"> <div class = \"col-sm-3\"> <img class = \"smaller-image radius\"src = \"" + channelsAll[i].ImageURL + "\" style=\"width:150px;height:150px;\"></div><div class = \"col-sm-3 name text-center\">" + "<a href = \"" + channelsAll[i].Link + "\" target = \"blank_\">" + channelsAll[i].Name + " </a></div><div class = \"col-sm-6 description text-center\">" + channelsAll[i].Status + "</div></div>");
    }
  });

  $("#online").on("click", function () {
    clearData();
    for (var i = 0; i < channelsAll.length; i++) {
      if (channelsAll[i].Status !== "Offline") {
        $("#displaySection").append("<div class =\"bodyDisplay row row-span\"> <div class = \"col-sm-3\"> <img class = \"smaller-image radius\"src = \"" + channelsAll[i].ImageURL + "\" style=\"width:150px;height:150px;\"></div><div class = \"col-sm-3 name text-center\">" + "<a href = \"" + channelsAll[i].Link + "\" target = \"blank_\">" + channelsAll[i].Name + " </a></div><div class = \"col-sm-6 description text-center\">" + channelsAll[i].Status + "</div></div>");
      }
    }
  });
  $("#offline").on("click", function () {
    clearData();
    for (var i = 0; i < channelsAll.length; i++) {
      if (channelsAll[i].Status === "Offline") {
        $("#displaySection").append("<div class =\"bodyDisplay row row-span\"> <div class = \"col-sm-3\"> <img class = \"smaller-image radius\"src = \"" + channelsAll[i].ImageURL + "\" style=\"width:150px;height:150px;\"></div><div class = \"col-sm-3 name text-center\">" + "<a href = \"" + channelsAll[i].Link + "\" target = \"blank_\">" + channelsAll[i].Name + " </a></div><div class = \"col-sm-6 description text-center\">" + channelsAll[i].Status + "</div></div>");
      }
    }
  });
  console.log("Hello");
});

});

require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map