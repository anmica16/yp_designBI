//import $ from "jquery";
/* eslint-disable */
import tool from "./tool";
export default class RectLayout {
  constructor(config = {}) {
    let baseCfg = {
      // --------------------------------------------------------------------------
      //【一、基本参数】
      // --------------------------------------------------------------------------

      //【1】【可配置】默认左上、右上、左下、右下 四个角的归属，默认为 上 or 下
      nw: "n", //左上 默认归于 上方，一般标题占 100%宽度
      ne: "n", //右上 默认归于 上方，一般标题占 100%宽度
      sw: "s", //左下 默认归于 下方，一般底部占 100%宽度
      se: "s", //右下 默认归于 下方，一般底部占 100%宽度

      //【-2-】【不用于配置】五部分引用，过程变量：
      n: null, //上
      w: null, //左
      c: null, //中
      e: null, //右
      s: null, //下
      //【-3-】【不用于配置】未设置位置的 隐藏item：
      hiddenItems: [],
      //【-4-】【不用于配置】未设置位置 但可按默认顺序加进去的items
      unsetItems: []
    };
    Object.assign(this, baseCfg, config);
  }

  // --------------------------------------------------------------------------
  //【二、过程函数】
  // --------------------------------------------------------------------------

  //【++2】remake前的clear工作
  clearPosistion() {
    let lay = this,
      setFlag = ["n", "w", "c", "e", "s"];
    setFlag.forEach(pos => {
      delete lay[pos];
    });
  }

  //【++1】检查并设置 一个 item的位置
  positionCheckSetBase(item) {
    var lay = this;

    var setFlag = ["n", "w", "c", "e", "s"],
      pos = item.layoutAt;

    if (item.hidden) {
      lay.hiddenItems.push(item);
      return true; //【=4=】也算是设置完毕
    }

    //5个位置
    if (pos && setFlag.indexOf(pos) > -1) {
      if (lay[pos]) {
        //【=1=】已存在
        console.warn([
          "重复设置位置",
          pos,
          "该位置上已有：",
          lay[pos],
          "试图覆盖item为：",
          item,
          "将按照未设定位置处理"
        ]);
        lay.unsetItems.push(item);
        return false;
      } else {
        //【=2=】可设置
        lay[pos] = item;
        return true;
      }
    } else {
      //【=3=】其他错误位置
      console.warn([
        "错误的位置：",
        pos,
        " 请在",
        setFlag,
        "中选择一个进行配置",
        " 将按照未设定位置处理"
      ]);
      lay.unsetItems.push(item);
      return false;
    }
  }

  //【++2】对未设置的进行设置
  setNoPosItems(unsetItems) {
    var lay = this;
    var setFlag = ["n", "w", "c", "e", "s"];
    unsetItems = unsetItems || lay.unsetItems;

    tool.isObject(unsetItems) && (unsetItems = [unsetItems]);

    //【=1=】 且 有可安排的 未设置位置的 item
    if (unsetItems.length) {
      for (var j = 0; j < unsetItems.length; ++j) {
        var item = unsetItems[j];
        var cannotSet = true;

        //【=2=】循环看是否有位置
        for (var p = 0; p < setFlag.length; ++p) {
          var pos = setFlag[p];
          if (!lay[pos]) {
            lay[pos] = item; // 1.双向
            item.layoutAt = pos; // 2.双向
            cannotSet = false; //如果这个item 所有pos上都没有设置，那么就是不能set的状态了
            break;
          } else {
            continue;
          }
        }

        //【=3=】没有剩余位置，就隐藏
        if (cannotSet) {
          item.layoutAt = false;
          item.hidden = true;
          lay.hiddenItems.push(item);
        }
      }
    }
  }

  //【++3】增加完成后的引用替换：
  addChildRef(child) {
    var lay = this;
    if (!child.hidden && child.layoutAt && lay[child.layoutAt]) {
      lay[child.layoutAt] = child;
      child.dom.addClass("AbsRect-item");
    }
  }

  //【++4】隐藏的items如果已加入，则要隐藏掉:
  hideItems() {
    var lay = this;
    if (lay.hiddenItems.length) {
      lay.hiddenItems.forEach(function (item, i) {
        if (item.created && item.dom) {
          item.dom.css({
            display: "none"
          });
        } else {
          item.hidden = true;
          item.style = "display: none; " + item.style;
        }
      });
    }
  }

  //【1】位置检查和 设定
  positionCheckSet(items) {
    var lay = this;

    //【=1=】检查items，设置引用，默认顺序 上 左中右 下，多余隐藏
    items.forEach(function (item, i) {
      lay.positionCheckSetBase(item);
    });
    //【=2=】 且 有可安排的 未设置位置的 item
    if (lay.unsetItems.length) {
      lay.setNoPosItems();
    }
    //【=3=】隐藏部分设置失效 items
    lay.hideItems();
  }

  //【2-1】上方n的:
  setNorthWHTL() {
    var lay = this;
    if (lay.n) {
      //重置
      lay.n.top = lay.n.left = 0;

      //高度无异议，宽度要么是 100% 要么是 100% 减去左右
      var leftPercent = 100,
        rightNum = 0;
      //【=1.1=】左边是否有
      if (lay.nw === "w" && lay.w) {
        try {
          let theW = (lay.w.width + "").replace("px", "");
          lay.n.left = theW.trim(); //关键的left
          if (theW.indexOf("%") > -1) {
            leftPercent -= parseFloat(theW.replace("%", ""));
          } else {
            rightNum += parseFloat(theW);
          }
        } catch (e) {
          console.error(["错误的width lay.w.width", lay.w.width]);
        }
      }
      //【=1.2=】右边是否有
      if (lay.ne === "e" && lay.e) {
        try {
          let theW = (lay.e.width + "").replace("px", "");
          if (theW.indexOf("%") > -1) {
            leftPercent -= parseFloat(theW.replace("%", ""));
          } else {
            rightNum += parseFloat(theW);
          }
        } catch (e) {
          console.error(["错误的width lay.e.width", lay.e.width]);
        }
      }
      //【=2=】设置 calc宽度：
      lay.n.width =
        "calc( " + (leftPercent + "%") + " - " + (rightNum + "px") + " )";
    }
  }

  //【2-2】下方s的:
  setSouthWHTL() {
    var lay = this;
    if (lay.s) {
      //重置
      lay.s.top = lay.s.left = 0;

      {
        //对top的设定：
        let leftPercent = 100,
          rightNum = 0;
        //自己的高度
        try {
          var theH = (lay.s.height + "").replace("px", "");
          if (theH.indexOf("%") > -1) {
            leftPercent -= parseFloat(theH.replace("%", ""));
          } else {
            rightNum += parseFloat(theH);
          }
          lay.s.top =
            "calc( " + (leftPercent + "%") + " - " + (rightNum + "px") + " )"; //关键的top
        } catch (e) {
          console.error(["错误的height lay.s.height", lay.s.height]);
        }
      }

      //高度无异议，宽度要么是 100% 要么是 100% 减去左右
      let leftPercent = 100,
        rightNum = 0;
      //【=1.1=】左边是否有
      if (lay.sw === "w" && lay.w) {
        try {
          let theW = (lay.w.width + "").replace("px", "");
          lay.s.left = theW.trim(); //关键的left
          if (theW.indexOf("%") > -1) {
            leftPercent -= parseFloat(theW.replace("%", ""));
          } else {
            rightNum += parseFloat(theW);
          }
        } catch (e) {
          console.error(["错误的width lay.w.width", lay.w.width]);
        }
      }
      //【=1.2=】右边是否有
      if (lay.se === "e" && lay.e) {
        try {
          let theW = (lay.e.width + "").replace("px", "");
          if (theW.indexOf("%") > -1) {
            leftPercent -= parseFloat(theW.replace("%", ""));
          } else {
            rightNum += parseFloat(theW);
          }
        } catch (e) {
          console.error(["错误的width lay.e.width", lay.e.width]);
        }
      }
      //【=2=】设置 calc宽度：
      lay.s.width =
        "calc( " + (leftPercent + "%") + " - " + (rightNum + "px") + " )";
    }
  }

  //【2-3】左边w的:
  setWestWHTL() {
    var lay = this;
    if (lay.w) {
      //重置
      lay.w.top = lay.w.left = 0;

      //宽度无异议，高度要么是 100% 要么是 100% 减去左右
      var leftPercent = 100,
        rightNum = 0;
      //【=1.1=】上边是否有
      if (lay.nw === "n" && lay.n) {
        try {
          let theH = (lay.n.height + "").replace("px", "");
          lay.w.top = theH.trim();
          if (theH.indexOf("%") > -1) {
            leftPercent -= parseFloat(theH.replace("%", ""));
          } else {
            rightNum += parseFloat(theH);
          }
        } catch (e) {
          console.error(["错误的height lay.n.height", lay.n.height]);
        }
      }
      //【=1.2=】下边是否有
      if (lay.sw === "s" && lay.s) {
        try {
          let theH = (lay.s.height + "").replace("px", "");
          if (theH.indexOf("%") > -1) {
            leftPercent -= parseFloat(theH.replace("%", ""));
          } else {
            rightNum += parseFloat(theH);
          }
        } catch (e) {
          console.error(["错误的height lay.s.height", lay.s.height]);
        }
      }
      //【=2=】设置 calc高度：
      lay.w.height =
        "calc( " + (leftPercent + "%") + " - " + (rightNum + "px") + " )";
    }
  }

  //【2-4】右边e的:
  setEastWHTL() {
    var lay = this;
    if (lay.e) {
      //重置
      lay.e.top = lay.e.left = 0;

      {
        //left的计算
        let leftPercent = 100,
          rightNum = 0;
        //自己的宽度
        try {
          var theW = (lay.e.width + "").replace("px", "");
          if (theW.indexOf("%") > -1) {
            leftPercent -= parseFloat(theW.replace("%", ""));
          } else {
            rightNum += parseFloat(theW);
          }
          lay.e.left =
            "calc( " + (leftPercent + "%") + " - " + (rightNum + "px") + " )"; //关键的left
        } catch (e) {
          console.error(["错误的width lay.e.width", lay.e.width]);
        }
      }

      //宽度无异议，高度要么是 100% 要么是 100% 减去左右
      let leftPercent = 100,
        rightNum = 0;
      //【=1.1=】上边是否有
      if (lay.ne === "n" && lay.n) {
        try {
          let theH = (lay.n.height + "").replace("px", "");
          lay.e.top = theH.trim();
          if (theH.indexOf("%") > -1) {
            leftPercent -= parseFloat(theH.replace("%", ""));
          } else {
            rightNum += parseFloat(theH);
          }
        } catch (e) {
          console.error(["错误的height lay.n.height", lay.n.height]);
        }
      }
      //【=1.2=】下边是否有
      if (lay.se === "s" && lay.s) {
        try {
          let theH = (lay.s.height + "").replace("px", "");
          if (theH.indexOf("%") > -1) {
            leftPercent -= parseFloat(theH.replace("%", ""));
          } else {
            rightNum += parseFloat(theH);
          }
        } catch (e) {
          console.error(["错误的height lay.s.height", lay.s.height]);
        }
      }
      //【=2=】设置 calc高度：
      lay.e.height =
        "calc( " + (leftPercent + "%") + " - " + (rightNum + "px") + " )";
    }
  }

  //【2-5】中间c的:
  setCenterWHTL() {
    var lay = this;
    if (lay.c) {
      //重置
      lay.c.top = lay.c.left = 0;

      {
        //【一】宽度
        let leftPercent = 100,
          rightNum = 0;
        //【=1.1=】左边是否有
        if (lay.w) {
          try {
            var theW = (lay.w.width + "").replace("px", "");
            lay.c.left = theW.trim();
            if (theW.indexOf("%") > -1) {
              leftPercent -= parseFloat(theW.replace("%", ""));
            } else {
              rightNum += parseFloat(theW);
            }
          } catch (e) {
            console.error(["错误的width lay.w.width", lay.w.width]);
          }
        }
        //【=1.2=】右边是否有
        if (lay.e) {
          try {
            let theW = (lay.e.width + "").replace("px", "");
            if (theW.indexOf("%") > -1) {
              leftPercent -= parseFloat(theW.replace("%", ""));
            } else {
              rightNum += parseFloat(theW);
            }
          } catch (e) {
            console.error(["错误的width lay.e.width", lay.e.width]);
          }
        }
        //【=2=】设置 calc宽度：
        lay.c.width =
          "calc( " + (leftPercent + "%") + " - " + (rightNum + "px") + " )";
      }

      {
        //【二】高度
        let leftPercent = 100,
          rightNum = 0;
        //【=1.1=】上边是否有
        if (lay.n) {
          try {
            let theH = (lay.n.height + "").replace("px", "");
            lay.c.top = theH.trim();
            if (theH.indexOf("%") > -1) {
              leftPercent -= parseFloat(theH.replace("%", ""));
            } else {
              rightNum += parseFloat(theH);
            }
          } catch (e) {
            console.error(["错误的height lay.n.height", lay.n.height]);
          }
        }
        //【=1.2=】下边是否有
        if (lay.s) {
          try {
            var theH = (lay.s.height + "").replace("px", "");
            if (theH.indexOf("%") > -1) {
              leftPercent -= parseFloat(theH.replace("%", ""));
            } else {
              rightNum += parseFloat(theH);
            }
          } catch (e) {
            console.error(["错误的height lay.s.height", lay.s.height]);
          }
        }
        //【=2=】设置 calc高度：
        lay.c.height =
          "calc( " + (leftPercent + "%") + " - " + (rightNum + "px") + " )";
      }
    }
  }

  //【2】按顺序 挨个设置高宽
  setRectItemWHTL() {
    var lay = this;
    lay.setNorthWHTL();
    lay.setSouthWHTL();
    lay.setWestWHTL();
    lay.setEastWHTL();
    lay.setCenterWHTL();
  }

  //【3】将 位置信息形成style：
  setTLtoStyle() {
    var lay = this;
    var setFlag = ["n", "w", "c", "e", "s"];
    setFlag.forEach(function (pos, i) {
      var posItem = lay[pos];
      if (posItem) {
        posItem.style = posItem.style || {};
        posItem.top = posItem.top || "0";
        posItem.left = posItem.left || "0"; //都是这种数字 或者 d%的形式
        posItem.vWidth = posItem.width || 0;
        posItem.vHeight = posItem.height || 0;

        //【=1=】没有% 就加上px标识
        if (posItem.top.indexOf("%") < 0) {
          posItem.top = posItem.top + "px";
        }
        if (posItem.left.indexOf("%") < 0) {
          posItem.left = posItem.left + "px";
        }

        if (Number.isFinite(posItem.vWidth)) {
          posItem.vWidth = posItem.vWidth + "px";
        }
        if (Number.isFinite(posItem.vHeight)) {
          posItem.vHeight = posItem.height + "px";
        }
      }
    });
  }

  //【==== 1 ====】初始化设置
  makeLayout(items, ifRemake) {
    var lay = this;
    if (!items || !items.length) {
      console.log([
        "无子集！不过可以通过后续 add进去后 重计算调整！",
        items,
        lay
      ]);
      return;
    }
    //【0】是否重新布局
    ifRemake && lay.clearPosistion();
    //【1】位置检查和 设定
    lay.positionCheckSet(items);
    //【2】按顺序 挨个设置高宽绝对定位
    lay.setRectItemWHTL();
    //【3】然后将 位置信息形成style：
    lay.setTLtoStyle();

    //console.log(["看看 lay上面的信息", lay]);
  }

  //【==== 2 ====】重新计算并设置高宽、top left：
  //  只需要在任一 position上的 item高宽改变之后立即触发这个函数就可以
  reCalcWHTL() {
    var lay = this;
    //【=1=】数据计算完毕
    lay.setRectItemWHTL();
    lay.setTLtoStyle();
  }
}
