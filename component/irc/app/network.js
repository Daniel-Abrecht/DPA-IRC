
constructor(app, name=null){
  super();

  this.app = app;
  this.T = app.T;
  this.NT = this.T.network_list_entry.create();

  this.reconnect_attempts = 0;

  this.channel_list = new Map();

  this.name = name;
  this.connected = 0;

  this.irc = new IRC();
  this.irc.addEventListener('open', ()=>this.onopen());
  this.irc.addEventListener('close', ()=>this.onclose());

  this.T.network_list.appendChild(this.NT.networkentry);

  this.expect_znc = false;

  this.addEventListener("channel-added", ({detail: channel})=>{
    let entry = this.T.channel_list_entry.create();
    entry.name.innerText = channel.name;
    entry.channelentry.name = channel.name;
    channel.list_entry = entry;
    entry.channelentry.addEventListener("click", ()=>{
      entry.channelentry.classList.remove("mentioned");
      entry.notifications.innerText = '';
      this.showChannel(channel.name);
    });
    channel.addEventListener("update", ()=>{
      if(this.app.current_channel != channel)
        entry.notifications.innerText = (entry.notifications.innerText|0) + 1;
    });
    channel.addEventListener("mentioned", ()=>{
      if(this.app.current_channel != channel)
        entry.channelentry.classList.add("mentioned");
    });
    let before = null;
    for(let e of this.NT.channel_list.children){
      if(e.name < channel.name)
        continue;
      before = e;
      break;
    }
    this.NT.channel_list.insertBefore(entry.channelentry, before);
  });

  this.addEventListener("channel-removed", ({detail: channel})=>{
    if(channel.list_entry && channel.list_entry.channelentry.parentNode)
      channel.list_entry.channelentry.remove();
  });

  for(let k of Object.getOwnPropertyNames(Object.getPrototypeOf(this)))
    if(k.startsWith('onirc_') && this[k] instanceof Function)
      this.irc.addEventListener('irc-'+k.slice(6), (...x)=>this[k](...x));

  this.addEventListener("resize", ()=>{
    if(this.offsetWidth >= 40 * parseFloat(getComputedStyle(document.documentElement).fontSize)){
      this.classList.remove("mobile");
    }else{
      this.classList.add("mobile");
    }
  });
}

set name(name){
  this[$private].name = name;
  this.NT.name.innerText = name || 'IRC';
  for(let channel of this.channel_list)
    channel.name = channel.name;
}

get name(){
  return this[$private].name;
}

set connected(state){
  this[$private].connected = state;
  this.NT.networkentry.classList[(state===1)?'add':'remove']('connected');
}

get connected(){
  return this[$private].connected;
}

getChannel(name, {create}={}){
  let resolve;
  let promise = new Promise(r=>resolve=r);
  resolve((async()=>{
    name = name || null;
    let channel = this.channel_list.get(name);
    if(channel || !create)
      return channel;
    this.channel_list.set(name, promise);
    channel = Component("irc-channel", this.irc);
    channel = await channel;
    channel.network = this;
    if(name)
      channel.name = name;
    this.dispatchEvent(new CustomEvent("channel-added", { detail: channel }));
    this.app.dispatchEvent(new CustomEvent("channel-added", { detail: channel }));
    if(!this.app.current_channel)
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
  if(this.app.current_channel == channel)
    this.app.current_channel = null;
  channel.remove();
  this.dispatchEvent(new CustomEvent("channel-removed", { detail: channel }));
  this.app.dispatchEvent(new CustomEvent("channel-removed", { detail: channel }));
  return true;
}

async showChannel(name){
  let channel = await this.channel_list.get(name);
  if(!channel)
    return false;
  if(!this.app.showChannel(channel))
    return false;
  this.dispatchEvent(new CustomEvent("channel-shown", { detail: channel }));
  return true;
}

onopen(){
  if(this.connected){
    this.connected = 1;
    return;
  }
  this.connected = 1;
  this.dispatchEvent(new CustomEvent("open", {detail:this}));
  console.log("open");
  this.reconnect_attempts = 3;
}

async onclose(){
  this.connected = 2;
  while(this.reconnect_attempts > 0){
    this.reconnect_attempts -= 1;
    await new Promise(r=>setTimeout(r, 10 * 1000));
    try {
      await this.irc.connect();
    } catch(error) {
      console.error(error);
      continue;
    }
    return;
  }
  this.connected = 0;
  this.dispatchEvent(new CustomEvent("close", {detail:this}));
}

close(){
  this.irc.close();
  this.NT.networkentry.remove();
}

async onmessage({detail}){
  let [target, message] = detail.args;
  let targets = this.irc.parse_message_targets(target);
  for(let target of targets){
    if(!this.expect_znc && target.me && detail.prefix.full == "*status!znc@znc.in"){
      this.app.handle_znc_status_msg(this, message);
      continue;
    }
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

cmd_quote(text){
  this.irc.send_raw(text);
}

cmd_join(channel){
  this.irc.send("JOIN", {args:[channel]});
}

do_expect_znc(t=500){
  if(this.expect_znc)
    clearTimeout(this.expect_znc);
  this.expect_znc = setTimeout(()=>this.expect_znc=false, t);
}

async cmd_msg(rem){
  let [_, to, text] = rem.match(/^ *([^ ]+) +(.*)$/);
  let channel = await this.getChannel(to, {create: true});
  this.showChannel(channel);
  for(let part of IRC.split_cmd("PRIVMSG", {
    args: [channel.name, text]
  })){
    if(channel.name == '*status')
      this.do_expect_znc();
    this.irc.send("PRIVMSG", part);
    channel.log(this.irc.me, "PRIVMSG", part.args[1]);
  }
}
