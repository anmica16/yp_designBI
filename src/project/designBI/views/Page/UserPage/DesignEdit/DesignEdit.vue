<template>
  <div class="DesignEdit" style="width: 100%; height: 100%">
    <div v-if="!nowBoard">
      您访问了一个不存在的绘板！请<router-link :to="{ name: 'DesignCenter' }"
        >返回</router-link
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
            <el-popover
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
            </el-popover>
          </div>
          <dir class="rightPart">
            <div class="item view">
              <i class="el-icon-data-analysis"></i>
              <span class="text">预览绘板</span>
            </div>
          </dir>
        </div>

        <!-- 【2】左侧工具栏 -->
        <div class="EditLeftBar" slot="w">
          <el-popover
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
          </el-popover>
          <el-popover
            class="popover treeBtn"
            @show="leftBarPopShow"
            ref="popover"
            placement="right-start"
          >
            <div class="barItem" slot="reference">
              <dir class="icon">
                <i class="el-icon-map-location"></i>
              </dir>
              <dir class="text">控件树</dir>
            </div>
            <div class="treeView">待扩展</div>
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
              ></Bubble>
            </div>
          </Scrollbar>
        </div>
      </RectLayoutV2>
    </template>
  </div>
</template>

<script>
import Vue from "vue";
import DesignItemInstance from "@designBI/store/Entity/DesignItemInstance";
import tool from "@/plugins/js/tool";
import $ from "jquery";
export default {
  name: "DesignEdit",
  data() {
    return {
      queryFlag: "DesignEdit",
      loadRoot: false,
      nowInstances: null,
      //activeName: "",
      //drawingBoards: [],
      //在router进行切换的时候 切换
      // nowBoard: null,
      // nowInstances: null,

      //# 1 百分比模式？
      percentMode: true
    };
  },
  computed: {
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
  watch: {
    //#3 手动触发 带动联动
    nowBoard(newBoard, oldBoard) {
      let me = this;
      //# 4 标题名改变
      $("title").html(`绘板：${newBoard.recordData.name}`);
      if (newBoard && newBoard != oldBoard) {
        me.nowInstances = me.getNowInstances();
      }
    }
  },
  // mounted() {
  //   let me = this;
  //   console.log(["$route.params", me.$route.params]);
  // },
  methods: {
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
    }
  },
  mounted() {
    let me = this;
    me.nowInstances = me.getNowInstances();
  }
};
</script>

<style lang="scss">
.EditCenter-inner {
  height: 100%;
  width: 100%;
}
</style>
