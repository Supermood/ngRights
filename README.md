# ngRights

ngRights is a library that allows you to easily add feature-toggling, RBAC and ABAC policies to your front-end.

You can find all the details [in the wiki](https://github.com/Supermood/ngRights/wiki) where you will find the [wiki sections](https://github.com/Supermood/ngRights/wiki#plan), how to [quickstart](https://github.com/Supermood/ngRights/wiki#quickstart), how to [contribute](https://github.com/Supermood/ngRights/wiki#contributing) and the project's [timeline](https://github.com/Supermood/ngRights/wiki#timeline).

The Quickstart section is repeated here for simplicity:
## Quickstart
#### 1. Install the library
``` bower install ngRights```
#### 2. Define rights
```javascript
app.config(['ngRightsProvider', function(ngRightsProvider) {
  ngRightsProvider.setRights({
    page: {
      post: {
        create: function(subject, page) { return page.ownerId == subject.id; }
      }
    }
  });
}]);
```
#### 3. Use ngRights
```html
<div ng-controller="PageController">
  <h1>{{ page.title }}</h1>
  <button ng-rights="pages.posts.create(page)">Create new post</button>
  <div ng-repeat="post in page.posts">
    {{ post.title }}
  </div>
</div>
```

