FormInput = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    linkState: React.PropTypes.func.isRequired,
    hasError: React.PropTypes.func.isRequired
  },
  
  render: function() {
    var {name, linkState, hasError, title, ...other} = this.props;
    var classes = React.addons.classSet({
      'input-symbol': true,
      'error': this.props.hasError(name)
    });
    
    title = title || name;
    
    return (
      <div className={classes}>
        <input name={name} valueLink={linkState(name)} {...other}/>
        <span className="icon-lock" title={title}></span>
      </div>
    );
  }
});