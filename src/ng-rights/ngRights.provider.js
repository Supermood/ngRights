angular.module('ngRightsProvider', []).provider('ngRights', function() {

  function NgRights(ruleset, subjectGenerator) {
    this.ruleset = transformRules(ruleset, subjectGenerator);
    this.subjectGenerator = subjectGenerator;
    console.log('ngRights rules are ', this.ruleset);
  }
  NgRights.prototype.setRules = function (rules) {
    this.ruleset = transformRules(rules, this.subjectGenerator);
    console.log('ruleset is ', this.ruleset);
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

  var defaultRuleset = {};
  var subjectGenerator = null;

  this.setRules = function (ruleset) {
    defaultRuleset = ruleset;
  };
  this.setSubjectGenerator = function (generator) {
    subjectGenerator = generator;
  };

  this.$get = function() {
    console.log('default rules are ', defaultRuleset);
    return new NgRights(defaultRuleset, subjectGenerator);
  };
});
