<template>
  <div class="DimTable">
    <el-table
      :data="pageData"
      style="width: 100%"
      height="calc(100% - 36px)"
      border
    >
      <template v-for="(dim, i) in dimension">
        <el-table-column
          :key="dim.key"
          :label="dim.key"
          :prop="dim.key"
          :index="i"
          :width="dim.type === 'date' ? '200' : ''"
        >
          <template slot="header">
            <DimTypeTag :type="dimension[i].type" :name="dimension[i].key">
            </DimTypeTag>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <Pager ref="pager" :total="data.length" :page-size="pageSize"></Pager>
  </div>
</template>

<script>
//v1：剔除多余mixin，做纯粹展示，简单传入数据
export default {
  name: "DimTable",
  props: {
    data: {
      type: Array,
      required: true
    },
    dimension: {
      type: Array,
      required: true
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },
  computed: {
    pageData() {
      let me = this,
        datas = me.data,
        pager = me.$refs.pager;
      if (pager) {
        return datas.slice(pager.start, pager.end);
      } else {
        return datas;
      }
    }
  }
};
</script>
