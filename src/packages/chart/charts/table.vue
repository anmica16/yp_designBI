<template>
  <div class="chart-table">
    <el-table
      height="100%"
      v-if="hasDimension"
      row-key="$id"
      :expand-row-keys="['1']"
      :tree-props="{ children: 'items' }"
      :data="treeData"
      border
    >
      <template v-for="col in totDims">
        <el-table-column :key="col.$id" :prop="col.realKey" :label="col.key">
        </el-table-column>
      </template>
    </el-table>

    <div v-else class="noDimensionTip">
      <div class="back"></div>
      <div class="text">请先进入修改界面添加维度指标</div>
    </div>
  </div>
</template>

<script>
import chartBase from "../chartBase";
export default {
  name: "chart-table",
  mixins: [chartBase],
  //【update】暂时等待sql模式建立
  data() {
    return {
      type: "treeTable"
    };
  },
  computed: {
    totDims() {
      let me = this;
      return me.Dims.concat(me.Indices);
    },
    treeData() {
      let me = this;
      if (me.requestData) {
        return me.requestData.treeData;
      } else {
        return [];
      }
    }
  }
};
</script>
