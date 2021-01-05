const $62 = [
  "0123456789",
  "abcdefghijklmnopqrstuvwxyz",
  "abcdefghijklmnopqrstuvwxyz".toUpperCase()
].join("");
const $62Len = $62.length;

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

  //仅针对 null 和 undefined的检查
  isNull(value) {
    return value === null || value === undefined;
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
  mergeBase: function(ifClone, ifCheckIf, setFn, destination) {
    let me = this,
      i = 4,
      ln = arguments.length,
      hasSetFn = me.isFunction(setFn),
      mergeFn = me.mergeBase.bind(me),
      cloneFn = val => {
        return ifClone ? me.clone(val) : val;
      },
      object,
      key,
      value,
      sourceKey,
      arrayKey;

    //【=1=】对于目标为非 数组、对象类型时
    if (!me.isObject(destination) && !me.isArray(destination)) {
      throw `不允许对非数组、对象类型进行merge操作,destination:${destination}`;
    }

    for (; i < ln; i++) {
      object = arguments[i];

      //【=1.2=】对于是扩展对象的深入 要慎重
      if (me.isObject(object) && !me.isSimpleObject(object)) {
        //暂不操作
        continue;
      }

      //【=2=】正常情况
      for (key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
          value = object[key];
          if (value && value.constructor === Object) {
            sourceKey = destination[key];
            if (sourceKey && me.isObject(sourceKey)) {
              mergeFn(ifClone, ifCheckIf, setFn, sourceKey, value);
            } else {
              //#2 补充setFn函数模式
              let result = ifCheckIf
                ? destination[key] || cloneFn(value)
                : cloneFn(value);
              if (hasSetFn) {
                setFn(destination, key, result);
              } else {
                destination[key] = result;
              }
            }
          }
          //【1221】搞这么复杂，老是出错，干错就直接赋值，数组太复杂了
          //else if (value && value.constructor === Array) {
          //merge array
          // sourceKey = destination[key];
          // if (!sourceKey || sourceKey.constructor !== Array) {
          //   let result = cloneFn(value);
          //   if (hasSetFn) {
          //     setFn(destination, key, result);
          //   } else {
          //     destination[key] = result;
          //   }
          // } else {
          //   //# 2 也存在删除的情况
          //   let removeItems = [],
          //     theI = -1;
          //   me.each(value, function(val, i) {
          //     theI = i;
          //     let tempVal;
          //     arrayKey = sourceKey[i];
          //     if (!arrayKey) {
          //       tempVal = cloneFn(val);
          //     } else if (me.isNull(val)) {
          //       removeItems.push(sourceKey[i]);
          //       return;
          //     } else {
          //       tempVal = mergeFn(
          //         ifClone,
          //         ifCheckIf,
          //         setFn,
          //         sourceKey[i],
          //         val
          //       );
          //     }
          //     //# 1 对于多的，要进行push操作，而不是i取值操作
          //     if (i > sourceKey.length - 1) {
          //       //console.log(["这儿的push检查"]);
          //       if (me.isNull(tempVal)) {
          //         return;
          //       }
          //       sourceKey.push(tempVal);
          //     } else {
          //       if (me.isNull(tempVal)) {
          //         removeItems.push(sourceKey[i]);
          //       } else {
          //         sourceKey[i] = tempVal;
          //       }
          //     }
          //   });
          //   //# 4 深入的 array值就直接 视为全改了
          //   if (theI < sourceKey.length - 1) {
          //     sourceKey.splice(theI + 1); //对下一个以及之后全部删除
          //   }
          //   //# 3 删除对应的
          //   if (removeItems.length) {
          //     me.each(removeItems, function(item) {
          //       let at = sourceKey.indexOf(item);
          //       sourceKey.splice(at, 1);
          //     });
          //   }
          // }
          //}
          else {
            let result = ifCheckIf
              ? destination[key] || cloneFn(value)
              : cloneFn(value);
            if (hasSetFn) {
              setFn(destination, key, result);
            } else {
              destination[key] = result;
            }
          }
        }
      }
    }

    return destination;
  },
  mergeBaseBefore(ifClone, ifCheckIf, setFn = null, args) {
    let me = this,
      theArgs = [ifClone, ifCheckIf, setFn];
    for (let i = 0; i < args.length; ++i) {
      let arg = args[i];
      theArgs.push(arg);
    }
    return me.mergeBase.apply(me, theArgs);
  },
  //【=1=】非复制，全覆盖式 深入 apply
  merge() {
    return this.mergeBaseBefore.apply(
      this,
      [false, false, null].concat(arguments)
    );
  },
  //【=2=】非复制，if 覆盖式 深入 applyIf
  mergeIf() {
    return this.mergeBaseBefore.apply(
      this,
      [false, true, null].concat(arguments)
    );
  },
  //【=3=】深度复制，全覆盖式 深入 apply
  mergeClone() {
    return this.mergeBaseBefore.apply(
      this,
      [true, false, null].concat(arguments)
    );
  },
  //【=4=】深度复制，if 覆盖式 深入 applyIf
  mergeCloneIf() {
    return this.mergeBaseBefore.apply(
      this,
      [true, true, null].concat(arguments)
    );
  },
  //#2 模式二，带有setFn的模式
  mergeSet(setFn = null) {
    let args = [];
    for (let i = 1; i < arguments.length; ++i) {
      let arg = arguments[i];
      args.push(arg);
    }
    return this.mergeBaseBefore.apply(
      this,
      [false, false, setFn].concat([args])
    );
  },
  mergeSetIf(setFn = null) {
    let args = [];
    for (let i = 1; i < arguments.length; ++i) {
      let arg = arguments[i];
      args.push(arg);
    }
    return this.mergeBaseBefore.apply(
      this,
      [false, true, setFn].concat([args])
    );
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
  // 不改变源对象，生成一个克隆的
  parseObject(target, ifDeep = true) {
    let me = this,
      reg = /^[{|[]/;
    if (me.isString(target)) {
      //#1 只有 json字符串才进行 深入
      if (reg.test(target)) {
        let cTarget = JSON.parse(target);
        //#1.2 只有parse后的json字符串，才会形成obj和array的情况，再进行深入
        if (ifDeep) {
          return me.parseObject(cTarget, ifDeep);
        } else {
          return cTarget;
        }
      } else {
        //#2 普通字符串
        return target;
      }
    }
    //#3 数组
    else if (me.isArray(target)) {
      let result = [];
      me.each(target, item => {
        let cItem = me.parseObject(item, ifDeep);
        result.push(cItem);
      });
      return result;
    }
    //#4 对象
    else if (me.isObject(target)) {
      let result = {};
      me.each(target, (key, val) => {
        let cVal = me.parseObject(val, ifDeep);
        result[key] = cVal;
      });
      return result;
    }
    //#5 值类型
    else {
      return target;
    }
  },
  //~ +1 数组的insert
  insert(array, at, ins) {
    let me = this;
    if (!array || !me.isNumber(at) || me.isNull(ins)) {
      console.error(["参数错误，insert失败！", arguments]);
      return;
    }
    if (me.isArray(ins)) {
      return array
        .slice(0, at)
        .concat(ins)
        .concat(array.slice(at));
    } else {
      return array
        .slice(0, at)
        .concat([ins])
        .concat(array.slice(at));
    }
  },
  /** ---------------------------------------------------
   ** 功能函数
   ** -------------------------------------------------  */
  //~ 【1】 限流器
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
        //# 1 在等待期间如果被唤醒，那么该flag为true，则会在执行完一次后 最后执行一次
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
  async makePromise(Fn, returnPromise = false, scope, args) {
    scope = scope || this;
    args = args || [];
    let pro = new Promise((res, rej) => {
      let result = null;
      if (!returnPromise) {
        try {
          result = Fn.apply(scope, args);
        } catch (e) {
          rej(e);
          return;
        }
        res(result);
      } else {
        Fn.apply(scope, args)
          .then(r => {
            res(r);
          })
          .catch(r => {
            rej(r);
          });
      }
    });
    return pro;
  },
  //~ 【2】原子器【粗糙】现在的版本可能有同时运行该函数？
  atomic: function(Fn, waitTime = false, returnPromise = false) {
    //++ 1 v2 这样的话就只可能插队
    let waitPros = new Map(),
      proResult = [],
      count = 0,
      tool = this;
    waitPros.set(count, Promise.resolve());
    // # 0 Fn的执行器，每次都是promise执行，可以加then、catch作为后续
    let proxy = async function() {
      //# ++ 2 v3 将原子操作放在了这两行，应该很小概率会重复！
      let lastCount = count++,
        nowCount = count;

      let me = this,
        args = arguments;

      //# 1 前一个promise执行？
      let lastPro = waitPros.get(lastCount);
      let pro = new Promise((res, rej) => {
        let begin = Date.now();
        //# 2.2 与上一个紧密相关
        lastPro
          .then(pr => {
            //# 3 时间限制 如果有，那么就是限流类型的
            if (waitTime) {
              let nowTime = Date.now(),
                wt = nowTime - begin;
              if (wt > waitTime) {
                let nowLast = waitPros.get(waitPros.size - 1);
                //# 4 最后一个但超时的 允许call，此为 尾call
                if (nowLast !== pro) {
                  //【update】超时就无意义了，删除为好，释放内存
                  // proResult.unshift({
                  //   count: nowCount,
                  //   type: "超时",
                  //   begin,
                  //   nowTime,
                  //   wt
                  // });
                  waitPros.delete(lastCount);
                  res(proResult);
                  return;
                }
              }
            }

            //# 2.3 上一个ok了后才运行下面的pro
            tool
              .makePromise(Fn, returnPromise, me, args)
              .then(r => {
                proResult.unshift({
                  count: nowCount,
                  result: r
                });
                res(proResult);
              })
              .catch(r => {
                proResult.unshift({
                  count: nowCount,
                  result: r
                });
                rej(proResult);
              });
          })
          .catch(er => {
            //# 2.4 出错了就拒绝
            rej(er);
          });
      });
      waitPros.set(nowCount, pro);
      return pro;
    };
    return proxy;
  },

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
  //~ 4 汉字count
  len(str) {
    let me = this,
      count = 0;
    if (me.isString(str)) {
      count = str.length;
      for (let i = 0; i < str.length; ++i) {
        if (str.charCodeAt(i) > 255) {
          ++count;
        }
      }
    } else if (me.isObject(str)) {
      count = Object.keys(str).length;
    } else if (me.isArray(str)) {
      count = str.length;
    }

    return count;
  },
  //~ 4-2 汉字范围的 substr 三个参数必须有
  substr(str, at, len) {
    let me = this;
    if (me.isString(str)) {
      //# 1 可能len过长
      if (at + len >= str.length) {
        return str;
      }
      //# 2 正常
      let count = 0,
        result = "";
      for (let i = at; i < str.length; ++i) {
        let n = str.charCodeAt(i) > 255 ? 2 : 1,
          nextCount = count + n;

        if (nextCount > len) {
          return result;
        } else {
          result = result + str[i];
          count = nextCount;
        }
      }
    }
    //# 3 不能对非string操作;
    return false;
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
            if (k === "S") {
              fmt = fmt.replace(RegExp.$1, "" + o[k]);
            } else {
              fmt = fmt.replace(
                RegExp.$1,
                ("00" + o[k]).substr(("" + o[k]).length)
              );
            }
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

//~ 4 值转化
tool.apply(tool, {
  // 正数数字转62位的“数字”，记为str
  ito62(i) {
    let result = "",
      rest = Math.floor(Math.abs(i));
    do {
      let r = rest % $62Len,
        char = $62[r];
      result = char + result;

      rest /= $62Len;
      rest = Math.floor(rest);
    } while (rest > 0);
    return result;
  },

  random62(len = 1) {
    let me = this,
      maxLen = Math.pow(62, len),
      num = Math.floor(Math.random() * maxLen),
      num62 = me.ito62(num);
    return num62;
  },
  //【update】可升级为 26 * 2 + 10的位数加密
  uniqueStr: function() {
    let me = this,
      p_date = me.ito62(Date.now()),
      p_math = me.random62(6);

    return p_date + p_math;
  },
  now(withM) {
    return this.Date.format(
      Date.now(),
      "yyyy-MM-dd hh:mm:ss" + (withM ? ".S" : "")
    );
  },
  //++ 1 随机取样
  getSample(source, count) {
    let me = this;
    if (!me.isArray(source)) {
      console.error(["不允许对非数组进行取样！"]);
      return null;
    }
    if (source.length <= count) {
      return source;
    }
    let rest = source.slice(),
      result = [];
    while (result.length < 100) {
      let at = Math.floor(Math.random() * rest.length),
        select = rest.splice(at, 1);
      result.push(select);
    }
    return result;
  }
});

export default tool;
