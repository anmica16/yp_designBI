<template>
  <div class="dataPropCoat" :class="'step' + step">
    <div class="selectInfo" v-if="DetailData">
      <span class="type" :class="sourceType">{{ sourceType }}</span>
      <span class="tableName">{{ sourceTableName }}</span>
    </div>
    <div class="theSelectArea">
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
            <el-button size="mini" type="primary" @click="step2Fn(true)"
              >确认</el-button
            >
            <el-button size="mini" @click="step2Fn(false)">取消</el-button>
          </div>
        </div>
      </transition>
      <!-- ~ 3 尾端拖拽列表 -->
      <transition name="PageMove">
        <div class="dimList" v-show="step === 3">
          <div class="reSelect">
            <el-button type="primary" size="mini" @click="reStep"
              >重新选择</el-button
            >
            <el-button type="success" size="mini" @click="step = 2"
              >查看数据</el-button
            >
          </div>
          <div class="theDims">
            <Scrollbar>
              <!-- 【update】拖拽 -->
              <CandyDimTag
                class="edit"
                v-for="dim in fDataIdDims"
                :key="dim.key"
                :Dim="dim"
                :candyMaster="candyMaster"
              ></CandyDimTag>
            </Scrollbar>
          </div>
        </div>
      </transition>
    </div>
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
    },
    //%% 1 较为不方便的加入类别，貌似也只有明细这里会用到，所以无所谓了
    dimClass: {
      type: String
    },
    preText: {
      type: String
    },
    //%% 2 过滤器
    dimListFilter: Function
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
            dataId: me.DetailData.id,
            dimClass: me.dimClass,
            preText: me.preText
          };
        });
      }
      return result;
    },
    fDataIdDims() {
      let me = this;
      if (tool.isFunction(me.dimListFilter)) {
        return me.dimListFilter(me.dataIdDims);
      } else {
        return me.dataIdDims;
      }
    },
    //+ 1 类型提示
    sourceType() {
      let me = this,
        d = me.DetailData,
        r = "";
      if (d) {
        r = d.dataType == "sql" ? d.dataType : d.fileType || d.dataType;
      }
      return r;
    },
    sourceTableName() {
      let me = this,
        d = me.DetailData,
        r = "",
        type = me.sourceType;
      if (d) {
        if (type == "sql") {
          r = `[${d.sourceName}].[${d.dataBaseName}].dbo.[${d.tableName}]`;
        } else {
          r = d.fileName;
        }
      }
      return r;
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

<style lang="scss">
.dataPropCoat {
  $h: 26px;
  $color: #3b94e7;
  $color1: #fad075;
  $color2: #f8423c;
  $color3: #3ac02e;
  $color4: #18406e;
  $color5: #a83be7;
  .selectInfo {
    height: $h;
    padding: 0 0 0 8px;
    font-size: 14px;
    .type {
      display: inline-block;
      padding: 2px 6px;
      font-size: 12px;
      color: white;
      background: $color3;
      border-radius: 50px;
      &.sql {
        background: $color4;
      }
    }
    .tableName {
      margin-left: 4px;
    }
  }
  .theSelectArea {
    height: calc(100% - #{$h});
    > * {
      height: 100%;
    }
  }
}
</style>
