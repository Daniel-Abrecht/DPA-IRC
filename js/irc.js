
let utf8 = {
  encoder: new TextEncoder('utf-8'),
  decoder: new TextDecoder("utf-8")
};

let responses = {
  "-1": { name: 'timeout' },
  1: { name: 'RPL_WELCOME' },
  2: { name: 'RPL_YOURHOST' },
  3: { name: 'RPL_CREATED' },
  4: { name: 'RPL_MYINFO' },
  5: { name: 'RPL_BOUNCE' },
  200: { name: 'RPL_TRACELINK', nonfinal: true },
  201: { name: 'RPL_TRACECONNECTING', nonfinal: true },
  202: { name: 'RPL_TRACEHANDSHAKE', nonfinal: true },
  203: { name: 'RPL_TRACEUNKNOWN', nonfinal: true },
  204: { name: 'RPL_TRACEOPERATOR', nonfinal: true },
  205: { name: 'RPL_TRACEUSER', nonfinal: true },
  206: { name: 'RPL_TRACESERVER', nonfinal: true },
  207: { name: 'RPL_TRACESERVICE', nonfinal: true },
  208: { name: 'RPL_TRACENEWTYPE', nonfinal: true },
  209: { name: 'RPL_TRACECLASS', nonfinal: true },
  210: { name: 'RPL_TRACERECONNECT', nonfinal: true },
  211: { name: 'RPL_STATSLINKINFO', nonfinal: true },
  212: { name: 'RPL_STATSCOMMANDS', nonfinal: true },
  213: { name: 'RPL_STATSCLINE', nonfinal: true },
  215: { name: 'RPL_STATSILINE', nonfinal: true },
  217: { name: 'RPL_STATSQLINE', nonfinal: true },
  219: { name: 'RPL_ENDOFSTATS' },
  221: { name: 'RPL_UMODEIS' },
  231: { name: 'RPL_SERVICEINFO', nonfinal: true },
  233: { name: 'RPL_SERVICE', nonfinal: true },
  234: { name: 'RPL_SERVLIST', nonfinal: true },
  235: { name: 'RPL_SERVLISTEND' },
  240: { name: 'RPL_STATSVLINE', nonfinal: true },
  242: { name: 'RPL_STATSUPTIME', nonfinal: true },
  243: { name: 'RPL_STATSOLINE', nonfinal: true },
  244: { name: 'RPL_STATSHLINE', nonfinal: true },
  246: { name: 'RPL_STATSPING', nonfinal: true },
  250: { name: 'RPL_STATSDLINE', nonfinal: true },
  251: { name: 'RPL_LUSERCLIENT' },
  252: { name: 'RPL_LUSEROP' },
  253: { name: 'RPL_LUSERUNKNOWN' },
  254: { name: 'RPL_LUSERCHANNELS' },
  255: { name: 'RPL_LUSERME' },
  256: { name: 'RPL_ADMINME' },
  257: { name: 'RPL_ADMINLOC' },
  258: { name: 'RPL_ADMINLOC' },
  259: { name: 'RPL_ADMINEMAIL' },
  261: { name: 'RPL_TRACELOG', nonfinal: true },
  262: { name: 'RPL_TRACEEND' },
  263: { name: 'RPL_TRYAGAIN' },
  300: { name: 'RPL_NONE' },
  301: { name: 'RPL_AWAY' },
  302: { name: 'RPL_USERHOST' },
  303: { name: 'RPL_ISON' },
  305: { name: 'RPL_UNAWAY' },
  306: { name: 'RPL_NOWAWAY' },
  311: { name: 'RPL_WHOISUSER', nonfinal: true },
  312: { name: 'RPL_WHOISSERVER', nonfinal: true },
  313: { name: 'RPL_WHOISOPERATOR', nonfinal: true },
  314: { name: 'RPL_WHOWASUSER', nonfinal: true },
  315: { name: 'RPL_ENDOFWHO' },
  317: { name: 'RPL_WHOISIDLE', nonfinal: true },
  318: { name: 'RPL_ENDOFWHOIS', nonfinal: true },
  319: { name: 'RPL_WHOISCHANNELS', nonfinal: true },
  321: { name: 'RPL_LISTSTART', nonfinal: true },
  322: { name: 'RPL_LIST', nonfinal: true },
  323: { name: 'RPL_LISTEND' },
  324: { name: 'RPL_CHANNELMODEIS' },
  325: { name: 'RPL_UNIQOPIS' },
  331: { name: 'RPL_NOTOPIC' },
  332: { name: 'RPL_TOPIC' },
  341: { name: 'RPL_INVITING' },
  342: { name: 'RPL_SUMMONING' },
  346: { name: 'RPL_INVITELIST', nonfinal: true },
  347: { name: 'RPL_ENDOFINVITELIST' },
  348: { name: 'RPL_EXCEPTLIST', nonfinal: true },
  349: { name: 'RPL_ENDOFEXCEPTLIST' },
  351: { name: 'RPL_VERSION' },
  352: { name: 'RPL_WHOREPLY', nonfinal: true },
  353: { name: 'RPL_NAMREPLY', nonfinal: true },
  361: { name: 'RPL_KILLDONE' },
  363: { name: 'RPL_CLOSEEND' },
  364: { name: 'RPL_LINKS', nonfinal: true },
  365: { name: 'RPL_ENDOFLINKS' },
  366: { name: 'RPL_ENDOFNAMES' },
  367: { name: 'RPL_BANLIST', nonfinal: true },
  368: { name: 'RPL_ENDOFBANLIST' },
  369: { name: 'RPL_ENDOFWHOWAS' },
  371: { name: 'RPL_INFO', nonfinal: true },
  372: { name: 'RPL_MOTD', nonfinal: true },
  374: { name: 'RPL_ENDOFINFO' },
  375: { name: 'RPL_MOTDSTART' },
  376: { name: 'RPL_ENDOFMOTD' },
  381: { name: 'RPL_YOUREOPER' },
  382: { name: 'RPL_REHASHING' },
  383: { name: 'RPL_YOURESERVICE' },
  384: { name: 'RPL_MYPORTIS' },
  391: { name: 'RPL_TIME' },
  392: { name: 'RPL_USERSSTART', nonfinal: true },
  393: { name: 'RPL_USERS', nonfinal: true },
  394: { name: 'RPL_ENDOFUSERS' },
  395: { name: 'RPL_NOUSERS' },
  401: { name: 'ERR_NOSUCHNICK' },
  402: { name: 'ERR_NOSUCHSERVER' },
  403: { name: 'ERR_NOSUCHCHANNEL' },
  404: { name: 'ERR_CANNOTSENDTOCHAN' },
  405: { name: 'ERR_TOOMANYCHANNELS' },
  406: { name: 'ERR_WASNOSUCHNICK' },
  407: { name: 'ERR_TOOMANYTARGETS' },
  408: { name: 'ERR_NOSUCHSERVICE' },
  409: { name: 'ERR_NOORIGIN' },
  411: { name: 'ERR_NORECIPIENT' },
  412: { name: 'ERR_NOTEXTTOSEND' },
  413: { name: 'ERR_NOTOPLEVEL' },
  414: { name: 'ERR_WILDTOPLEVEL' },
  415: { name: 'ERR_BADMASK' },
  421: { name: 'ERR_UNKNOWNCOMMAND' },
  422: { name: 'ERR_NOMOTD' },
  423: { name: 'ERR_NOADMININFO' },
  424: { name: 'ERR_FILEERROR' },
  431: { name: 'ERR_NONICKNAMEGIVEN' },
  432: { name: 'ERR_ERRONEUSNICKNAME' },
  433: { name: 'ERR_NICKNAMEINUSE' },
  436: { name: 'ERR_NICKCOLLISION' },
  437: { name: 'ERR_UNAVAILRESOURCE' },
  441: { name: 'ERR_USERNOTINCHANNEL' },
  442: { name: 'ERR_NOTONCHANNEL' },
  443: { name: 'ERR_USERONCHANNEL' },
  444: { name: 'ERR_NOLOGIN' },
  445: { name: 'ERR_SUMMONDISABLED' },
  446: { name: 'ERR_USERSDISABLED' },
  451: { name: 'ERR_NOTREGISTERED' },
  461: { name: 'ERR_NEEDMOREPARAMS' },
  462: { name: 'ERR_ALREADYREGISTRED' },
  463: { name: 'ERR_NOPERMFORHOST' },
  464: { name: 'ERR_PASSWDMISMATCH' },
  465: { name: 'ERR_YOUREBANNEDCREEP' },
  466: { name: 'ERR_YOUWILLBEBANNED' },
  467: { name: 'ERR_KEYSET' },
  471: { name: 'ERR_CHANNELISFULL' },
  472: { name: 'ERR_UNKNOWNMODE' },
  473: { name: 'ERR_INVITEONLYCHAN' },
  474: { name: 'ERR_BANNEDFROMCHAN' },
  475: { name: 'ERR_BADCHANNELKEY' },
  476: { name: 'ERR_BADCHANMASK' },
  477: { name: 'ERR_NOCHANMODES' },
  478: { name: 'ERR_BANLISTFULL' },
  481: { name: 'ERR_NOPRIVILEGES' },
  482: { name: 'ERR_CHANOPRIVSNEEDED' },
  483: { name: 'ERR_CANTKILLSERVER' },
  484: { name: 'ERR_RESTRICTED' },
  485: { name: 'ERR_UNIQOPPRIVSNEEDED' },
  491: { name: 'ERR_NOOPERHOST' },
  492: { name: 'ERR_NOSERVICEHOST' },
  501: { name: 'ERR_UMODEUNKNOWNFLAG' },
  502: { name: 'ERR_USERSDONTMATCH' }
};
for(let [code, value] of Object.entries(responses)){
  value.code = +code;
  responses[value.name] = value;
}

class IRCError extends Error {
  constructor(params){
    super(IRCError.makeMessage(params));
    Object.assign(this, params);
  }
  static makeMessage(params){
    let code = params.code;
    let res = '' + code;
    if(responses[code])
      res = responses[code].name + ' (' + code + ')';
    if(params.argstr)
      res = res += ': ' + params.argstr;
    return res;
  }
}


const SynchronousPromise = (()=>{
  const $private = Symbol("private");
  const resolved = Symbol("resolved");
  const SETTLED  = 1;
  const RESOLVED = 2;
  const REJECTED = 3;
  class SynchronousPromise {
    constructor(callback){
      this[$private] = {
        resolve: [],
        reject: [],
        state: 0,
        result: null
      };
      Object.seal(this[$private]);
      callback(r=>{if(!this[$private].state)this[resolved](r,false);}, r=>{if(!this[$private].state)this[resolved](r,true);});
    }
    [resolved](result, rejected){
      this[$private].state = SETTLED;
      let stops = new Set();
      const unpack = rejected=>(result)=>{
        if(this[$private].state != SETTLED)
          return;
        if(stops.has(result)){
          result = new Error("Recursive promise will never complete!");
          rejected = true;
        }
        stops.add(result);
        if(result && result.then){
          try {
            return result.then(unpack(false), unpack(true));
          } catch(error) {
            result = error;
            rejected = true;
          }
        }
        this[$private].state = rejected ? REJECTED : RESOLVED;
        this[$private].result = result;
        for(let callback of this[$private][rejected?'reject':'resolve'])
          callback(result);
        this[$private].reject = null;
        this[$private].resolve = null;
      };
      unpack(rejected)(result);
    }
    then(onresolve, onreject){
      if(!onresolve) onresolve = (x) => x;
      if(!onreject ) onreject  = (e) => {throw e;};
      const promise = new SynchronousPromise(()=>{});
      if(!this[$private].state || this[$private].state == SETTLED){
        this[$private].resolve.push((result)=>promise[resolved]({then: (re,rj)=>re(onresolve(result))}, false));
        this[$private].reject .push((result)=>promise[resolved]({then: (re,rj)=>re(onreject (result))}, false));
      }else{
        promise[resolved]({then: (re,rj)=>re(onresolve(this[$private].result))}, this[$private].state == REJECTED);
      }
      return promise;
    }
    catch(callback){
      return this.then(null, callback);
    }
    static resolve(obj){
      const promise = new SynchronousPromise(()=>{});
      promise[resolved](obj, true);
      return promise;
    }
  }
  return SynchronousPromise;
})();

class IRC extends EventTarget {

  IRC(){
    this.ignored = new Set();
  }

  async connect(params){
    this.is_znc = true;
    this.ignored = new Set();

    if(params){
      this.connection_params = params;
    }else{
      params = this.connection_params;
    }

    let {
      url, user, password, nick, realname,
      message_length_limit,
      request_timeout
    } = params;

    if(!url)
      url = (location.protocol == 'http:' ? 'ws://' : 'wss://') + location.host + location.pathname;
    if(!user)
      user = nick;
    if(!nick)
      nick = user;
    if(!realname)
      realname = user;

    if(!user)
      throw new Error("Please specify user and/or nick");

    if(this.ws)
      this.ws.close();

    this.user = user;
    this.nick = nick;
    this.realname = realname;

    this.ws = new WebSocket(url, "binary");
    this.ws.binaryType = 'arraybuffer';

    let closed = false;
    var connection_promise = new SynchronousPromise((resolve, reject)=>{
      this.ws.onopen = event=>{
        if(connection_promise == this.pending_answare)
          this.pending_answare = null;
        resolve();
        this.dispatchEvent(new event.constructor(event.type, event));
      };
      this.ws.onclose = event=>{
        reject(event);
        connection_promise = null;
        this.dispatchEvent(new event.constructor(event.type, event));
      }
      this.ws.onerror = event=>{
        this.dispatchEvent(new event.constructor(event.type, event));
        if(connection_promise && this.ws.readyState != this.ws.OPEN){
          reject(event);
          connection_promise = null;
        }
      }
    });
    this.pending_answare = connection_promise;
    connection_promise.wait = true;

    this.ws.onmessage = (...x)=>this.onmessage(...x);
    this.message_length_limit = message_length_limit || 1024 * 10;
    this.request_timeout = request_timeout || 2000;
    this.buffer = "";
    this.ignore_command = false;
    this.generation = 0;
    if(password){
      this.send("PASS", {args:[password]});
      this.send("NICK", {args:[nick]});
      this.server_name = (await this.send("USER", {args:[user, 0, location.hostname, realname]})).prefix.full;
    }else{
      this.send("NICK", {args:[nick]});
      this.send("USER", {args:[user, 0, location.hostname, realname]});
    }

    await connection_promise;
    connection_promise = null;
  }

  ignore_notice(prefix, timeout=500){
    this.ignored.add(prefix);
    setTimeout(timeout, ()=>this.ignored.remove(prefix));
  }

  parse_message(str){
    let parts = str.split(' ');
    let prefix = null;
    if(parts[0][0] == ':')
      prefix = parts.shift().slice(1);
    if(prefix){
      let [full, nick, _1, user, _2, host] = prefix.match(/^([^!@]*)(!([^@]*))?(@(.*))?$/);
      prefix = {
        full: prefix,
        nick, user, host,
        me: nick === this.nick
      };
    }
    let command = parts.shift();
    if(!command)
      throw new Error("Message contained no command");
    let argstr = parts.join(' ');
    let args = [];
    while(parts.length){
      if(parts[0][0] == ':'){
        args.push(parts.join(' ').slice(1));
        parts = [];
      }else{
        args.push(parts.shift());
      }
    }
    let result = { prefix, args, argstr };
    if(/[0-9]{3}/.test(command)){
      result.type = 'response';
      result.code = command|0;
      if(result.code == 1){
        result.category = 'reply';
      }else if(result.code < 100){
        result.category = 'client-info';
      }else if(result.code >= 200 && result.code < 400){
        result.category = 'reply';
      }else if(result.code >= 400 && result.code < 600){
        result.category = 'error';
      }else{
        result.category = 'unknown';
      }
    }else{
      result.type = 'command';
      result.command = command;
    }
    return result;
  }

  show_reply({prefix, code, argstr}){
    console.log(prefix, code, argstr);
  }

  onresponse(response){
    switch(response.category){
      case 'error': {
        let error = new IRCError(response);
        if(this.pending_answare)
          this.pending_answare.reject(error);
        this.pending_answare = null;
      } break;
      case 'reply': {
        if(responses[response.code] && !responses[response.code].nonfinal){
          if(this.pending_answare){
            this.pending_answare.resolve(response);
            this.pending_answare = null;
            break;
          }
        }
        this.show_reply(response);
      } break;
      default: {
        this.show_reply(response);
      } break;
    }
  }

  eval_message(str){
    let message = this.parse_message(str);
    switch(message.type){
      case 'command': {
        if(message.command == 'NOTICE' && this.ignored.has(message.prefix.full))
          break;
        let func = "onirc_" + message.command;
        if(this[func] instanceof Function){
          return this[func](message.prefix, ...message.args);
        }else{
          this.dispatchEvent(
            new CustomEvent(
              "irc-" + message.command,
              { detail: message }
            )
          );
        }
      } break;
      case 'response': return this.onresponse(message);
    }
  }

  send_raw(str, timeout){
    if(!str || /\r\n/.test(str) || str.length > 510)
      throw new Error("Invalid message");
    this.parse_message(str); // Verify that this is a valid IRC message
    this.generation += 1;
    let generation = this.generation;
    let resolve, reject;
    let pending_answare = new SynchronousPromise((rs,rj)=>{
      resolve = rs;
      reject = rj;
    });
    setTimeout(()=>{
      this.generation += 1;
      if(pending_answare && !pending_answare.wait)
        pending_answare.reject(new IRCError({code:-1, args: [], argstr: ''}));
    }, 0);
    pending_answare.resolve = resolve;
    pending_answare.reject = reject;
    pending_answare.catch(()=>{}); // Ignore uncatched errors. Errors are the default.
    (async()=>{
      if(this.pending_answare && this.pending_answare.wait)
        await this.pending_answare;
      this.ws.send(utf8.encoder.encode(str+'\r\n'));
      setTimeout(()=>pending_answare.reject(new IRCError({code:-1, args: [], argstr: ''})), timeout || this.request_timeout);
      await pending_answare.catch(e=>{});
      if(this.pending_answare == pending_answare)
        this.pending_answare = null;
    })();
    return {
      then: (resolve, reject)=>{
        if(this.generation != generation)
          throw new Error("then/await must be called before next send\n");
        let res = pending_answare.then(resolve, reject);
        pending_answare.wait = true;
        this.pending_answare = pending_answare;
        return res;
      }
    };
  }

  send(command, {prefix, args, timeout}){
    if(!command || /[ ]|^:/.test(command))
      throw new Error("Invalid command syntax");
    let message = command;
    if(prefix){
      if(/ /.test(prefix))
        throw new Error("Invalid prefix");
      message = ':' + prefix + ' ' + message;
    }
    if(args && args.length){
      args = args.map( x => x===null || x===undefined ? '' : ''+x );
      let last_arg = args.pop();
      if(args.length){
        if(args.some(x=>/[ ]|^:/.test(x)))
          throw new Error("Invalid command argument syntax");
        message += ' ' + args.join(' ');
      }
      if(/[ ]|^:/.test(last_arg))
        last_arg = ':' + last_arg;
      message += ' ' + last_arg;
    }
    return this.send_raw(message, timeout);
  }

  onmessage(event){
    if(!(event.data instanceof ArrayBuffer))
      throw new Error("Can only handle ArrayBuffer");
    let data = utf8.decoder.decode(event.data);
    do {
      let newlineat = data.indexOf('\r\n')
      if(this.ignore_command){
        if(newlineat == -1)
          return;
        data = data.slice(newlineat+2);
        this.ignore_command = false;
        this.buffer = '';
      }
      let total_length = this.buffer.length + (newlineat == -1 ? data.length : newlineat);
      if(total_length > 510)
        console.warn("Got a line longer than 510 bytes");
      if(total_length > this.message_length_limit){
         this.buffer = "";
         this.ignore_command = true;
         console.error(`Line too long (${total_length} > ${this.message_length_limit})`);
         return;
      }
      if(newlineat == -1){
        if(this.buffer.length + data.length > this.max_length)
        this.buffer = data;
        return;
      }else{
        let message = this.buffer + data.slice(0, newlineat);
        data = data.slice(newlineat+2);
        try {
          let result = this.eval_message(message);
        } catch(error) {
          console.error(error, message);
        }
      }
    } while(data.length);
  }

  parse_message_target(full){
    if(!full)
      return null;
    let result = {
      full,
      channel: null,
      nick: null,
      user: null,
      host: null,
      me: false
    };
    let channel = full.match(/^(#|\+|!([0-9A-Z]{5})|&)(.*)$/);
    result.is_channel = !!channel;
    if(channel){
      result.channel_id = channel[2] || null;
      result.channel = channel[3] || null;
      result.normalized = '#' + (result.channel||'');
    }else{
      result.is_nick = true;
      let [_0, nick, _1, user, _2, host] = full.match(/^([^%@]*)(%([^@]*))?(@(.*))?$/);
      result.nick = nick || null;
      result.user = user || null;
      result.host = host || null;
      result.normalized = result.nick;
      result.me = result.normalized === this.nick;
    }
    return result;
  }

  parse_message_targets(str){
    if(!str)
      return str;
    return str.split(',').map(x=>this.parse_message_target(x));
  }

  onirc_PING(from, server1, server2){
    this.send("PONG", {args:[this.nick, server1]});
  }

  static split_cmd(cmd, options){
    let {args, before, after, prefix} = options;
    if(!before) before = '';
    if(!after ) after  = '';
    if(!prefix) prefix = '';
    if(!args)
      return [];
    let text = args.pop();
    let length_left = 510 - (prefix ? prefix.length + 1 : 0) - cmd.length - 1 - before.length - after.length - args.reduce((a,b)=>a+b.length+1, 0);
    if(length_left <= 255 || isNaN(length_left))
      throw new Error("length of repeating command parts is more than half the line length limit, let's not do this...");
    return text.split('\n').map(part=>{
      let ll = length_left;
      if(/ |^:/.test(text))
        ll -= 1;
      let res = [];
      while(part.length){
        let fragment = part.slice(0, ll);
        part = part.slice(ll);
        res.push(before + fragment + after);
      }
      return res;
    }).flat().map(part=>({
      ...options,
      args: [...args, part]
    }));
  }

  get me(){
    return {
      me: true,
      nick: this.nick,
    };
  }

  close(){
    this.ws.close();
  }
}
