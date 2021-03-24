<template>
  <div class="cond-base cond-text-down">
    <div class="cond-title">文本下拉</div>
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
import numberD from "./number-down";
export default {
  name: "cond-text-down",
  extends: numberD,
  computed: {
    mSelVals() {
      let me = this,
        selVals = me.selVals;
      return selVals.map(v => {
        let tv = `'${v}'`;
        return tv;
      });
    },
    conditionResult() {
      let me = this,
        conds = [];
      if (me.mSelVals.length) {
        conds.push({
          $id: me.condId,
          type: me.cmpType,
          value: me.mSelVals.join(",")
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
  }
};
</script>
