import tool from "@/plugins/js/tool";
import $ from "jquery";
import Vue from "vue";
let dropManagerCfg = {
  name: "dropManager",
  data() {
    return {
      //# 1 在Bubble中 引用
      //管理拽入的控件
      items: new Map()
    };
  },
  computed: {
    // mapNodes() {
    //   let me = this,
    //     dragNodes = [],
    //     ownerNodes = [];
    //   me.items.forEach((val, key) => {
    //     ownerNodes.push(key);
    //     dragNodes.push(val);
    //   });
    //   return {
    //     dragNodes,
    //     ownerNodes
    //   };
    // },
    // dragNodes() {
    //   return this.mapNodes.dragNodes;
    // },
    // ownerNodes() {
    //   return this.mapNodes.ownerNodes;
    // }
  },
  methods: {
    set() {
      return this.items.set(...arguments);
    },
    get() {
      return this.items.get(...arguments);
    },

    remove(el) {
      if (tool.isNumber(el)) {
        if (el < this.items.length) {
          this.items.splice(el, 1);
        }
      } else {
        let at = this.items.indexOf(el);
        if (at > -1) {
          this.items.splice(at, 1);
        }
      }
    },

    checkResizeStop(e, ownerNode, dragNode) {
      let me = this;
      return new Promise((res, rej) => {
        res();
      });
    },

    //【drag 4】
    findLastParent(parents1, parents2) {
      let me = this,
        lastSame = -1;
      for (let i = 0; i < parents1.length && i < parents2.length; ++i) {
        if (parents1[i] === parents2[i]) {
          lastSame = i;
        } else {
          return [parents1[lastSame], lastSame];
        }
      }
      return lastSame === -1 ? false : [parents1[lastSame], lastSame];
    },

    //【drag 3】
    findIfChild(parent, child) {
      let me = this,
        childPL = child.parentsList;
      if (childPL.length) {
        //# 1 如果 child的 父亲链中 有parent的 ins，那么确定其为父亲
        if (childPL.indexOf(parent.Instance) > -1) {
          return true;
        }
      }
      return false;
    },

    //【drag 2】
    findFrontItem(fitOwners) {
      let me = this;
      if (fitOwners.length == 1) {
        return fitOwners[0];
      }
      let xyOkItems = [],
        parents = [];
      for (let i = 0; i < fitOwners.length; ++i) {
        let isParent = false;
        for (let j = 0; j < fitOwners.length; ++j) {
          if (i == j) continue; //这个是相同的情况。
          isParent = me.findIfChild(fitOwners[i], fitOwners[j]);
          //=1= 如果找到了是包含了 任一group的，那么这个 parent就是有child的
          if (isParent) {
            break; //=2=也就可以跳出来进行下一个的 循环了
          }
        }
        //=3= 找遍了所有 都没有找到 所包含的子集，那么这个就是 最底层的 非父级部件了。
        if (!isParent) {
          xyOkItems.push(fitOwners[i]);
        } else {
          parents.push(fitOwners[i]);
        }
      }
      //=4= 开始对所有 底层子控件进行 更前端比较
      if (xyOkItems.length) {
        if (xyOkItems.length == 1) {
          return xyOkItems[0];
        }
        //=4.1= zIndex比较
        xyOkItems.sort(function(a, b) {
          let aIns = a.Instance,
            bIns = b.Instance,
            p1s = a.parentsList,
            p2s = b.parentsList,
            findP = me.findLastParent(p1s, p2s);
          if (findP) {
            let z1 =
                (p1s.length > findP[1] + 1 &&
                  p1s[findP[1] + 1].recordData.style.zIndex) ||
                aIns.recordData.style.zIndex ||
                0,
              z2 =
                (p2s.length > findP[1] + 1 &&
                  p2s[findP[1] + 1].recordData.style.zIndex) ||
                bIns.recordData.style.zIndex ||
                0;
            return z1 - z2;
          } else {
            let z1 = aIns.recordData.style.zIndex || 0,
              z2 = bIns.recordData.style.zIndex || 0;
            return z1 - z2;
          }
        });
        //=5= 还蕴含着 加入顺序
        return xyOkItems[xyOkItems.length - 1];
      }
      //不应该走到这里，应该是能找到的。
      console.error(
        "应该是能找到 最下层子级的，但是没找到，可能是父子级 items关系没整对"
      );
      return false;
    },

    //【drag 1】
    checkDragStop(e, ownerNode, dragNode) {
      let me = this;
      return new Promise((res, rej) => {
        //~ 0 只要保证在body100%高度内进行操作，就不会有问题
        let stopX = e.clientX,
          stopY = e.clientY;
        //~ 1 该区域有哪些可选 能drop进的组件
        let fitOwners = [];
        me.items.forEach(function(dNode, holderNode) {
          //# 1 排除自己、
          if (ownerNode == holderNode) {
            return;
          }
          //# 1-2 以及自己内部
          let findInner = holderNode.instanceCode
            ? ownerNode.down("instanceCode", holderNode.instanceCode)
            : false;
          if (findInner) {
            return;
          }
          //# 1-3 还要可见
          if (!$(holderNode.$el).is(":visible")) {
            return;
          }

          //# 2 开始检测
          let dom = $(dNode.$el),
            off = dom.offset(),
            rectX = off.left,
            rectY = off.top,
            rectW = dNode.width,
            rectH = dNode.height;
          //console.log(["比较与client的点 X", stopX, rectX, "Y", stopY, rectY]);
          if (
            stopX > rectX &&
            stopX < rectX + rectW &&
            stopY > rectY &&
            stopY < rectY + rectH
          ) {
            fitOwners.push(holderNode);
          }
        });
        if (fitOwners.length) {
          //【3】有 就寻找最下层 子级
          let theOwner = me.findFrontItem(fitOwners);

          //# 1-4 排除现有父亲
          if (theOwner.instanceCode === ownerNode.parentCode) {
            rej({
              type: "notFind",
              message: "sameParent"
            });
            return;
          }

          // console.log([
          //   "找到最前端的 子控件了！ check!",
          //   fitOwners,
          //   theOwner,
          //   me
          // ]);
          //【4】加入！
          if (theOwner) {
            theOwner.Instance.add(ownerNode.Instance)
              .then(r => {
                //3个save都完成了

                res({
                  r,
                  type: "add"
                });
              })
              .catch(r => {
                rej({
                  r,
                  type: "error"
                });
              });
            return;
          }
        }
        //只有add进去的才是res
        rej({ type: "notFind" });
      });
    }
  }
  // created() {
  //   let me = this;
  // }
};
let dropManagerCtor = Vue.extend(dropManagerCfg);
const dropManager = new dropManagerCtor();

export default dropManager;
