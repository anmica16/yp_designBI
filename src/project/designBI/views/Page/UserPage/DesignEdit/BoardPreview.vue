<template>
  <div class="BoardView BoardPreview">
    <div class="BoardView-inner">
      <div class="titleArea">
        <div class="item back" @click="goBackEdit">
          <i class="bi bi-board"></i>
          <span class="text">返回仪表盘</span>
        </div>
      </div>

      <div class="boardArea">
        <BubbleReadOnly
          ref="bubble"
          v-if="nowBoardRoot"
          :Entity="nowBoardRoot"
          :isRoot="true"
          :nowBoard="nowBoard"
          :EditNode="me"
        ></BubbleReadOnly>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import loader from "@/plugins/js/loader";
import tool from "@/plugins/js/tool";
import DesignEditMixin from "./DesignEditMixin.js";

export default {
  name: "BoardPreview",
  mixins: [DesignEditMixin],
  props: {
    theTempCode: {
      type: String,
      required: true
    },
    originEdit: {
      type: Object,
      required: true
    }
  },
  computed: {
    isReadonly() {
      return true;
    },
    nowTemplateCode() {
      let me = this;
      return me.theTempCode;
    }
  },
  methods: {
    //# 1 返回
    goBackEdit() {
      let me = this;
      me.originEdit.goBackEdit();
    },
    //# 2 大小适配
    checkParentSize() {
      let me = this;
      me.$refs.bubble.checkParentSize();
      let cellBubble = me.down("CellBubble");
      if (cellBubble) {
        cellBubble.mCheckResize();
      }
    },
    //# 3 数据刷新
    refreshData() {
      let me = this;
      me.$refs.bubble.refreshData();
    }
  }
};
</script>
