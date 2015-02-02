ListsShow = React.createClass({
  mixins: [Router.State],
  
  propTypes: {
    // FIXME: should we just be passing the user around?
    userId: React.PropTypes.string.isRequired,
    list: React.PropTypes.object, // May still be loading (FIXME: ?)
    // FIXME: is it good enough to just match on object for the collections?
    collections: React.PropTypes.object.isRequired
  },
  
  getInitialState: function() {
    return {
      todos: [],
      editingTodoId: null
    };
  },

  componentWillMount: function() {
    // FIXME: we need to wrap in non-reactive in case this component was
    //   created as a side effect of a change in another autorun
    //   [in this case, loading->listsShow triggered by route sub going ready]
    //
    // Otherwise if the outer computation [i.e. in body] invalidates,
    //   Tracker will kill this comp, assuming that when outer re-runs it'll
    //   re-establish it. However that's not how react work. Instead
    //   react calls `componentWillReceiveProps`. So another alternative
    //   is to re-setup the autorun there. That might make sense and 
    //   answer the NOTE below.
    //
    // We should either do this always, or call setState in afterFlush.
    Tracker.nonreactive(function() {
      this.dep = Tracker.autorun(function() {
        // FIXME: this sub doesn't start until the lists sub is ready.
        //   this is kind of inefficient (we could start it earlier)
        //   as all we need is the listId. It's an argument against template-level
        //   subs I guess. Do we need to solve it?
        this.sub = Meteor.subscribe('todos', this.props.list._id);

        this.setState({
          todos: this.props.collections.Todos.find({listId: this.props.list._id}).fetch()
        });
      }.bind(this));
    }.bind(this));
  },
  
  // NOTE: Is this the right pattern for re-subscribing when props change?
  componentWillReceiveProps: function(nextProps) {
    if (this.props.list._id !== nextProps.list._id) {
      this.dep.invalidate();
    }
  },
  
  componentWillUnmount: function() {
    this.sub.stop();
    this.dep.stop();
  },
  
  makeTodoEditing: function(todo, editing) {
    this.setState({
      editingTodoId: editing ? todo._id : null
    });
  },
  
  render: function() {
    var self = this;
    var todosOrLoading;
    
    if (self.sub.ready()) {
      if (self.state.todos.length) {
        todosOrLoading = self.state.todos.map(function(todo) {
          var editing = (todo._id === self.state.editingTodoId);
          return <TodoItem collections={self.props.collections} todo={todo} 
            editing={editing} key={todo._id} makeEditing={self.makeTodoEditing.bind(self, todo)}/>;
        });
      } else {
        todosOrLoading = (
          <div className="wrapper-message">
            <div className="title-message">No tasks here</div>
            <div className="subtitle-message">Add new tasks using the field above</div>
          </div>
        );
      }
    } else {
      todosOrLoading = (
        <div className="wrapper-message">
          <div className="title-message">Loading tasks...</div>
        </div>
      );
    }
    
    return (
      <div className="page lists-show">
        <ListsShowEditor {...this.props}/>
        <div className="content-scrollable list-items">
          {todosOrLoading}
        </div>
      </div>
    );
  }
});

var ListsShowEditor = React.createClass({
  mixins: [Router.Navigation],
  
  propTypes: {
    userId: React.PropTypes.string.isRequired,
    list: React.PropTypes.object.isRequired,
    collections: React.PropTypes.object.isRequired
  },
  
  getInitialState: function() {
    return {
      editing: false
    };
  },
  
  focusNewTodo: function() {
    this.refs.newTodo.getDOMNode().focus();
  },
  
  createNewTodo: function(event) {
    event.preventDefault();
    
    var input = this.refs.newTodo.getDOMNode();
    if (! input.value)
      return;
    
    this.props.collections.Todos.insert({
      listId: this.props.list._id,
      text: input.value,
      checked: false,
      createdAt: new Date()
    });
    this.props.collections.Lists.update(this.props.list._id, {$inc: {incompleteCount: 1}});
    input.value = '';
  },
  
  editList: function(bool) {
    this.setState({
      editing: bool
    });
  },
  
  deleteList: function() {
    var list = this.props.list;
    
    // ensure the last public list cannot be deleted.
    if (! list.userId && 
      this.props.collections.Lists.find({userId: {$exists: false}}).count() === 1) {
      return alert("Sorry, you cannot delete the final public list!");
    }
  
    var message = "Are you sure you want to delete the list " + list.name + "?";
    if (confirm(message)) {
      // we must remove each item individually from the client
      this.props.collections.Todos.find({listId: list._id}).forEach(function(todo) {
        this.props.collections.Todos.remove(todo._id);
      }.bind(this));
      this.props.collections.Lists.remove(list._id);

      this.transitionTo('home'); 
    }
  },
  
  toggleListPrivacy: function() {
    // TODO
    // if (! Meteor.user()) {
    //   return alert("Please sign in or create an account to make private lists.");
    // }
    //
    // if (list.userId) {
    //   Lists.update(list._id, {$unset: {userId: true}});
    // } else {
    //   // ensure the last public list cannot be made private
    //   if (Lists.find({userId: {$exists: false}}).count() === 1) {
    //     return alert("Sorry, you cannot make the final public list private!");
    //   }
    //
    //   Lists.update(list._id, {$set: {userId: Meteor.userId()}});
    // }
  },
  
  render: function() {
    var title;
    if (this.state.editing) {
      title = <ListsShowTitleEditor list={this.props.list} 
        collections={this.props.collections} editList={this.editList}/>;
    } else {
      title = (
        <div>
          <MenuNav/>
          <ListsShowTitle list={this.props.list} editList={this.editList}/>
          <ListsShowMenu list={this.props.list} editList={this.editList}
            deleteList={this.deleteList}  toggleListPrivacy={this.toggleListPrivacy} />
        </div>
      );
    }
    
    return (
      <nav classNameName="js-title-nav">
        {title}

        <form className="todo-new input-symbol" onSubmit={this.createNewTodo}>
          <input type="text" placeholder="Type to add new tasks" ref="newTodo"/>
          <span className="icon-add" onClick={this.focusNewTodo}></span>
        </form>
      </nav>
    )
  }
});

var ListsShowTitleEditor = React.createClass({
  propTypes: {
    list: React.PropTypes.object.isRequired,
    editList: React.PropTypes.func.isRequired,
    collections: React.PropTypes.object.isRequired
  },  
  getInitialState: function() {
    return {
      name: this.props.list.name
    };
  },
  handleChange: function(event) {
    this.setState({name: event.target.value});
  },
  // FIXME: this doesn't work because the blur event fires before the click.
  cancelChanges: function(event) {
    event.preventDefault();
    this.props.editList(false);
  },
  saveList: function() {
    if (! this.cancelled) {
      this.props.collections.Lists.update(this.props.list._id, {$set: {name: this.state.name}});
      this.props.editList(false);
    }
  },
  render: function() {
    return (
      <form className="list-edit-form" onSubmit={this.saveList}>
        <input type="text" name="name" value={this.state.name} onChange={this.handleChange} onBlur={this.saveList}/>
        <div className="nav-group right">
          <a className="nav-item" onClick={this.cancelChanges}><span className="icon-close" title="Cancel"></span></a>
        </div>
      </form>
    )
  }
});

var ListsShowTitle = React.createClass({
  propTypes: {
    list: React.PropTypes.object.isRequired,
    editList: React.PropTypes.func.isRequired
  },
  handleClick: function() {
    this.props.editList(true);
  },
  render: function() {
    return (
      <h1 className="title-page" onClick={this.handleClick}>
        <span className="title-wrapper">{this.props.list.name}</span> 
        <span className="count-list">{this.props.list.incompleteCount}</span>
      </h1>
    );
  }
});

var ListsShowMenu = React.createClass({
  propTypes: {
    list: React.PropTypes.object.isRequired,
    editList: React.PropTypes.func.isRequired,
    deleteList: React.PropTypes.func.isRequired,
    toggleListPrivacy: React.PropTypes.func.isRequired
  },
  handleSelectChange: function(event) {
    if (event.target.value === 'edit') {
      this.props.editList(true);
    } else if (event.target.value === 'delete') {
      this.props.deleteList();
    } else if (event.target.value === 'private') {
      this.props.toggleListPrivacy(true);
    } else {
      this.props.toggleListPrivacy(false);
    }
  },
  render: function() {
    return (
      <div className="nav-group right">
        <div className="nav-item options-mobile">
          <select className="list-edit" onChange={this.handleSelectChange}>
            <option disabled>Select an action</option>
            {this.props.list.userId ?
              <option value="public">Make Public</option>
            : <option value="private">Make Private</option>
            }
            <option value="delete">Delete</option>
          </select>
          <span className="icon-cog"></span>
        </div>
        <div className="options-web">
          <a className="js-toggle-list-privacy nav-item">
            {this.props.list.userId ?
              <span className="icon-lock" title="Make list public"></span>
            : <span className="icon-unlock" title="Make list private"></span>
            }
          </a>

          <a className="nav-item" onClick={this.props.deleteList}>
            <span className="icon-trash" title="Delete list"></span>
          </a>
        </div>
      </div>
    )
  }
});