<template>
  <div class="dataSelector">
    <div class="leftTree">
      <IndexTree
        ref="tree"
        class="dataTree"
        :records="records"
        valid="exist"
        @node-click="nodeClickFn"
      >
      </IndexTree>
    </div>
    <div class="rightTable" v-loading="DetailDataLoading">
      <template v-if="!nowFileRec">
        <div class="fileNotSelectTip">
          <div class="back"></div>
          <div class="text">请从左侧选择表</div>
        </div>
      </template>
      <!-- ~ 4 先写在这里 再独立 -->
      <template v-else-if="DetailData">
        <div class="tableSelector">
          <div class="selectInfo" v-if="DetailData">
            <span class="type" :class="sourceType">{{ sourceType }}</span>
            <span class="tableName">{{ sourceTableName }}</span>
          </div>
          <div class="selectBody">
            <DimTable
              height="100%"
              ref="resultTable"
              :data="DetailData.dataTable"
              :dimension="totDims"
            ></DimTable>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import dataSelectorMixin from "./dataSelectorMixin";
//import SimpleCheckData from "../../Page/UserPage/DesignCenter/newData/SimpleCheckData";
export default {
  name: "dataSelector",
  // components: {
  //   SimpleCheckData
  // },
  mixins: [dataSelectorMixin],
  props: {
    Instance: Object
  },
  data() {
    return {
      queryFlag: "dataSelector"
    };
  },
  computed: {
    dimension() {
      if (this.DetailData && this.DetailData.dimension) {
        return tool.parse(this.DetailData.dimension);
      } else {
        return [];
      }
    },
    totDims() {
      let me = this,
        tot = me.dimension.map(d => {
          let fd = tool.apply({}, d, {
            formatter: row => {
              //这里温和点，只有key
              let val = row[d.key];
              if (d.type === "number") {
                return tool.fmtNumber(val);
              } else {
                return val;
              }
            }
          });
          return fd;
        });
      return tot;
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
  created() {
    let me = this,
      ins = me.Instance;
    if (me.isLoadByHand) {
      me.refreshRecords().then(result => {
        let rec = me.records.find(r => {
          return r.id == ins.instanceVue.dataId;
        });
        me.nodeClickFn(rec);
      });
    }
  }
};
</script>

<style lang="scss">
.tableSelector {
  height: 100%;
  $h: 28px;
  $color: #3b94e7;
  $color1: #fad075;
  $color2: #f8423c;
  $color3: #3ac02e;
  $color4: #18406e;
  $color5: #a83be7;
  .selectInfo {
    height: $h;
    padding-left: 8px;
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
  > .selectBody {
    height: calc(100% - #{$h});
  }
}
</style>
