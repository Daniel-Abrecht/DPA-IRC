
constructor(){
  super();

  this.channel_list = new Map();
  this.current_channel = null;

  this.T.login.addEventListener("login", ({detail})=>this.connect(detail));

  this.irc = new IRC();
  this.irc.addEventListener('open', ()=>{ this.T.login.state = 'LOGGEDIN'; });
  this.irc.addEventListener('close', ()=>{ this.T.login.state = 'LOGGEDOUT'; });

  this.T.text.addEventListener("input", event=>this.oninput(event));
  this.T.text.addEventListener("keydown", event=>this.onkeydown(event));
  this.T.chatline.addEventListener("submit", event=>{
    event.preventDefault();
    if(this.send(this.T.text.value)){
      this.T.text.value = '';
      this.T.text.style.height = '';
    }
  });

  for(let k of Object.getOwnPropertyNames(Object.getPrototypeOf(this)))
    if(k.startsWith('onirc_') && this[k] instanceof Function)
      this.irc.addEventListener('irc-'+k.slice(6), (...x)=>this[k](...x));

  this.addEventListener("channel-added", ({detail: channel})=>{
    let entry = this.T.channel_list_entry.create();
    entry.name.innerText = channel.name;
    channel.list_entry = entry;
    entry.channelentry.addEventListener("click", ()=>{
      entry.channelentry.classList.remove("mentioned");
      entry.notifications.innerText = '';
      this.showChannel(channel.name);
    });
    channel.addEventListener("update", ()=>{
      if(this.current_channel != channel)
        entry.notifications.innerText = (entry.notifications.innerText|0) + 1;
    });
    channel.addEventListener("mentioned", ()=>{
      if(this.current_channel != channel)
        entry.channelentry.classList.add("mentioned");
    });
    this.T.channellist.appendChild(entry.channelentry);
  });

  this.addEventListener("channel-removed", ({detail: channel})=>{
    if(channel.list_entry && channel.list_entry.channelentry.parentNode)
      channel.list_entry.channelentry.remove();
  });

  this.addEventListener("resize", ()=>{
    if(this.offsetWidth >= 40 * parseFloat(getComputedStyle(document.documentElement).fontSize)){
      this.classList.remove("mobile");
    }else{
      this.classList.add("mobile");
    }
  });
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

send(text){
  if(!text.length)
    return;
  try {
    let command = text.match(/^\/([a-z]+) ?(.*)$/);
    if(command){
      let [_0, cmd, argument] = command;
      if(this['cmd_'+cmd] instanceof Function){
        this['cmd_'+cmd](argument);
      }else if(this.current_channel['cmd_'+cmd] instanceof Function){
        this.current_channel['cmd_'+cmd](argument);
      }else{
        throw new Error(`Command "${cmd}" not found`);
      }
    }else if(this.current_channel){
      for(let part of IRC.split_cmd("PRIVMSG", {
        args: [this.current_channel.name, text]
      })){
        this.irc.send("PRIVMSG", part);
        this.current_channel.log(this.irc.me, "PRIVMSG", part.args[1]);
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

cmd_quote(text){
  this.irc.send_raw(text);
}

cmd_join(channel){
  this.irc.send("JOIN", {args:[channel]});
}

cmd_part(channel){
  if(!channel){
    if(!this.current_channel)
      throw new Error("No channel to part from");
    if(!this.current_channel.name)
      throw new Error("Can't part from nameless channel");
    channel = this.current_channel.name;
  }
  this.irc.send("PART", {args:[channel]});
}

async connect({nick, password, server}){
  if(this.T.login.state != 'LOGGEDOUT')
    throw new Error("Already logged in or login still pending");
  this.T.login.state = 'PENDING';
  try {
    await this.irc.connect({nick, password, url: server});
  } catch(error) {
    this.T.login.state = 'LOGGEDOUT';
    throw error;
  }
}

getChannel(name, {create}={}){
  let resolve;
  let promise = new Promise(r=>resolve=r);
  resolve((async()=>{
    name = name || null;
    let channel = this.channel_list.get(name);
    if(channel)
      return channel;
    this.channel_list.set(name, promise);
    channel = Component("irc-channel", this.irc);
    channel = await channel;
    if(name)
      channel.name = name;
    this.dispatchEvent(new CustomEvent("channel-added", { detail: channel }));
    if(!this.current_channel)
      this.showChannel(name);
    return channel;
  })());
  return promise;
}

async removeChannel(name){
  if(!name)
    return false;
  let channel = await this.channel_list.get(name);
  if(!channel)
    return false;
  this.channel_list.delete(name);
  if(this.current_channel == channel)
    this.current_channel = null;
  channel.remove();
  this.dispatchEvent(new CustomEvent("channel-removed", { detail: channel }));
  return true;
}

async showChannel(name){
  let channel = await this.channel_list.get(name);
  if(!channel)
    return false;
  if(this.current_channel == channel)
    return;
  if(this.current_channel)
    this.current_channel.remove();
  this.T.channel.appendChild(channel);
  this.current_channel = channel;
  this.dispatchEvent(new CustomEvent("channel-shown", { detail: channel }));
  return true;
}

async onmessage({detail}){
  let [target, message] = detail.args;
  let targets = this.irc.parse_message_targets(target);
  for(let target of targets){
    let target_channel;
    if(target.me){
      target_channel = detail.prefix.nick;
    }else{
      target_channel = target.normalized;
    }
    let channel = await this.getChannel(target_channel, {create: true});
    channel.log(detail.prefix, detail.command, message);
  }
}

onirc_PRIVMSG(...x){ return this.onmessage(...x); }
onirc_NOTICE (...x){ return this.onmessage(...x); }

onirc_PART({detail}){
  if(!detail.args.length)
    return;
  if(detail.prefix.me){
    this.removeChannel(detail.args[0]);
  }
}

async onirc_JOIN({detail}){
  let target = detail.args[0];
  if(detail.prefix.me){
    let channel = await this.getChannel(target, {create: true});
    channel.joined = true;
  }
}
