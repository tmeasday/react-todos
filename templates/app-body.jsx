var RouteHandler = Router.RouteHandler,
  Link = Router.Link;


Body = React.createClass({
  mixins: [Router.State, Router.Navigation],
  
  propTypes: {
    userId: React.PropTypes.string,
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
    
    
    Tracker.nonreactive(function() {
      self.sub = Meteor.subscribe('publicLists')
    
      self.dep = Tracker.autorun(function() {
        self.setState({
          lists: self.props.collections.Lists.find().fetch()
        });
      
        self.chooseSelectedList();
      });
    });
  },
  
  componentWillUnmount: function() {
    this.dep.stop();
  },
  
  componentWillReceiveProps: function() {
    this.chooseSelectedList();
  },
  
  createNewList: function() {
    var list = {name: this.props.collections.Lists.defaultName(), incompleteCount: 0};
    list._id = this.props.collections.Lists.insert(list);
    this.transitionTo('listsShow', list);
  },
  
  render: function() {
    var selectedList;
    if (this.state.selectedListId)
      selectedList = this.props.collections.Lists.findOne(this.state.selectedListId);
    
    var pageProps = {
      collections: this.props.collections,
      userId: this.props.userId,
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
        <Menu userId={this.props.userId} lists={this.state.lists} selectedList={selectedList} createNewList={this.createNewList}/>
        <div id="content-container">
          {page}
        </div>
      </div>
    );
  }
});

var Menu = React.createClass({
  propTypes: {
    userId: React.PropTypes.string,
    lists: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    selectedList: React.PropTypes.object,
    createNewList: React.PropTypes.func.isRequired
  },
  
  render: function() {
    var items = this.props.lists.map(function(list) {
      var selected = this.props.selectedList && (this.props.selectedList._id === list._id);

      return <ListItem key={list._id} list={list} selected={selected}/>;
    }.bind(this));
    
    return (
      <section id="menu">
        <UserState userId={this.props.userId}/>
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
    userId: React.PropTypes.string
  },
  
  getInitialState: function() {
    return {
      open: false
    }
  },
  
  toggleOpen: function() {
    this.setState({open: ! this.state.open});
  },
  
  logout: function() {
    Meteor.logout();
    
    // TODO: should logout be a prop passed down from the body? 
    //   is there a more appropriate way to send this kind of "application"
    //   message? perhaps a flux-like model?
    
    // if we are on a private list, we'll need to go to a public one
    // var current = Router.current();
    // if (current.route.name === 'listsShow' && current.data().userId) {
    //   Router.go('listsShow', Lists.findOne({userId: {$exists: false}}));
    // }
  },
  
  render: function() {
    return (this.props.userId ? this.renderLoggedIn() : this.renderLoggedOut());
  },
  
  renderLoggedIn: function() {
    // XXX: Don't access Meteor.user() here
    var email = Meteor.user() && Meteor.user().emails[0].address || '';
    var emailLocalPart = email.substring(0, email.indexOf('@'));
    
    return (
      <div className="btns-group-vertical">
        <a className="btn-secondary" onClick={this.toggleOpen}>
          <span className={this.state.open ? 'icon-arrow-up' : 'icon-arrow-down'}></span>
          {emailLocalPart}
        </a>
        {this.state.open && <a className="btn-secondary" onClick={this.logout}>Logout</a>}
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