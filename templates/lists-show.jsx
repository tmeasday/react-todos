ListsShow = React.createClass({
  mixins: [Router.State],
  
  propTypes: {
    state: React.PropTypes.object.isRequired,
    todos: React.PropTypes.instanceOf(Mongo.Collection).isRequired
  },
  
  getInitialState: function() {
    return {
      todos: [],
      editingTodoId: null
    };
  },

  componentWillMount: function() {
    var self = this;
    
    // NOTE: could put this in the dep and it'd auto stop when the dep did..?
    var listId = self.props.state.selectedListId;
    self.sub = Meteor.subscribe('todos', listId);
    
    self.dep = Tracker.autorun(function() {
      self.setState({
        todos: self.props.todos.find({listId: listId}).fetch()
      });
    });
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
          return <TodoItem todos={self.props.todos} todo={todo} 
            editing={editing} makeEditing={self.makeTodoEditing.bind(self, todo)}/>;
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