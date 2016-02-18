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
       * This function is called every $digest and computes if the element to which
       * this directive is bound should be displayed.
       * If there is an error while computing this, it will display the element based
       * on the default onErrorValue that can be setup using the ngRightsProvider.
       */
      function computeNgRights() {
        var ngRightsShown;
        try {
          parseExpression(attributes.ngRights);
          ngRightsShown = ngRights.hasRight(identifiers, scope.$eval($parse(parameter)));
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
