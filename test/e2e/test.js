
angular.module('testApp', ['ngRights']).config(['ngRightsProvider', function (ngRightsProvider) {
  ngRightsProvider.setRules({
    pages: {
      title: {
        display: function (subject, object) { return true; }
      },
      posts: {
        create: function (subject, object) { return object.ownerId === subject.id; },
        remove: function (subject, object) { return object.ownerId === subject.id; }
      },
    }
  });
  //ngRightsProvider.setRulesUrl('async.js');
  ngRightsProvider.setOnErrorDisplay(true);
  ngRightsProvider.setSubjectGenerator(function() {
    return {
      name: 'Bob',
      email: 'demo@example.com',
      id: 3
    };
  });
}]);
angular.module('testApp').controller('PagesController', ['ngRights', '$scope', function (ngRights, $scope) {
  $scope.pages = [{
    title: 'Presidents of the world',
    ownerId: 2,
    owner: 'Alice',
    posts: [{
      content: 'This is my first post',
      ownerId: 2,
      owner: 'Alice'
    }, {
      content: 'Some text lays there',
      ownerId: 3,
      owner: 'Bob'
    }]
  }, {
    title: 'Evolutions of the Internet',
    owner: 'Bob',
    ownerId: 3,
    posts: [{
      content: 'In the past decade, Internet has changed the way we live...',
      ownerId: 2,
      owner: 'Alice'
    }]
  }];
  $scope.openPage = function(page) {
    $scope.openedPage = page;
  };
  $scope.addPost = function(text) {
    $scope.openedPage.posts.push({ content: text, ownerId: 3, owner: 'Bob' });
  };
  $scope.removePost = function(key) {
    $scope.openedPage.posts.splice(key, 1);
  }
}]);
