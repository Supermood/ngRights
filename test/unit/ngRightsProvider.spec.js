/* globals describe, beforeEach, it, inject, expect, assert */
/* jshint expr: true */
'use strict';

describe('ngRightsProvider', function() {

  var provider, ngRightsService;

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
          fourth: function (subject, object) { return true; },
          fifth: function (subject, object) { return object.ownerId === subject.id; }
        }
      }
    });
    provider.setSubjectGenerator(function() {
      return {
        id: 5
      };
    });
    provider.setOnErrorDisplay(false); // hide if there's an error evaluating a rule
  });

  beforeEach(inject(function(ngRights) {
    ngRightsService = ngRights;
  }));

  it('should transform rules into functions', function() {
    assert.isFunction(ngRightsService.ruleset.first.second, 'first.second should be a function');
    expect(ngRightsService.ruleset.first.any).to.not.exist;
    assert.isFunction(ngRightsService.ruleset.first.third.fourth, 'first.third.fourth should be a function');
    assert.isFunction(ngRightsService.ruleset.first.third.fifth, 'first.third.fourth should be a function');
  });

  it('should wrap the rules in functions correctly', function() {
    expect(ngRightsService.ruleset.first.second()).to.be.true;
    expect(ngRightsService.ruleset.first.third.fourth()).to.be.true;
    expect(ngRightsService.ruleset.first.third.fourth('test')).to.be.true;
    expect(ngRightsService.ruleset.first.third.fourth(123456)).to.be.true;
    // pass only the objects (not the subject) to the library
    expect(ngRightsService.ruleset.first.third.fifth({ ownerId: 5 })).to.be.true;
    expect(ngRightsService.ruleset.first.third.fifth({ ownerId: 3 })).to.be.false;
  });

  it('should allow to add / overwrite rules', function() {
    expect(ngRightsService.ruleset.first.second()).to.be.true;
    ngRightsService.addRules({ first: { second: false }, sixth: true });
    assert.isFunction(ngRightsService.ruleset.first.second, 'first.second should be a function');
    expect(ngRightsService.ruleset.first.second()).to.be.false;
    expect(ngRightsService.ruleset.sixth()).to.be.true;
    // reject wrong rules :
    expect(function() { ngRightsService.addRules({ seventh: 123456 }); }).to.throw(Error); // this is a bad rule
    expect(function() { ngRightsService.addRules({ seventh: 'test' }); }).to.throw(Error); // this is a bad rule
  });

  it('should allow ruleset redefinition', function() {
    expect(ngRightsService.ruleset.first.second()).to.be.true;
    ngRightsService.setRules({ first: { second: false }});
    assert.isFunction(ngRightsService.ruleset.first.second, 'first.second should be a function');
    expect(ngRightsService.ruleset.first.second()).to.be.false;
    expect(ngRightsService.ruleset.first.third).to.not.exist; // this rule is removed
  });


});
