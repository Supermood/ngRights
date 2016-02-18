'use strict';

describe('ngRights', function() {

  var module;
  var dependencies;
  dependencies = [];

  var hasModule = function(module) {
    return dependencies.indexOf(module) >= 0;
  };

  beforeEach(function() {
    // Get module
    module = angular.module('ngRights');
    dependencies = module.requires;
  });

  it('should load directive and provider', function() {
    expect(hasModule('ngRightsDirective')).to.be.ok;
    expect(hasModule('ngRightsProvider')).to.be.ok;
  });

});
