let objectPrototype = Object.prototype,
  //对象原型
  toString = objectPrototype.toString;
let tool = {
  emptyFn: function() {},
  /**
   * 方法：对象冒充调用方法
   */
  bind: function(fn, scope) {
    fn = fn || tool.emptyFn;
    return function() {
      return fn.apply(scope, arguments);
    };
  },
  isString: function(value) {
    return typeof value === "string";
  },

  isBoolean: function(value) {
    return typeof value === "boolean";
  },
  isNumber: function(value) {
    return typeof value === "number" && isFinite(value);
  },

  isNumeric: function(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  // Safari 3.x and 4.x returns 'function' for typeof <NodeList>, hence we need to fall back to using
  // Object.prototype.toString (slower)
  isFunction:
    typeof document !== "undefined" &&
    typeof document.getElementsByTagName("body") === "function"
      ? function(value) {
          return !!value && toString.call(value) === "[object Function]";
        }
      : function(value) {
          return !!value && typeof value === "function";
        },

  isSimpleObject: function(value) {
    return value instanceof Object && value.constructor === Object;
  },

  isObject:
    toString.call(null) === "[object Object]"
      ? function(value) {
          // check ownerDocument here as well to exclude DOM nodes
          return (
            value !== null &&
            value !== undefined &&
            toString.call(value) === "[object Object]" &&
            value.ownerDocument === undefined
          );
        }
      : function(value) {
          return toString.call(value) === "[object Object]";
        },

  isEmpty: function(value, allowEmptyString) {
    return (
      value === null ||
      value === undefined ||
      (!allowEmptyString ? value === "" : false) ||
      (tool.isArray(value) && value.length === 0)
    );
  },

  isArray:
    "isArray" in Array
      ? Array.isArray
      : function(value) {
          return toString.call(value) === "[object Array]";
        },

  isDate: function(value) {
    return toString.call(value) === "[object Date]";
  },

  /** ---------------------------------------------------
   ** 对象赋值补充
   ** -------------------------------------------------  */
  apply: function() {
    return Object.assign.apply(this, arguments);
  },
  applyIf: function(target, ...plus) {
    let me = this;
    if (plus.length === 1) {
      let onePlus = plus[0];
      if (me.isObject(onePlus)) {
        for (let pro in onePlus) {
          if (Object.hasOwnProperty.call(onePlus, pro)) {
            if (target[pro] === undefined && onePlus[pro] !== undefined) {
              target[pro] = onePlus[pro];
            }
          }
        }
      }
    } else if (plus.length > 1) {
      plus.forEach(onePlus => {
        target = me.applyIf(target, onePlus);
      });
    }
    return target;
  },

  /**
   * 克隆 exclude:array 要排除的属性
   */
  clone: function(item, cloneDom, exclude) {
    let me = this;
    if (item === null || item === undefined) {
      return item;
    }
    if (exclude) {
      if (me.isString(exclude)) {
        exclude = [exclude];
      }
    } else {
      exclude = [];
    }
    exclude = me.isArray(exclude) ? exclude : [];
    // DOM nodes
    if (cloneDom !== false && item.nodeType && item.cloneNode) {
      return item.cloneNode(true);
    }
    var type = toString.call(item),
      i,
      j,
      k,
      clone,
      key;
    // Date
    if (type === "[object Date]") {
      return new Date(item.getTime());
    }
    // Array
    if (type === "[object Array]") {
      i = item.length;
      clone = [];
      while (i--) {
        clone[i] = me.clone(item[i], cloneDom);
      }
    }
    // Object
    else if (type === "[object Object]" && item.constructor === Object) {
      clone = {};
      for (key in item) {
        if (Object.hasOwnProperty.call(item, key)) {
          if (exclude.indexOf(key) < 0) {
            clone[key] = me.clone(item[key], cloneDom);
          }
        }
      }
    }
    return clone || item;
  },

  //不同于 apply，是深入的 apply
  mergeBase: function(ifClone, ifCheckIf, destination) {
    let me = this,
      i = 3,
      ln = arguments.length,
      mergeFn = me.mergeBase.bind(me),
      cloneFn = val => {
        return ifClone ? me.clone(val) : val;
      },
      object,
      key,
      value,
      sourceKey,
      arrayKey;

    for (; i < ln; i++) {
      object = arguments[i];
      //【=1=】对于目标为非 数组、对象类型时
      if (!me.isObject(destination) && !me.isArray(destination)) {
        destination = cloneFn(object);
        continue;
      }
      //【=2=】正常情况
      for (key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
          value = object[key];
          if (value && value.constructor === Object) {
            sourceKey = destination[key];
            if (sourceKey && me.isObject(sourceKey)) {
              mergeFn(ifClone, ifCheckIf, sourceKey, value);
            } else {
              destination[key] = ifCheckIf
                ? destination[key] || cloneFn(value)
                : cloneFn(value);
            }
          } else if (value && value.constructor === Array) {
            //merge array
            sourceKey = destination[key];
            if (!sourceKey || sourceKey.constructor !== Array)
              destination[key] = cloneFn(value);
            else {
              me.each(value, function(val, i) {
                arrayKey = sourceKey[i];
                if (!arrayKey) {
                  sourceKey[i] = cloneFn(val);
                } else {
                  sourceKey[i] = mergeFn(ifClone, ifCheckIf, sourceKey[i], val);
                }
              });
            }
          } else {
            destination[key] = ifCheckIf
              ? destination[key] || cloneFn(value)
              : cloneFn(value);
          }
        }
      }
    }

    return destination;
  },
  mergeBaseBefore(ifClone, ifCheckIf, args) {
    let me = this,
      theArgs = [ifClone, ifCheckIf];
    for (let i = 0; i < args.length; ++i) {
      let arg = args[i];
      theArgs.push(arg);
    }
    return me.mergeBase.apply(me, theArgs);
  },
  //【=1=】非复制，全覆盖式 深入 apply
  merge() {
    return this.mergeBaseBefore.apply(this, [false, false].concat(arguments));
  },
  //【=2=】非复制，if 覆盖式 深入 applyIf
  mergeIf() {
    return this.mergeBaseBefore.apply(this, [false, true].concat(arguments));
  },
  //【=3=】深度复制，全覆盖式 深入 apply
  mergeClone() {
    return this.mergeBaseBefore.apply(this, [true, false].concat(arguments));
  },
  //【=4=】深度复制，if 覆盖式 深入 applyIf
  mergeCloneIf() {
    return this.mergeBaseBefore.apply(this, [true, true].concat(arguments));
  },

  /** ---------------------------------------------------
   ** 遍历方法补充 对象 or 数组
   ** -------------------------------------------------  */
  each(array, fn, reverse) {
    if (this.isArray(array)) {
      //【1】在 return false的 temp Fn后中断  同 break。
      if (!reverse) {
        for (let i = 0; i < array.length; ++i) {
          let item = array[i];
          if (fn.call(item, item, i, array) === false) {
            return i;
          }
        }
      } else {
        for (let i = array.length - 1; i > -1; --i) {
          let item = array[i];
          if (fn.call(item, item, i, array) === false) {
            return i;
          }
        }
      }
      return true;
    } else if (this.isObject(array)) {
      let keys = Object.keys(array);
      for (let i = 0; i < keys.length; ++i) {
        let key = keys[i],
          val = array[key];
        if (fn.call(array, key, val, array) === false) {
          return key;
        }
      }
    } else {
      return false;
    }
  },
  /** ---------------------------------------------------
   ** 功能函数
   ** -------------------------------------------------  */
  //~ 1 限流器
  throttle: (function() {
    // Defines minimum timeout before adding a trailing call.
    var requestAnimationFrame$1 = (function() {
      if (typeof requestAnimationFrame === "function") {
        return requestAnimationFrame.bind(window);
      }
      return function(callback) {
        return setTimeout(function() {
          return callback(Date.now());
        }, 1000 / 60);
      };
    })();
    var trailingTimeout = 2;
    var throttle = function(callback, delay) {
      var leadingCall = false,
        trailingCall = false,
        lastCallTime = 0,
        scope = this,
        args = [];
      function resolvePending() {
        if (leadingCall) {
          leadingCall = false;
          callback.apply(scope, args);
        }
        if (trailingCall) {
          proxy.apply(scope, args);
        }
      }
      function timeoutCallback() {
        requestAnimationFrame$1(resolvePending);
      }
      function proxy() {
        scope = this;
        args = arguments;
        var timeStamp = Date.now();
        if (leadingCall) {
          // Reject immediately following calls.
          if (timeStamp - lastCallTime < trailingTimeout) {
            return;
          }
          trailingCall = true;
        } else {
          leadingCall = true;
          trailingCall = false;
          setTimeout(timeoutCallback, delay);
        }
        lastCallTime = timeStamp;
      }
      return proxy;
    };
    return throttle;
  })(),
  //~ 2 字符串模板
  format: function() {
    var result = arguments[0],
      reg = null;
    for (var i = 1; i < arguments.length; i++) {
      if (arguments[i] !== undefined) {
        reg = new RegExp("({)" + (i - 1) + "(})", "g");
        result = result.replace(reg, arguments[i]);
      }
    }
    return result;
  }
};

export default tool;
