<template>
  <div class="DesignEdit" style="width: 100%; height: 100%">
    <div v-if="!nowBoard">
      您访问了一个不存在的绘板！请<router-link :to="{ name: 'DesignCenter' }"
        >返回</router-link
      >
    </div>
    <template v-else>
      <RectLayoutV2 ref="rect">
        <template #n>
          <theHeader></theHeader>
        </template>
        <template #w>
          <div class="leftBar">
            <el-popover ref="popover" placement="right-start" trigger="click">
              <el-button slot="reference">新增子控件</el-button>

              <el-table :data="addTable" @row-click="handleAddTip">
                <el-table-column
                  v-for="col in addTableColumns"
                  :key="col.prop"
                  v-bind="col"
                ></el-table-column>
              </el-table>
            </el-popover>
          </div>
        </template>
        <template #c>
          <div v-loading="loadRoot" class="editCenter">
            <Bubble
              v-if="nowBoardRoot"
              :Entity="nowBoardRoot"
              :isRoot="true"
            ></Bubble>
          </div>
          <!-- <Bubble></Bubble> -->
          <!-- <el-tabs ref="tabpanel" type="card" v-model="activeName">
          <el-tab-pane
            v-for="item in drawingBoards"
            :key="item.name"
            :label="item.label"
            :name="item.name"
            :closable="item.closable"
          >
            <DrawingBoard
              :is="item.xtype || 'el-tab-pane'"
              :config="item"
            ></DrawingBoard>
          </el-tab-pane>
        </el-tabs> -->
        </template>
        <template #e>
          <div>east</div>
        </template>
      </RectLayoutV2>
    </template>
  </div>
</template>

<script>
import Vue from "vue";
import theHeader from "./header";
import DesignItemInstance from "@designBI/store/Entity/DesignItemInstance";
import tool from "@/plugins/js/tool";
export default {
  name: "DesignEdit",
  components: {
    theHeader
  },
  data() {
    return {
      queryFlag: "DesignEdit",
      loadRoot: false,
      nowInstances: null
      //activeName: "",
      //drawingBoards: [],
      //在router进行切换的时候 切换
      // nowBoard: null,
      // nowInstances: null,
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
    addTable() {
      let me = this,
        items = Vue.$itemManager.items,
        data = [];
      tool.each(items, item => {
        let rec = tool.clone(item.recordData);
        let props = [];
        tool.each(rec.props, (key, val) => {
          //#1 一个prop的配置 必为对象
          if (tool.isObject(val)) {
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
    }
  },
  watch: {
    //#3 手动触发 带动联动
    nowBoard(newBoard) {
      let me = this;
      if (newBoard) {
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
        let rootIns = new DesignItemInstance({
          ...me.nowBoard.getData("rootInstance").$context,
          xtype: "BaseBubble"
          // propsData: {
          //   pro1: "custom pro1"
          // },
          // source: {
          //   slot1: "测试值1"
          // }
        });
        //# 2 保存和添加到map，然后重新获取
        me.refreshRoot(rootIns);
        //console.log(["尝试改变值", rootIns]);
        //items.push(rootIns);
      }

      return items;
    },
    refreshRoot(rootIns) {
      let me = this;
      //# 2 保存和添加到map，然后重新获取
      rootIns.save().then(() => {
        //#3 加入后刷新一下root引用
        me.nowBoard.refreshRecord();
        //me.$forceUpdate();
      });
    },
    handleAddTip(oneItem) {
      console.log(["点击提示，打开window进行细项添加", oneItem, arguments]);
    }
  },
  mounted() {
    let me = this;
    me.nowInstances = me.getNowInstances();
  }
};
</script>

<style lang="scss">
.editCenter {
  height: 100%;
  width: 100%;
}
</style>
