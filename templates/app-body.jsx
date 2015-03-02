var RouteHandler = Router.RouteHandler,
  Link = Router.Link;


Body = React.createClass({
  mixins: [Router.State, Router.Navigation],
  
  propTypes: {
    user: React.PropTypes.object,
    collections: React.PropTypes.shape({
      Todos: React.PropTypes.instanceOf(Mongo.Collection),
      Lists: React.PropTypes.instanceOf(Mongo.Collection),
      Users: React.PropTypes.instanceOf(Mongo.Collection),
    }).isRequired
  },
  
  getInitialState: function() {
    return {
      lists: [],
      selectedListId: null
    };
  },
  
  goToFirstPublicList: function() {
    var publicLists = _.filter(this.state.lists, function(l) {
      return ! l.userId;
    });
    var firstListId = publicLists.length && publicLists[0]._id;

    if (firstListId) {
      this.transitionTo('listsShow', { 
        _id: firstListId 
      });
    }
  },

  chooseSelectedList: function() {
    var routeId = this.getParams()._id;

      // If we're on the home route, try to redirect to first public list
    if (this.isActive('home')) {
      this.goToFirstPublicList();
    } else if (this.isActive('listsShow') && routeId) {
      // If we're on listsShow and the route has an id, select the appropriate
      // list
      this.setState({
        selectedListId: routeId
      });
    }
  },
  
  componentWillMount: function() {
    // FIXME: use meteor-react package / this.getMeteorState / this.subs (?)
    Tracker.nonreactive(function() {
      this.sub = Meteor.subscribe('publicLists')
      
      this.dep = Tracker.autorun(function() {
        if (this.props.user)
          Meteor.subscribe('privateLists', this.props.user._id);
    
        this.setState({
          lists: this.props.collections.Lists.find().fetch()
        });
      
        this.chooseSelectedList();
      }.bind(this));
    }.bind(this));
  },
  
  componentWillUnmount: function() {
    this.dep.stop();
  },
  
  componentWillReceiveProps: function() {
    this.dep.invalidate();
    this.chooseSelectedList();
  },
  
  selectedList: function() {
    if (this.state.selectedListId)
      return this.props.collections.Lists.findOne(this.state.selectedListId);
  },
  
  createNewList: function() {
    var list = {name: this.props.collections.Lists.defaultName(), incompleteCount: 0};
    list._id = this.props.collections.Lists.insert(list);
    this.transitionTo('listsShow', list);
  },
  
  logout: function() {
    Meteor.logout();
    
    // if we are on a private list, we'll need to go to a public one
    var currentRoute = this.getRoutes().pop();
    if (currentRoute.name === 'listsShow' && this.selectedList().userId) {
      this.goToFirstPublicList();
    }
  },
  
  render: function() {
    var selectedList = this.selectedList();
    var pageProps = {
      collections: this.props.collections,
      user: this.props.user,
      list: selectedList
    };
    
    var page;
    if (this.sub.ready) {
      if (this.isActive('listsShow') && ! pageProps.list) {
        page = <NotFound/>;
      } else {
        page = <RouteHandler {...pageProps}/>; 
      }
    } else {
      page = <Loading/>;
    }
    
    return (
      // TODO: menu open / cordova 
      <div id="container">
        <Menu user={this.props.user} lists={this.state.lists} 
          selectedList={selectedList} 
          createNewList={this.createNewList}
          logout={this.logout}/>
        <div id="content-container">
          {page}
        </div>
      </div>
    );
  }
});

var Menu = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    lists: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    selectedList: React.PropTypes.object,
    createNewList: React.PropTypes.func.isRequired,
    logout: React.PropTypes.func.isRequired
  },
  
  render: function() {
    var items = this.props.lists.map(function(list) {
      var selected = this.props.selectedList && (this.props.selectedList._id === list._id);

      return <ListItem key={list._id} list={list} selected={selected}/>;
    }.bind(this));
    
    return (
      <section id="menu">
        <UserState user={this.props.user} logout={this.props.logout}/>
        <div className="list-todos">
          <a className="link-list-new" onClick={this.props.createNewList}><span className="icon-plus"></span>New List</a>
          {items}
        </div>
      </section>
    );
  }
});

var UserState = React.createClass({
  propTypes: {
    user: React.PropTypes.object
  },
  
  getInitialState: function() {
    return {
      open: false
    }
  },
  
  toggleOpen: function() {
    this.setState({open: ! this.state.open});
  },
  
  render: function() {
    return (this.props.user ? this.renderLoggedIn() : this.renderLoggedOut());
  },
  
  renderLoggedIn: function() {
    var email = this.props.user.emails[0].address || '';
    var emailLocalPart = email.substring(0, email.indexOf('@'));
    
    return (
      <div className="btns-group-vertical">
        <a className="btn-secondary" onClick={this.toggleOpen}>
          <span className={this.state.open ? 'icon-arrow-up' : 'icon-arrow-down'}></span>
          {emailLocalPart}
        </a>
        {this.state.open && <a className="btn-secondary" onClick={this.props.logout}>Logout</a>}
      </div>
    )
  },
  
  renderLoggedOut: function() {
    return (
      <div className="btns-group">
        <Link to="signin" className="btn-secondary">Sign In</Link>
        <Link to="join" className="btn-secondary">Join</Link>
      </div>
    );
  }
});

var ListItem = React.createClass({
  propTypes: {
    list: React.PropTypes.object.isRequired
  },
  render: function() {
    var lockIcon = this.props.list.userId ? <span className="icon-lock"/> : '';
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

var Loading = React.createClass({
  render: function() {
    return <img src="/img/logo-todos.svg" className="loading-app" />;
  }
});

var NotFound = React.createClass({
  render: function() {
    return (
      <div className="page not-found">
        <MenuNav/>

        <div className="content-scrollable">
          <div className="wrapper-message">
            <div className="title-message">Page not found</div>
          </div>
        </div>
      </div>
    );
  }
});