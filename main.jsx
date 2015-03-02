// TODO: connection timeout code
// TODO: server-side rendering

var collections = {
  Lists: Lists,
  Todos: Todos,
  Users: Meteor.users
}

if (Meteor.isClient) {
  Meteor.startup(function() {
    Router.run(routes, Router.HistoryLocation, function (Handler, state) {
      Tracker.autorun(function() {
        var html = <Handler collections={collections} user={Meteor.user()}/>;
        React.render(html, document.body);
      });
    });
  });
}
