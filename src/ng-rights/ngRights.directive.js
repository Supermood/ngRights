angular.module('ngRightsDirective', []).directive('ngRights', ['$parse', 'ngRights', function($parse, ngRights) {
  return {
    restrict: 'A',
    multiElement: true,
    link: function(scope, element, attributes) {
      scope.ngRightsShown = false;
      updateDisplay();

      function computeNgRights() {
        var expression = attributes.ngRights;
        if (expression.indexOf('(') === -1) {
          expression += '()';
        }
        scope.ngRightsExpression = expression;
        try {
          scope.ngRightsShown = scope.$eval($parse(scope.ngRightsExpression), ngRights.ruleset); // magic line !
        } catch(e) {
          // if we cannot compute it, it means we should hide the element
          scope.ngRightsShown = false;
        }
        return scope.ngRightsShown;
      }

      function updateDisplay() {
        console.log("updated ngRights");
        element.css('display', scope.ngRightsShown ? 'initial' : 'none');
      }

      scope.$watch(computeNgRights, updateDisplay);
    }
  }
}]);
