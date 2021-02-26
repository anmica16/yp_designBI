<template>
  <div class="BoardInsPropSelector">
    <div class="TipArea">
      <span class="boardTip">
        <span class="el-icon-data-analysis"></span>
        <span class="text">{{ selBoard ? selBoard.name : "未选择" }}</span>
      </span>

      <span class="itemTip chartTitle" v-if="selItem">
        <span class="chartType" :class="{ join: selItem.joinDataIds }">{{
          selItem.joinDataIds ? "关联图表" : "图表"
        }}</span>
        <span class="chartName">{{ selItem.name }}</span>
      </span>
    </div>
    <!-- =1= 选择绘板的区域 -->
    <div class="selectArea">
      <div class="boardSelectArea" v-show="!selBoard">
        <boardChoose
          :prePIndex="prePIndex"
          @board-select="boardSelFn"
        ></boardChoose>
      </div>
      <!-- =2= 控件item -->
      <div class="itemSelectArea" v-show="selBoard && !selItem">
        <el-table
          border
          :data="itemList"
          @row-click="itemSelectFn"
          height="100%"
        >
          <el-table-column label="控件名">
            <span class="infoWrap chartTitle" slot="default" slot-scope="scope">
              <i
                class="icon bi"
                :class="getSelectType(scope.row.chartType).icon"
              ></i>
              <span
                class="chartType"
                :class="{ join: scope.row.joinDataIds }"
                >{{ scope.row.joinDataIds ? "关联图表" : "图表" }}</span
              >
              <span class="chartName">{{ scope.row.name }}</span>
            </span>
          </el-table-column>
        </el-table>
      </div>

      <!-- =3= 维度区域 -->
      <div class="dimSelectArea" v-show="selItem">
        <el-table border @row-click="dimSelectFn" height="100%" :data="dimList">
          <el-table-column type="selection"></el-table-column>
          <el-table-column label="控件名">
            <span class="infoWrap chartTitle" slot="default" slot-scope="scope">
              <DimTypeTag
                :type="scope.row.type"
                :name="scope.row.chineseName || scope.row.key"
              ></DimTypeTag>
            </span>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { theStore, selectTypes, getSelectType } from "@designBI/store";
import $ from "@/plugins/js/loader";
import boardChoose from "./public/boardChoose";
import Vue from "vue";
export default {
  name: "BoardInsPropSelector",
  components: {
    boardChoose
  },
  props: {
    prePIndex: String,
    preBoard: Object,
    preIns: Object
  },
  data() {
    return {
      selBoard: null,
      itemList: [],
      selItem: null,
      dimList: [],
      selDims: []
    };
  },
  computed: {
    selectTypes() {
      return selectTypes;
    }
  },
  methods: {
    boardSelFn(row) {
      let me = this;
      me.selBoard = row;
      theStore.dispatch("getInstancesFn", row.templateCode).then(items => {
        me.itemList = items.filter(a => {
          return a.useType != 2;
        });
      });
      //console.log(["点击row board", arguments]);
    },
    getSelectType(type) {
      return getSelectType(type);
    },
    itemSelectFn(row) {
      let me = this;
      me.selItem = row;
      //维度信息
      //=1= 检查 source有无，无则数据库
      let sourceDim = JSON.parse(row.source);
      if (sourceDim.Dims) {
        me.dimList = sourceDim.Dims;
      } else {
        $.ajax({
          url: Vue.Api.designBI,
          data: {
            method: Vue.Api.designBI.GetLinkData,
            id: row.linkDataId
          }
        }).then(result => {
          let data = result.data;
          if (data && data.length) {
            me.dimList = data[0].dimension;
          }
        });
      }
    },
    dimSelectFn(row) {
      let me = this;
      console.log(["选择了一个维度", row]);
    }
  }
};
</script>
