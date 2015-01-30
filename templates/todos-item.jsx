TodoItem = React.createClass({
  getInitialState: function() {
    return {
      editing: false
    };
  },
  
  render: function() {
    var classes = React.addons.classSet({
      'list-item': true,
      'checked': this.props.todo.checked,
      'editing': this.state.editing
    });
    
    return (
      <div className={classes}>
        <label className="checkbox">
          <input type="checkbox" checked={this.props.todo.checked} name="checked"/>
          <span className="checkbox-custom"></span>
        </label>

        <input type="text" value={this.props.todo.text} placeholder="Task name"/>
        <a className="js-delete-item delete-item" href="#"><span class="icon-trash"></span></a>
      </div>
    );
  }
});