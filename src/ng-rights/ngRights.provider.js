angular.module('ngRightsProvider', []).provider('ngRights', function() {

  function NgRights(ruleset, subjectGenerator, onErrorValue, $rootScope) {
    this.ruleset = {};
    this.defaultRuleset = angular.copy(ruleset);
    this.subjectGenerator = subjectGenerator;
    this.rootScope = $rootScope;
    this.onErrorValue = onErrorValue;
    this.ruleset = transformRules(this.defaultRuleset, subjectGenerator);
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

  function transformRules(ruleset, subjectGenerator) {
    var transformedRules = {};
    for(var i = 0; i < Object.keys(ruleset).length; i++) {
      var key = Object.keys(ruleset)[i];
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
      } else {
        throw new Error('Wrong rule definition, rules must be objects, functions or booleans.');
      }
    }
    return transformedRules;
  }

  var defaultRuleset = {};
  var subjectGenerator = null;
  var onErrorValue = false;

  this.setRules = function (ruleset) {
    defaultRuleset = ruleset;
  };
  this.setSubjectGenerator = function (generator) {
    subjectGenerator = generator;
  };
  this.setOnErrorDisplay = function (value) {
    onErrorValue = value;
  };

  this.$get = ['$rootScope', function($rootScope) {
    window.ngRights = new NgRights(defaultRuleset, subjectGenerator, onErrorValue, $rootScope);
    return window.ngRights;
  }];
});
