var Link = Router.Link;

Signin = React.createClass({
  mixins: [Router.Navigation, React.addons.LinkedStateMixin],
  
  getInitialState: function() {
    return {
      email: '',
      password: '',
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
      errors.email = 'Email is required';
    }

    if (! this.state.password) {
      errors.password = 'Password is required';
    }
    
    this.setState({errors: errors});
    if (_.keys(errors).length) {
      return;
    }
    
    Meteor.loginWithPassword(this.state.email, this.state.password, function(error) {
      if (error) {
        this.setState({errors: {'none': error.reason}});
      } else {
        this.transitionTo('home');
      }
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
            <h1 className="title-auth">Sign In.</h1>
            <p className="subtitle-auth" >Signing in allows you to view private lists</p>

            <form onSubmit={this.handleSubmit}>
              {errorMessages}

              <FormInput type="email" name="email" placeholder="Your Email"
                {...inputProps}/>

              <FormInput type="password" name="password" placeholder="Password"
                {...inputProps}/>

              <button type="submit" className="btn-primary">Sign in</button>
            </form>
          </div>

          <Link to='join' className="link-auth-alt">Need an account? Join Now.</Link>
        </div>
      </div>
    );
  }
});
var Link = Router.Link;

Signin = React.createClass({
  mixins: [Router.Navigation, React.addons.LinkedStateMixin],
  
  getInitialState: function() {
    return {
      email: '',
      password: '',
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
      errors.email = 'Email is required';
    }

    if (! this.state.password) {
      errors.password = 'Password is required';
    }
    
    this.setState({errors: errors});
    if (_.keys(errors).length) {
      return;
    }
    
    Meteor.loginWithPassword(this.state.email, this.state.password, function(error) {
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
            <h1 className="title-auth">Sign In.</h1>
            <p className="subtitle-auth" >Signing in allows you to view private lists</p>

            <form onSubmit={this.handleSubmit}>
              {errorMessages}

              <FormInput type="email" name="email" placeholder="Your Email"
                {...inputProps}/>

              <FormInput type="password" name="password" placeholder="Password"
                {...inputProps}/>

              <button type="submit" className="btn-primary">Sign in</button>
            </form>
          </div>

          <Link to='join' className="link-auth-alt">Need an account? Join Now.</Link>
        </div>
      </div>
    );
  }
});
