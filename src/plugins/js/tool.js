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
  },
  uniqueStr: function() {
    return (
      Date.now() +
      "_" +
      Math.random()
        .toFixed(8)
        .substr(2) +
      "_" +
      Math.random()
        .toFixed(8)
        .substr(2)
    );
  }
};

//~ 3 日期工具
tool.apply(tool, {
  Date: {
    AddYear: function(date, e) {
      if (!e) {
        return date;
      }
      return new Date(date.getTime() + e * 12 * 30.5 * 24 * 60 * 60 * 1000);
    },
    AddMouth: function(date, e) {
      if (!e) {
        return date;
      }
      return new Date(date.getTime() + e * 30.5 * 24 * 60 * 60 * 1000);
    },
    AddDay: function(date, e) {
      if (!e) {
        return date;
      }
      return new Date(date.getTime() + e * 24 * 60 * 60 * 1000);
    },
    AddHours: function(date, e) {
      if (!e) {
        return date;
      }
      return new Date(date.getTime() + e * 60 * 60 * 1000);
    },
    AddMinutes: function(date, e) {
      if (!e) {
        return date;
      }
      return new Date(date.getTime() + e * 60 * 1000);
    },
    toString: function(v) {
      //待完善
      return v;
    },
    toDateTime: function(source) {
      //将指定格式的字符串转换为时间类型,因正则表达式功力不足，暂时如此使用
      source = tool.isString(source)
        ? String(source).replace(/-/g, "/")
        : source;
      var date = new Date(source);
      if (String(date) === "Invalid Date") {
        var isTime = /^(\d{4})\/(\d{1,2})\/(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/.test(
          source
        );
        if (isTime)
          return new Date(
            RegExp.$1,
            parseInt(RegExp.$2) - 1,
            RegExp.$3,
            RegExp.$4,
            RegExp.$5
          );
        isTime = /^(\d{4})\/(\d{1,2})\/(\d{1,2}) (\d{1,2}):(\d{1,2})$/.test(
          source
        );
        if (isTime)
          return new Date(
            RegExp.$1,
            parseInt(RegExp.$2) - 1,
            RegExp.$3,
            RegExp.$4
          );
        isTime = /^(\d{4})\/(\d{1,2})\/(\d{1,2}) (\d{1,2})$/.test(source);
        if (isTime)
          return new Date(RegExp.$1, parseInt(RegExp.$2) - 1, RegExp.$3);
        isTime = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.test(source);
        if (isTime)
          return new Date(RegExp.$1, parseInt(RegExp.$2) - 1, RegExp.$3);
        return source;
      }
      return date;
    },
    format: function(source, fmt) {
      if (!source) return source;
      var date = this.toDateTime(source);
      if (tool.isString(date)) {
        try {
          date = new Date(source);
        } catch (e) {
          return source;
        }
      }
      if (!tool.isDate(date)) return source;
      var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //日
        "H+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        S: date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + "").substr(
            4 - (RegExp.$1.length === 1 ? 4 : RegExp.$1.length)
          )
        );
      } else if (/(Y+)/.test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + "").substr(
            4 - (RegExp.$1.length === 1 ? 4 : RegExp.$1.length)
          )
        );
      }
      if (/(D)/.test(fmt)) {
        var d = date.getDay();
        switch (d) {
          case 0:
            d = "日";
            break;
          case 1:
            d = "一";
            break;
          case 2:
            d = "二";
            break;
          case 3:
            d = "三";
            break;
          case 4:
            d = "四";
            break;
          case 5:
            d = "五";
            break;
          case 6:
            d = "六";
            break;
        }
        fmt = fmt.replace(RegExp.$1, d);
      }
      for (var k in o) {
        if (Object.hasOwnProperty.call(o, k)) {
          if (new RegExp("(" + k + ")").test(fmt)) {
            //fmt = fmt.replace(RegExp.$1,(RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            fmt = fmt.replace(
              RegExp.$1,
              ("00" + o[k]).substr(("" + o[k]).length)
            );
          }
        }
      }
      return fmt;
    },
    //获取时间戳
    unixtime: function(d) {
      if (!d) d = new Date();
      return Math.round(d.getTime() / 1000);
    },
    unTimeToDate: function getLocalTime(nt, format) {
      var date = new Date(nt);
      // console.log(date);
      if (format) {
        return tool.Date.format(date, format);
      }
      return date;
    },
    GetDateDiff: function(startTime, endTime, type) {
      var result = "";
      var date3 = endTime.getTime() - startTime.getTime(); //时间差的毫秒数
      //计算出相差天数
      var days = Math.floor(date3 / (24 * 3600 * 1000));
      result += days > 0 ? days + "天" : "";
      //计算出小时数
      var leave1 = date3 % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
      var hours = Math.floor(leave1 / (3600 * 1000));
      result += hours > 0 ? hours + "小时" : "";
      //计算相差分钟数
      var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
      var minutes = Math.floor(leave2 / (60 * 1000));
      result += minutes > 0 ? minutes + "分钟" : "";
      //  计算相差秒数
      var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
      var seconds = Math.round(leave3 / 1000);

      result += seconds > 0 ? seconds + "秒" : "";

      return result;
    }
  }
});

export default tool;
