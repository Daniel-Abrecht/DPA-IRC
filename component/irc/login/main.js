
constructor(){
  super();
  this.T.login.addEventListener("submit", event=>{
    event.preventDefault();
    let detail = {
      nick: this.T.nick.value,
      password: this.T.password.value,
      server: this.T.server.value
    };
    this.login(detail);
  }, true);
  this[$private].states = new Set(['LOGGEDOUT', 'LOGGEDIN', 'PENDING']);
  this.state = 'LOGGEDOUT';
}

login(detail){
  this.dispatchEvent(
    new CustomEvent("login", {
      bubbles: false,
      detail
    })
  );
}

set state(state){
  if(!(this[$private].states.has(state)))
    throw new Error('Not logged out!!!');
  if(this[$private].state == state)
    return;
  this[$private].state = state;
  for(let x of this[$private].states)
    this.classList.remove(x.toLowerCase());
  this.classList.add(state.toLowerCase());
}

get state(){
  return this[$private].state;
}
