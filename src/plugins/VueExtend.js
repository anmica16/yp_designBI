import tool from "./js/tool";
//import $ from "./js/loader";
//import Api from "../assets/custom/Api_v8";
export default {
  queryAble(Vue) {
    let matchKey = function(item, key, val) {
      if (!item) return false;
      if (key === undefined && val === undefined) {
        return item;
      }
      if (tool.isFunction(key)) {
        return key(item);
      }
      if (tool.isFunction(val)) {
        return val(item[key]);
      }
      if (val === undefined && key) {
        val = key;
        key = "queryFlag";
      }

      return item[key] === val;
    };

    Vue.prototype.up = function(key, val) {
      let me = this,
        returnitem = null,
        ownerCt = me.$parent;
      if (matchKey(ownerCt, key, val)) {
        returnitem = ownerCt;
      } else if (ownerCt) {
        returnitem = ownerCt.up(key, val);
      }
      return returnitem;
    };

    Vue.prototype.down = function(key, val, sourceItems) {
      let me = this,
        returnitem = null;
      if (!sourceItems) {
        if (me.$children && me.$children.length > 0) {
          returnitem = me.down(key, val, me.$children);
        }
      } else {
        if (sourceItems.length > 0) {
          tool.each(sourceItems, function(item) {
            if (matchKey(item, key, val)) {
              returnitem = item;
              return false;
            } else if (item) {
              let _returnitem = item.down(key, val);
              if (_returnitem) {
                returnitem = _returnitem;
                return false;
              }
            }
          });
        }
      }

      return returnitem;
    };
  },

  //【=2=】请求数据
  // requestAble(Vue) {
  //   Vue.prototype.Api = Api;

  //   Vue.prototype.ajax = function(options) {
  //     let me = this,
  //       result = new Promise((res, rej) => {
  //         $.ajax(options)
  //           .then(datas => {
  //             res(datas);
  //           })
  //           //【-1-】失败处理，如果是带msg的
  //           .catch(function(err) {
  //             console.log(["ajax 失败", arguments, err]);
  //             if (err && err.msg !== undefined) {
  //               switch (err.msg) {
  //                 case "response_login":
  //                   me.$msgbox({
  //                     title: "操作失败",
  //                     message: err.msg
  //                   }).catch(() => {});
  //                   me.$router.psuh({ name: "Login" });
  //                   break;
  //                 default:
  //                   rej(err);
  //               }
  //             }
  //           });
  //       });
  //     return result;
  //   };
  // },

  // eslint-disable-next-line
  
  //【=3=】加入和移除

  install(Vue, options) {
    this.queryAble(Vue);
    //this.requestAble(Vue);
  }
};
