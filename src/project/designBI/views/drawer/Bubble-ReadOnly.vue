<template>
  <DragResizeMouse
    ref="dragNode"
    :parent="true"
    :resizeByHand="true"
    :w="isRoot && percentMode ? '100%' : recordData.style.width"
    :h="recordData.style.height"
    :x="isRoot ? 0 : recordData.style.left || 0"
    :y="isRoot ? 0 : recordData.style.top || 0"
    :z="isRoot ? 0 : recordData.style.zIndex || 0"
    :widthMode="percentMode ? 'per' : ''"
    :leftMode="percentMode ? 'per' : ''"
    :dragFlag="recordData.drag_resize_cfg.can_drag"
    :draggable="false"
    :resizable="false"
    :canDragTo="false"
    :dropable="false"
    :dropFlag="recordData.drag_resize_cfg.can_drop"
    :resizeMask="true"
    class="BubbleDragResize"
    :class="{ ...recordData.class, isRoot, isHover, isSelect }"
    @mouseover.native.stop="mouseoverFn"
    @mouseleave.native="mouseleaveFn"
    @mousedown.native.stop="mousedownFn"
    :mouseDownStop="false"
    @transitionend.native.self="transitionEndFn"
  >
    <div
      ref="host"
      class="hostWrap"
      :class="{ isRoot }"
      :is="xtype"
      v-bind="propsData"
    ></div>

    <div
      v-if="!isRoot"
      v-show="isSelect"
      class="attachTool"
      @mousedown.stop
      @touchstart.stop
    >
      <div class="toolLayer">
        <el-button
          v-if="_joinTables && _joinTables.length"
          :type="limitedByJoin ? 'success' : 'info'"
          title="清除联动项"
          :icon="limitedByJoin ? 'el-icon-paperclip' : 'el-icon-link'"
          size="mini"
          @click="clearJoinLimits"
        ></el-button>
      </div>
    </div>

    <div
      v-if="!isRoot"
      v-show="isSelect || isHover"
      class="attachBorder"
      @mousemove.stop="dragResizeMouseMove($event)"
      @mousedown.stop.prevent="dragResizeMouseDown($event)"
      @touchstart.stop.prevent="dragResizeTouchDown($event)"
    >
      <!-- 线 -->
      <div class="line line-left"></div>
      <div class="line line-top"></div>
      <div class="line line-right"></div>
      <div class="line line-bottom"></div>
      <!-- 点 -->
      <div class="dot dot-left"></div>
      <div class="dot dot-top"></div>
      <div class="dot dot-right"></div>
      <div class="dot dot-bottom"></div>
      <div class="dot dot-lt"></div>
      <div class="dot dot-rt"></div>
      <div class="dot dot-lb"></div>
      <div class="dot dot-rb"></div>
    </div>
  </DragResizeMouse>
</template>

<script>
import Bubble from "./Bubble";
//像一个泡泡一样，可以到处移动，也可以拖拽等
export default {
  name: "Bubble-ReadOnly",
  extends: Bubble
};
</script>
