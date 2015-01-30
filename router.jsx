var Route = Router.Route,
  DefaultRoute = Router.DefaultRoute,
  NotFoundRoute = Router.NotFoundRoute;

routes = (
  <Route name="appBody" path="/" handler={Body}>
    <Route name="listsShow" path='/lists/:_id' handler={ListsShow}/>
    <DefaultRoute name="home" handler={Home}/>
    
    <Route name="join" handler={Join}/>
    <Route name="signin" handler={Signin}/>
    <NotFoundRoute handler={NotFound}/>
  </Route>
);