import $ from "jquery";
import tool from "../tool";
import Vue from "vue";

let pureLoader = {
  defaultCfg: {
    type: "POST"
  },
  defaultData: {},

  ajax: function (options) {
    let me = this,
      theAjax = null,
      pro = new Promise((res, rej) => {
        //【=1=】默认项
        tool.applyIf(options, me.defaultCfg);
        options.url = options.url.url || options.url;
        options.data = options.data || {};
        //【=1-2=】method选项
        if (options.method) {
          options.data.method = options.method;
          delete options.method;
        }
        //【=1-3=】默认data
        tool.applyIf(options.data, me.defaultData);

        //【=2=】传输，然后结果处理,将false都归于 catch了
        //console.log(["ajax检测", $, options]);
        theAjax = $.ajax(options);
        // 先always 再 done 再 then
        theAjax.then(function (_result) {
          //console.log(["then ## 4", arguments]);
          let result = JSON.parse(_result),
            suc = result.success;
          if (suc) {
            res(result);
          } else {
            //【=3=】特殊后台反应机制，在App里面集中建立Fn来对应，这里来激活
            if (result.msg === "response_login") {
              tool.isFunction(Vue.$goLogin) && Vue.$goLogin();
            } else {
              rej(result);
            }
          }
        });
        //先fail 再 always
        theAjax.fail(function (_1) {
          //console.log(["fail ## 2", arguments]);
          rej(_1);
        });

        theAjax.always(function () {
          //console.log(["always ## 3", arguments]);
          theAjax = null;
        });
      });
    pro.abort = function () {
      theAjax && theAjax.abort();
    };

    return pro;
  }
};

export default pureLoader;

class lastLoader {
  quere = [];
  then = null;
  catch = null;
  finally = null;
  ajax = null;
  nowAjax = null;

  constructor(cfg) {
    let me = this;
    me.ajax = cfg.ajax;
    me.then = cfg.then || function () { };
    me.catch = cfg.catch || function () { };
    me.finally = cfg.finally || function () { };
  }
  load() {
    let me = this;

    //【=1=】执行abort
    if (me.quere.length) {
      me.quere = me.quere.filter(pro => {
        return !pro.$end;
      });
      me.quere.forEach(pro => {
        try {
          !pro.$end && pro.abort();
        } catch (e) {
          console.log(["进行了一次abort", e]);
        }
      });
      //console.log(["执行了一次abort操作 quere"]);
    }

    //【=2=】再一次执行
    let tempAjax = pureLoader.ajax(me.ajax)
      .then(result => {
        me.then(result);
        me.finally(result);
      })
      .catch(r => {
        if (r && r.statusText === "abort") {
          //
        } else {
          me.catch(r);
          me.finally(r);
        }
      })
      .finally(result => {
        tempAjax.$end = true;
      });

    //【=3=】加入queue
    me.quere.push(tempAjax);
    me.nowAjax = tempAjax;

    //【=4=】给全面的ajax操作提供入口
    return tempAjax;
  }
}

export { lastLoader };
