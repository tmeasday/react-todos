TodoItem = React.createClass({
  propTypes: {
    collections: React.PropTypes.object.isRequired,
    todo: React.PropTypes.object.isRequired,
    editing: React.PropTypes.bool.isRequired,
    makeEditing: React.PropTypes.func.isRequired
  },

  handleCheck: function(event) {
    var checked = $(event.target).is(':checked');
    this.props.collections.Todos.update(this.props.todo._id, {$set: {checked: checked}});

    this.props.collections.Lists.update(this.props.todo.listId, {$inc: {incompleteCount: checked ? -1 : 1}});
  },
  
  handleFocus: function() {
    this.props.makeEditing(true);
  },

  handleBlur: function() {
    this.props.makeEditing(false);
  },
  
  handleChange: function(event) {
    this.props.collections.Todos.update(this.props.todo._id, {$set: {text: event.target.value}});
  },
  
  handleKeyDown: function(event) {
    // ESC or ENTER
    if (event.which === 27 || event.which === 13) {
      event.preventDefault();
      event.target.blur();
    }
  },
  
  render: function() {
    var classes = React.addons.classSet({
      'list-item': true,
      'checked': this.props.todo.checked,
      'editing': this.props.editing
    });
    
    return (
      <div className={classes}>
        <label className="checkbox">
          <input type="checkbox" checked={this.props.todo.checked} name="checked" onChange={this.handleCheck}/>
          <span className="checkbox-custom"></span>
        </label>

        <input type="text" value={this.props.todo.text} placeholder="Task name" 
          onFocus={this.handleFocus} onBlur={this.handleBlur} onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}/>
        <a className="js-delete-item delete-item" href="#"><span className="icon-trash"></span></a>
      </div>
    );
  }
});