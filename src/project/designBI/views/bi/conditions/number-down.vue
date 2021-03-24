<template>
  <div class="cond-base cond-number-down">
    <div class="cond-title">数值下拉</div>
    <div class="cond-body" @mousedown.stop v-loading="infoPropsLoading">
      <el-select ref="select" v-model="selVals" multiple placeholder="请选择">
        <el-option
          v-for="item in dataList"
          :key="item.value"
          :label="item.value"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import mixin from "./mixin";
export default {
  name: "cond-number-down",
  mixins: [mixin],
  data() {
    return {
      cmpType: "in",

      selVals: []
    };
  },
  computed: {
    itype() {
      return "distinct";
    },
    dataList() {
      let me = this;
      return (me.infoProps.length && me.infoProps[0].dataList) || [];
    },
    conditionResult() {
      let me = this,
        conds = [];
      if (me.selVals.length) {
        conds.push({
          $id: me.condId,
          type: me.cmpType,
          value: me.selVals.join(",")
        });
      }
      return conds;
    },
    singleValue() {
      return this.conditionResult
        .map(cond => {
          return cond.value;
        })
        .join("");
    }
  },
  methods: {
    conditionResultValueTest(val, cond) {
      return true;
    },
    assisBlurFn() {
      let me = this,
        select = me.$refs.select,
        popper = select.popperElm;
      me.assisBlurBase([select.$el, popper, select.blur]);
    }
  },
  created() {
    let me = this;
    me.getInfoProps();
  },
  mounted() {
    let me = this,
      select = me.$refs.select,
      dropdown = select.$refs.popper;
    dropdown.$on("created", me.assisBlurFn);
    dropdown.$on("destroyPopper", me.blurBase);
  }
};
</script>
