/* @pollon/pollon - v1.0.0
* https://github.com/pollon-js/pollon#readme
* 2020 Francesco Lasaracina. Licensed ISC */
System.register(["@pollon/light-dom","@pollon/state-machine","@pollon/message-broker"],(function(e){"use strict";var n,t,r,o,i,a;return{setters:[function(e){n=e.Query},function(e){t=e.StateMachine},function(e){r=e.Publisher,o=e.Broker,i=e.Event,a=e.Subscriber}],execute:function(){function u(e){return new Promise((function(n){setTimeout(n,e)}))}function l(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function c(e,n){for(var t=0;t<n.length;t++){var r=n[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function s(e,n,t){return n&&c(e.prototype,n),t&&c(e,t),e}function h(e,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(n&&n.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),n&&d(e,n)}function f(e){return(f=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function d(e,n){return(d=Object.setPrototypeOf||function(e,n){return e.__proto__=n,e})(e,n)}function v(e,n){return!n||"object"!=typeof n&&"function"!=typeof n?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):n}function p(e,n,t){return(p="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,n,t){var r=function(e,n){for(;!Object.prototype.hasOwnProperty.call(e,n)&&null!==(e=f(e)););return e}(e,n);if(r){var o=Object.getOwnPropertyDescriptor(r,n);return o.get?o.get.call(t):o.value}})(e,n,t||e)}function m(e,n){return g(e)||function(e,n){if(!(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e)))return;var t=[],r=!0,o=!1,i=void 0;try{for(var a,u=e[Symbol.iterator]();!(r=(a=u.next()).done)&&(t.push(a.value),!n||t.length!==n);r=!0);}catch(e){o=!0,i=e}finally{try{r||null==u.return||u.return()}finally{if(o)throw i}}return t}(e,n)||k()}function y(e){return function(e){if(Array.isArray(e)){for(var n=0,t=new Array(e.length);n<e.length;n++)t[n]=e[n];return t}}(e)||w(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function g(e){if(Array.isArray(e))return e}function w(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}function k(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function b(e){return"string"==Object.prototype.toString.call(e).match(/^\[object\s(.*)\]$/)[1].toLowerCase()}e("wait",u);var P=e("INJECTION_MODES",{APPEND:"lifecycle.injection-mode.append",PREPEND:"lifecycle.injection-mode.prepend",REPLACE:"lifecycle.injection-mode.replace"}),E=function(e,n){e.setAttribute("data-view-state",n)},R=function(e){var t;if(!b(e.root))throw new Error("Pollon: [kernel:lifecycle] Root must be a valid CSS selector");if(!(t=n(document).one(e.root)).length)throw new Error("Pollon: [kernel:lifecycle] Root must be a valid node");switch(E(e.node.get(0),"detached"),e.injectionMode){case M.INJECTION_MODES.APPEND:t.append(e.node);break;case M.INJECTION_MODES.PREPEND:t.prepend(e.node);break;case M.INJECTION_MODES.REPLACE:t.replace(e.node)}},M=e("KernelLifecycle",function(){function e(r){l(this,e),this.root=null,this.injectionMode=null,this.ID=r,this.node=n.element("div",{"data-view":r}),this.FSM=new t({initial:"detached",transitions:{detached:{initialize:"initialized"},initialized:{load:"loaded"},loaded:{applyBindings:"bound"},bound:{dispose:"disposed"},disposed:{restart:"initialized"}}})}return s(e,null,[{key:"EVENTS",get:function(){return t.EVENTS}},{key:"INJECTION_MODES",get:function(){return P}}]),s(e,[{key:"initialize",value:function(e){var n=this;return this.FSM.can("initialize")?new Promise((function(t,r){E(n.node.get(0),"detached"),R(n),t(e)})).then(this.FSM.handle.bind(this.FSM,"initialize")):Promise.resolve(e)}},{key:"load",value:function(e){var t=this;return this.FSM.can("load")?new Promise((function(r,o){var i;i=t.node.get(0),document.body==i||document.body.compareDocumentPosition(i)&Node.DOCUMENT_POSITION_CONTAINED_BY||R(t),void 0===e&&(e=n.element("<div>").get(0)),t.node.replace(e),E(t.node.get(0),"loaded"),r(e)})).then(this.FSM.handle.bind(this.FSM,"load")):Promise.resolve(e)}},{key:"applyBindings",value:function(){var e=this;if(!this.FSM.can("applyBindings"))return Promise.resolve();for(var n=arguments.length,t=new Array(n),r=0;r<n;r++)t[r]=arguments[r];return this.FSM.handle("applyBindings",t).then((function(){E(e.node.get(0),"ready")}))}},{key:"dispose",value:function(){var e=this;return this.FSM.can("dispose")?this.FSM.handle("dispose",this.node.get(0)).then((function(n){n||e.node.unbind(),E(e.node.get(0),"disposed")})).then((function(){return e.FSM.handle("restart")})):Promise.resolve()}}]),e}()),N=function(e,n){if(e[n]){for(var t=arguments.length,r=new Array(t>2?t-2:0),o=2;o<t;o++)r[o-2]=arguments[o];return e[n].apply(e,r)}};e("Lifecycle",function(){function e(n){l(this,e),this.Module=n}return s(e,[{key:"init",value:function(){return N(this.Module.View,"init")}},{key:"onLoad",value:function(e){return N(this.Module.View,"onLoad",e)}},{key:"onApplyBindings",value:function(){for(var e=arguments.length,n=new Array(e),t=0;t<e;t++)n[t]=arguments[t];return N.apply(void 0,[this.Module.View,"onApplyBindings"].concat(n))}},{key:"onDispose",value:function(){for(var e=arguments.length,n=new Array(e),t=0;t<e;t++)n[t]=arguments[t];return N.apply(void 0,[this.Module.View,"onDispose"].concat(n))}}]),e}());function A(e){return e instanceof Function}function S(){var e=(new Date).getTime();return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(n){var t=(e+16*Math.random())%16|0;return e=Math.floor(e/16),("x"==n?t:7&t|8).toString(16)}))}function T(e){return"object"==Object.prototype.toString.call(e).match(/^\[object\s(.*)\]$/)[1].toLowerCase()}var I=e("Module",function(){function e(){l(this,e)}return s(e,null,[{key:"create",value:function(n){if(n instanceof e)return n;if(!T(n)&&!A(n))throw new Error("Pollon: [Module:invalid] module must be either an object, a function or a Module instance");A(n)&&(n=n.prototype&&n.prototype.constructor.name?new n:n());var t=new e;return Object.assign(n,t)}}]),s(e,[{key:"canActivate",value:function(){return!0}},{key:"canDeactivate",value:function(){return!0}}]),e}());var D=function(){function e(){l(this,e),this.store={}}return s(e,[{key:"put",value:function(e,n){this.store[e]=n}},{key:"get",value:function(e){return this.store[e]}}]),e}(),x=e("TemplateLoader",function(){function e(n){l(this,e),this.appName=n,this.cache=new D,this.extension=".jpt"}return s(e,[{key:"canParse",value:function(e){return-1<e.indexOf(this.extension,e.length-this.extension)}},{key:"getInfo",value:function(e){var n;if(this.canParse(e))return{id:n=e.substring(0,e.length-this.extension.length),path:n+this.extension}}},{key:"get",value:function(e){var n,t,r=this;return this.canParse(e)?(t=this.getInfo(e),n=Z.get(this.appName),new Promise((function(o,i){n.loadText(t.path).then((function(e){o(e)})).catch((function(n){r.onUnloadable(e,t,n).then((function(e){o(e)}))}))}))):Promise.reject()}},{key:"onUnloadable",value:function(e,n,t){var r;return r='Not Found. Searched for "'+n.id+'" via path "'+n.path+'".',Promise.resolve(r)}}]),e}()),O=function(e){var n,t,r;if((n=document.createElement("div")).innerHTML=e,!(t=n.childNodes).length)return n.cloneNode(!0);if(1==t.length)return t[0].cloneNode(!0);if(r=[],t.forEach((function(e){if(3==e.nodeType&&(!/\S/.test(e.nodeValue)||!e.nodeValue.trim()))return;r.push(e)})),r.length>1){var o=document.createElement("div");return r.forEach((function(e){o.appendChild(e)})),o.cloneNode(!0)}return r[0].cloneNode(!0)},j=e("HTMLLoader",function(e){function n(e){var t;return l(this,n),(t=v(this,f(n).call(this,e))).extension=".jpt",t}return h(n,e),s(n,[{key:"get",value:function(e){var t,r=this;if(b(e))return this.canParse(e)?(t=this.getInfo(e),this.cache.get(t.id)?new Promise((function(e,n){e(r.cache.get(t.id).cloneNode(!0))})):p(f(n.prototype),"get",this).call(this,e).then((function(e){var n=O(e.trim());return r.cache.put(t.id,n),n.cloneNode(!0)}))):Promise.reject("Pollon: [template:html] ".concat(e," element is unparseable by the HTML loader"));if(!function(e){return e&&1===e.nodeType||e&&11===e.nodeType||e&&9===e.nodeType}(e))throw new Error("Pollon: [template:html] You must pass either a file path or a DOM Node for the HTML Loader to work properly");return O(e).cloneNode(!0)}},{key:"onUnloadable",value:function(e,t,r){return p(f(n.prototype),"onUnloadable",this).call(this,e,t,r).then((function(e){return O('<div class="view-404">Template '.concat(e,"</div>"))})).catch((function(e){return O('<div class="view-404">Template '.concat(e,"</div>"))}))}}]),n}(x)),_=function(){function e(n){if(l(this,e),!n.name)throw new Error("Pollon [router:route:invalid] Route must have a name!");this.name=n.name,this.pattern=e.parse(n.pattern)[0],this.params=e.parse(n.pattern)[1],this.path=n.path||"",this.ID=n.module,this.parentID=null,this.handler=function(){},this.args=null,this.injection={point:n.injection.point,mode:n.injection.mode}}return s(e,null,[{key:"parse",value:function(e){var n;return n=[],[e.replace(/(:[^/<>]+)(?:<([^>]+)>)?/g,(function(t,r,o){if(r.split(" ").length>1)throw new Error("Pollon: [router:route:invalid] Invalid route pattern: ".concat(e));return n.push(r),o?"("+o+")":"([^/]+)"})),n]}}]),e}(),L=function(e){return e&&e.toString().replace(/^\//,"").replace(/\/$/,"")},F=function(){function e(n){l(this,e),this.routes={},this.current={},this.mode="onpopstate",this.initialized=!1,this.preventPushStateForInnerRecursiveCalls=!1,this.baseUrl=n,this.onNavigationStart=function(){},this.recursiveCounter=0}return s(e,[{key:"patternMatch",value:function(e){var n;return void 0!==this.current.hash&&(e=L(e),!!(n=this.current.hash.match(e))&&(n.shift(),n))}},{key:"match",value:function(e){var n,t=Object.entries(e);if(void 0===this.current.hash)return!1;for(var r=0,o=t;r<o.length;r++){var i=m(o[r],2)[1];if(n=this.patternMatch(i.pattern),n)return[i,n]}return!1}},{key:"add",value:function(e){this.routes[e.name]=e}},{key:"remove",value:function(e){var n;n=this.routes.filter((function(n){return n.pattern!=e.pattern})),this.routes=n}},{key:"getByName",value:function(e){return this.routes[e]&&this.routes[e]}},{key:"executeRoute",value:function(e){var n,t,r=this;if(this.current.hash=L(e),!(t=this.match(this.routes)))return Promise.reject("Pollon: [router:route:not-found] Route ".concat(e," not found"));n=[].concat(t[1]||[]);for(var o=arguments.length,i=new Array(o>1?o-1:0),a=1;a<o;a++)i[a-1]=arguments[a];return i&&(n=t[1].concat(i)),t[0].handler.apply({},n).then((function(n){if(n)if(r.recursiveCounter=0,"onhashchange"==r.mode)window.location.href=window.location.href.replace(/#(.*)$/,"")+"#"+L(e);else{var t=r.initialized?"pushState":"replaceState";if(r.initialized=!0,!r.preventPushStateForInnerRecursiveCalls){var o=document.createElement("a");o.href=window.location.origin.replace(/$\/+/,"")+"/"+e.replace(/^\/+/,""),history[t](null,null,o.href)}}}))}},{key:"listen",value:function(){var e=this;window[this.mode]=function(){var n;n="onhashchange"==e.mode?(n=window.location.href.match(/#(.*)$/))?n[1]:"":(n=L(decodeURI(location.pathname+location.search))).replace(/\?(.*)$/,""),e.preventPushStateForInnerRecursiveCalls=!0,n!=e.current.hash?e.navigate(n,void 0):e.navigate(e.current.hash,void 0)}}},{key:"navigate",value:function(e){for(var n=this,t=arguments.length,r=new Array(t>1?t-1:0),o=1;o<t;o++)r[o-1]=arguments[o];if(this.recursiveCounter++,this.recursiveCounter>=10)throw"Pollon [router:lifecycle] navigation loop detected";if(e=this.baseUrl+e,this.current.hash===e)return Promise.resolve();var i=this.current.hash;return Promise.resolve().then((function(){return n.onNavigationStart.apply(n,[e].concat(r))})).then((function(){return n.executeRoute.apply(n,[e].concat(r))})).then((function(){n.preventPushStateForInnerRecursiveCalls=!1})).catch((function(e){if(n.current.hash=L(i),"onhashchange"==n.mode?window.location.href=window.location.href.replace(/#(.*)$/,"")+"#"+i:history.pushState(null,null,window.location.href),console.warn(e),e&&e.url)return console.warn("Pollon [router:lifecycle] Redirecting to ".concat(e.url)),n.navigate(e.url,e.args||void 0);throw n.recursiveCounter=0,e}))}},{key:"navigateBack",value:function(){window.history.back()}},{key:"navigateForward",value:function(){window.history.forward()}}]),e}();function B(e,n){return n=n||"./",0===e.indexOf("@")&&(n=""),n+e}var C=function(e,n,t){return n.path=n.path||B(n.ID,e),t(n.path).then((function(e){if(e.Runtime&&n.injection.point){var t=function(e,n,t){var r;if(e||(e=P.APPEND),!n)throw new Error('Pollon: [Router] Invalid injection options for Module  "'.concat(t.ID,'"'));if(!(r=Object.values(P).filter((function(n){return e==n}))).length)throw new Error('Pollon: [Router] Invalid injection method for Module  "'.concat(t.ID,'"'));return{point:n,mode:r[0]}}(n.injection.mode,n.injection.point,e);e.Runtime.injectionMode=t.mode,e.Runtime.root=t.point}return e}))},U=function e(n,t,r,o,i){return t.path=t.path||B(t.ID,n),C(n,t,o).then((function(e){return r.length&&(r[r.length-1].module=e),e})).then((function(a){if(!a)return r;if(!a.Router)return r;a.Router.routes=Array.isArray(a.Router.routes)?a.Router.routes:[];var u=function(e,n,t){var r;return e.forEach((function(e){var o,i,a,u,l,c;r||e.pattern&&(o=_.parse(n.pattern),a=_.parse(e.pattern),i=o[0].replace(/^[\^]/,""),u=a[0].replace(/^[\^]/,""),l=(l=i?i+"/"+u:u).replace(/\/$/,""),(c=t(new RegExp(l)))&&((r=new _(e)).pattern=l,r.args=c.slice(-a[1].length),r.parentID=n.ID,console.info("Pollon: [router] Discovering new child route: ".concat(r.name," with: "),r.args)))})),r||new Error("Pollon: [router:child-route-not-found] Child route for ".concat(n.name," not found")),r}(a.Router.routes,t,i);return u?(r.push(u),e(n,u,r,o,i)):r}))},V=function(e,n,t,r){return U(e,n,[n],t,r)},z=function(e,n){return Promise.resolve({off:e.reverse(),on:[n],active:[n]})},$=function(e,n,t){return n.then((r=t.module,function(n){return e.kernel.canDeactivateModule(r).then((function(e){return e.url?e:e&&n}))}));var r},G=function(e,n,t,r){return t.then((o=r.module,i=r.args||[],function(t){var r;return(r=e.kernel).canActivateModule.apply(r,[o].concat(y(i.concat(n)))).then((function(e){return e&&e.url?e:e&&t})).catch(console.log.bind(console))}));var o,i};function H(e,n,t){return n?new Promise((function(r,o){n.off.reduce($.bind(null,e),Promise.resolve(!0)).then((function(e){e||o()})).then((function(){return n.on.reduce(G.bind(null,e,t),Promise.resolve(!0))})).then((function(e){e&&e.url?o(e):e?r(n):o(e)})).catch(o.bind(o))})):{off:[],on:[],active:[]}}function J(e,n,t,r,o){var i,a,u,l,c,s;if((i=Array.isArray(e)?Array.prototype.slice.call(e):[],u={active:a=Array.isArray(n)?Array.prototype.slice.call(n):[],on:[],off:[]},a.length)&&!((l=a.slice().reverse())[0].pattern.length?t.match(l[0].pattern):t==l[0].pattern))return z(i,o);if(!i.length)return u.off=[],u.on=a,Promise.resolve(u);if(!a.length)return z(i,o);for(c=0,s=0;c<i.length&&a[s]&&a[s].pattern===i[c].pattern;c++,s++);return u.off=(i.slice(c)||[]).reverse(),u.on=a.slice(s)||[],0==u.on.length&&0==u.off.length&&(r!=t||!(arguments.length<=5)&&arguments.length-5)&&u.active.length&&(u.off=[u.active[u.active.length-1]],u.on=[u.active[u.active.length-1]]),Promise.resolve(u)}var K=function(e){var n=this;return function(){for(var t=arguments.length,r=new Array(t),o=0;o<t;o++)r[o]=arguments[o];return V(n.baseUrl,e,n.kernel.getModule.bind(n.kernel),n.Router.patternMatch.bind(n.Router)).then((function(e){var t;if((t=(t=_.parse(e[e.length-1].pattern)[0].replace(/^[\^]/,"")).replace(/\/$/,""))&&!n.currentPath.match(new RegExp("^"+t+"$")))throw console.warn(t,n.currentPath),new Error("Pollon: [router:not-found] route not found for ".concat(n.currentPath));return e})).then((function(e){return n._404?(n._404.module?Promise.resolve(n._404.module):C(n.baseUrl,n._404,n.kernel.getModule.bind(n.kernel))).then((function(t){return n._404.module=t,J.apply(void 0,[n.stack,e,n.currentPath,n.lastFetchedUrl,n._404].concat(r))})):Promise.resolve()})).catch((function(e){return console.warn(e),(n._404.module?Promise.resolve(n._404.module):C(n.baseUrl,n._404,n.kernel.getModule.bind(n.kernel))).then((function(e){return n._404.module=e,{on:[n._404],off:(n.stack||[]).reverse(),active:[n._404]}}))})).then((function(t){var o=(e.args||[]).concat(r);return n.workflow.reduce((function(e,n){var r=t.on[t.on.length-1];return r||(r=t.off[0]),e.then((function(){return n.apply(void 0,[r].concat(y(o)))}))}),Promise.resolve()).then((function(){return t})).catch((function(e){if(console.log(e),e&&e.url)throw e;return{on:[],off:[],active:t.active,preventNavigation:!0,reason:"Pollon [router:lifecycle] A navigation policy prevented navigation to ".concat(n.Router.current.hash)}}))})).then((function(t){if(t.on&&t.off)return H(n,t,r).catch((function(e){if(console.log(e),console.warn("Pollon [router:lifecycle] failed to activate or deactivate module",n.Router.current.hash),e&&e.url)throw e;return{on:[],off:[],active:t.active,preventNavigation:!0,reason:"Pollon [router:lifecycle] failed to activate or deactivate module ".concat(n.Router.current.hash)}}));throw new Error("Pollon [router:not-found] route ".concat(e.name," not found"))})).then((function(e){var t,o,i,a,u;if(u=n.kernel.currentModule,e.preventNavigation)throw e.reason;i=Array.prototype.slice.apply(e.off),a=Array.prototype.slice.apply(e.on),t=function(e){return e?(console.info("Pollon [router:deactivating] ".concat(e.ID)),n.kernel.deactivate(e.path).then((function(){var e=i.shift();return t(e)}))):Promise.resolve()},o=function(e){var t;if(n.kernel.currentModule=null,!e)return Promise.resolve();console.info("Pollon [router:activating]",e.ID,"route-params:",e.args,"injected-params:",r);var i=e.args||[];return i=i.slice().concat(r||[]),(t=n.kernel.activate).call.apply(t,[n.kernel,e.path].concat(y(i))).then((function(){var e=a.shift();return o(e)}))};var l=i.shift();return t(l).then((function(){var t=a.shift();return o(t).then((function(){var t,o;n.stack.length&&(!e.on.length&&n.stack[n.stack.length-2]&&n.stack[n.stack.length-2].module&&n.stack[n.stack.length-2].module.resumeFromChildren&&(o=(n.stack[n.stack.length-2].args||[]).slice().concat(r||[]))&&(t=n.stack[n.stack.length-2].module).resumeFromChildren.apply(t,y(o)));return n.stack=e.active,n.lastFetchedUrl=n.Router.current.hash,n.kernel.currentModule=e.active&&e.active[e.active.length-1].module,n.kernel.busy(!1),!0})).catch((function(e){throw n.kernel.currentModule=u,n.kernel.busy(!1),e}))}))}))}},W=function(){function e(n,t){l(this,e),this.Router=new F(n.baseUrl),this.Router.onNavigationStart=this.onNavigationStart.bind(this),this.baseUrl=n.baseUrl,this.appRoot=n.selector,this.lastFetchedUrl=null,this.kernel=n.kernel,this.workflow=t.workflow||[],this.stack=[],this.fallbackStack=[],this._404=null,t.routes&&Array.isArray(t.routes)&&this.map(t.routes)}return s(e,[{key:"currentPath",get:function(){return this.Router.current.hash}}]),s(e,[{key:"map",value:function(e){var n=this;(e=Array.isArray(e)?e:[e]).forEach((function(e){e.name&&(n.Router.getByName(e.name)&&console.warn("Pollon [router:map] Skipping ".concat(e.name,": route already exists")),(e=new _(e)).handler=K.call(n,e),"404"!=e.name||n._404||(n._404=e),n.Router.add(e))}))}},{key:"listen",value:function(){this.Router.listen()}},{key:"canNavigate",value:function(){return!this.kernel.busy()}},{key:"onNavigationStart",value:function(e){this.kernel.busy(!0)}},{key:"navigate",value:function(e){for(var n,t=this,r=arguments.length,o=new Array(r>1?r-1:0),i=1;i<r;i++)o[i-1]=arguments[i];return u(1).then((function(){var r;if(t.canNavigate())return n=t.kernel.currentModule,(r=t.Router).navigate.apply(r,[e].concat(o))})).catch((function(e){throw t.kernel.currentModule=n,t.kernel.busy(!1),e}))}},{key:"navigateBack",value:function(){var e,n=this;return u(1).then((function(){if(n.canNavigate())return e=n.kernel.currentModule,n.Router.navigateBack()})).catch((function(t){throw n.kernel.currentModule=e,n.kernel.busy(!1),t}))}},{key:"navigateForward",value:function(){var e,n=this;return u(1).then((function(){if(n.canNavigate())return e=n.kernel.currentModule,n.Router.navigateForward()})).catch((function(t){throw n.kernel.currentModule=e,n.kernel.busy(!1),t}))}}]),e}(),q=function(e){function n(e){var t;return l(this,n),(t=v(this,f(n).call(this,Z.STARTED))).appName=e,t}return h(n,e),n}(i),Y=function(e){function n(){return l(this,n),v(this,f(n).call(this,Z.NAVIGATION_START))}return h(n,e),n}(i),Q=function(e){function n(){return l(this,n),v(this,f(n).call(this,Z.NAVIGATION_END))}return h(n,e),n}(i),X={},Z=e("Application",function(){function e(n,t){var i=this;if(l(this,e),!n)throw new Error("Pollon: [application] application must have a name");if(X[n]&&X[n].instance)throw new Error("Pollon: [application:exists] another application called ".concat(n," already exists"));this.name=n,this.root=t.root||"body",this.baseUrl=void 0!==t.baseUrl?t.baseUrl:"./";var a=t.loader||null,u=t.binder||null;this.kernel=new fe(n,a,u),this.publisher=new r([e.STARTED,e.NAVIGATION_START,e.NAVIGATION_END]),this.Templates={HTML:new j(this.name)},this.Bus=new o,this.Providers=new o,this.Bus.add(this.publisher),this.busy.subscribe((function(n,t){if("busy"==t.status)return document.querySelector(i.root).classList.add("is-transitioning"),void i.publisher.fire(e.NAVIGATION_START,new Y);document.querySelector(i.root).classList.remove("is-transitioning"),i.publisher.fire(e.NAVIGATION_END,new Q),i.kernel.currentModule&&(document.querySelector(i.root).setAttribute("active-view",i.kernel.currentModule.name),i.kernel.currentModule.title&&(document.title=i.kernel.currentModule.title))})),X[this.name]={instance:this,prepared:!1,started:!1,loader:a,plugins:[],routes:[],navigationWorkflow:[]},u.init(this)}return s(e,[{key:"busy",get:function(){return this.kernel.busy}},{key:"moduleInitialized",get:function(){return this.kernel.moduleInitialized}},{key:"moduleLoaded",get:function(){return this.kernel.moduleLoaded}},{key:"moduleReady",get:function(){return this.kernel.moduleReady}},{key:"moduleDisposed",get:function(){return this.kernel.moduleDisposed}}],[{key:"get",value:function(e){if(X[e])return X[e].instance}},{key:"STARTED",get:function(){return"application.started"}},{key:"NAVIGATION_START",get:function(){return"application.navigation.start"}},{key:"NAVIGATION_END",get:function(){return"application.navigation.end"}}]),s(e,[{key:"loadText",value:function(e){if(X[this.name].loader)return X[this.name].loader.loadText(e);throw new Error("Pollon: [application:strategies:unset] LoadText strategy is missing.")}},{key:"load",value:function(e){if(X[this.name].loader)return X[this.name].loader.load(e);throw new Error("Pollon: [application:strategies:unset] Load strategy is missing.")}},{key:"loadPlugins",value:function(e){if(X[this.name].loader)return X[this.name].loader.loadPlugins(e);if(!e.length)throw new Error("Pollon: [application:strategies:unset] Plugin loading strategy is missing");return[]}},{key:"resolvePluginURI",value:function(e,n){return X[this.name].loader?X[this.name].loader.resolvePluginURI(e,n):n}},{key:"routes",value:function(e){var n;return X[this.name].routes=(n=X[this.name].routes).concat.apply(n,y(e)),this}},{key:"navigationStep",value:function(){var e;return X[this.name].navigationWorkflow=(e=X[this.name].navigationWorkflow).concat.apply(e,arguments),this}},{key:"use",value:function(e,n){var t=this;return Object.keys(e).forEach((function(r){X[t.name].plugins.push({name:r,url:t.resolvePluginURI(r,n),config:e[r]})})),this}},{key:"prepare",value:function(){var e=this;if(X[this.name]&&!X[this.name].prepared){X[this.name].prepared=!0;var n=[];return X[this.name].plugins.forEach((function(e){n.push(e.url)})),this.loadPlugins(n).then((function(n){var t,r=(g(t=n)||w(t)||k()).slice(0),o=-1;return r.map((function(n){var t,r;return o++,r=X[e.name].plugins[o].name,t=T(t=X[e.name].plugins[o].config)?t:t(e.name),t=T(t)?t:{},n.install?{name:r,canInstall:!0,plugin:n,config:t}:{name:r,canInstall:!1,plugin:n}})).reduce((function(n,t){return n.then((function(){var n;return t.canInstall&&(n=t.plugin.install(e,t.config)),(n=n&&n.then?n:Promise.resolve()).then((function(){return t}))})).then((function(e){console.info("Pollon: [Plugin:installed] ".concat(e.name))})).catch(console.error.bind(console))}),Promise.resolve())}))}}},{key:"start",value:function(){if(X[this.name]&&!X[this.name].started&&(X[this.name].started=!0,X[this.name].routes.length)){var n=new W(this,{routes:X[this.name].routes,workflow:X[this.name].navigationWorkflow});this.navigate=n.navigate.bind(n),this.navigateBack=n.navigateBack.bind(n),this.navigateForward=n.navigateForward.bind(n),this.currentPath=function(){return n.currentPath};var t=X[this.name].routes.filter((function(e){return!!e.default}));return n.listen(),this.publisher.fire(e.STARTED,new q(this.name)),t.length&&this.navigate(t[0].pattern)}}}]),e}()),ee="kernel.status",ne="kernel.module.initialized",te="kernel.module.loaded",re="kernel.module.ready",oe="kernel.module.disposed",ie=function(e){function n(e){var t;return l(this,n),(t=v(this,f(n).call(this,ee))).status=e?"busy":"idle",t}return h(n,e),n}(i);function ae(e){var n,t;return(t=function(t){return void 0===t?!!n:(n=!!t,e.publisher.fire(ee,new ie(!!t),e))}).subscribe=function(n,t){var r={};r[ee]={method:n,once:!!t},e.Bus.add(new a(r))},t}var ue=function(e){function n(e){var t;return l(this,n),(t=v(this,f(n).call(this,ne))).module=e,t}return h(n,e),n}(i);var le=function(e){function n(e){var t;return l(this,n),(t=v(this,f(n).call(this,te))).module=e,t}return h(n,e),n}(i);var ce=function(e){function n(e,t){var r;return l(this,n),(r=v(this,f(n).call(this,re))).module=e,r.args=t,r}return h(n,e),n}(i);var se=function(e){function n(e){var t;return l(this,n),(t=v(this,f(n).call(this,oe))).module=e,t}return h(n,e),n}(i);var he=function(e,n,t){return n},fe=e("Kernel",function(){function e(n,t,i){var u,c,s,h;if(l(this,e),!t||!t.loadModule)throw new Error("Pollon: [application:strategies:unset] Module loading strategy is missing.");u=t.loadModule.bind(t),i&&i.applyBindings?c=i.applyBindings.bind(i):(console.warn("Pollon: [application:strategies:unset] MVVM strategy is missing. Default strategy is being used (no binding)"),c=he),this.loadTemplate=function(e){return function(n){var t=Z.get(e);if(n&&n.View&&n.View.template)return t.Templates.HTML.get(n.View.template)}}(n),this.loadModule=u,this.applyBindings=c,this.appName=n,this.modules={},this.currentModule=null,this._transitionDelay=300,this.busy=ae(this),this.moduleInitialized=(s=this,(h=function(e){return s.publisher.fire(ne,new ue(e),s)}).subscribe=function(e,n){var t={};t[ne]={method:e,once:!!n},s.Bus.add(new a(t))},h),this.moduleLoaded=function(e){var n;return(n=function(n){return e.publisher.fire(te,new le(n),e)}).subscribe=function(n,t){var r={};r[te]={method:n,once:!!t},e.Bus.add(new a(r))},n}(this),this.moduleReady=function(e){var n;return(n=function(n,t){return e.publisher.fire(re,new ce(n,t),e)}).subscribe=function(n,t){var r={};r[re]={method:n,once:!!t},e.Bus.add(new a(r))},n}(this),this.moduleDisposed=function(e){var n;return(n=function(n){return e.publisher.fire(oe,new se(n),e)}).subscribe=function(n,t){var r={};r[oe]={method:n,once:!!t},e.Bus.add(new a(r))},n}(this),this.busy=ae(this),this.Bus=new o,this.publisher=new r([ee,ne,oe,te,re]),this.Bus.add(this.publisher)}return s(e,[{key:"getModule",value:function(e){var n,t=this;if(this.modules[e])return Promise.resolve(this.modules[e]);try{n=this.loadModule(this.appName,e)}catch(n){throw new Error("Pollon: [Kernel:module:loading] Cannot load module ".concat(e,": ").concat(n))}if(!n)throw new Error("Pollon: [Kernel:module:loading] Cannot load module ".concat(e));return n.then||(n=Promise.resolve(n)),n.then((function(n){return(n=I.create(n)).ID=e,n.Runtime=new M(e),t.modules[e]=n,n})).then((function(e){return e.Runtime.FSM.on(M.EVENTS.ON,"initialize",(function(n,r){return e.appName=r.args[0],t.moduleInitialized(e.name),e.Lifecycle&&A(e.Lifecycle.init)&&e.Lifecycle.init()})),e.Runtime.FSM.on(M.EVENTS.ENTERED,"loaded",(function(n,r){var o;return t.moduleLoaded(e.name),e.Lifecycle&&A(e.Lifecycle.onLoad)&&(o=e.Lifecycle).onLoad.apply(o,y(r.args||[]))})),e.Runtime.FSM.on(M.EVENTS.ENTERED,"bound",(function(n,t){var r;return e.Lifecycle&&A(e.Lifecycle.onApplyBindings)&&(r=e.Lifecycle.onApplyBindings).apply.apply(r,[e.Lifecycle].concat(y(t.args||[])))})),e.Runtime.FSM.on(M.EVENTS.ENTERED,"disposed",(function(n,r){var o;return t.moduleDisposed(e.name),e.Lifecycle&&A(e.Lifecycle.onDispose)&&(o=e.Lifecycle).onDispose.apply(o,y(r.args||[]))})),e.onReady=e.onReady&&e.onReady.bind(e)||function(){for(var n=arguments.length,r=new Array(n),o=0;o<n;o++)r[o]=arguments[o];return t.moduleReady(e.name,r)},e}))}},{key:"canDeactivateModule",value:function(e){var n=this;return e.Runtime?new Promise((function(t,r){var o;try{o=e.canDeactivate&&e.canDeactivate(n.appName)}catch(e){t(!1)}return o&&o.then?o.then((function(e){t(e)})).catch(t.bind(t)):t(o)})):Promise.resolve(!0)}},{key:"canActivateModule",value:function(e){for(var n=this,t=arguments.length,r=new Array(t>1?t-1:0),o=1;o<t;o++)r[o-1]=arguments[o];return e.Runtime?new Promise((function(t,o){var i;try{i=e.canActivate&&e.canActivate.apply(e,[n.appName].concat(r))}catch(e){o(e)}return i&&i.then?i.then((function(e){t(e)})).catch(o.bind(o)):t(i)})):Promise.resolve(!0)}},{key:"deactivate",value:function(e){var n=this;return console.log("deactivate",e),this.getModule(e).then((function(t){return n.canDeactivateModule(t).then((function(n){if(!n)throw new Error("Pollon: [kernel:module:deactivation] Unable to deactivate module ".concat(e));return t.Runtime.dispose()}))})).catch(console.info.bind(console))}},{key:"activate",value:function(e){for(var n=this,t=arguments.length,r=new Array(t>1?t-1:0),o=1;o<t;o++)r[o-1]=arguments[o];return e?(this.currentModule?this.deactivate(this.currentModule.Runtime.ID):Promise.resolve(!0)).then((function(){return n.getModule(e)})).then((function(e){return n.canActivateModule.apply(n,[e].concat(r))})).then((function(t){var o;if(!t)throw new Error("Pollon: [kernel:module:activation] Unable to activate module ".concat(e));return(o=n.modules[e].Runtime).initialize.apply(o,[n.appName].concat(r))})).then((function(){var t=n.modules[e];return n.loadTemplate(t)})).then((function(t){return n.modules[e].Runtime.load(t)})).then((function(){var t;(t=n.modules[e]).Runtime.node&&(t.name||(t.name="unknown-module-"+S()),t.Runtime.node.attr("data-view",t.name))})).then((function(){var t=n.modules[e];return n.applyBindings(Z.get(n.appName),t.Runtime.node.get(0),t)})).then((function(){var t;return(t=n.modules[e].Runtime).applyBindings.apply(t,r)})).then((function(){return n._transitionDelay&&u(n._transitionDelay)})).then((function(){var t;return n.currentModule=n.modules[e],n.moduleReady(n.currentModule.name,r),n.currentModule.onReady&&(t=n.currentModule).onReady.apply(t,r)})).catch(console.error.bind(console)):Promise.resolve()}},{key:"setTransitionDelay",value:function(e){this._transitionDelay=+e}}]),e}());e("RedirectCommand",(function e(n){l(this,e),this.url=n})),e("RedirectExternalURICommand",(function e(n){l(this,e),window.location.href=n}))}}}));
