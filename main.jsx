// TODO: connection timeout code
// TODO: server-side rendering

if (Meteor.isClient) {
  Meteor.startup(function() {
    Router.run(routes, function (Handler) {
      React.render(<Handler Lists={Lists} Todos={Todos}/>, document.body);
    });
  });
}
