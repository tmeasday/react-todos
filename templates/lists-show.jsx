ListsShow = React.createClass({
  mixins: [Router.State],
  
  propTypes: {
    state: React.PropTypes.object.isRequired,
    todos: React.PropTypes.instanceOf(Mongo.Collection).isRequired
  },
  
  getInitialState: function() {
    return {
      todos: [],
      selectedTodoId: null
    };
  },

  componentWillMount: function() {
    var self = this;
    
    // NOTE: could put this in the dep and it'd auto stop when the dep did..?
    var listId = self.props.state.selectedListId;
    self.sub = Meteor.subscribe('todos', listId);
    
    self.dep = Tracker.autorun(function() {
      console.log(self.props, self.state)
      self.setState({
        todos: self.props.todos.find({listId: listId}).fetch()
      });
    });
  },
  
  componentWillUnmount: function() {
    this.sub.stop();
    this.dep.stop();
  },

  render: function() {
    var self = this;
    var todosOrLoading;
    
    if (self.sub.ready()) {
      if (self.state.todos.length) {
        todosOrLoading = self.state.todos.map(function(todo) {
          var selected = todo._id === self.state.selectedTodoId;
          return <TodoItem todo={todo} selected={selected}/>;
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
        <div className="content-scrollable list-items">
          {todosOrLoading}
        </div>
      </div>
    );
  }
});