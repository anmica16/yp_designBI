<template>
  <div class="cond-base cond-text-search">
    <div class="cond-title">文本搜索</div>
    <div class="cond-body" @mousedown.stop v-loading="infoPropsLoading">
      <el-input
        clearable
        placeholder="请输入搜索内容"
        prefix-icon="el-icon-search"
        v-model="queryStr"
      >
      </el-input>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import mixin from "./mixin";
export default {
  name: "cond-text-search",
  mixins: [mixin],
  data() {
    return {
      cmpType: "like",

      queryStr: ""
    };
  },
  computed: {
    conditionResult() {
      let me = this,
        conds = [];
      if (me.queryStr) {
        conds.push({
          $id: me.condId,
          type: me.cmpType,
          value: `'%${me.queryStr}%'`
        });
      }
      return conds;
    },
    singleValue() {
      return this.queryStr;
    }
  },
  methods: {
    conditionResultValueTest(val, cond) {
      return true;
    }
  }
};
</script>
