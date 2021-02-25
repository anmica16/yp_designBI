<template>
  <div class="DesignEdit" style="width: 100%; height: 100%">
    <div v-if="!nowBoard">
      正在努力搜索和加载该绘板！若等待过久可<router-link
        :to="{ name: 'DesignCenter' }"
        >返回主界面</router-link
      >
    </div>
    <template v-else>
      <RectLayoutV2 ref="rect" wWidth="60px" nHeight="36px">
        <!-- 【3】上部 标题 工具栏 -->
        <div slot="n" class="EditHeader">
          <div class="leftPart">
            <!-- ~ 1 绘板名 -->
            <div class="item templateTitle" :title="nowBoard.recordData.name">
              <i class="el-icon-edit"></i>
              <span class="text">{{ limitName }}</span>
            </div>

            <!-- ~ 2 导出 撤销、还原 预留 -->
            <!-- <el-popover
              class="popover"
              @show="headPopShow"
              placement="bottom-start"
              trigger="hover"
            >
              <div slot="reference" class="item">
                <i class="el-icon-document-add"></i>
                <span class="text">导出</span>
              </div>
              <div class="outType">
                <div class="option">
                  <i class="el-icon-date"></i>
                  <span class="text">导出Excel</span>
                </div>
                <div class="option">
                  <i class="el-icon-collection"></i>
                  <span class="text">导出Pdf</span>
                </div>
              </div>
            </el-popover>

            <div class="item">
              <i class="el-icon-caret-left"></i>
              <span class="text">撤销</span>
            </div>

            <div class="item">
              <span class="text">还原</span>
              <i class="el-icon-caret-right"></i>
            </div>

            <div class="divid"></div>

            <div class="item">
              <i class="el-icon-magic-stick"></i>
              <span class="text">绘板样式</span>
            </div>

            <el-popover
              class="popover"
              @show="headPopShow"
              trigger="hover"
              placement="bottom-start"
            >
              <div slot="reference" class="item">
                <i class="el-icon-more"></i>
                <span class="text">更多</span>
              </div>
              <div class="outType">
                <div class="option">
                  <i class="el-icon-picture-outline"></i>
                  <span class="text">选项1</span>
                </div>
                <div class="option">
                  <i class="el-icon-camera"></i>
                  <span class="text">选项2</span>
                </div>
              </div>
            </el-popover> -->
          </div>

          <dir class="rightPart">
            <div class="item return" @click="returnToCenter">
              <i class="el-icon-s-promotion"></i>
              <span class="text">返回主界面</span>
            </div>

            <div class="item view">
              <i class="el-icon-data-analysis"></i>
              <span class="text">预览绘板</span>
            </div>
          </dir>
        </div>

        <!-- 【2】左侧工具栏 -->
        <div class="EditLeftBar" slot="w">
          <div class="barItem core" @click="createBIItem">
            <dir class="icon">
              <i class="el-icon-circle-plus-outline"></i>
            </dir>
            <dir class="text">BI控件</dir>
          </div>
          <div class="dividLine"></div>
          <!-- <el-popover
            class="popover addItemBtn"
            @show="leftBarPopShow"
            ref="popover"
            placement="right-start"
            trigger="click"
          >
            <div slot="reference" class="barItem">
              <dir class="icon">
                <i class="el-icon-circle-plus-outline"></i>
              </dir>
              <dir class="text">子控件</dir>
            </div>

            <el-table :data="addTable" @row-click="handleAddTip">
              <el-table-column
                v-for="col in addTableColumns"
                :key="col.prop"
                v-bind="col"
              ></el-table-column>
            </el-table>
          </el-popover> -->
          <!-- ~ 3 关联表控件 -->
          <div class="barItem" @click="createDetail">
            <dir class="icon">
              <i class="el-icon-office-building"></i>
            </dir>
            <dir class="text">关联控件</dir>
          </div>
          <!-- ~ 2 过滤控件 -->
          <el-popover
            class="popover conditionAddBar"
            @show="leftBarPopShow"
            ref="popover"
            placement="right-start"
          >
            <div class="barItem" slot="reference">
              <dir class="icon">
                <i class="el-icon-cold-drink"></i>
              </dir>
              <dir class="text">过滤组件</dir>
            </div>
            <div class="conditionAddPop">
              <template v-for="(section, j) in conditionCmps">
                <div
                  class="conditionSection"
                  v-if="section.items.length"
                  :key="section.key"
                >
                  <div class="sectionTitle">{{ section.name }}</div>
                  <div class="sectionTags">
                    <template v-for="(condition, i) in section.items">
                      <el-button
                        plain
                        :type="['primary', 'success', 'info'][j % 3]"
                        :key="i"
                        class="oneCondition"
                        :icon="'bi ' + condition.icon"
                        @click="conditionAddFn(condition)"
                      >
                        {{ condition.text }}
                      </el-button>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </el-popover>
        </div>

        <!-- 【1】中间部分 绘板 -->
        <div class="EditCenter" slot="c">
          <Scrollbar
            class="EditCenter-scorll"
            style="width: 100%; height: 100%"
          >
            <div
              v-loading="loadRoot"
              :style="{
                width: rootWidth,
                height: rootHeight,
                position: 'relative'
              }"
              class="EditCenter-inner"
            >
              <Bubble
                v-if="nowBoardRoot"
                :Entity="nowBoardRoot"
                :isRoot="true"
                :nowBoard="nowBoard"
                :EditNode="me"
              ></Bubble>
            </div>
          </Scrollbar>
        </div>
      </RectLayoutV2>

      <!-- ~ 3 各子控件编辑全页 fix全局 -->
      <transition name="PageMove">
        <ItemEdit
          ref="itemEdit"
          v-show="itemEditPage"
          :addInstances="addInstances"
          :EditNode="me"
          :nowBoard="nowBoard"
          :linkDatas="linkDatas"
          :isShow="itemEditPage"
        ></ItemEdit>
      </transition>
    </template>
  </div>
</template>

<script>
import "@designBI/assets/theme/edit.scss";

import Vue from "vue";
import DesignItemInstance from "@designBI/store/Entity/DesignItemInstance";
import DrawingBoard from "@designBI/store/Entity/DrawingBoard";

//@@ 1 多个新增器
import dataSelector from "@designBI/views/component/dealBI/dataSelector.vue";
import propertySelector from "@designBI/views/component/dealBI/propertySelector.vue";
import detailSelector from "@designBI/views/component/dealBI/detailSelector.vue";

import tool from "@/plugins/js/tool";
import $ from "jquery";
import loader from "@/plugins/js/loader";
import "@designBI/edit.js";
//~ ++ 1 全页面fixed
import ItemEdit from "./edit/ItemEdit";
import { Xbase } from "@designBI/views/mixins/X";

//~ ++ 2 过滤组件
const conditionCmps = [
  //# 0 总按钮
  {
    key: "btn",
    name: "全局按钮",
    items: [
      {
        xtype: "",
        text: "查询按钮",
        icon: "bi-search-btn"
      },
      {
        xtype: "",
        text: "重置按钮",
        icon: "bi-re-btn"
      }
    ].filter(a => {
      return a.xtype;
    })
  },
  //# 1 数值
  {
    key: "number",
    name: "数值过滤组件",
    items: [
      {
        xtype: "cond-number-divid",
        text: "数值区间",
        icon: "bi-num-divid"
      },
      {
        xtype: "",
        text: "数值下拉",
        icon: "bi-num-down"
      },
      {
        xtype: "",
        text: "区间滑块",
        icon: "bi-num-range"
      }
    ].filter(a => {
      return a.xtype;
    })
  },
  //# 2 文本
  {
    key: "text",
    name: "文本过滤组件",
    items: [
      {
        xtype: "",
        text: "文本下拉",
        icon: "bi-text-down"
      },
      {
        xtype: "",
        text: "文本列表",
        icon: "bi-text-list"
      }
    ].filter(a => {
      return a.xtype;
    })
  },
  //# 3 时间
  {
    key: "date",
    name: "时间过滤组件",
    items: [
      {
        xtype: "",
        text: "年份",
        icon: "bi-year"
      },
      {
        xtype: "",
        text: "年月",
        icon: "bi-month"
      },
      {
        xtype: "",
        text: "年季度",
        icon: "bi-year90"
      },
      {
        xtype: "",
        text: "日期",
        icon: "bi-day"
      },
      {
        xtype: "",
        text: "日期面板",
        icon: "bi-calendar"
      },
      {
        xtype: "",
        text: "日期区间",
        icon: "bi-day-range"
      },
      {
        xtype: "",
        text: "年月区间",
        icon: "bi-yearday-range"
      }
    ].filter(a => {
      return a.xtype;
    })
  }
];

export default {
  name: "DesignEdit",
  mixins: [Xbase],
  components: {
    ItemEdit
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
      //# 4 所选record，
      //【update】目前只涉及到关联变化
      selectMap: {},

      itemEditPage: false,
      addInstances: []
    };
  },
  computed: {
    me() {
      return this;
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
      let me = this,
        templateCode = me.nowTemplateCode,
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

    getNowInstances_v2(doLoop = false) {
      let me = this,
        templateCode = me.nowTemplateCode;
      //# 1 第一次就新增一个
      me.$store.dispatch("getInstancesFn", { templateCode }).then(theItems => {
        console.log(["数据库获取一次！检查数量！", theItems]);
        if (!theItems.length) {
          let rootIns = new DesignItemInstance({
            ...me.nowBoard.getData("rootInstance").$context,
            xtype: "CellBubble"
          });
          //# 2 保存和添加到map，然后重新获取
          rootIns.save();
          //【update】
          // .then(() => {
          //   if (!doLoop) {
          //     //# 3 重新获取一次
          //     me.getNowInstances(true);
          //   }
          // });
        }
        me.nowInstances = theItems;
      });
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
        me.$msgbox({
          title: "添加BI组件--选择数据源",
          message: h(dataSelector, {
            key: tool.uniqueStr()
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
                  name: "未命名子控件" + (me.addInstances.length + 1)
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
                    me.$message.error("添加失败！请检查服务器运行状态");
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
        }).catch(() => {});
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
        name: "未命名过滤控件" + (me.addInstances.length + 1)
      });

      return new Promise(res => {
        me.$msgbox({
          title: "添加过滤组件",
          message: h(propertySelector, {
            key: tool.uniqueStr(),
            props: {
              xtype: condition.xtype,
              newCondition: true,
              Entity: readyIns
            }
          }),
          closeOnClickModal: true,
          showCancelButton: true,
          customClass: "newCondition",
          beforeClose(action, ins, done) {
            if (action === "confirm") {
              let selector = ins.down("propertySelector");

              //console.log(["这个ins 的 form？", ins, selector]);
              if (selector.selProps.length) {
                readyIns.setData({
                  propsData: {
                    properties: selector.selProps.map(a => {
                      let b = tool.apply({}, a);
                      delete b.parentCoating;
                      return b;
                    })
                  }
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
                    me.$message.error("添加失败！请检查服务器运行状态");
                    res(false);
                  });
              } else {
                //# 2 提示未选中
                me.$message.warning("请选择至少一个字段！");
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
    //~ 4 关联控件增加
    createDetail() {
      let me = this,
        h = me.$createElement;
      console.log(["关联控件增加"]);
      //@@ 1 可能加入的 ins
      let readyIns = new DesignItemInstance({
        xtype: "BIBase",
        templateCode: me.nowTemplateCode,
        useType: 11, //30表示关联控件
        chartType: "table-mingxi",
        name: "未命名关联控件" + (me.addInstances.length + 1)
      });

      return new Promise(res => {
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
                  me.$message.error("添加失败！请检查服务器运行状态");
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
        }).catch(() => {});
      });
    },
    returnToCenter() {
      let me = this;
      me.$router.push({ name: "DesignCenter" });
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
  }
  // mounted() {
  //   let me = this;
  //   me.getNowInstances();
  // }
};
</script>
