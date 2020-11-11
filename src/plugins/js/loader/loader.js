import $ from "jquery";
import tool from "../tool";
import store from "../../store";
export default class loader {
  constructor(el) {
    this.El = el;
  }
}

//【=1=】类方法
Object.assign(loader, {
  defaultCfg: {
    crossDomain: true == !document.all,
    type: "POST"
  },
  defaultData: {
    windowsDirver: true,
    lg: "cn"
  },

  ajax: function(options) {
    let me = this;
    return new Promise((res, rej) => {
      //【=1=】默认项
      tool.applyIf(options, me.defaultCfg);
      options.url =
        store.state.backEndOrigin + (options.url.url || options.url);
      options.data = options.data || {};
      //【=1-2=】method选项
      if (options.method) {
        options.data.method = options.method;
        delete options.method;
      }
      if (options.data.method) {
        options.data.method = options.data.method.name || options.data.method;
      }
      //【=1-3=】默认data
      tool.applyIf(options.data, me.defaultData);

      //【=2=】传输，然后结果处理,将false都归于 catch了
      $.ajax(options)
        .then(function(_result) {
          let result = JSON.parse(_result),
            suc = result.success;
          if (suc) {
            res(result);
          } else {
            rej(result);
          }
        })
        .catch(function(_1) {
          rej(_1);
        });
    });
  }
});

//【=2=】实例方法
// loader.prototype.ajax = function (cfg) {

// };
