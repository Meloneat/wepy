'use strict';

// can we use __proto__?
var hasProto = '__proto__' in {};

var _Set;
/* istanbul ignore if */ // $flow-disable-line
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = (function () {
    function Set () {
      this.set = Object.create(null);
    }
    Set.prototype.has = function has (key) {
      return this.set[key] === true
    };
    Set.prototype.add = function add (key) {
      this.set[key] = true;
    };
    Set.prototype.clear = function clear () {
      this.set = Object.create(null);
    };

    return Set;
  }());
}


/* istanbul ignore next */
function isNative (Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
}

/**
 * String type check
 */
var isStr = function (v) { return typeof v === 'string'; };
/**
 * Number type check
 */
var isNum = function (v) { return typeof v === 'number'; };
/**
 * Array type check
 */
var isArr = Array.isArray;
/**
 * undefined type check
 */
var isUndef = function (v) { return v === undefined; };
/**
 * Function type check
 */
var isFunc = function (v) { return typeof v === 'function'; };
/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

var isObj = isObject;
/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
var _toString = Object.prototype.toString;
function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]';
}

/**
 * Check whether the object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
 */
function noop (a, b, c) {}

/**
 * Check if val is a valid array index.
 */
function isValidArrayIndex (val) {
  var n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

/**
 * Convert an Array-lik object to a real Array
 */
function toArray (list, start) {
  if ( start === void 0 ) start = 0;

  var i = list.length - start;
  var rst = new Array(i);
  while(i--) {
    rst[i] = list[i + start];
  }
  return rst;
}

/*
 * extend objects
 * e.g.
 * extend({}, {a: 1}) : extend {a: 1} to {}
 * extend(true, [], [1,2,3]) : deep extend [1,2,3] to an empty array
 * extend(true, {}, {a: 1}, {b: 2}) : deep extend two objects to {}
 */
function extend () {
  var arguments$1 = arguments;

  var options, name, src, copy, copyIsArray, clone,
  target = arguments[ 0 ] || {},
  i = 1,
  length = arguments.length,
  deep = false;

  // Handle a deep copy situation
  if ( typeof target === 'boolean' ) {
    deep = target;

    // Skip the boolean and the target
    target = arguments[ i ] || {};
    i++;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== 'object' && !(typeof(target) === 'function') ) {
    target = {};
  }

  // Extend jQuery itself if only one argument is passed
  if ( i === length ) {
    target = this;
    i--;
  }

  for ( ; i < length; i++ ) {

    // Only deal with non-null/undefined values
    if ( ( options = arguments$1[ i ] ) ) {

      // Extend the base object
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if ( target === copy ) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if ( deep && copy && ( isPlainObject( copy ) ||
          ( copyIsArray = Array.isArray( copy ) ) ) ) {

          if ( copyIsArray ) {
            copyIsArray = false;
            clone = src && Array.isArray( src ) ? src : [];

          } else {
            clone = src && isPlainObject( src ) ? src : {};
          }

          // Never move original objects, clone them
          target[ name ] = extend( deep, clone, copy );

        // Don't bring in undefined values => bring undefined values
        } else {
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
}

/*
 * clone objects, return a cloned object default to use deep clone
 * e.g.
 * clone({a: 1})
 * clone({a: b: {c : 1}}, false);
 */
function clone (sth, deep) {
  if ( deep === void 0 ) deep = true;

  if (isArr(sth)) {
    return extend(deep, [], sth);
  } else if ('' + sth === 'null') {
    return sth;
  } else if (isPlainObject(sth)) {
    return extend(deep, {}, sth);
  } else {
    return sth;
  }
}

var WEAPP_APP_LIFECYCLE = [
  'onLaunch',
  'onShow',
  'onHide',
  'onError',
  'onPageNotFound'
];

var WEAPP_PAGE_LIFECYCLE = [
  'onLoad',
  'onShow',
  'onReady',
  'onHide',
  'onUnload',
  'onPullDownRefresh',
  'onReachBottom',
  'onShareAppMessage',
  'onPageScroll',
  'onTabItemTap',
  'onResize' ];

var WEAPP_COMPONENT_LIFECYCLE = [
  'beforeCreate',
  'created',
  'attached',
  'ready',
  'moved',
  'detached'
];

var WEAPP_LIFECYCLE = [].concat(WEAPP_APP_LIFECYCLE).concat(WEAPP_PAGE_LIFECYCLE).concat(WEAPP_COMPONENT_LIFECYCLE);

var config = {

}

var warn = noop;

var generateComponentTrace = function (vm) {
  return ("Found in component: \"" + (vm.$is) + "\"");
};

{
  var hasConsole = typeof console !== 'undefined';
  // TODO
  warn = function (msg, vm) {
    if (hasConsole && (!config.silent)) {
      console.error("[WePY warn]: " + msg + (
        vm ? generateComponentTrace(vm) : ''
      ));
    }
  };
}

function handleError (err, vm, info) {
  if (vm) {
    var cur = vm;
    while ((cur = cur.$parent)) {
      var hooks = cur.$options.errorCaptured;
      if (hooks) {
        for (var i = 0; i < hooks.length; i++) {
          try {
            var capture = hooks[i].call(cur, err, vm, info) === false;
            if (capture) { return }
          } catch (e) {
            globalHandleError(e, cur, 'errorCaptured hook');
          }
        }
      }
    }
  }
  globalHandleError(err, vm, info);
}

function globalHandleError (err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e) {
      logError(e, null, 'config.errorHandler');
    }
  }
  logError(err, vm, info);
}

function logError (err, vm, info) {
  {
    warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
  }
  /* istanbul ignore else */
  if (typeof console !== 'undefined') {
    console.error(err);
  } else {
    throw err
  }
}

var callbacks = [];
var pending = false;

function flushCallbacks () {
  pending = false;
  var copies = callbacks.slice(0);
  callbacks.length = 0;
  for (var i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

// Here we have async deferring wrappers using both micro and macro tasks.
// In < 2.4 we used micro tasks everywhere, but there are some scenarios where
// micro tasks have too high a priority and fires in between supposedly
// sequential events (e.g. #4521, #6690) or even between bubbling of the same
// event (#6566). However, using macro tasks everywhere also has subtle problems
// when state is changed right before repaint (e.g. #6813, out-in transitions).
// Here we use micro task by default, but expose a way to force macro task when
// needed (e.g. in event handlers attached by v-on).
var microTimerFunc;
var macroTimerFunc;
var useMacroTask = false;

// Determine (macro) Task defer implementation.
// Technically setImmediate should be the ideal choice, but it's only available
// in IE. The only polyfill that consistently queues the callback after all DOM
// events triggered in the same loop is by using MessageChannel.
/* istanbul ignore if */
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = function () {
    setImmediate(flushCallbacks);
  };
} else if (typeof MessageChannel !== 'undefined' && (
  isNative(MessageChannel) ||
  // PhantomJS
  MessageChannel.toString() === '[object MessageChannelConstructor]'
)) {
  var channel = new MessageChannel();
  var port = channel.port2;
  channel.port1.onmessage = flushCallbacks;
  macroTimerFunc = function () {
    port.postMessage(1);
  };
} else {
  /* istanbul ignore next */
  macroTimerFunc = function () {
    setTimeout(flushCallbacks, 0);
  };
}

// Determine MicroTask defer implementation.
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  var p = Promise.resolve();
  microTimerFunc = function () {
    p.then(flushCallbacks);
    // in problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    // if (isIOS) setTimeout(noop)
  };
} else {
  // fallback to macro
  microTimerFunc = macroTimerFunc;
}

function nextTick (cb, ctx) {
  var _resolve;
  callbacks.push(function () {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
  if (!pending) {
    pending = true;
    if (useMacroTask) {
      macroTimerFunc();
    } else {
      microTimerFunc();
    }
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(function (resolve) {
      _resolve = resolve;
    })
  }
}

var renderCallbacks = [];

function renderFlushCallbacks () {
  var copies = renderCallbacks.slice(0);
  renderCallbacks.length = 0;
  for (var i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

function renderNextTick (cb, ctx) {
  var _resolve;
  renderCallbacks.push(function () {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });

  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(function (resolve) { _resolve = resolve; });
  }
}

/**
 * Parse a v-model expression into a base path and a final key segment.
 * Handles both dot-path and possible square brackets.
 *
 * Possible cases:
 *
 * - test
 * - test[key]
 * - test[test1[key]]
 * - test["a"][key]
 * - xxx.test[a[a].test1[key]]
 * - test.xxx.a["asa"][test1[key]]
 *
 */

/**
 * Remove an item from an array
 */
function remove (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Define a property.
 */
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Parse simple path.
 */
var bailRE = /[^\w.$]/;
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  }
  var segments = path.split('.');
  return function (obj) {
    for (var i = 0; i < segments.length; i++) {
      if (!obj) { return }
      obj = obj[segments[i]];
    }
    return obj
  }
}

// import type Watcher from './watcher'

var uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
var Dep = function Dep () {
  this.id = uid++;
  this.subs = [];
};

Dep.prototype.addSub = function addSub (sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function removeSub (sub) {
  remove(this.subs, sub);
};

Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function notify () {
  // stabilize the subscriber list first
  var subs = this.subs.slice();
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;
var targetStack = [];

function pushTarget (_target) {
  if (Dep.target) { targetStack.push(Dep.target); }
  Dep.target = _target;
}

function popTarget () {
  Dep.target = targetStack.pop();
}

/**
 * @desc ObserverPath 类以及相关处理函数
 * Observer 所在位置对应在整棵 data tree 的路径集合
 * @createDate 2019-07-21
 */

/**
 * 生成完整路径
 * @param key  {String|Number} 当为字符串时，说明是属性名，当为数字时，说明是索引
 * @param parentPath {String} 父路径
 * @return {string}
 */
var setPath = function (key, parentPath) {
  return isNum(key)
    ? (parentPath + "[" + key + "]")
    : (parentPath + "." + key);
};

/**
 * 得到 ObserverPath
 * @param value 被观察对象
 * @return {ObserverPath|null}
 */
var pickOp = function (value) {
  return isObject(value) && hasOwn(value, '__ob__')
    ? value.__ob__.op
    : null;
};

var ObserverPath = function ObserverPath (key, ob, parentOp) {
  this.ob = ob;
  // eslint-disable-next-line eqeqeq
  if (parentOp) {
    var ref = getPathMap(key, parentOp.pathKeys, parentOp.pathMap);
    var combinePathKeys = ref.combinePathKeys;
    var combinePathMap = ref.combinePathMap;
    this.pathKeys = combinePathKeys;
    this.pathMap = combinePathMap;
  } else {
    this.pathKeys = null;
    this.pathMap = null;
  }
};

ObserverPath.prototype.traverseOp = function traverseOp (key, pathKeys, pathMap, handler) {
    var this$1 = this;

  // 得到 newKey 和 pathMap 组合的路径集合
  var ref = getPathMap(key, pathKeys, pathMap);
    var combinePathMap = ref.combinePathMap;
    var combinePathKeys = ref.combinePathKeys;
  var handlePathKeys = [];
  var handlePathMap = {};
  var hasChange = false;

  // 遍历 combinePathMap
  for (var i = 0; i < combinePathKeys.length; i++) {
    var pathObj = handler(combinePathMap[combinePathKeys[i]], this$1);
    if (pathObj) {
      hasChange = true;
      handlePathKeys.push(pathObj.path);
      handlePathMap[pathObj.path] = pathObj;
    }
  }

  if (hasChange) {
    var value = this.ob.value;
    if (Array.isArray(value)) {
      for (var i$1 = 0; i$1 < value.length; i$1++) {
        var op = pickOp(value[i$1]);
        op && op.traverseOp(i$1, handlePathKeys, handlePathMap, handler);
      }
    } else {
      var keys = Object.keys(value);
      for (var i$2 = 0; i$2 < keys.length; i$2++) {
        var key$1 = keys[i$2];
        var op$1 = pickOp(value[key$1]);
        op$1 && op$1.traverseOp(key$1, handlePathKeys, handlePathMap, handler);
      }
    }
  }

};

ObserverPath.prototype.addPath = function addPath (pathObj) {
  this.pathKeys.push(pathObj.path);
  this.pathMap[pathObj.path] = pathObj;
};

ObserverPath.prototype.delPath = function delPath (path) {
  remove(this.pathKeys, path);
  delete this.pathMap[path];
};

/**
 * 添加新的 __ob__ 的 path
 */
function addPaths (newKey, op, parentOp) {
  op.traverseOp(newKey, parentOp.pathKeys, parentOp.pathMap, handler);

  function handler (pathObj, op) {
    if (!(pathObj.path in op.pathMap)) {
      // 新增一条 path
      op.addPath(pathObj);
      return pathObj;
    } else {
      return null;
    }
  }
}

/**
 * 删除指定的 __ob__ 的 path
 */
function cleanPaths (oldKey, op, parentOp) {
  op.traverseOp(oldKey, parentOp.pathKeys, parentOp.pathMap, handler);

  function handler (pathObj, op) {
    // 删除一条 path
    op.delPath(pathObj.path);
    return pathObj;
  }
}

/**
 * 得到 pathMap 与 key 组合后的路径集合
 */
function getPathMap (key, pathKeys, pathMap) {
  var obj;

  if (pathMap) {
    // console.log('pathMap', pathMap)
    var combinePathKeys = [];
    var combinePathMap = {};
    for (var i = 0; i < pathKeys.length; i++) {
      var path = setPath(key, pathMap[pathKeys[i]].path);
      combinePathKeys.push(path);
      combinePathMap[path] = {key: key, root: pathMap[pathKeys[i]].root, path: path};
    }
    return {combinePathKeys: combinePathKeys, combinePathMap: combinePathMap};
  } else {
    return {
      combinePathKeys: [key],
      combinePathMap: ( obj = {}, obj[key] = {key: key, root: key, path: key}, obj)
    };
  }
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);

var methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator () {
    var this$1 = this;
    var args = [], len$1 = arguments.length;
    while ( len$1-- ) args[ len$1 ] = arguments[ len$1 ];

    // 清除已经失效的 paths
    if (this.length > 0) {
      switch (method) {
        case 'pop':
          var len = this.length;
          delInvalidPaths(len - 1, this[len - 1], this);
          break
        case 'shift':
          delInvalidPaths(0, this[0], this);
          break;
        case 'splice':
        case 'sort':
        case 'reverse':
          for (var i = 0; i < this.length; i++) {
            delInvalidPaths(i, this$1[i], this$1);
          }
      }
    }

    var result = original.apply(this, args);
    var ob = this.__ob__;
    var vm = ob.vm;

    // push parent key to dirty, wait to setData
    if (vm.$dirty) {
      if (method === 'push') {
        var lastIndex = ob.value.length - 1;
        vm.$dirty.set(ob.op, lastIndex, ob.value[lastIndex]);
      } else {
        vm.$dirty.set(ob.op, null, ob.value);
      }
    }

    // 这里和 vue 不一样，所有变异方法都需要更新 path
    ob.observeArray(ob.key, ob.value);

    // notify change
    ob.dep.notify();
    return result;
  });
});

function delInvalidPaths (key, value, parent) {
  if (isObject(value) && hasOwn(value, '__ob__')) {
    // delete invalid paths
    cleanPaths(key, value.__ob__.op, parent.__ob__.op);
  }
}

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
var observerState = {
  shouldConvert: true
};

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
var Observer = function Observer (ref) {
  var vm = ref.vm;
  var key = ref.key;
  var value = ref.value;
  var parent = ref.parent;

  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  this.vm = vm;
  this.op = new ObserverPath(key, this, parent && parent.__ob__ && parent.__ob__.op);

  def(value, '__ob__', this);
  if (Array.isArray(value)) {
    var augment = hasProto
      ? protoAugment
      : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(key, value);
  } else {
    this.walk(key, value);
  }
};

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
Observer.prototype.walk = function walk (key, obj) {
    var this$1 = this;

  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive({ vm: this$1.vm, obj: obj, key: keys[i], value: obj[keys[i]], parent: obj });
    //defineReactive(this.vm, obj, keys[i], obj[keys[i]]);
  }
};

/**
 * Observe a list of Array items.
 */
Observer.prototype.observeArray = function observeArray (key, items) {
    var this$1 = this;

  for (var i = 0, l = items.length; i < l; i++) {
    observe({ vm: this$1.vm, key: i, value: items[i], parent: items });
  }
};

/**
 * Check if path exsit in vm
 */
Observer.prototype.hasPath = function hasPath (path) {
  var value = this.vm;
  var key = '';
  var i = 0;
  while (i < path.length) {
    if (path[i] !== '.' && path[i] !== '[' && path[i] !== ']') {
      key += path[i];
    } else if (key.length !== 0) {
      value = value[key];
      key = '';
      if (!isObject(value)) {
        return false;
      }
    }
    i++;
  }
  return true;
};

/**
 * Is this path value equal
 */
Observer.prototype.isPathEq = function isPathEq (path, value) {
  var objValue = this.vm;
  var key = '';
  var i = 0;
  while (i < path.length) {
    if (path[i] !== '.' && path[i] !== '[' && path[i] !== ']') {
      key += path[i];
    } else if (key.length !== 0) {
      objValue = objValue[key];
      key = '';
      if (!isObject(objValue)) {
        return false;
      }
    }
    i++;
  }
  if (key.length !== 0) {
    objValue = objValue[key];
  }
  return value === objValue;
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src, keys) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe (ref) {
  var vm = ref.vm;
  var key = ref.key;
  var value = ref.value;
  var parent = ref.parent;
  var root = ref.root;

  if (!isObject(value)) {
    return
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
    var op = ob.op;
    addPaths(key, op, parent.__ob__.op);
  } else if (
    observerState.shouldConvert &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer({vm: vm, key: key, value: value, parent: parent});
  }
  if (root && ob) {
    ob.vmCount++;
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
function defineReactive (ref) {
  var vm = ref.vm;
  var obj = ref.obj;
  var key = ref.key;
  var value = ref.value;
  var parent = ref.parent;
  var customSetter = ref.customSetter;
  var shallow = ref.shallow;

  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  if (!getter && arguments.length === 2) {
    value = obj[key];
  }
  var setter = property && property.set;

  var childOb = !shallow && observe({vm: vm, key: key, value: value, parent: obj});
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var val = getter ? getter.call(obj) : value;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
          if (Array.isArray(val)) {
            dependArray(val);
          }
        }
      }
      return val
    },
    set: function reactiveSetter (newVal) {
      var val = getter ? getter.call(obj) : value;
      /* eslint-disable no-self-compare */
      if (newVal === val || (newVal !== newVal && val !== val)) {
        return
      }

      if (isObject(value) && hasOwn(value, '__ob__')) {
        /**
         * 删掉无效的 paths
         * 注意：即使 path 只有一个也要删掉，因为其子节点可能有多个 path
         */
        cleanPaths(key, value.__ob__.op, parent.__ob__.op);
      }

      /* eslint-enable no-self-compare */
      if ("development" !== 'production' && customSetter) {
        customSetter();
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        value = newVal;
      }

      // Have to set dirty after value assigned, otherwise the dirty key is incrrect.
      if (vm) {
        // push parent key to dirty, wait to setData
        if (vm.$dirty) {
          vm.$dirty.set(obj.__ob__.op, key, newVal);
        }
      }
      childOb = !shallow && observe({ vm: vm, key: key, value: newVal, parent: parent });
      dep.notify();
    }
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set (vm, target, key, val) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }

  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val
  }

  var ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
    "development" !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    );
    return val
  }

  if (!ob) {
    target[key] = val;
    return val
  }

  if (isObject(target[key]) && hasOwn(target[key], '__ob__')) {
    // delete invalid paths
    cleanPaths(key, target[key].__ob__.op, ob.op);
  }
  defineReactive({ vm: vm, obj: ob.value, key: key, value: val, parent: ob.value });
  if (vm) {
    // push parent key to dirty, wait to setData
    if (vm.$dirty && hasOwn(target, '__ob__')) {
      vm.$dirty.set(target.__ob__.op, key, val);
    }
  }
  ob.dep.notify();
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
function del (target, key) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return
  }

  var ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
    "development" !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    );
    return
  }

  if (!hasOwn(target, key)) {
    return
  }

  // set $dirty
  target[key] = null;
  delete target[key];
  if (!ob) {
    return
  }
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value) {
  for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

var Base = function Base () {
  this._events = {};
};

Base.prototype.$set = function $set (target, key, val) {
  return set(this, target, key, val);
};

Base.prototype.$delete = function $delete (target, key) {
  return del(target, key);
};

Base.prototype.$on = function $on (event, fn) {
    var this$1 = this;

  if (isArr(event)) {
    event.forEach(function (item) {
      if (isStr(item)) {
        this$1.$on(item, fn);
      } else if (isObj(item)) {
        this$1.$on(item.event, item.fn);
      }
    });
  } else {
    (this._events[event] || (this._events[event] = [])).push(fn);
  }
  return this;
};

Base.prototype.$once = function $once () {};

Base.prototype.$off = function $off (event, fn) {
    var this$1 = this;

  if (!event && !fn) {
    this._events = Object.create(null);
    return this;
  }

  if (isArr(event)) {
    event.forEach(function (item) {
      if (isStr(item)) {
        this$1.$off(item, fn);
      } else if (isObj(item)) {
        this$1.$off(item.event, item.fn);
      }
    });
    return this;
  }
  if (!this._events[event])
    { return this; }

  if (!fn) {
    this._events[event] = null;
    return this;
  }

  if (fn) {
    var fns = this._events[event];
    var i = fns.length;
    while (i--) {
      var tmp = fns[i];
      if (tmp === fn || tmp.fn === fn) {
        fns.splice(i, 1);
        break;
      }
    }
  }
  return this;
};

Base.prototype.$emit = function $emit (event) {
    var this$1 = this;

  var vm = this;
  var lowerCaseEvent = event.toLowerCase();
  var fns = this._events[event] || [];
  if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
    // TODO: handler warn
  }
  var args = toArray(arguments, 1);
  fns.forEach(function (fn) {
    try {
      fn.apply(this$1, args);
    } catch (e) {
      handleError(e, vm, ("event handler for \"" + event + "\""));
    }
  });
  return this;
};

var seenObjects = new _Set();

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
function traverse (val) {
  _traverse(val, seenObjects);
  seenObjects.clear();
}

function _traverse (val, seen) {
  var i, keys;
  var isA = Array.isArray(val);
  if ((!isA && !isObject(val)) || Object.isFrozen(val)) {
    return
  }
  if (val.__ob__) {
    var depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) { _traverse(val[i], seen); }
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) { _traverse(val[keys[i]], seen); }
  }
}

var MAX_UPDATE_COUNT = 100;

var queue = [];
var activatedChildren = [];
var has = {};
var circular = {};
var waiting = false;
var flushing = false;
var index = 0;

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0;
  has = {};
  {
    circular = {};
  }
  waiting = flushing = false;
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue (times) {
  if ( times === void 0 ) times = 0;

  flushing = true;
  var watcher, id;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) { return a.id - b.id; });

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  // there would be mutilple renderWatcher in the queue.
  var renderWatcher = [];
  for (index = 0; index < queue.length; index++) {
    // if it's renderWatcher, run it in the end
    watcher = queue[index];
    if (watcher && watcher.isRenderWatcher) {
      renderWatcher.push(watcher);
      continue;
    }
    id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if ("development" !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? ("in watcher with expression \"" + (watcher.expression) + "\"")
              : "in a component render function."
          ),
          watcher.vm
        );
        resetSchedulerState();
        return;
      }
    }
  }
  // Run renderWatcher in the end.
  if (renderWatcher.length) {
    renderWatcher.forEach(function (watcher) {
      has[watcher.id] = null;
      watcher.run();
    });
  }

  // It may added new watcher to the queue in render watcher
  var pendingQueue = queue.slice(index);

  if (pendingQueue.length) {
    flushSchedulerQueue(times + 1);
  } else {
    // keep copies of post queues before resetting state
    // const activatedQueue = activatedChildren.slice()
    // const updatedQueue = queue.slice()

    resetSchedulerState();

    // call component updated and activated hooks
    // callActivatedHooks(activatedQueue)
    // callUpdatedHooks(updatedQueue)

    // devtool hook
    /* istanbul ignore if */
    /*
    if (devtools && config.devtools) {
      devtools.emit('flush')
    }*/
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher (watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}

//import { SimpleSet } from '../util/index';

var uid$1 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
var Watcher = function Watcher (vm, expOrFn, cb, options, isRenderWatcher) {
  this.vm = vm;
  if (isRenderWatcher) {
    vm._watcher = this;
  }
  vm._watchers.push(this);
  // options
  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.computed = !!options.computed;
    this.sync = !!options.sync;
  } else {
    this.deep = this.user = this.computed = this.sync = false;
  }
  this.cb = cb;
  this.id = ++uid$1; // uid for batching
  this.active = true;
  this.dirty = this.computed; // for computed watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.isRenderWatcher = isRenderWatcher;
  this.expression = expOrFn.toString();
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = function () {};
      "development" !== 'production' && warn(
        "Failed watching path: \"" + expOrFn + "\" " +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      );
    }
  }
  this.value = this.computed
    ? undefined
    : this.get();
};

/**
 * Evaluate the getter, and re-collect dependencies.
 */
Watcher.prototype.get = function get () {
  pushTarget(this);
  var value;
  var vm = this.vm;
  try {
    value = this.getter.call(vm, vm);
  } catch (e) {
    if (this.user) {
      handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value);
    }
    popTarget();
    if (!this.isRenderWatcher)
      { this.cleanupDeps(); }
  }
  return value
};

/**
 * Add a dependency to this directive.
 */
Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 */
Watcher.prototype.cleanupDeps = function cleanupDeps () {
    var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    var dep = this$1.deps[i];
    if (!this$1.newDepIds.has(dep.id)) {
      dep.removeSub(this$1);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.computed) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
Watcher.prototype.run = function run () {
  if (this.active) {
    var value = this.get();
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for computed watchers.
 */
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get();
  if (this.vm.$dirty) {
    var keyVal = this._computedWatchers && this._computedWatchers[this.key] ? this.vm._computedWatchers[this.key].value : this.value;
    this.vm.$dirty.push(this.key, this.key, keyVal, this.value);
  }
  this.dirty = false;
  return this.value;
};

/**
 * Depend on all deps collected by this watcher.
 */
Watcher.prototype.depend = function depend () {
    var this$1 = this;

  if (Dep.target) {
    var i = this.deps.length;
    while (i--) {
      this$1.deps[i].depend();
    }
  }
};

/**
 * Remove self from all dependencies' subscriber list.
 */
Watcher.prototype.teardown = function teardown () {
    var this$1 = this;

  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
    if (!this.vm._isBeingDestroyed) {
      remove(this.vm._watchers, this);
    }
    var i = this.deps.length;
    while (i--) {
      this$1.deps[i].removeSub(this$1);
    }
    this.active = false;
  }
};

var WepyComponent = (function (Base$$1) {
  function WepyComponent () {
    Base$$1.apply(this, arguments);
  }

  if ( Base$$1 ) WepyComponent.__proto__ = Base$$1;
  WepyComponent.prototype = Object.create( Base$$1 && Base$$1.prototype );
  WepyComponent.prototype.constructor = WepyComponent;

  WepyComponent.prototype.$watch = function $watch (expOrFn, cb, options) {
    var this$1 = this;

    var vm = this;
    if (isArr(cb)) {
      cb.forEach(function (handler) {
        this$1.$watch(expOrFn, handler, options);
      });
    }
    if (isPlainObject(cb)) {
      var handler = cb;
      options = handler;
      handler = handler.handler;
      if (typeof handler === 'string')
        { handler = this[handler]; }
      return this.$watch(expOrFn, handler, options);
    }

    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn () {
      watcher.teardown();
    }
  };

  WepyComponent.prototype.$forceUpdate = function $forceUpdate () {
    if (this._watcher) {
      this._watcher.update();
    }
  };

  return WepyComponent;
}(Base));

WepyComponent.prototype.$nextTick = renderNextTick;

var sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};


function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  };
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
/*
 * patch data option
 */
function patchData (output, data) {
  if (!data) {
    data = {};
  }
  output.data = data;
}

/*
 * init data
 */
function initData (vm, data) {
  if (!data) {
    data = {};
  }
  var _data;
  if (typeof data === 'function') {
    _data = data.call(vm);
  } else {
    _data = clone(data);
  }
  vm._data = _data;
  Object.keys(_data).forEach(function (key) {
    proxy(vm, '_data', key);
  });

  observe({
    vm: vm,
    key: '',
    value: _data,
    parent: '',
    root: true
  });
  //observe(vm, _data, null, true);
}

function initWatch (vm, watch) {
  if (watch) {
    Object.keys(watch).forEach(function (key) {
      vm.$watch(key, watch[key]);
    });
  }
}

function createComputedGetter (key) {
  return function computedGetter () {
    var watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      watcher.key = key;
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    }
  }
}

/*
 * init computed
 */
function initComputed (vm, computed) {
  if (!computed) {
    return;
  }
  var watchers = vm._computedWatchers = Object.create(null);
  var computedWatcherOptions = { computed: true };

  Object.keys(computed).forEach(function (key) {
    var def$$1 = computed[key];
    var getter = typeof def$$1 === 'object' ? def$$1.get : def$$1;

    if (!getter || typeof getter !== 'function') {
      console.error(("Getter is missing for computed property \"" + key + "\""));
    }

    // push to dirty after dep called.
    watchers[key] = new Watcher(vm, getter || function () {}, function (newv, oldv) {
      // evaluate will set dirty
      // vm.$dirty.push(key, key, newv);
    }, computedWatcherOptions);

    if (typeof def$$1 === 'function') {
      sharedPropertyDefinition.get = createComputedGetter(key);
      sharedPropertyDefinition.set = function () {};
    } else {
      sharedPropertyDefinition.get = def$$1.cache !== false ? createComputedGetter(key) : def$$1.get;
      sharedPropertyDefinition.set = def$$1.set;
    }

    Object.defineProperty(vm, key, sharedPropertyDefinition);
  });
}

var WepyConstructor = (function (WepyComponent$$1) {
  function WepyConstructor (opt) {
    if ( opt === void 0 ) opt = {};

    var vm = new WepyComponent$$1();

    // Only need data and watchers for a empty WepyComponent
    if (opt.data) {
      initData(vm, opt.data);
    }
    initWatch(vm);

    initComputed(vm, opt.computed);
    return vm;
  }

  if ( WepyComponent$$1 ) WepyConstructor.__proto__ = WepyComponent$$1;
  WepyConstructor.prototype = Object.create( WepyComponent$$1 && WepyComponent$$1.prototype );
  WepyConstructor.prototype.constructor = WepyConstructor;

  return WepyConstructor;
}(WepyComponent));

var $global = Object.create(null);

function use (plugin) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  if (plugin.installed) {
    return this;
  }

  var install = plugin.install || plugin;

  if (isFunc(install)) {
    install.apply(plugin, [this].concat(args));
  }

  plugin.installed = 1;
}

function mixin (options) {
  if ( options === void 0 ) options = {};

  $global.mixin = ($global.mixin || []).concat(options);
}

var WepyApp = (function (Base$$1) {
  function WepyApp () {
    Base$$1.call(this);
  }

  if ( Base$$1 ) WepyApp.__proto__ = Base$$1;
  WepyApp.prototype = Object.create( Base$$1 && Base$$1.prototype );
  WepyApp.prototype.constructor = WepyApp;

  return WepyApp;
}(Base));

var WepyPage = (function (WepyComponent$$1) {
  function WepyPage () {
    WepyComponent$$1.apply(this, arguments);
  }

  if ( WepyComponent$$1 ) WepyPage.__proto__ = WepyComponent$$1;
  WepyPage.prototype = Object.create( WepyComponent$$1 && WepyComponent$$1.prototype );
  WepyPage.prototype.constructor = WepyPage;

  WepyPage.prototype.$launch = function $launch (url, params) {
    this.$route('reLaunch', url, params);
  };
  WepyPage.prototype.$navigate = function $navigate (url, params) {
    this.$route('navigate', url, params);
  };

  WepyPage.prototype.$redirect = function $redirect (url, params) {
    this.$route('redirect', url, params);
  };

  WepyPage.prototype.$back = function $back (p) {
    if ( p === void 0 ) p = {};

    if (isNum(p))
      { p = { delta: p }; }

    if (!p.delta)
      { p.delta = 1; }

    return wx.navigateBack(p);
  };

  WepyPage.prototype.$route = function $route (type, url, params) {
    if ( params === void 0 ) params = {};

    var wxparams;
    if (isStr(url)) {
      var paramsList = [];
      if (isObj(params)) {
        for (var k in params) {
          if (!isUndef(params[k])) {
            paramsList.push((k + "=" + (encodeURIComponent(params[k]))));
          }
        }
      }
      if (paramsList.length)
        { url = url + '?' + paramsList.join('&'); }

      wxparams = { url: url };
    } else {
      wxparams = url;
    }
    var fn = wx[type] || wx[type + 'To'];
    if (isFunc(fn)) {
      return fn(wxparams);
    }
  };

  return WepyPage;
}(WepyComponent));

function callUserHook (vm, hookName, arg) {
  var pageHook = vm.hooks[hookName];
  var appHook = vm.$app.hooks[hookName];

  var result = arg;

  // First run page hook, and then run app hook
  // Pass page hook result to app hook
  // If return undefined, then return default argument
  [ pageHook, appHook ].forEach(function (fn) {
    if (isFunc(fn)) {
      result = fn.call(vm, result);
      if (isUndef(result)) {
        result = arg;
      }
    }
  });

  return result;
}

function initHooks(vm, hooks) {
  if ( hooks === void 0 ) hooks = {};

  vm.hooks = hooks;
}

var AllowedTypes = [ String, Number, Boolean, Object, Array, null ];

var observerFn = function (output, props, prop) {
  return function (newVal, oldVal, changedPaths) {
    var vm = this.$wepy;

    // changedPaths 长度大于 1，说明是由内部赋值改变的 prop
    if (changedPaths.length > 1) {
      return
    }
    var _data = newVal;
    if (typeof _data === 'function') {
      _data = _data.call(vm);
    }
    vm[changedPaths[0]] = _data;
  };
};
/*
 * patch props option
 */
function patchProps (output, props) {
  var newProps = {};
  if (isStr(props)) {
    newProps = [props];
  }
  if (isArr(props)) {
    props.forEach(function (prop) {
      newProps[prop] = {
        type: null,
        observer: observerFn(output, props, prop)
      };
    });
  } else if (isObj(props)) {
    for (var k in props) {
      var prop = props[k];
      var newProp = {};

      // props.type
      if (isUndef(prop.type)){
        newProp.type = null;
      } else if (isArr(prop.type)) {
        newProp.type = null;
        console.warn(("In mini-app, mutiple type is not allowed. The type of \"" + k + "\" will changed to \"null\""));
      } else if (AllowedTypes.indexOf(prop.type) === -1) {
        newProp.type = null;
        console.warn(("Type property of props \"" + k + "\" is invalid. Only String/Number/Boolean/Object/Array/null is allowed in weapp Component"));
      } else {
        newProp.type = prop.type;
      }

      // props.default
      if (!isUndef(prop.default)) {
        if (isFunc(prop.default)) {
          newProp.value = prop.default.call(output);
        } else {
          newProp.value = prop.default;
        }
      }
      // TODO
      // props.validator
      // props.required

      newProp.observer = observerFn(output, props, prop);

      newProps[k] = newProp;
    }
  }

  Object.keys(newProps).forEach(function (prop) {

  });

  output.properties = newProps;
}
/*
 * init props
 */
function initProps (vm, properties) {
  vm._props = {};

  if (!properties) {
    return;
  }

  Object.keys(properties).forEach(function (key) {
    vm._props[key] = properties[key].value;
    proxy(vm, '_props', key);
  });

  observe({
    vm: vm,
    key: '',
    value: vm._props,
    root: true
  });
}

function initRender (vm, keys, computedKeys) {
  vm._init = false;
  var dirtyFromAttach = null;
  return new Watcher(vm, function () {
    if (!vm._init) {
      keys.forEach(function (key) { return clone(vm[key]); });
    }

    if (vm.$dirty.length() || dirtyFromAttach) {
      var keys$1 = vm.$dirty.get('key');
      computedKeys.forEach(function (key) { return vm[key]; });
      var dirty = vm.$dirty.pop();

      // TODO: reset subs
      Object.keys(keys$1).forEach(function (key) { return clone(vm[key]); });

      if (vm._init) {
        dirty = callUserHook(vm, 'before-setData', dirty);
      }

      // vm._fromSelf = true;
      if (dirty || dirtyFromAttach) {
        // init render is in lifecycle, setData in lifecycle will not work, so cacheData is needed.
        if (!vm._init) {
          if (dirtyFromAttach === null) {
            dirtyFromAttach = {};
          }
          Object.assign(dirtyFromAttach, dirty);
        } else if (dirtyFromAttach) {  // setData in attached
          vm.$wx.setData(Object.assign(dirtyFromAttach, dirty || {}), renderFlushCallbacks);
          dirtyFromAttach = null;
        } else {
          vm.$wx.setData(dirty, renderFlushCallbacks);
        }
      }
    }
    vm._init = true;
  }, function () {

  }, null, true);
}

var Event = function Event (e) {
  var detail = e.detail;
  var target = e.target;
  var currentTarget = e.currentTarget;
  this.$wx = e;
  this.type = e.type;
  this.timeStamp = e.timeStamp;
  if (detail) {
    this.x = detail.x;
    this.y = detail.y;
  }

  this.target = target;
  this.currentTarget = currentTarget;
  this.touches = e.touches;
  this.changedTouches = e.changedTouches;
};

var proxyHandler = function (e) {
  var vm = this.$wepy;
  var type = e.type;
  // touchstart do not have currentTarget
  var dataset = (e.currentTarget || e.target).dataset;
  var evtid = dataset.wpyEvt;
  var modelId = dataset.modelId;
  var rel = vm.$rel || {};
  var handlers = rel.handlers ? (rel.handlers[evtid] || {}) : {};
  var fn = handlers[type];
  var model = rel.models[modelId];

  if (!fn && !model) {
    return;
  }

  var $event = new Event(e);

  var i = 0;
  var params = [];
  var modelParams = [];

  var noParams = false;
  var noModelParams = !model;
  while (i++ < 26 && (!noParams || !noModelParams)) {
    var alpha = String.fromCharCode(64 + i);
    if (!noParams) {
      var key = 'wpy' + type + alpha;
      if (!(key in dataset)) { // it can be undefined;
        noParams = true;
      } else {
        params.push(dataset[key]);
      }
    }
    if (!noModelParams && model) {
      var modelKey = 'model' + alpha;
      if (!(modelKey in dataset)) {
        noModelParams = true;
      } else {
        modelParams.push(dataset[modelKey]);
      }
    }
  }

  if (model) {
    if (type === model.type) {
      if (isFunc(model.handler)) {
        model.handler.call(vm, e.detail.value, modelParams);
      }
    }
  }
  if (isFunc(fn)) {
    var paramsWithEvent = params.concat($event);
    var hookRes = callUserHook(vm, 'before-event', {
      event: $event,
      params: paramsWithEvent
    });

    if (hookRes === false) { // Event cancelled.
      return;
    }
    return fn.apply(vm, params.concat($event));
  } else if (!model) {
    throw new Error('Unrecognized event');
  }
};

/*
 * initialize page methods, also the app
 */
function initMethods (vm, methods) {
  if (methods) {
    Object.keys(methods).forEach(function (method) {
      vm[method] = methods[method];
    });
  }
}
/*
 * patch method option
 */
function patchMethods (output, methods, isComponent) {

  output.methods = {};
  var target = output.methods;

  target._initComponent = function (e) {
    var child = e.detail;
    var ref$1 = e.target.dataset;
    var ref = ref$1.ref;
    var wpyEvt = ref$1.wpyEvt;
    var vm = this.$wepy;
    vm.$children.push(child);
    if (ref) {
      if (vm.$refs[ref]) {
        warn(
          'duplicate ref "' + ref +
          '" will be covered by the last instance.\n',
          vm
        );
      }
      vm.$refs[ref] = child;
    }
    child.$evtId = wpyEvt;
    child.$parent = vm;
    child.$app = vm.$app;
    child.$root = vm.$root;
    return vm;
  };
  target._proxy = proxyHandler;

  // TODO: perf
  // Only orginal component method goes to target. no need to add all methods.
  if (methods) {
    Object.keys(methods).forEach(function (method) {
      target[method] = methods[method];
    });
  }
}

/*
 * initialize events
 */
function initEvents (vm) {
  var parent = vm.$parent;
  var rel = parent.$rel;
  vm._events = {};
  var on = rel.info.on;
  var evtId = vm.$evtId;
  if (!evtId) { return; }

  var evtNames = on[evtId];

  evtNames.forEach(function (evtName) {
    vm.$on(evtName, function () {
      var fn = rel.handlers[evtId][evtName];
      fn.apply(parent, arguments);
    });
  });
}

var Dirty = function Dirty (type) {
  this.reset();

  // path||key
  this.type = type || 'path';
};

Dirty.prototype.push = function push (key, path, keyVal, pathValue) {
  this._keys[key] = keyVal;
  this._path[path] = pathValue;
  this._length++;
};

Dirty.prototype.pop = function pop () {
  var data = Object.create(null);
  if (this.type === 'path') {
    data = this._path;
  } else if (this.type === 'key') {
    data = this._keys;
  }
  this.reset();
  return data;
};

Dirty.prototype.get = function get (type) {
  return type === 'path' ? this._path : this._keys;
};

/**
 * Set dirty from a ObserverPath
 */
Dirty.prototype.set = function set (op, key, value) {
  var pathMap;
  var pathKeys;
  // eslint-disable-next-line eqeqeq
  if (key != null) {
    var ref = getPathMap(key, op.pathKeys, op.pathMap);
      var combinePathKeys = ref.combinePathKeys;
      var combinePathMap = ref.combinePathMap;
    pathKeys = combinePathKeys;
    pathMap = combinePathMap;
  } else {
    pathKeys = op.pathKeys;
    pathMap = op.pathMap;
  }
  /**
   * 出于性能考虑，使用 usingComponents 时， setData 内容不会被直接深复制，
   * 即 this.setData({ field: obj }) 后 this.data.field === obj 。
   * 因此不需要所有 path 都 setData 。
   */
  var ref$1 = pathMap[pathKeys[0]];
    var root = ref$1.root;
    var path = ref$1.path;
  this.push(root, path, root === path ? value : op.ob.vm[root], value);
};

Dirty.prototype.reset = function reset () {
  this._keys = {};
  this._path = {};
  this._length = 0;
  return this;
};

Dirty.prototype.length = function length () {
  return this._length;
};

var comid = 0;
var app;


var callUserMethod = function (vm, userOpt, method, args) {
  var result;
  var methods = userOpt[method];
  if (isFunc(methods)) {
    result = userOpt[method].apply(vm, args);
  } else if (isArr(methods)) {
    for (var i in methods) {
      if (isFunc(methods[i])) {
        result = methods[i].apply(vm, args);
      }
    }
  }
  return result;
};

var getLifecycycle = function (defaultLifecycle, rel, type) {
  var lifecycle = defaultLifecycle.concat([]);
  if (rel && rel.lifecycle && rel.lifecycle[type]) {
    var userDefinedLifecycle = [];
    if (isFunc(rel.lifecycle[type])) {
      userDefinedLifecycle = rel.lifecycle[type].call(null, lifecycle);
    }
    userDefinedLifecycle.forEach(function (u) {
      if (lifecycle.indexOf(u) > -1) {
        warn(("'" + u + "' is already implemented in current version, please remove it from your lifecycel config"));
      } else {
        lifecycle.push(u);
      }
    });
  }
  return lifecycle;
};

/*
 * patch app lifecyle
 */
function patchAppLifecycle (appConfig, options, rel) {
  if ( rel === void 0 ) rel = {};

  appConfig.onLaunch = function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var vm = new WepyApp();
    app = vm;
    vm.$options = options;
    vm.$route = {};
    vm.$rel = rel;

    vm.$wx = this;
    this.$wepy = vm;

    initHooks(vm, options.hooks);

    initMethods(vm, options.methods);

    return callUserMethod(vm, vm.$options, 'onLaunch', args);
  };

  var lifecycle = getLifecycycle(WEAPP_APP_LIFECYCLE, rel, 'app');

  lifecycle.forEach(function (k) {
    // it's not defined aready && user defined it && it's an array or function
    if (!appConfig[k] && options[k] && (isFunc(options[k]) || isArr(options[k]))) {
      appConfig[k] = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return callUserMethod(app, app.$options, k, args);
      };
    }
  });

}
function patchLifecycle (output, options, rel, isComponent) {

  var initClass = isComponent ? WepyComponent : WepyPage;
  var initLifecycle = function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var vm = new initClass();

    vm.$dirty = new Dirty('path');
    vm.$children = [];
    vm.$refs = {};

    this.$wepy = vm;
    vm.$wx = this;
    vm.$is = this.is;
    vm.$options = options;
    vm.$rel = rel;
    vm._watchers = [];
    if (!isComponent) {
      vm.$root = vm;
      vm.$app = app;
    }
    if (this.is === 'custom-tab-bar/index') {
      vm.$app = app;
      vm.$parent = app;
    }

    vm.$id = ++comid + (isComponent ? '.1' : '.0');

    callUserMethod(vm, vm.$options, 'beforeCreate', args);

    initHooks(vm, options.hooks);

    initProps(vm, output.properties);

    initData(vm, output.data, isComponent);

    initMethods(vm, options.methods);

    initComputed(vm, options.computed, true);

    initWatch(vm, options.watch);

    // create render watcher
    initRender(vm, Object.keys(vm._data).concat(Object.keys(vm._props)).concat(Object.keys(vm._computedWatchers || {})), Object.keys(vm._computedWatchers || {}));

    return callUserMethod(vm, vm.$options, 'created', args);
  };

  output.created = initLifecycle;
  if (isComponent) {

    output.attached = function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];
 // Component attached
      var outProps = output.properties || {};
      // this.propperties are includes datas
      var acceptProps = this.properties;
      var vm = this.$wepy;
      var parent = this.triggerEvent('_init', vm);

      // created 不能调用 setData，如果有 dirty 在此更新
      vm.$forceUpdate();

      initEvents(vm);

      Object.keys(outProps).forEach(function (k) { return vm[k] = acceptProps[k]; });

      return callUserMethod(vm, vm.$options, 'attached', args);
    };
  } else {
    output.attached = function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];
 // Page attached
      var vm = this.$wepy;
      var app = vm.$app;
      var pages = getCurrentPages();
      var currentPage = pages[pages.length - 1];
      var path = currentPage.__route__;
      var webViewId = currentPage.__wxWebviewId__;

      // created 不能调用 setData，如果有 dirty 在此更新
      vm.$forceUpdate();

      if (app.$route.path !== path) {
        app.$route.path = path;
        app.$route.webViewId = webViewId;
        vm.routed && (vm.routed());
      }

      // TODO: page attached
      return callUserMethod(vm, vm.$options, 'attached', args);
    };
    // Page lifecycle will be called under methods
    // e.g:
    // Component({
    //   methods: {
    //     onLoad () {
    //       console.log('page onload')
    //     }
    //   }
    // })

    var lifecycle$1 = getLifecycycle(WEAPP_PAGE_LIFECYCLE, rel, 'page');

    lifecycle$1.forEach(function (k) {
      if (!output[k] && options[k] && (isFunc(options[k]) || isArr(options[k]))) {
        output.methods[k] = function () {
          var args = [], len = arguments.length;
          while ( len-- ) args[ len ] = arguments[ len ];

          return callUserMethod(this.$wepy, this.$wepy.$options, k, args);
        };
      }
    });
  }
  var lifecycle = getLifecycycle(WEAPP_COMPONENT_LIFECYCLE, rel, 'component');

  lifecycle.forEach(function (k) {
    // beforeCreate is not a real lifecycle
    if (!output[k] && k !== 'beforeCreate' && (isFunc(options[k]) || isArr(options[k]))) {
      output[k] = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return callUserMethod(this.$wepy, this.$wepy.$options, k, args);
      };
    }
  });
}

var config$1 = {
  optionMergeStrategies: {},
  constants: {
    WEAPP_LIFECYCLE: WEAPP_LIFECYCLE,
    WEAPP_APP_LIFECYCLE: WEAPP_APP_LIFECYCLE,
    WEAPP_PAGE_LIFECYCLE: WEAPP_PAGE_LIFECYCLE,
    WEAPP_COMPONENT_LIFECYCLE: WEAPP_COMPONENT_LIFECYCLE
  }
};

// [Default Strategy]
// Update if it's not exist in output. Can be replaced by option[key].
// e.g.
// export default {
//   myCustomMethod () {
//     // doSomething
//   }
// }
//
// [Merge Strategy]
// Replaced by the latest mixins property.
// e.g.
// export default {
//   data: {
//     a: 1
//   }
// }
//
// [Lifecycle Strategy]
// Extend lifecycle. update lifecycle to an array.
// e.g.
// export default {
//   onShow: {
//     console.log('onShow');
//   }
// }
var globalMixinPatched = false;

var strats = null;

function getStrategy (key) {
  if (!strats) {
    initStrats();
  }
  if (strats[key]) {
    return strats[key];
  } else {
    return defaultStrat;
  }
}
function defaultStrat (output, option, key, data) {
  if (!output[key]) {
    output[key] = data;
  }
}

function simpleMerge(parentVal, childVal) {
  return (!parentVal || !childVal) ? (parentVal || childVal) : Object.assign({}, parentVal, childVal);
}

function initStrats () {
  if (strats)
    { return strats; }

  strats = config$1.optionMergeStrategies;

  strats.data = strats.props = strats.methods = strats.computed = strats.watch = strats.hooks = function mergeStrategy(output, option, key, data) {
    option[key] = simpleMerge(option[key], data);
  };

  WEAPP_LIFECYCLE.forEach(function (lifecycle) {
    if (!strats[lifecycle]) {
      strats[lifecycle] = function lifeCycleStrategy(output, option, key, data) {
        if (!option[key]) {
          option[key] = isArr(data) ? data: [data];
        } else {
          option[key] = [ data ].concat(option[key]);
        }
      };
    }
  });
}

function patchMixins (output, option, mixins) {
  if (!mixins && !$global.mixin) {
    return;
  }

  if (!globalMixinPatched) {
    var globalMixin = $global.mixin || [];

    mixins = globalMixin.concat(mixins);
    globalMixinPatched = true;
  }

  if (isArr(mixins)) {
    mixins.forEach(function (mixin) { return patchMixins(output, option, mixin); });
    globalMixinPatched = false;
  } else {

    if (!strats) {
      initStrats();
    }
    for (var k in mixins) {
      strat = getStrategy(k);
      var strat = strats[k] || defaultStrat;
      strat(output, option, k, mixins[k]);
    }
  }
}

function patchRelations (output, relations) {
  if (!relations) {
    relations = {};
  }
  output.relations = relations;
}

function app$1 (option, rel) {
  var appConfig = {};

  patchMixins(appConfig, option, option.mixins);
  patchAppLifecycle(appConfig, option, rel);

  return App(appConfig);
}

function component (opt, rel) {
  if ( opt === void 0 ) opt = {};


  var compConfig = {
    externalClasses: opt.externalClasses || [],
    // support component options property
    // example: options: {addGlobalClass:true}
    options: opt.options || {}
  };

  patchMixins(compConfig, opt, opt.mixins);

  if (opt.properties) {
    compConfig.properties = opt.properties;
    if (opt.props) {
      console.warn("props will be ignore, if properties is set");
    }
  } else if (opt.props) {
    patchProps(compConfig, opt.props);
  }

  patchMethods(compConfig, opt.methods, true);

  patchData(compConfig, opt.data, true);

  patchRelations(compConfig, opt.relations);

  patchLifecycle(compConfig, opt, rel, true);

  return Component(compConfig);
}

function page (opt, rel) {
  if ( opt === void 0 ) opt = {};


  var pageConfig = {
    externalClasses: opt.externalClasses || [],
    // support component options property
    // example: options: {addGlobalClass:true}
    options: opt.options || {}
  };


  patchMixins(pageConfig, opt, opt.mixins);

  if (opt.properties) {
    pageConfig.properties = opt.properties;
    if (opt.props) {
      console.warn("props will be ignore, if properties is set");
    }
  } else if (opt.props) {
    patchProps(pageConfig, opt.props);
  }

  patchMethods(pageConfig, opt.methods);

  patchData(pageConfig, opt.data);

  patchLifecycle(pageConfig, opt, rel);

  return Component(pageConfig);
}

function initGlobalAPI (wepy) {

  wepy.use = use;
  wepy.mixin = mixin;

  wepy.set = function (target, key, val) {
    set.apply(wepy, [ undefined, target, key, val]);
  };

  wepy.delete = del;

  wepy.observe = observe;

  wepy.nextTick = renderNextTick;

  wepy.app = app$1;
  wepy.page = page;
  wepy.component = component;

  return wepy;
}

var wepy = initGlobalAPI(WepyConstructor);

wepy.config = config$1;
wepy.global = $global;
wepy.version = "2.0.0-alpha.11";

module.exports = wepy;
