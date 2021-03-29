import "@designBI/assets/theme/edit.scss";

import Vue from "vue";
import DesignItemInstance from "@designBI/store/Entity/DesignItemInstance";
import DrawingBoard from "@designBI/store/Entity/DrawingBoard";

//@@ 1 多个新增器
import dataSelector from "@designBI/views/component/dealBI/dataSelector.vue";
import propertySelector from "@designBI/views/component/dealBI/propertySelector.vue";
import paramSelector from "@designBI/views/component/dealBI/paramSelector.vue";
import detailSelector from "@designBI/views/component/dealBI/detailSelector.vue";
import BoardInsPropSelector from "@designBI/views/component/dealBI/BoardInsPropSelector.vue";

import tool from "@/plugins/js/tool";
import $ from "jquery";
import loader from "@/plugins/js/loader";
import "@designBI/edit.js";
//~ ++ 1 全页面fixed
import ItemEdit from "./edit/ItemEdit";
import { Xbase } from "@designBI/views/mixins/X";
import LoginUser from "@designBI/views/mixins/LoginUser";
import userBtn from "@designBI/views/Page/PublicItem/userBtn.vue";
import msgBtn from "@designBI/views/Page/PublicItem/msgBtn.vue";

import { conditionCmps } from "@designBI/store";

export default {
  name: "DesignEdit2",
  mixins: [Xbase, LoginUser],
  components: {
    ItemEdit,
    userBtn,
    msgBtn
  },
  data() {
    return {
      queryFlag: "DesignEdit",
      loadRoot: false,
      nowInstances: [],
      //activeName: "",
      //drawingBoards: [],
      //在router进行切换的时候 切换
      // nowBoard: null,
      // nowInstances: null,

      //# 1 百分比模式？
      percentMode: true,
      //# 2 进入item 编辑页?
      linkDatas: {},
      ajaxLinkDatas: [],
      //# 3 条件汇总 联动
      conditionMap: {},
      singleCondMap: {},
      //# 4 所选record，
      //【update】目前只涉及到关联变化
      selectMap: {},

      itemEditPage: false,
      addInstances: [],

      //# 5 预览页开关
      previewShow: false
    };
  },
  computed: {
    me() {
      return this;
    },
    isReadonly() {
      return false;
    },
    conditionCmps() {
      return conditionCmps;
    },
    //在router进行切换的时候 切换
    nowTemplateCode() {
      let me = this,
        params = me.$route.params,
        templateCode = params.templateCode;
      return templateCode;
    },
    nowBoard() {
      let me = this,
        templateCode = me.nowTemplateCode;
      return me.$store.getters.getBoard(templateCode);
    },
    nowBoardRoot() {
      let me = this;
      if (!me.nowBoard) {
        return null;
      } else {
        return me.nowBoard.record.rootInstance;
      }
    },
    rootWidth() {
      let me = this,
        nowBoardRoot = me.nowBoardRoot;

      if (me.percentMode) {
        return "100%";
      }

      return (
        (nowBoardRoot && nowBoardRoot.recordData.style.width + "px") || "auto"
      );
    },

    rootHeight() {
      let me = this,
        nowBoardRoot = me.nowBoardRoot;

      return (
        (nowBoardRoot && nowBoardRoot.recordData.style.height + "px") || "auto"
      );
    },
    addTable() {
      let me = this,
        items = Vue.$itemManager.items,
        data = [];
      tool.each(items, item => {
        let rec = tool.clone(item.recordData);
        rec.Entity = item;
        let props = [];
        tool.each(rec.props, (key, val) => {
          //#1 一个prop的配置 必为对象
          if (tool.isObject(val)) {
            if (val.default && !tool.isFunction(val.default)) {
              throw `注意新增控件prop时，如果设置了default值，必须设置为function返回值的形式！该prop：${key}，请检查对应子控件的vue或js文件配置！`;
            }

            let prop = {
              key: key,
              //类型都有名称
              type: val.type.name,
              default: (val.default && val.default()) || "无",
              required: val.required,
              desp: val.desp
            };
            props.push(prop);
          }
        });
        let propsString = [];
        tool.each(props, prop => {
          let str = [
            prop.required ? "[必须]" : "[可选]",
            prop.key + ":" + "(" + prop.type + ")",
            prop.desp ? prop.desp : "",
            " 默认值:" + prop.default
          ].join("");
          propsString.push(str);
        });
        rec.props = propsString.length ? propsString.join("\r\n") : "无";

        data.push(rec);
      });

      return data;
    },
    addTableColumns() {
      let me = this,
        //items = Vue.$itemManager.items,
        //inCols = ["name", "xtype", "desp"],
        cols = [
          {
            prop: "name",
            label: "名称",
            width: 80
          },
          {
            prop: "xtype",
            label: "类名",
            width: 100
          },
          {
            prop: "desp",
            label: "描述",
            width: 150
          },
          {
            prop: "props",
            label: "传入属性",
            width: 225
          }
        ];
      //#1 常规

      //#2 "props"
      return cols;
    },
    limitName() {
      let me = this,
        limit = 35,
        name = me.nowBoard.recordData.name,
        theLen = tool.len(name);
      //console.log(["这里不对？"]);
      name = theLen > limit ? tool.substr(name, 0, limit) + "..." : name;
      return name;
    }
  },
  methods: {
    //+ 1 文件夹模式
    getNowBoard() {
      let me = this;
      me.$store.dispatch("getNowBoard", me.nowTemplateCode);
    },
    getNowInstances() {
      let me = this;
      if (me.nowBoard && me.nowBoard.recordData.isFolder) {
        return;
      }
      let templateCode = me.nowTemplateCode,
        //不一定会反应过来
        items = me.$store.getters.getInstances(templateCode);
      //# 1 第一次就新增一个
      if (items && !items.length) {
        me.$store
          .dispatch("getInstancesInDB", { templateCode })
          .then(theItems => {
            console.log(["数据库获取一次！检查数量！", theItems]);
            if (!theItems.length) {
              let rootIns = new DesignItemInstance({
                ...me.nowBoard.getData("rootInstance").$context,
                xtype: "CellBubble"
              });
              //# 2 保存和添加到map，然后重新获取
              rootIns.save();
            }
          });
      }

      return items;
    },

    handleAddTip(oneItem) {
      let me = this;
      me.$refs.popover.handleBlur();
      console.log(["点击提示，打开window进行细项添加", oneItem, arguments]);
      let itemMaker = Vue.extend({
        template: `<Window title="新建子控件" ref="win">
            <Maker_Entity 
            :Entity="Entity"
            :EntityClass="DesignItemInstance"
            @submitForm="submitForm"></Maker_Entity>
          </Window>`,
        data() {
          return {
            DesignItemInstance,
            Entity: {
              xtype: oneItem.xtype,
              templateCode: me.nowBoardRoot.recordData.templateCode
            }
          };
        },
        methods: {
          //经过保存的 instance
          //【update】应该在保存的时候，对父类进行子项添加！
          submitForm(Instance) {
            let theWin = this;
            Instance.$$newIns = true;
            console.log(["尝试添加！"]);
            me.nowBoardRoot.add(Instance);
            theWin.$refs.win.close();
          }
        }
      });
      Vue.$windowManager.add(itemMaker);
    },
    headPopShow(thePop) {
      //console.log(["show head", arguments, this]);
      $(thePop.$refs.popper).css({
        transform: "translateY(-10px)"
      });
    },

    leftBarPopShow() {
      //console.log(["show leftBarPopShow", arguments, this]);
    },
    //【core】创建 BI控件
    createBIItem() {
      let me = this,
        h = me.$createElement;

      return new Promise(res => {
        if (me.isReadonly) {
          res(false);
          return;
        }
        me.$msgbox({
          title: "添加BI组件--选择数据源",
          message: h(dataSelector, {
            key: tool.uniqueStr(),
            props: {
              recordsFilter(recs) {
                return recs.filter(r => {
                  return ["procedure", "custom"].indexOf(r.dataSubType) < 0;
                });
              }
            }
          }),
          closeOnClickModal: true,
          showCancelButton: true,
          customClass: "newBIItem",
          beforeClose(action, ins, done) {
            if (action === "confirm") {
              console.log(["这个ins 的 form？", ins]);
              let selector = ins.down("dataSelector"),
                theRec = selector.nowFileRec;
              if (theRec) {
                //# 2 ins建立关联，然后获取关联数据
                let newIns = new DesignItemInstance({
                  xtype: "BIBase",
                  templateCode: me.nowTemplateCode,
                  linkDataId: theRec.id,
                  useType: 10,
                  chartType: "table-mingxi",
                  name: "子控件" + (me.addInstances.length + 1),
                  createTime: tool.now(),
                  createOperId: me.loginUser.userCode,
                  ownerGroup: me.pageGroupId
                });
                //# 3 add到主cell
                newIns.$$newIns = true;
                selector.confirmLoading = true;
                me.nowBoardRoot
                  .add(newIns)
                  .then(r => {
                    me.$message.success("新增成功！");
                    done();

                    newIns.$bubble.goEditPage();
                    newIns.$bubble.mousedownFn();
                    res(newIns);
                  })
                  .catch(r => {
                    me.$message.error(
                      r.msg || "添加失败！请检查服务器运行状态"
                    );
                    res(false);
                  })
                  .finally(() => {
                    selector.confirmLoading = false;
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
        }).catch(() => { });
      });
    },
    //## 1 切换
    goEditPage(ins) {
      let me = this;
      me.itemEditPage = true;
      me.$nextTick(() => {
        me.$refs.itemEdit.changeIns(ins);
      });
    },
    goBackEdit() {
      let me = this;
      me.itemEditPage = false;
      me.previewShow = false;
    },
    //## 2 item 全页数据中心
    //~ 1 刷新某id数据
    refreshLinkData(dataId) {
      let me = this,
        options = {
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.GetLinkData,
          data: {
            id: dataId
          }
        };

      return new Promise((res, rej) => {
        if (me.ajaxLinkDatas.indexOf(dataId) > -1) {
          res(me.linkDatas[dataId]);
        } else {
          me.ajaxLinkDatas.push(dataId);
          loader
            .ajax(options)
            .then(result => {
              let data = result.data;
              if (data && data.length) {
                let setData = data[0];
                if (tool.isString(setData.dimension)) {
                  setData.dimension = JSON.parse(setData.dimension);
                }
                //# 3 设定好
                me.$set(me.linkDatas, dataId, setData);
                res(setData);
              } else {
                res(false);
              }
            })
            .catch(r => {
              res(false);
            })
            .finally(() => {
              let at = me.ajaxLinkDatas.indexOf(dataId);
              at > -1 && me.ajaxLinkDatas.splice(at, 1);
            });
        }
      });
    },
    //~ 2 获取某id数据
    getLinkData(dataId) {
      let me = this,
        linkDatas = me.linkDatas;

      return new Promise(res => {
        if (tool.isArray(linkDatas[dataId])) {
          res(linkDatas[dataId]);
        } else {
          me.refreshLinkData(dataId).then(sumData => {
            res(sumData);
          });
        }
      });
    },
    //~ 3 条件控件增加
    conditionAddFn(condition) {
      let me = this,
        h = me.$createElement;
      //console.log(["条件控件增加", condition]);

      //@@ 1 可能加入的 ins
      let readyIns = new DesignItemInstance({
        xtype: condition.xtype,
        templateCode: me.nowTemplateCode,
        useType: 20, //20表示过滤控件
        name: "过滤控件" + (me.addInstances.length + 1)
      });

      return new Promise(res => {
        if (me.isReadonly) {
          res(false);
          return;
        }
        me.$msgbox({
          title: "添加过滤组件",
          message: h(propertySelector, {
            key: tool.uniqueStr(),
            props: {
              xtype: condition.xtype,
              newCondition: true,
              Entity: readyIns,
              EditNode: me
            }
          }),
          closeOnClickModal: true,
          showCancelButton: true,
          customClass: "newCondition",
          beforeClose(action, ins, done) {
            if (action === "confirm") {
              let selector = ins.down("propertySelector");

              //console.log(["这个ins 的 form？", ins, selector]);
              //if (selector.selProps.length) {
              readyIns.setData({
                propsData: {
                  properties: selector.selProps.map(a => {
                    let b = tool.apply({}, a);
                    delete b.parentCoating;
                    return b;
                  })
                },
                createTime: tool.now(),
                createOperId: me.loginUser.userCode,
                ownerGroup: me.pageGroupId
              });

              //# 3 add到主cell
              //newIns.$$newIns = true;
              me.nowBoardRoot
                .add(readyIns)
                .then(r => {
                  me.$message.success("新增成功！");
                  done();
                  res(readyIns);
                })
                .catch(r => {
                  me.$message.error(r.msg || "添加失败！请检查服务器运行状态");
                  res(false);
                });
              // } else {
              //   //# 2 提示未选中
              //   me.$message.warning("请选择至少一个字段！");
              //   res(false);
              // }
            } else {
              done();
              res(false);
            }
          }
        }).catch(() => { });
      });
    },
    //~ 4 关联控件增加
    createDetail() {
      let me = this,
        h = me.$createElement;
      //console.log(["关联控件增加"]);

      return new Promise(res => {
        if (me.isReadonly) {
          res(false);
          return;
        }
        //@@ 1 可能加入的 ins
        let readyIns = new DesignItemInstance({
          xtype: "BIBase",
          templateCode: me.nowTemplateCode,
          useType: 11, //11表示关联控件
          chartType: "table-mingxi",
          name: "关联控件" + (me.addInstances.length + 1),
          createTime: tool.now(),
          createOperId: me.loginUser.userCode,
          ownerGroup: me.pageGroupId
        });
        me.$msgbox({
          title: "添加关联控件",
          message: h(detailSelector, {
            key: tool.uniqueStr(),
            props: {
              Instance: readyIns
            }
          }),
          closeOnClickModal: false,
          showCancelButton: true,
          customClass: "newDetail",
          beforeClose(action, ins, done) {
            if (action === "confirm") {
              let selector = ins.down("detailSelector"),
                detailDims = selector.$refs.detailDims;

              if (selector.badJoin) {
                me.$message.warning("关联表还有错误未处理完毕！");
                res(false);
                return;
              }

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
              console.log(["//# 2-2 检测所选维度数量", selector, detailDims]);
              if (!detailDims.candies.length) {
                me.$message.warning("请至少选择1个维度指标！");
                res(false);
                return;
              }
              selector.confirmLoading = true;
              //# 3 进行保存
              me.nowBoardRoot
                .add(readyIns)
                .then(r => {
                  me.$message.success("新增成功！");
                  done();
                  readyIns.$bubble.goEditPage();
                  readyIns.$bubble.mousedownFn();
                  res(readyIns);
                })
                .catch(r => {
                  me.$message.error(r.msg || "添加失败！请检查服务器运行状态");
                  res(false);
                })
                .finally(() => {
                  selector.confirmLoading = false;
                });
            } else {
              done();
              res(false);
            }
          }
        }).catch(() => { });
      });
    },
    returnToCenter() {
      let me = this;
      me.$router.push({ name: "DesignCenter" });
    },
    //~ 6 新复用
    selectCopyItemFn() {
      let me = this,
        h = me.$createElement;

      return new Promise(res => {
        if (me.isReadonly) {
          res(false);
          return;
        }
        me.$msgbox({
          title: "通过复用添加控件",
          message: h(BoardInsPropSelector, {
            key: tool.uniqueStr(),
            props: {
              stepRange: [1, 2],
              prePIndex: me.nowBoard.recordData.pIndex
            }
          }),
          closeOnClickModal: true,
          showCancelButton: true,
          customClass: "newDetail newCopyItem",
          beforeClose(action, ins, done) {
            if (action === "confirm") {
              let selector = ins.down("BoardInsPropSelector"),
                insData = selector.selItem;
              if (!insData) {
                me.$message.warning("请选择需要复制的子控件！");
                res(false);
                return;
              }
              selector.loading = true;
              let theIns = new DesignItemInstance(tool.apply({}, insData));

              let newIns = theIns.newCopy();
              newIns.setData({
                templateCode: me.nowBoard.templateCode
              });
              me.nowBoardRoot
                .add(newIns)
                .then(() => {
                  me.$message.success("复制成功");
                  newIns.$bubble.mousedownFn();
                  done();
                  res(newIns);
                  selector.loading = false;
                })
                .catch(r => {
                  me.$message.warning(r.msg || "复制失败");
                  res(false);
                  selector.loading = false;
                });
            } else {
              done();
              res(false);
            }
          }
        });
      });
    },
    //~ 7 参数控件添加
    createParamItem() {
      let me = this,
        h = me.$createElement;
      //console.log(["参数控件增加"]);

      return new Promise(res => {
        if (me.isReadonly) {
          res(false);
          return;
        }
        //@@ 1 可能加入的 ins
        let readyIns = new DesignItemInstance({
          xtype: "BIBase",
          templateCode: me.nowTemplateCode,
          useType: 12, //12 表示参数控件
          chartType: "table-mingxi",
          name: "参数控件" + (me.addInstances.length + 1),
          createTime: tool.now(),
          createOperId: me.loginUser.userCode,
          ownerGroup: me.pageGroupId
        });

        me.$msgbox({
          title: "添加参数控件",
          message: h(paramSelector, {
            key: tool.uniqueStr(),
            props: {
              Instance: readyIns,
              EditNode: me
            }
          }),
          closeOnClickModal: false,
          showCancelButton: true,
          customClass: "createParamItem",
          beforeClose(action, ins, done) {
            if (action === "confirm") {
              let selector = ins.down("paramSelector"),
                selectResult = selector.selectResult;

              if (!selectResult) {
                me.$message.warning("参数列表尚未添加完毕，请添加完后再试！");
                res(false);
                return;
              }

              readyIns.setData(selectResult);

              selector.confirmLoading = true;
              //# 3 进行保存
              me.nowBoardRoot
                .add(readyIns)
                .then(r => {
                  me.$message.success("新增成功！");
                  done();
                  readyIns.$bubble.goEditPage();
                  readyIns.$bubble.mousedownFn();
                  res(readyIns);
                })
                .catch(r => {
                  me.$message.error(r.msg || "添加失败！请检查服务器运行状态");
                  res(false);
                })
                .finally(() => {
                  selector.confirmLoading = false;
                });
            } else {
              done();
              res(false);
            }
          }
        }).catch(() => { });
      });
    }
  },
  watch: {
    //#3 手动触发 带动联动
    nowBoard(newBoard, oldBoard) {
      let me = this;
      //# 4 标题名改变
      $("title").html(`绘板：${newBoard.recordData.name}`);
      if (newBoard && newBoard != oldBoard) {
        me.getNowInstances();
      }
    },
    //@ 4 resize跟进
    itemEditPage() {
      $(window).trigger("resize");
    },
    nowTemplateCode(newVal) {
      let me = this;
      if (newVal) {
        me.getNowBoard();
      }
    }
  },
  created() {
    let me = this;
    //@ 1 记录子Ins加入、删除
    me.$on("addInstance", ins => {
      let at = me.addInstances.indexOf(ins);
      at < 0 && me.addInstances.push(ins);
    });
    me.$on("removeInstance", ins => {
      let at = me.addInstances.indexOf(ins);
      at > -1 && me.addInstances.splice(at, 1);
    });
    //@ 2 文件夹模式
    me.getNowBoard();
  },
  mounted() {
    let me = this;
    me.getNowInstances();
  }
};
