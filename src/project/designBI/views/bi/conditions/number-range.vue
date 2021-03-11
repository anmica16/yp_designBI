<template>
  <div class="cond-base cond-number-range">
    <div class="cond-title">区间滑块</div>
    <div class="cond-body" @mousedown.stop v-loading="infoPropsLoading">
      <div class="rangeTip">
        <span class="num">{{ selRange.length && selRange[0] }}</span>
        <span class="fill"></span>
        <span class="num">{{ selRange.length && selRange[1] }}</span>
      </div>
      <el-slider
        v-model="selRange"
        ref="range"
        range
        :min="min"
        :max="max"
        :step="step"
      ></el-slider>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import mixin from "./mixin";
export default {
  name: "cond-number-range",
  mixins: [mixin],
  data() {
    return {
      leftType: "gteq",
      rightType: "lteq",

      range: null,

      selRange: [0, 100]
    };
  },
  computed: {
    itype() {
      return "min_max";
    },
    nInfoProps() {
      let me = this,
        r = [];
      tool.each(me.infoProps, p => {
        let cp = {
          min: parseFloat(p.min),
          max: parseFloat(p.max)
        };
        r.push(cp);
      });

      return r;
    },
    //加载时获取
    min() {
      let me = this,
        props = me.nInfoProps.slice();
      if (props.length) {
        props.sort((a, b) => {
          return a.min - b.min;
        });
        return props[0].min;
      } else {
        return 0;
      }
    },
    max() {
      let me = this,
        props = me.nInfoProps.slice();
      if (props.length) {
        props.sort((a, b) => {
          return b.max - a.max;
        });
        return props[0].max;
      } else {
        return 100;
      }
    },
    step() {
      let me = this,
        stepNum = (me.max - me.min) / 100;
      return stepNum;
    },
    conditionResult() {
      let me = this,
        conds = [];
      if (me.selRange.length) {
        conds.push({
          $id: me.condId + "_1",
          type: me.leftType,
          value: me.selRange[0]
        });
        conds.push({
          $id: me.condId + "_2",
          type: me.rightType,
          value: me.selRange[1]
        });
      }
      return conds;
    }
  },
  methods: {
    conditionResultValueTest(val, cond) {
      return tool.isNumber(parseFloat(val));
    }
  },
  created() {
    let me = this;
    me.getInfoProps().then(r => {
      me.$nextTick(() => {
        me.selRange = [me.min, me.max];
      });
    });
  },
  mounted() {
    let me = this;
    me.range = me.$refs.range;
  }
};
</script>
