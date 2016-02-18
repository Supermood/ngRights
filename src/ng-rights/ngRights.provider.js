angular.module('ngRightsProvider', []).provider('ngRights', function() {

  function NgRights(ruleset, url, subjectGenerator, onErrorValue, $rootScope, $http) {
    this.ruleset = {};
    this.defaultRuleset = angular.copy(ruleset);
    this.url = url;
    this.subjectGenerator = subjectGenerator;
    this.rootScope = $rootScope;
    this.http = $http;
    this.onErrorValue = onErrorValue;
    if (this.defaultRuleset) {
      this.ruleset = transformRules(this.defaultRuleset, subjectGenerator);
    }
    if (this.url) {
      this.loadAsync(this.url);
    }
  }
  NgRights.prototype.setRules = function (rules) {
    this.ruleset = transformRules(rules, this.subjectGenerator, this.onErrorValue);
    this.rootScope.$broadcast('ngRights-update');
  };
  NgRights.prototype.addRules = function (rules) {
    angular.merge(this.ruleset, transformRules(rules, this.subjectGenerator));
    this.rootScope.$broadcast('ngRights-update');
  };
  NgRights.prototype.refresh = function () {
    this.rootScope.$broadcast('ngRights-update');
  };
  NgRights.prototype.reload = function () {
    if (this.url) {
      this.loadAsync(this.url);
    }
  };
  NgRights.prototype.loadAsync = function (url) {
    this.http.get(url).then(function(data) {
      eval('this.addRules(' + data + ')');
    });
  };

  function transformRules(ruleset, subjectGenerator) {
    var transformedRules = {};
    for(var key in ruleset) {
      if (ruleset.hasOwnProperty(key)) {
        var rule = ruleset[key];
        if (angular.isObject(rule)) {
          // if it's a nested object, recursively generate rules
          transformedRules[key] = transformRules(rule, subjectGenerator);
        } else if (angular.isFunction(rule)) {
          // if it's a function, we return a function that calls the subject generator and has only one parameter
          transformedRules[key] = (function(rule) {
            return function (object) {
              return rule(subjectGenerator(), object);
            };
          })(rule);
        } else if (typeof rule === 'boolean') {
          // if it's a boolean, we return a function that returns that boolean
          transformedRules[key] = (function(rule) { return function () { return rule; }; })(rule);
        }
      }
    }
    return transformedRules;
  }

  var defaultRuleset = null;
  var subjectGenerator = null;
  var rulesUrl = null;
  var onErrorValue = false;

  this.setRules = function (ruleset) {
    defaultRuleset = ruleset;
  };
  this.setRulesUrl = function (url) {
    rulesUrl = url;
  };
  this.setSubjectGenerator = function (generator) {
    subjectGenerator = generator;
  };
  this.setOnErrorDisplay = function (value) {
    onErrorValue = value;
  };

  this.$get = ['$rootScope', '$http', function($rootScope, $http) {
    window.ngRights = new NgRights(defaultRuleset, rulesUrl, subjectGenerator, onErrorValue, $rootScope, $http);
    return window.ngRights;
  }];
});
