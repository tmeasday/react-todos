var Link = Router.Link;

Join = React.createClass({
  mixins: [Router.Navigation],
  
  getInitialState: function() {
    return {
      email: '',
      password: '',
      confirm: '',
      errors: {}
    }
  },
  
  handleChange: function(field, event) {
    var change = {};
    change[field] = event.target.value;
    this.setState(change);
  },
  
  handleSubmit: function(event) {
    event.preventDefault();
    
    var errors = {};

    if (! this.state.email) {
      errors.email = 'Email required';
    }

    if (! this.state.password) {
      errors.password = 'Password required';
    }

    if (this.state.confirm !== this.state.password) {
      errors.confirm = 'Please confirm your password';
    }

    this.setState({errors: errors});
    if (_.keys(errors).length) {
      return;
    }

    Accounts.createUser({
      email: this.state.email,
      password: this.state.password
    }, function(error) {
      if (error) {
        this.setState({errors: {'none': error.reason}});
      }

      this.transitionTo('home');
    }.bind(this));
    
  },
  
  render: function() {
    var errorMessages = _.map(this.state.errors, function(error, field) {
      return <div className="list-item" key={field}>{error}</div>;
    });
    
    if (errorMessages.length) {
      errorMessages = <div className="list-errors">{errorMessages}</div>;
    }
    
    return (
      <div className="page auth">
        <MenuNav/>

        <div className="content-scrollable">
          <div className="wrapper-auth">
            <h1 className="title-auth">Join.</h1>
            <p className="subtitle-auth" >Joining allows you to make private lists</p>

            <form onSubmit={this.handleSubmit}>
              {errorMessages}

              <FormInput type="email" name="email" value={this.state.email} 
                placeholder="Your Email"
                error={_.has(this.state.errors, 'email')} 
                handleChange={this.handleChange.bind(this, 'email')}/>

              <FormInput type="password" name="password" value={this.state.password} 
                placeholder="Password"
                error={_.has(this.state.errors, 'password')} 
                handleChange={this.handleChange.bind(this, 'password')}/>

              <FormInput type="password" name="confirm" value={this.state.confirm} 
                placeholder="Confirm Password"
                error={_.has(this.state.errors, 'confirm')} 
                handleChange={this.handleChange.bind(this, 'confirm')}/>

              <button type="submit" className="btn-primary">Join Now</button>
            </form>
          </div>

          <Link to='signin' className="link-auth-alt">Have an account? Sign in</Link>
        </div>
      </div>
    );
  }
});

var FormInput = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    value: React.PropTypes.string.isRequired,
    error: React.PropTypes.bool.isRequired,
    handleChange: React.PropTypes.func.isRequired,
  },
  
  render: function() {
    var {error, handleChange, title, ...other} = this.props;
    var classes = React.addons.classSet({
      'input-symbol': true,
      'error': !! error
    });
    
    title = title || this.props.name;
    
    return (
      <div className={classes}>
        <input onChange={handleChange} {...other}/>
        <span className="icon-lock" title={title}></span>
      </div>
    );
  }
});