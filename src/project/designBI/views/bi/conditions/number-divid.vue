<template>
  <div class="cond-base cond-number-divid">
    <div class="cond-title">数值区间</div>
    <div class="cond-body" @mousedown.stop>
      <el-input v-model="leftValue" placeholder="无限制"></el-input>
      <el-select :class="leftType" v-model="leftType">
        <el-option
          v-for="op in leftTypes"
          :key="op.type"
          :label="op.name"
          :value="op.type"
        >
          <span class="text"
            ><span :class="'bi ' + op.icon"></span>{{ `（${op.name}）` }}</span
          >
        </el-option>
      </el-select>
      <span class="midValue">值</span>
      <el-select :class="rightType" v-model="rightType">
        <el-option
          v-for="op in rightTypes"
          :key="op.type"
          :label="op.name"
          :value="op.type"
        >
          <span class="text"
            ><span :class="'bi ' + op.icon"></span>{{ `（${op.name}）` }}</span
          >
        </el-option>
      </el-select>
      <el-input v-model="rightValue" placeholder="无限制"></el-input>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import Vue from "vue";
import mixin from "./mixin";
//@@ 1 实际上是反起来的
const less = [
  {
    type: "gt",
    icon: "bi-lt",
    name: "小于"
  },
  {
    type: "gteq",
    icon: "bi-lteq",
    name: "小于等于"
  }
];
const greater = [
  {
    type: "lt",
    icon: "bi-gt",
    name: "大于"
  },
  {
    type: "lteq",
    icon: "bi-gteq",
    name: "大于等于"
  }
];
export default {
  name: "cond-number-divid",
  mixins: [mixin],
  // props: {
  //   numberOptions: Object
  // },
  data() {
    return {
      leftType: null,
      rightType: null,
      leftValue: null,
      rightValue: null
    };
  },
  computed: {
    leftTypes() {
      return less;
    },
    rightTypes() {
      return greater;
    },
    conditionResult() {
      let me = this,
        conds = [];
      conds.push({
        $id: me.condId + "_1",
        type: me.leftType,
        value: me.leftValue
      });
      conds.push({
        $id: me.condId + "_2",
        type: me.rightType,
        value: me.rightValue
      });
      return conds;
    }
  },
  methods: {
    conditionResultValueTest(val, cond) {
      return tool.isNumber(parseFloat(val));
    }
  }
  // created() {
  //   let me = this,
  //     ops = me.numberOptions || {};
  //   me.leftType = ops.leftType || less[0].type;
  //   me.rightType = ops.rightType || greater[0].type;
  //   me.leftValue = ops.leftValue || null;
  //   me.rightValue = ops.rightValue || null;
  // }
};
</script>
