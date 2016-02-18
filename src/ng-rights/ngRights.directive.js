angular.module('ngRightsDirective', []).directive('ngRights', ['$parse', 'ngRights', function($parse, ngRights) {
  return {
    restrict: 'A',
    multiElement: true,
    link: function(scope, element, attributes) {
      element.css('display', 'none');

      var identifiers = [], parameter = '';

      /**
       * ParseExpression takes as input an expression and modifies the local identifiers
       * and parameters accordingly. The expression must match the regex:
       * /([a-zA-Z1-9_$]+\.)*([a-zA-Z1-9_$]+)\((.*)\)/g : https://regex101.com/r/zA9bM0/1
       * Which can have multiple forms:
       *   someting.nested.like.objects
       *   someting.nested.like.objects()
       *   someting.nested.like.objects(expressionArgument)
       *
       * @param  {string} expr The expression to parse
       *
       */
      function parseExpression(expr) {
        //  RegExp :                    identifier     dot OR (anything)
        //  Matches an identifier with a dot, or a function call :
        //    [example.][nested.][rule.][last(parameters)]
        var identifier = new RegExp(/([a-zA-Z1-9_$]+)(?:(\.)|\((.*)\))?/g),
            results = null;
        // reset identifiers and parameters in case this function is called many times
        identifiers = [];
        parameter = '';
        // match all identifiers : "id1.id2.id3.id4"
        while ((results = identifier.exec(expr)) !== null) {
          identifiers.push(results[1]);
          if (results[2] !== '.') { // if there's no dot, it means we're matching the parenthesis
            parameter = results[3] || '';
            break;
          }
        }
      }

      /**
       * GetRule uses the local identifiers to fetch the rule in the ngRights ruleset
       * rules must be defined prior to this function call.
       *
       * @return {function} If the rule you are referring to exists, it will return
       *                    that rule (a function). Otherwise, it will return null.
       */
      function getRule() {
        var currentSet = ngRights.ruleset;
        // using the identifier, go through sets
        for (var i = 0; i < identifiers.length; i++) {
          if (currentSet.hasOwnProperty(identifiers[i])) {
            currentSet = currentSet[identifiers[i]];
          } else {
            // console.error('The rule you are looking for wasn\'t found');
            return null;
          }
        }
        return currentSet;
      }

      /**
       * This function is called every $digest and computes if the element to which
       * this directive is bound should be displayed.
       * If there is an error while computing this, it will display the element based
       * on the default onErrorValue that can be setup using the ngRightsProvider.
       */
      function computeNgRights() {
        var ngRightsShown;
        try {
          parseExpression(attributes.ngRights);
          var rule = getRule();
          if (rule) {
            ngRightsShown = rule(scope.$eval($parse(parameter))); // "not so magic anymore" line :(
            if (typeof ngRightsShown !== 'boolean') {
              ngRightsShown = ngRights.onErrorValue;
            }
          } else {
            ngRightsShown = ngRights.onErrorValue;
          }
        } catch(e) {
          // if we cannot compute it, it means we should hide the element
          ngRightsShown = ngRights.onErrorValue;
        }
        element.css('display', ngRightsShown ? 'inherit' : 'none');
      }

      scope.$on('ngRights-update', computeNgRights);

      scope.$watch(computeNgRights);
    }
  };
}]);
