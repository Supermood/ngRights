/* globals describe, beforeEach, it, inject, expect */
/* jshint expr: true */
'use strict';

describe('ngRightsDirective', function() {
  var element, scope, ngRightsService, compile;

  var provider;

  beforeEach(function () {
      // Initialize the service provider by injecting it to a fake module's config block
      angular.module('testApp', ['ngRights'])
      .config(function (ngRightsProvider) {
          provider = ngRightsProvider;
      });
      // Initialize myApp injector
      module('ngRightsProvider', 'testApp');

      // Kickstart the injectors previously registered with calls to angular.mock.module
      inject(function () {});
  });

  beforeEach(function() {
    provider.setRules({
      first: {
        second: true,
        third: {
          fourth: function (subject, object) { return subject.id === object.ownerId; },
          fifth: function (subject, object) { return 12; }
        },
        sixth: false,
      }
    });
    provider.setSubjectGenerator(function() {
      return {
        id: 5
      };
    });
    provider.setOnErrorDisplay(false); // hide if there's an error evaluating a rule
  });

  beforeEach(inject(function($rootScope, $compile, ngRights) {
    scope = $rootScope.$new();
    ngRightsService = ngRights;
    compile = $compile;
    scope.$digest();
  }));

  it('should be able to find the ruleset', function() {
    expect(ngRightsService.ruleset).to.exist;
  });

  it('should update elements display when the rule is a boolean', function() {
    element = compile('<div ng-rights="first.second"></div>')(scope);
    scope.$digest();
    expect(element.css('display')).to.equal('inherit');

    element = compile('<div ng-rights="first.sixth"></div>')(scope);
    scope.$digest();
    expect(element.css('display')).to.equal('none');
  });

  it('should update elements display when there is a function call', function() {
    scope.testObject = { ownerId : 3 };
    element = compile('<div ng-rights="first.third.fourth(testObject)"></div>')(scope);
    scope.$digest();
    expect(element.css('display')).to.equal('none');

    scope.testObject.ownerId = 5;
    scope.$digest();
    expect(element.css('display')).to.equal('inherit');
  });

  it('should use the default on error display when the rule cannot be understood', function() {
    element = compile('<div ng-rights="first.nonexistent"></div>')(scope);
    scope.$digest();
    expect(element.css('display')).to.equal('none');

    element = compile('<div ng-rights="first.third.fifth"></div>')(scope);
    scope.$digest();
    expect(element.css('display')).to.equal('none'); // because setOnErrorDisplay is false

    element = compile('<div ng-rights="first.third(+--...++\\)"></div>')(scope);
    scope.$digest();
    expect(element.css('display')).to.equal('none'); // because setOnErrorDisplay is false
  });


  it('should update elements when refresh is called', function() {
    element = compile('<div ng-rights="first.third.fifth"></div>')(scope);
    expect(element.css('display')).to.equal('none');
    ngRightsService.addRules({ first: { third: { fifth: function(subject, object) { return true; }}}});
    ngRightsService.refresh();
    expect(element.css('display')).to.equal('inherit');
  });

});
