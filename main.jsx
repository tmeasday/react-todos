// TODO: connection timeout code
// TODO: server-side rendering

var collections = {
  Lists: Lists,
  Todos: Todos,
  Users: Meteor.users
}

if (Meteor.isClient) {
  Meteor.startup(function() {
    Router.run(routes, function (Handler) {
      // TODO: userId
      React.render(<Handler collections={collections} userId='123'/>, document.body);
    });
  });
}
