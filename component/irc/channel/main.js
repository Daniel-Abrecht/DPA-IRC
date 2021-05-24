
constructor(irc){
  super();
  if(!irc)
    throw new Error("IRC instance needed for instanciation");
  this.irc = irc;
  this.mevlist = [];
}

mount(){
  this.mevlist.push([this.parentComponent, "channel-shown", ()=>this.scroll_to_bottom()]);
  for(let [target, ...x] of this.mevlist)
    target.addEventListener(...x);
}

umount(){
  while(this.mevlist.length){
    let [target, name, callback] = this.mevlist.pop();
    target.removeEventListener(name, callback);
  }
}

static strhash(str){
  var hash=0, chr;
  for(let n=str.length,i=0; i<n; i++){
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

static strcolor(str){
  return 'hsl('+(this.strhash(str)%360)+',100%,50%)';
}

scroll_to_bottom(){
  this.T.chat.scrollTop = this.T.chat.scrollHeight - this.T.chat.offsetHeight;
}

log(from, type, text){

  let line = this.T.line.create();
  line.line.style.setProperty('--nick-color', this.constructor.strcolor(from.nick||''));
  line.line.classList.add('type-'+type);

  if(from){
    line.name.innerText = from.nick;
    if(from.me)
      line.line.classList.add("me");
  }

  let [date, time] = (new Date()).toISOString().split(/[TZ.]/);
  line.line.style.setProperty('--d', `'${date}'`);
  line.line.style.setProperty('--t', `'${time}'`);

  let action = null;
  {
    let parts = text.match(/^\x01(([A-Z]+) )?(.*)\x01$/);
    if(parts){
      let [_0, _1, _action, _text] = parts;
      action = _action || '';
      text = _text;
    }
  }
  if(action)
    line.line.classList.add("action-" + action);

  let mentioned = false;
  {
    let parts = text.split(this.irc.nick);
    for(let i=1; i<parts.length; i++)
      if(!/[a-zA-Z0-9]$/.test(parts[i-1]) && !/^[a-zA-Z0-9]/.test(parts[i]))
        mentioned = true;
  }
  if(mentioned)
    line.line.classList.add("mentioned");

  text = [text];

  // Detect possible URI
  text = text.map(x=>{
    if(typeof x != 'string')
      return x;
    let res = [];
    let uri = [];
    for(let part of x.replace(
      /(web\+)?[a-z]{2,10}:((\/\/((([a-zA-Z0-9_\-.]|%[0-9a-fA-F]{2})+:)?([a-zA-Z0-9_\-.]|%[0-9a-fA-F]{2})+@)?([a-z\-][a-z0-9\-]*\.)+[a-z-]+(:[0-9]{1,5})?(\/(\.?[a-zA-Z0-9_\-\/?&=#]|%[0-9a-fA-F]{2})*)?)|((\.?[a-zA-Z0-9?&=\/_\-]|%[0-9a-fA-F]{2})+:(\.?[:a-zA-Z0-9?&=\/_\-]|%[0-9a-fA-F]{2})+))/g,
      str => {
        let a = document.createElement("a");
        a.target = "_blank";
        a.href = str;
        a.innerText = str;
        uri.push(a);
        return '\0';
      }
    ).split('\0')){
      res.push(part);
      if(uri.length)
        res.push(uri.shift());
    }
    return res;
  }).flat();

  for(let part of text)
    line.text.appendChild(typeof part == 'string' ? document.createTextNode(part) : part);

  let scroll_to_bottom = (this.T.chat.scrollTop+13 >= (this.T.chat.scrollHeight - this.T.chat.offsetHeight));
  this.T.chat.appendChild(line.line);
  if(scroll_to_bottom)
    this.scroll_to_bottom();
  this.dispatchEvent(new CustomEvent("update", { detail:{
    from, type, text
  }}));
  if(mentioned)
    this.dispatchEvent(new CustomEvent("mentioned"));
}

cmd_me(text){
  for(let part of IRC.split_cmd("PRIVMSG", {
    args: [this.name, text], 
    before: '\x01ACTION ',
    after: '\x01'
  })){
    this.irc.send("PRIVMSG", part);
    this.log(this.irc.me, "PRIVMSG", part.args[1]);
  }
}

set name(name){
  let title = name;
  if(this.network && this.network.name)
    title = `${name} @ ${this.network.name}`;
  this.T.title.innerText = title;
  this[$private].name = name;
}

get name(){
  return this[$private].name || null;
}
