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
        <el-table border :data="itemList" @row-click="itemSelectFn">
          <el-table-column label="控件名">
            <span class="infoWrap chartTitle" slot="default" slot-scope="scope">
              <i class="icon" :class="getSelectType(scope.row.chartType)"></i>
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
      <div class="boardSelectArea" v-show="selItem"></div>
    </div>
  </div>
</template>

<script>
import { theStore, selectTypes, getSelectType } from "@designBI/store";
import boardChoose from "./public/boardChoose";
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
      selDims: []
    };
  },
  computed: {
    dimList() {
      return [];
    },
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
    }
  }
};
</script>
