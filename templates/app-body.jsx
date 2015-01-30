var RouteHandler = Router.RouteHandler,
  Link = Router.Link;

ListItem = React.createClass({
  render: function() {
    var lockIcon = this.props.state.userId ? <span className="icon-lock"/> : '';
    var incompleteCount = '';
    if (this.props.list.incompleteCount)
      incompleteCount = <span className="count-list">{this.props.list.incompleteCount}</span>;

    var classes = React.addons.classSet({
      'list-todo': true,
      'active': this.props.selected
    });
    
    return (
      <Link to="listsShow" params={this.props.list} className={classes} title={this.props.list.name}>
        {lockIcon}
        {incompleteCount}
        {this.props.list.name}
      </Link>
    );
  }
});


Menu = React.createClass({
  render: function() {
    // XXX: not a fan of .bind(this) rather than self. Shall we just use ES6?
    var self = this;
    
    var items = self.props.state.lists.map(function(list) {
      var selected = self.props.state.selectedListId === list._id;

      return <ListItem {...self.props} key={list._id} list={list} selected={selected}/>;
    });
    
    return (
      <section id="menu">
        <div className="list-todos">
          <a className="js-new-list link-list-new"><span className="icon-plus"></span>New List</a>
          {items}
        </div>
      </section>
    );
  }
});

Body = React.createClass({
  mixins: [Router.State, Router.Navigation],
  
  propTypes: {
    lists: React.PropTypes.instanceOf(Mongo.Collection).isRequired,
    todos: React.PropTypes.instanceOf(Mongo.Collection).isRequired
  },
  
  getInitialState: function() {
    return {
      lists: [],
      selectedListId: null,
      userId: null, // TODO
    };
  },
  
  chooseSelectedList: function() {
    var firstListId = this.state.lists.length && this.state.lists[0]._id;
    var routeId = this.getParams()._id;

    if (this.isActive('home') && firstListId) {
      // If we're on the home route and finally have a firstListId, redirect
      // to listsShow
      this.transitionTo('listsShow', { 
        _id: firstListId 
      });
    } else if (this.isActive('listsShow') && routeId) {
      // If we're on listsShow and the route has an id, select the appropriate
      // list
      this.setState({
        selectedListId: routeId
      });
    }
  },
  
  componentWillMount: function() {
    var self = this;
    
    Meteor.subscribe('publicLists')
    
    self.dep = Tracker.autorun(function() {
      self.setState({
        lists: self.props.lists.find().fetch()
      });
      
      self.chooseSelectedList();
    });
  },
  
  componentWillUnmount: function() {
    this.dep.stop();
  },
  
  componentWillReceiveProps: function() {
    this.chooseSelectedList();
  },
  
  render: function() {
    return (
      // XXX menu open / cordova 
      <div id="container">
        <Menu state={this.state}/>
        <div id="content-container">
          <RouteHandler state={this.state} todos={this.props.todos}/>
        </div>
      </div>
    );
  }
});

