<template>
  <div class="dataPropCoat" :class="'step' + step">
    <!-- ~ 1 先dataId选择 -->
    <div v-show="step === 1" class="dataIdSelect">
      <IndexTree
        class="dataTree"
        :records="records"
        valid="exist"
        :disabled="disabled"
        @node-click="dataTreeNodeClick"
      >
      </IndexTree>
    </div>
    <!-- ~ 2 确认该table -->
    <transition name="Expand">
      <div v-show="step === 2" class="dataIdConfirm">
        <SimpleCheckData v-if="DetailData" :DetailData="DetailData">
        </SimpleCheckData>
        <div class="btns">
          <el-button @click="step2Fn(true)">确认</el-button>
          <el-button @click="step2Fn(false)">取消</el-button>
        </div>
      </div>
    </transition>
    <!-- ~ 3 尾端拖拽列表 -->
    <transition name="PageMove">
      <div class="dimList" v-show="step === 3">
        <div class="reSelect">
          <el-button @click="reStep">重新选择</el-button>
        </div>
        <div class="theDims">
          <Scrollbar>
            <!-- 【update】拖拽 -->
            <CandyDimTag
              class="edit"
              v-for="dim in dataIdDims"
              :key="dim.key"
              :Dim="dim"
              :candyMaster="candyMaster"
            ></CandyDimTag>
          </Scrollbar>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import SimpleCheckData from "@designBI/views/Page/UserPage/DesignCenter/newData/SimpleCheckData";
import CandyDimTag from "@designBI/views/component/dropCandy/CandyDimTag";
import tool from "@/plugins/js/tool";
import dataSelectorMixin from "../dataSelectorMixin";
//-- 3步选择维度
//1：选择dataId
//2：右侧扩展，查看表信息，等待确认
//3：右侧收缩，回到维度选择列表
export default {
  name: "dataPropCoat",
  mixins: [dataSelectorMixin],
  components: {
    CandyDimTag,
    SimpleCheckData
  },
  props: {
    candyMaster: {
      type: Object,
      required: true
    },
    disabled: {
      type: [String, Function],
      default: "disabled"
    }
  },
  data() {
    return {
      step: 1
    };
  },
  computed: {
    dataIdDims() {
      let me = this,
        result = [];
      if (me.DetailData && me.DetailData.dimension) {
        let dimStr = me.DetailData.dimension,
          dims = tool.isString(dimStr) ? JSON.parse(dimStr) : dimStr;
        result = dims.map(d => {
          return {
            ...d,
            dataId: me.DetailData.id
          };
        });
      }
      return result;
    }
  },
  methods: {
    dataTreeNodeClick(rec) {
      let me = this;
      if (rec.$disabled) {
        //【update】提示
        return;
      }
      if (!rec.isFolder) {
        me.getDetailData(rec).then(data => {
          if (data) {
            me.step = 2;
          }
        });
      }
    },
    step2Fn(ifPass) {
      let me = this;
      me.step = ifPass ? 3 : 1;
    },
    reStep() {
      this.step = 1;
    }
  },
  watch: {
    step(newVal, oldVal) {
      let me = this;
      if (newVal !== oldVal) {
        if (newVal === 3) {
          me.$emit("confirmData");
        }
      }
      if (newVal === 1) {
        me.DetailData = null;
        me.$emit("revokeData");
      }
    }
  }
};
</script>
