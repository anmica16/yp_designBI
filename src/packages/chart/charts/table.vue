<template>
  <div class="chart-table">
    <el-table
      row-key="$id"
      :tree-props="{ children: 'items' }"
      :data="treeData"
    >
      <template v-for="col in totDims">
        <el-table-column :key="col.$id" :prop="col.realKey" :label="col.key">
        </el-table-column>
      </template>
    </el-table>
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
