load network

constructor(){
  super();

  this.current_channel = null;

  this.networks = [new Network(this)];
  this.current_network = this.networks[0];
  this.znc_status_msg = '';

  this.T.login.addEventListener("login", ({detail})=>this.connect(detail));

  this.networks[0].addEventListener('open' , ()=>this.onopen ());
  this.networks[0].addEventListener('close', ()=>this.onclose());

  this.T.text.addEventListener("input", event=>this.oninput(event));
  this.T.text.addEventListener("keydown", event=>this.onkeydown(event));
  this.T.chatline.addEventListener("submit", async event=>{
    event.preventDefault();
    if(await this.send(this.T.text.value)){
      this.T.text.value = '';
      this.T.text.style.height = '';
    }
  });
}

onopen(){
  this.T.login.state = 'LOGGEDIN';
}

onclose(){
  this.T.login.state = 'LOGGEDOUT';
  while(this.networks.length > 1){
    let network = this.networks.pop();
    network.close();
  }
}

onkeydown(event){
  if(event.which == 13 || event.keyCode == 13){
    if(this.T.text.value.indexOf('\n') == -1 && !event.shiftKey){
      event.preventDefault();
      this.T.submit.click();
    }
  }
}

oninput(event){
  this.T.text.style.height = '';
  if(this.T.text.value){
    this.T.text.style.height = (this.T.text.scrollHeight+1) + 'px';
  }
}

static parse_list(){
  let state = parse_first_line;
  let res = {
    parse: line => state(line),
    get done(){return !state;},
    error: false,
    keys: null,
    values: [],
  };
  let cl;
  let keys;
  function parse_first_line(line){
    if(!/^\+[-+]+\+$/.test(line)){
      state = null;
      res.error = true;
      return;
    }
    cl = line.slice(1,-1).split('+').map(x=>x.length);
    state = parse_keys;
  }
  function parse_fields(line){
    return line.match('^\\|'+cl.map(x=>'('+'.'.repeat(x)+')').join('\\|')+'\\|$').slice(1).map(x=>x.trim());
  }
  function parse_keys(line){
    res.keys = keys = parse_fields(line);
    if(!keys){
      state = null;
      res.error = true;
      return;
    }
    state = parse_seps;
    return keys;
  }
  function parse_seps(line){
    if(line != '+'+cl.map(x=>'-'.repeat(x)).join('+')+'+'){
      state = null;
      res.error = true;
      return;
    }
    state = parse_values;
  }
  function parse_values(line){
    if(line == '+'+cl.map(x=>'-'.repeat(x)).join('+')+'+'){
      state = null;
      return;
    }
    let values = parse_fields(line);
    if(!values){
      state = null;
      res.error = true;
      return;
    }
    let v = Object.fromEntries(values.map((x,i)=>[keys[i],x]));
    res.values.push(v);
    return v;
  }
  return res;
}

handle_znc_status_msg(network, message){
  if(network != this.networks[0])
    return;
  if(!this.znc_status_response_handler)
    return;
  if(!this.znc_status_msg)
    this.znc_status_msg = Main.parse_list();
  this.znc_status_msg.parse(message);
  if(this.handle_znc_status_msg_timeout)
    clearTimeout(this.handle_znc_status_msg_timeout);
  const done = ()=>{
    let msg = this.znc_status_msg;
    this.znc_status_msg = '';
    this.handle_znc_status_msg_timeout = null;
    if(this.znc_status_response_handler){
      let h = this.znc_status_response_handler;
      this.znc_status_response_handler = null;
      if(msg.error){
        h.reject();
      }else{
        h.resolve(msg);
      }
    }
  }
  if(this.znc_status_msg.done)
    done()
  this.handle_znc_status_msg_timeout = setTimeout(done, 500);
}

async znc_status_request(message){
  if(!this.networks[0].irc.is_znc)
    return;
  while(this.znc_status_response_handler){
    try {
      await this.znc_status_response_handler;
    } catch(e) {}
  }
  let promise, resolve;
  promise = new Promise(r=>resolve=r);
  promise.resolve = resolve;
  this.znc_status_response_handler = promise;
  this.handle_znc_status_msg_timeout = setTimeout(()=>{
    this.handle_znc_status_msg_timeout=null;
    this.znc_status_response_handler=null;
    resolve(null);
  }, 2000);
  this.networks[0].irc.send("PRIVMSG", {args:['*status', message]});
  return await this.znc_status_response_handler;
}

async send(text){
  if(!text.length)
    return;
  try {
    let command = text.match(/^\/([a-z]+) ?(.*)$/);
    if(command){
      let [_0, cmd, argument] = command;
      if(this['cmd_'+cmd] instanceof Function){
        await this['cmd_'+cmd](argument);
      }else if(this.current_network && this.current_network['cmd_'+cmd] instanceof Function){
        await this.current_network['cmd_'+cmd](argument);
      }else if(this.current_channel && this.current_channel['cmd_'+cmd] instanceof Function){
        await this.current_channel['cmd_'+cmd](argument);
      }else{
        throw new Error(`Command "${cmd}" not found`);
      }
    }else if(this.current_channel){
      for(let part of IRC.split_cmd("PRIVMSG", {
        args: [this.current_channel.name, text]
      })){
        if(this.current_channel.name == '*status' && this.current_channel.network)
          this.current_channel.network.do_expect_znc();
        this.current_channel.irc.send("PRIVMSG", part);
        this.current_channel.log(this.current_channel.irc.me, "PRIVMSG", part.args[1]);
      }
    }else{
      throw new Error("Not in a channel!");
    }
  } catch(error) {
    console.warn(error);
    return false;
  }
  return true;
}

cmd_part(channel){
  if(!channel){
    if(!this.current_channel)
      throw new Error("No channel to part from");
    if(!this.current_channel.name)
      throw new Error("Can't part from nameless channel");
    channel = this.current_channel.name;
  }
  this.current_channel.irc.send("PART", {args:[channel]});
}

showChannel(channel){
  if(this.current_channel == channel)
    return false;
  if(this.current_channel)
    this.current_channel.remove();
  this.T.channel.appendChild(channel);
  this.current_channel = channel;
  this.current_network = channel.network;
  this.dispatchEvent(new CustomEvent("channel-shown", { detail: channel }));
  return true;
}

async connect({nick, password, server}){
  if(this.T.login.state != 'LOGGEDOUT')
    throw new Error("Already logged in or login still pending");
  this.T.login.state = 'PENDING';
  try {
    await this.networks[0].irc.connect({nick, password, url: server});
  } catch(error) {
    this.T.login.state = 'LOGGEDOUT';
    this.networks[0].close();
    throw error;
  }
  if(this.networks[0].irc.is_znc) try {
    let networks = (await this.znc_status_request("ListNetworks")).values;
    let network = networks.filter(network=>network['IRC Server'] == this.networks[0].irc.server_name)[0].Network;
    this.networks[0].name = network;
    networks = networks.filter(network=>network['IRC Server'] != this.networks[0].irc.server_name).map(x=>x.Network);
    var [_, puser, _, pnetwork, ppassword] = password.match(/^([^/:]+)(\/([^:]+))?:(.*)$/);
    for(let network of networks){
      let password = `${puser}/${network}:${ppassword}`;
      network = new Network(this, network);
      await network.irc.connect({nick, password, url: server});
      this.networks.push(network);
    }
  } catch(error) {
    console.warn(error);
  }
}
