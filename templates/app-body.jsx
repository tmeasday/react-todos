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
    
    self.sub = Meteor.subscribe('publicLists')
    
    self.dep = Tracker.autorun(function() {
      self.setState({
        lists: self.props.collections.Lists.find().fetch()
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
      page = (!! pageProps.list) ? <RouteHandler {...pageProps}/> : <NotFound/>;
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
    userId: React.PropTypes.string.isRequired,
    lists: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    selectedList: React.PropTypes.object,
    createNewList: React.PropTypes.func.isRequired
  },
  
  render: function() {
    var items = this.props.lists.map(function(list) {
      var selected = this.props.selectedList && (this.props.selectedList._id === list._id);

      return <ListItem key={list._id} list={list} selected={selected} userId={this.props.userId}/>;
    }.bind(this));
    
    return (
      <section id="menu">
        <div className="list-todos">
          <a className="link-list-new" onClick={this.props.createNewList}><span className="icon-plus"></span>New List</a>
          {items}
        </div>
      </section>
    );
  }
});

var ListItem = React.createClass({
  propTypes: {
    userId: React.PropTypes.string.isRequired,
    list: React.PropTypes.object.isRequired
  },
  render: function() {
    var lockIcon = this.props.userId ? <span className="icon-lock"/> : '';
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