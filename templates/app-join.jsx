var Link = Router.Link;

Join = React.createClass({
  mixins: [Router.Navigation, React.addons.LinkedStateMixin],
  
  getInitialState: function() {
    return {
      email: '',
      password: '',
      confirm: '',
      errors: {}
    }
  },
  
  hasError: function(name) {
    return _.has(this.state.errors, name);
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
    
    var inputProps = {
      linkState: this.linkState,
      hasError: this.hasError
    };
    
    return (
      <div className="page auth">
        <MenuNav/>

        <div className="content-scrollable">
          <div className="wrapper-auth">
            <h1 className="title-auth">Join.</h1>
            <p className="subtitle-auth" >Joining allows you to make private lists</p>

            <form onSubmit={this.handleSubmit}>
              {errorMessages}

              <FormInput type="email" name="email" placeholder="Your Email"
                {...inputProps}/>

              <FormInput type="password" name="password" placeholder="Password"
                {...inputProps}/>

              <FormInput type="password" name="confirm" 
                placeholder="Confirm Password" {...inputProps}/>

              <button type="submit" className="btn-primary">Join Now</button>
            </form>
          </div>

          <Link to='signin' className="link-auth-alt">Have an account? Sign in</Link>
        </div>
      </div>
    );
  }
});
