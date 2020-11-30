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
            <el-button> </el-button>
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
import theHeader from "./header";
import DesignItemInstance from "@designBI/store/Entity/DesignItemInstance";
export default {
  name: "DesignEdit",
  components: {
    theHeader
  },
  data() {
    return {
      queryFlag: "DesignEdit",
      loadRoot: false,
      nowBoard: null,
      nowBoardRoot: null,
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
      console.log(["这个变化没", me, templateCode]);
      return templateCode;
    }
  },
  watch: {
    async nowTemplateCode(newVal) {
      let me = this;
      console.log(["监听成功没", me, newVal]);
      me.nowBoard = me.getNowBoard(newVal);
      me.nowInstances = await me.getNowInstances();
      me.nowBoardRoot = me.getNowBoardRoot();
    }
  },
  // mounted() {
  //   let me = this;
  //   console.log(["$route.params", me.$route.params]);
  // },
  methods: {
    getNowBoard(newVal) {
      let me = this,
        templateCode = newVal;
      return me.$store.getters.getBoard(templateCode);
    },
    getNowBoardRoot() {
      let me = this;
      if (!me.nowBoard) {
        return null;
      } else {
        return me.nowBoard.record.rootInstance;
      }
    },
    async getNowInstances() {
      let me = this,
        templateCode = me.nowTemplateCode,
        //不一定会反应过来
        items = me.$store.getters.getInstances(templateCode);
      console.log(["这里运行得？之前"]);
      //# 1 第一次就新增一个
      if (items && !items.length) {
        console.log(["这里运行得？"]);
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
        await me.refreshRoot(rootIns);
        console.log(["尝试改变值", me.nowBoardRoot, me.nowBoard, rootIns]);
        //items.push(rootIns);
      }

      return items;
    },
    async refreshRoot(rootIns) {
      let me = this;
      //# 2 保存和添加到map，然后重新获取
      return new Promise((res, rej) => {
        rootIns.save().then(() => {
          //#3 加入后刷新一下root引用
          me.nowBoard.refreshRecord();
          //me.$forceUpdate();
          res();
        });
      });
    }
  }
};
</script>

<style lang="scss">
.editCenter {
  height: 100%;
  width: 100%;
}
</style>
