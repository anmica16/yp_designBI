<template>
  <div class="cond-base cond-number-divid">
    <div class="cond-title">数值区间</div>
    <div class="cond-body">
      <el-input v-model="leftValue" placeholder="无限制"></el-input>
      <el-select :class="leftType" v-model="leftType">
        <el-option v-for="op in leftTypes" :key="op.type" :value="op.type">
          <span class="text"
            ><span :class="'bi ' + op.icon"></span>{{ `（${op.name}）` }}</span
          >
        </el-option>
      </el-select>
      <span class="midValue">值</span>
      <el-select :class="rightType" v-model="rightType">
        <el-option v-for="op in rightTypes" :key="op.type" :value="op.type">
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
const less = [
  {
    type: "lt",
    icon: "bi-lt",
    name: "小于"
  },
  {
    type: "lteq",
    icon: "bi-lteq",
    name: "小于等于"
  }
];
const greater = [
  {
    type: "gt",
    icon: "bi-gt",
    name: "大于"
  },
  {
    type: "gteq",
    icon: "bi-gteq",
    name: "大于等于"
  }
];
export default {
  name: "cond-number-divid",
  mixins: [mixin],
  props: {
    numberOptions: Object
  },
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
      if (tool.isNumber(parseFloat(me.leftValue))) {
        conds.push({
          $id: me.condId + "_1",
          type: me.leftType,
          value: me.leftValue
        });
      }
      if (tool.isNumber(parseFloat(me.rightValue))) {
        conds.push({
          $id: me.condId + "_2",
          type: me.rightType,
          value: me.rightValue
        });
      }
      return conds;
    }
  },
  watch: {
    conditionResult(conds) {
      let me = this,
        props = me.properties,
        edit = me.EditNode;
      if (conds && conds.length && props.length && edit) {
        props.forEach(prop => {
          let dataId = prop.dataId,
            propName = prop.key;
          if (!tool.isArray(edit.conditionMap[dataId])) {
            Vue.set(edit.conditionMap, dataId, []);
          }
          //# 1 找准对应dataid的范畴
          let mapA = edit.conditionMap[dataId];
          //# 2 合适的cond形状
          let theConds = conds.map(cond => {
            return {
              ...cond,
              property: propName
            };
          });
          //# 3 再比较、合并、插入
          theConds.forEach(cond => {
            let findAt = mapA.findIndex(a => {
              return a.$id === cond.$id && a.property === cond.property;
            });
            if (findAt > -1) {
              mapA[findAt] = cond;
            } else {
              mapA.push(cond);
            }
          });
        });
      }
      //# 2 同时改变ins的 值
      me.Instance.setData({
        propsData: {
          numberOptions: {
            leftType: me.leftType,
            rightType: me.rightType,
            leftValue: me.leftValue,
            rightValue: me.rightValue
          }
        }
      });
      if (!me.newCondition) {
        me.Instance.save();
      }
    }
  },
  created() {
    let me = this,
      ops = me.numberOptions || {};
    me.leftType = ops.leftType || less[0].type;
    me.rightType = ops.rightType || greater[0].type;
    me.leftValue = ops.leftValue || null;
    me.rightValue = ops.rightValue || null;
  }
};
</script>
