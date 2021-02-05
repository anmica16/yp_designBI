import $ from "jquery";
import tool from "../tool";

let pureLoader = {
  defaultCfg: {
    type: "POST"
  },
  defaultData: {},

  ajax: function(options) {
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
        theAjax.then(function(_result) {
          //console.log(["then ## 4", arguments]);
          let result = JSON.parse(_result),
            suc = result.success;
          if (suc) {
            res(result);
          } else {
            rej(result);
          }
        });
        //先fail 再 always
        theAjax.fail(function(_1) {
          //console.log(["fail ## 2", arguments]);
          rej(_1);
        });

        theAjax.always(function() {
          //console.log(["always ## 3", arguments]);
          theAjax = null;
        });
      });
    pro.abort = function() {
      theAjax && theAjax.abort();
    };

    return pro;
  }
};

export default pureLoader;
