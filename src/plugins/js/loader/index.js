import $ from "jquery";
import tool from "../tool";

let pureLoader = {
  defaultCfg: {
    type: "POST"
  },
  defaultData: {},

  ajax: function(options) {
    let me = this;
    return new Promise((res, rej) => {
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
};

export default pureLoader;
