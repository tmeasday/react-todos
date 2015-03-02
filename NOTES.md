### TODOs


### Questions

1. Should we use flux for actions?

 - Log in/out
 - Create users.
 - create/modify list
 - create/modify todo
 
 Alternatively we could just pass a set of modifier functions down the stack.

2. 


Z: I attribute this (and probably the following question) to the crappness of
thinking in a global world (i.e meteor apps). In the way the app is currently 
structured, an alien coming to the codebase would be very confused as to how/why
the `userId=Meteor.userId()` would ever change in `main.jsx`. They would be
equally confused when looking at `Accounts.createUser({...` in `app-join.jsx`
and wondering how the hell the app suddenly knows the user is logged in.

I'd definitely like to workshop these two questions together.


- better pattern for deps

Z: Yep. lets try and hash this out :)
