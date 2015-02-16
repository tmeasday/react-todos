### TODOs




### Questions

- how to pass Meteor.user() around?
  - Make the user a prop of body?
  - Make the userId a prop of body and do collections.Users.findOne() where we need it?
  - Call Meteor.user()? [ugggh]

Z: I think 1. makes more sense given you'll always be writing some form of code like

```
  if (this.props.user)
    frobnicate(this.props.user.firstName());
```

In case 2., you have to go

```
  if (this.props.userId) {
    var user = this.props.collections.Users.findOne(this.props.userId);
    
    if (user)
      frobnicate(this.props.user.firstName);
  }
```

Not sure when the latter would be more advantageous over the former. 

- how to logout/in/create user? 
  - Global handler mediated by body?
  - Message ala Flux?
  - Directly in component [ugggh]

Z: I attribute this (and probably the following question) to the crappness of
thinking in a global world (i.e meteor apps). In the way the app is currently 
structured, an alien coming to the codebase would be very confused as to how/why
the `userId=Meteor.userId()` would ever change in `main.jsx`. They would be
equally confused when looking at `Accounts.createUser({...` in `app-join.jsx`
and wondering how the hell the app suddenly knows the user is logged in.

I'd definitely like to workshop these two questions together.


- better pattern for deps

Z: Yep. lets try and hash this out :)
