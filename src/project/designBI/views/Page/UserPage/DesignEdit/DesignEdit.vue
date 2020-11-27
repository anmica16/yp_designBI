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
          <Bubble
            v-for="item in nowInstances"
            :key="item.getData('instanceCode')"
            :Entity="item"
          ></Bubble>
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
      queryFlag: "DesignEdit"
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
    nowInstances() {
      let me = this,
        templateCode = me.nowTemplateCode,
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
        rootIns.save();
        //#3 加入后刷新一下root引用
        me.nowBoard.refreshRecord();
        console.log(["尝试改变值", rootIns]);
        //items.push(rootIns);
      }

      return items;
    }
  },
  mounted() {
    let me = this;
    console.log(["$route.params", me.$route.params]);
  }
};
</script>
