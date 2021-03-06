angular.module('ngRightsProvider', []).provider('ngRights', function() {

  function NgRights(ruleset, subjectGenerator, onErrorValue, $rootScope) {
    this.ruleset = {};
    this.defaultRuleset = angular.copy(ruleset);
    this.subjectGenerator = subjectGenerator;
    this.rootScope = $rootScope;
    this.onErrorValue = onErrorValue;
    this.ruleset = transformRules(this.defaultRuleset, subjectGenerator);
  }

  /**
   * SetRules allows you to reset the rules and specify the new rules.
   * @param {ruleset} rules The ruleset that will replace old rules.
   */
  NgRights.prototype.setRules = function (rules) {
    this.ruleset = transformRules(rules, this.subjectGenerator, this.onErrorValue);
    this.rootScope.$broadcast('ngRights-update');
  };

  /**
   * AddRules extends the current ruleset with the specified rules.
   * You can use this to re-define existing rules, as new rules having an already
   * used name will override the old ones.
   *
   * @param {ruleset} rules The ruleset that will be added to the ruleset.
   */
  NgRights.prototype.addRules = function (rules) {
    angular.merge(this.ruleset, transformRules(rules, this.subjectGenerator));
    this.rootScope.$broadcast('ngRights-update');
  };

  /**
   * GetRule uses the given identifiers to fetch the rule in the ngRights ruleset
   * rules must be defined prior to this function call.
   *
   * @param {string|Array} identifiers Array of strings or dot-separated string
   *                                   that represents the rule name.
   * @return {function} If the rule you are referring to exists, it will return
   *                    that rule (a function). Otherwise, it will throw an error.
   */
  NgRights.prototype.getRule = function (identifiers) {
    if (typeof identifiers === 'string') {
      identifiers = identifiers.split('.');
    }
    var currentSet = this.ruleset;
    // using the identifier, go through sets
    for (var i = 0; i < identifiers.length; i++) {
      if (currentSet.hasOwnProperty(identifiers[i])) {
        currentSet = currentSet[identifiers[i]];
      } else {
        throw new Error('The rule you are looking for wasn\'t found');
      }
    }
    return currentSet;
  };

  /**
   * HasRight calls the specified right function on the given object and evaluates
   * the result. If the result is not computable, it will return the onErrorValue.
   *
   * @param  {string}  right  The name of the right to check. It can be a dot
   *                          separated string or an Array of strings.
   * @param  {object}  object The object that will be fed to the rule, if found.
   * @return {Boolean}        True if the right is accepted, false otherwise
   */
  NgRights.prototype.hasRight = function (right, object) {
    var result = this.onErrorValue;
    try {
      var rule = this.getRule(right);
      result = rule(object); // rule evaluation takes place here
      if (typeof result !== 'boolean') {
        result = this.onErrorValue;
      }
    } catch(e) {
      // if we cannot evaluate it, it means we should hide the element
      result = this.onErrorValue;
    }
    return result;
  };

  /**
   * refresh forces the re-computation of all elements using the ngRights directive.
   */
  NgRights.prototype.refresh = function () {
    this.rootScope.$broadcast('ngRights-update');
  };

  /**
   * transformRules takes a ruleset as input and a subject generator (function)
   * it converts it to a ruleset where all rules are functions that take either
   * zero or 1 parameter (the object).
   *
   * @param  {ruleset}  ruleset          The ruleset to transform
   * @param  {function} subjectGenerator The function that generates the subject
   * @return {ruleset}                   A ruleset containing only functions
   */
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

  // default provider values
  var defaultRuleset = {};
  var subjectGenerator = null;
  var onErrorValue = false; // by default, we do not display elements when we can't evaluate rules

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
