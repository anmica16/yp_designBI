<template>
  <div class="d-page-design-edit" style="width: 100%; height: 100%;">
    <RectLayoutV2 ref="rect">
      <template #n>
        <theHeader></theHeader>
      </template>
      <template #w>
        <div>west</div>
      </template>
      <template #c>
        <el-tabs ref="tabpanel" type="card" v-model="activeName">
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
        </el-tabs>
      </template>
      <template #e>
        <div>east</div>
      </template>
    </RectLayoutV2>
  </div>
</template>

<script>
import theHeader from "./header";
export default {
  name: "d-page-design-edit",
  components: {
    theHeader
  },
  data() {
    return {
      queryFlag: "DesignEdit",
      activeName: "",
      drawingBoards: []
    };
  }
};
</script>
