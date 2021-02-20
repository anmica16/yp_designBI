<template>
  <div class="DimTable">
    <el-table
      ref="table"
      :data="pageData"
      style="width: 100%"
      height="calc(100% - 36px)"
      :highlight-current-row="selMode == 'single' ? true : false"
      border
      @row-click="rowClickFn"
    >
      <template v-for="(dim, i) in dimension">
        <el-table-column
          :key="dim.key"
          :label="dim.chineseName || dim.key"
          :prop="dim.realKey || dim.key"
          :index="i"
          :width="dim.type === 'date' ? '200' : ''"
          sortable
          :formatter="dim.formatter ? dim.formatter : null"
        >
          <template slot="header">
            <DimTypeTag
              :type="dimension[i].type"
              :name="dim.chineseName || dimension[i].key"
              xtype="span"
              :preText="preText"
            >
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
    },
    //# 2 表配置
    rowClickFn: {
      type: Function,
      default() {
        return function() {};
      }
    },
    selMode: {
      type: String,
      default: "single"
    },
    //# 3 拖拽维度归属文本
    preText: {
      type: String
    }
  },
  data() {
    return {
      pager: null
    };
  },
  computed: {
    pageData() {
      let me = this,
        datas = me.data,
        pager = me.pager;
      if (pager) {
        return datas.slice(pager.start, pager.end);
      } else {
        return datas;
      }
    }
  },
  methods: {
    doLayout() {
      let me = this;
      me.$refs.table.doLayout();
    }
  },
  mounted() {
    let me = this;
    me.pager = me.$refs.pager;
  }
};
</script>

<style lang="scss">
.DimTable {
  height: 100%;
}
</style>
