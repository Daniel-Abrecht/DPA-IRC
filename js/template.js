let $protected = Symbol('template');

function* iterate_nodes(...x){
  for(let it=document.createNodeIterator(...x), node; node=it.nextNode(); )
    yield node;
}

function Template(html){
  let root = null;
  if(html instanceof Node){
    root = html.cloneNode(true);
  }else{
    let template = document.createElement("template");
    template.innerHTML = html;
    root = template.content;
  }
  for(let node of iterate_nodes(root, NodeFilter.SHOW_TEXT)){
    let trimmed = node.nodeValue.trim();
    if(!trimmed)
      node.parentNode.removeChild(node);
    node.nodeValue = trimmed;
  }
  return {
    root,
    create(){
      let result = {};
      let fragment = document.importNode(root, true);
      for(let element of Array.from(fragment.querySelectorAll('[\\@]'))){
        let name = element.getAttribute('@');
        if(element instanceof HTMLTemplateElement){
          element.parentNode.removeChild(element);
          result[name] = Template(element.content);
        }else{
          result[name] = element;
        }
      }
      result.fragment = fragment;
      return result;
    }
  };
}

class CustomBaseElement extends HTMLElement {
  constructor(){
    super();
    let shadow = this.attachShadow({mode: 'closed'});
    this.shadow = shadow;
    this[$protected] = {
      shadow
    };
    this[this.constructor.$private] = {};
    mount(this);
    this.T = this.constructor.template.create();
    let fragment = this.T.fragment;
    delete this.T.fragment;
    let loading = document.createTextNode("Loading...");
    shadow.appendChild(loading);
    function ready(){
      shadow.removeChild(loading);
      shadow.appendChild(fragment);
    }
    this.constructor.$ready_promise.then(ready, ready);
  }
  get parentComponent(){
    let root_node = this.getRootNode();
    if(!root_node || !(root_node instanceof ShadowRoot))
      return null;
    return root_node.host || null;
  }
}

function isComponentName(name){
  return name && /^[a-zA-Z0-9-]*-[a-zA-Z0-9-]*$/.test(name);
}

async function loadAllComponents(root){
  await Promise.all(
    [root, ...root.querySelectorAll("*")]
      .filter( x => isComponentName(x.tagName) )
      .map( e => load_component(e.tagName.toLowerCase()) )
      .map( x => Promise.resolve(x).catch(()=>{}) )
  );
}

let mountlist = new Set();

setInterval(()=>{
  for(let entry of mountlist){
    if(entry[$protected].width == entry.offsetWidth)
      continue;
    entry[$protected].width = entry.offsetWidth;
    entry.dispatchEvent(new CustomEvent("resize"));
  }
}, 500);

function unmount(entry){
  if(!entry[$protected])
    return;
  if(!entry[$protected].observer)
    return;
  entry[$protected].observer.disconnect();
  entry[$protected].observer = null;
  mountlist.delete(entry);
  if(entry.unmount instanceof Function)
    try {
      entry.unmount();
    } catch(error) {
      console.error(error);
    }
  unmountAll(entry[$protected].shadow);
}

function unmountAll(root){
  for(let entry of [root, ...root.querySelectorAll("*")].filter(x=>x[$protected])){
    unmount(entry);
  }
}

function mount(entry){
  if(!entry[$protected])
    return;
  if(entry[$protected].observer)
    return;
  if(!entry.isConnected)
    return;
  entry[$protected].observer = observe(entry[$protected].shadow);
  mountlist.add(entry);
  if(entry.mount instanceof Function)
    try {
      entry.mount();
    } catch(error) {
      console.error(error);
    }
}

function mountAll(root){
  for(let entry of [root, ...root.querySelectorAll("*")].filter(x=>x[$protected])){
    mount(entry);
  }
}

function observe(target){
  var observer = new MutationObserver(mutations => {
    for(let mutation of mutations){
      for(let entry of mutation.addedNodes){
        if(entry instanceof HTMLElement){
          mountAll(entry);
          loadAllComponents(entry);
        }
      }
      for(let entry of mutation.removedNodes){
        if(entry instanceof HTMLElement){
          unmountAll(entry);
        }
      }
    }
  });
  var config = { childList: true, subtree:true };
  observer.observe(target, config);
  return observer;
}

function make_url_absolute(url){
  let a = document.createElement('a');
  a.href = url;
  return a.href;
}

function create_component(name, { js, html, css, base_path }){
  let resolve, reject;
  let promise = new Promise((rs,rj)=>{
    resolve = rs;
    reject = (...x)=>{ console.error(...x); return rj(...x); }
  });
  (async()=>{
    if(!js)
      js = '';
    let custom_base = CustomBaseElement;
    let $private = Symbol(name);
    let custom_element = null;
    try {
      custom_element = eval(`(class C_${name.replace(/-/g,'_')} extends custom_base {\n${js}\n})` + (base_path ? `\n//# sourceURL=${make_url_absolute(base_path)}main.js` : ''));
    } catch(e) {
      console.error(e);
      throw e;
    }
    // TODO: Add fallback in case custom_element is null
    custom_element.$private = $private;
    custom_element.$ready_promise = promise;
    let template = Template(html);
    if(css){
      let estyle = document.createElement("style");
      estyle.appendChild(document.createTextNode(css));
      template.root.appendChild(estyle);
    }
    custom_element.template = template;
    customElements.define(name, custom_element);
    await loadAllComponents(template.root);
    return custom_element;
  })().then(resolve, reject);
  return promise;
}

async function fetch_text(allow404, ...x){
  let response = await fetch(...x);
  if(!response.ok){
    if(response.status != 404 || !allow404){
      throw new Error(await response.text());
    }else if(response.status == 404){
      return '';
    }
  }
  return await response.text();
}

let component_cache = Object.create(null);
async function load_component(name){
  let ce = customElements.get(name);
  if(ce)
    return ce;
  if(component_cache[name])
    return component_cache[name];
  return component_cache[name] = (async()=>{
    let base_path = 'component/'+name.replace(/-/g,'/')+'/';

    // Await them as late as possible for concurrencies sake
    let html = fetch_text(false, base_path + 'main.html', {headers: {Accept: 'text/html'}});
    let css  = fetch_text(true , base_path + 'main.css', {headers: {Accept: 'text/css'}});
    let js   = fetch_text(true , base_path + 'main.js', {headers: {Accept: 'text/javascript'}});

    html = await html;
    css  = await css;
    js   = await js;

    return create_component(name, { js, html, css, base_path });
  })();
}

async function Component(name, ...args){
  let component = await load_component(name);
  return new component(...args);
}

function init(){
  loadAllComponents(document);
  observe(document);
}

init();
