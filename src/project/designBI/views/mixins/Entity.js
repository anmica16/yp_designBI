import DrawEntityBase from "@designBI/store/Entity/DrawEntityBase.js";
import tool from "@/plugins/js/tool";
import detailSelector from "@designBI/views/component/dealBI/detailSelector.vue";
import dataSelector from "@designBI/views/component/dealBI/dataSelector.vue";
let Base = {
  props: {
    //是否不必须 交给使用者覆盖
    Entity: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      Instance: null
    };
  },
  computed: {
    recordData() {
      return this.Instance ? this.Instance.recordData : {};
    },
    record() {
      return this.Instance ? this.Instance.record : {};
    },
    id() {
      return this.recordData.id;
    },
    name() {
      return this.recordData.name;
    },
    desp() {
      return this.recordData.desp;
    }
  },
  created() {
    let me = this;
    //console.log(["执行created Base start"]);
    //console.log(["这个 instanceof有点问题"]);
    //# 1 这里表示 临时的未save的 也可以
    if (me.Entity instanceof DrawEntityBase) {
      // if (me.Entity.$DNA && me.Entity.$DNA === "DesignItemInstance") {
      me.Instance = me.Entity;
    } else {
      //+ 1 要改成 getter的形式
      me.Instance = me.$store.getters.getInstance(me.Entity);
    }
    //me.Instance.$vNode = me;
    //console.log(["执行created Base end"]);
  }
};

let Board = tool.mergeClone({}, Base, {
  computed: {
    templateCode() {
      return this.recordData.templateCode;
    },
    rootInstance() {
      return this.record.rootInstance;
    }
  }
});

let Instance = tool.mergeClone({}, Base, {
  props: {
    nowBoard: Object,
    EditNode: Object
  },
  data() {
    return {
      Instance: null
    };
  },
  computed: {
    instanceVue() {
      return this.Instance.instanceVue;
    },
    instanceCode() {
      return this.recordData.instanceCode;
    },
    xtype() {
      return this.recordData.xtype;
    },
    source() {
      return this.recordData.source;
    },
    sourceDims() {
      let me = this,
        source = me.source,
        dims = [];
      if (source && source.Dims) {
        dims = source.Dims;
      }
      return dims;
    },
    //希望快速反应
    parent() {
      return this.record.parent;
    },
    parentCode() {
      return (
        this.recordData.parent &&
        this.recordData.parent.$context &&
        this.recordData.parent.$context.instanceCode
      );
    },
    //【update 1204】该变量放在单独的ins.vue里面
    parentsList() {
      let me = this;
      return me.instanceVue.parentsList;
    },
    //因为 record里面会自动转化 data的 $context选项,转化为一个 实体
    items() {
      // console.log([
      //   "items数量有变！",
      //   this.record.items,
      //   this.record.items && this.record.items.length
      // ]);
      let theItems = (this.Instance && this.record.items) || [];

      return theItems.filter(i => i);
    },
    canDrop() {
      return this.recordData.drag_resize_cfg.can_drop != "";
    },
    dataId() {
      return this.recordData ? this.recordData.linkDataId : null;
    },
    chartType() {
      let me = this,
        t = me.recordData
          ? me.recordData.chartType || "table-mingxi"
          : "table-mingxi";
      return t;
    },
    theme() {
      let me = this,
        t = me.recordData ? me.recordData.theme : "";
      return t;
    },
    //++ 1 更多配置
    config_more() {
      let me = this;
      return me.recordData ? me.recordData.config_more : null;
    },
    //++ 2 明细关联表
    _joinTables() {
      return this.config_more ? this.config_more.JoinTables : null;
    },
    //++ 6 自定义名
    _cusDimNames() {
      return this.config_more ? this.config_more.CusDimNames : null;
    },
    //## 5 明细表 配置
    JoinTables() {
      let me = this,
        edit = me.EditNode,
        itemJTs = me._joinTables,
        result = [];
      if (itemJTs && itemJTs.length) {
        //~~ 1 明细所需被选择模糊rec
        itemJTs.forEach(jt => {
          let rec = edit.selectMap[jt.dataId],
            theJT = tool.apply(
              {
                selectRecord: rec
              },
              jt
            );
          // console.log([
          //   "//## 5 明细表 配置",
          //   rec,
          //   jt,
          //   edit.selectMap[jt.dataId]
          // ]);
          result.push(theJT);
        });
      }
      return result;
    },
    limitedByJoin() {
      let me = this,
        isLimited = false,
        jts = me.JoinTables;
      tool.each(jts, jt => {
        if (jt.selectRecord) {
          isLimited = true;
          return false;
        }
      });
      return isLimited;
    }

  },
  methods: {
    //++ 5 关联控件配置改变
    configDetail() {
      let me = this,
        h = me.$createElement;
      //@@ 1 当前Ins
      let readyIns = me.Instance,
        cancelData = tool.clone(me.Instance.recordData);

      return new Promise(res => {
        me.$msgbox({
          title: "关联控件数据配置",
          message: h(detailSelector, {
            key: tool.uniqueStr(),
            props: {
              Instance: readyIns,
              isEdit: true
            }
          }),
          closeOnClickModal: false,
          showCancelButton: true,
          customClass: "newDetail",
          beforeClose(action, ins, done) {
            if (action === "confirm") {
              let selector = ins.down("detailSelector"),
                detailDims = selector.$refs.detailDims;

              //# 1 如果是空
              if (tool.isNull(readyIns.recordData.linkDataId)) {
                me.$message.warning("请选择主表！");
                res(false);
                return;
              }
              let JTs = readyIns.recordData.config_more.JoinTables,
                notHealthy = [];
              //# 2 检测每个 join的配置是否完整
              if (JTs && JTs.length) {
                JTs.forEach(jt => {
                  if (
                    tool.isNull(jt.joinTableProperty) ||
                    tool.isNull(jt.joinThisProperty)
                  ) {
                    //# 2-2 响应的反应出来
                    me.$set(jt, "$notHealthy", true);
                    notHealthy.push(jt);
                  }
                });
              } else {
                me.$message.warning("关联控件至少配置一个关联表！");
                res(false);
                return;
              }
              if (notHealthy.length) {
                me.$message.warning(
                  `存在${notHealthy.length}个关联配置不完整，请完善后再试！`
                );
                res(false);
                return;
              }

              //# 2-2 检测所选维度数量
              //console.log(["//# 2-2 检测所选维度数量", selector, detailDims]);
              if (!detailDims.candies.length) {
                me.$message.warning("请至少选择1个维度指标！");
                res(false);
                return;
              }

              //# 3 进行保存
              readyIns
                .save()
                .then(r => {
                  me.$message.success("修改关联配置成功！");
                  done();
                  res(readyIns);
                })
                .catch(r => {
                  me.$message.error("添加失败！请检查服务器运行状态");
                  res(false);
                });
            } else {
              me.Instance.setData(cancelData);
              done();
              res(false);
            }
          }
        }).catch(() => {});
      });
    },

    //++ 6 BI控件数据源更改
    configData() {
      let me = this,
        h = me.$createElement;

      return new Promise(res => {
        let ops = h(dataSelector, {
          key: tool.uniqueStr(),
          props: {
            Instance: me.Instance,
            isLoadByHand: true
          }
        });
        me.$msgbox({
          title: "BI控件数据源更改",
          message: ops,
          closeOnClickModal: true,
          showCancelButton: true,
          customClass: "newBIItem",
          beforeClose(action, ins, done) {
            if (action === "confirm") {
              //console.log(["这个ins 的 form？", ins]);
              let selector = ins.down("dataSelector"),
                theRec = selector.nowFileRec;
              if (theRec) {
                //# 2 ins建立关联，然后获取关联数据
                me.Instance.setData({
                  linkDataId: theRec.id
                });
                me.Instance.save()
                  .then(r => {
                    me.$message.success("BI控件数据源更改成功！");
                    done();
                    res(me.Instance);
                  })
                  .catch(r => {
                    me.$message.error(
                      "BI控件数据源更改失败！请检查服务器运行状态"
                    );
                    res(false);
                  });
              } else {
                //# 2 提示未选中
                me.$message.warning("尚未选则数据源！");
                res(false);
              }
            } else {
              done();
              res(false);
            }
          }
        }).catch(() => {});
      });
    },
    getRealKey(dim) {
      let me = this;
      return me._joinTables && me._joinTables.length ? dim.tName : dim.key;
    },
  }
});

export { Base, Board, Instance };
