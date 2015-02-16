### TODOs

- login
- make lists public/private


### Questions

- how to pass Meteor.user() around?
  - Make the user a prop of body?
  - Make the userId a prop of body and do collections.Users.findOne() where we need it?
  - Call Meteor.user()? [ugggh]

- how to logout/in/create user? 
  - Global handler mediated by body?
  - Message ala Flux?
  - Directly in component [ugggh]

- better pattern for deps

