<template>
  <div
    class="d-divid-line"
    :class="shape"
    :style="mapStyle"
    @mouseover="mouseoverHandler"
    @mousedown.stop.prevent="mousedownHandler"
  ></div>
</template>

<script>
import tool from "@/plugins/js/tool";
import $ from "jquery";

export default {
  name: "d-divid-line",
  props: {
    shape: {
      type: String,
      default: "vertical"
    },
    at: Array
  },
  data() {
    return {
      dragging: false,
      eventId: "",
      x_start: 0,
      y_start: 0,
      mapStyle: {}
    };
  },
  computed: {
    parent() {
      return this.up("d-cells-map");
    }
  },
  methods: {
    mousedownHandler(e) {
      let me = this;
      //console.log(["点击了！", arguments, me]);
      me.dragging = true;
      me.eventId = (Date.now() * Math.random()).toFixed(2);

      me.x_start = e.pageX;
      me.y_start = e.pageY;

      me.$emit("positionChangeBegin", me.shape, me.at);

      var mousemoveFn = tool.throttle(me.mousemoveHandler, 20);

      $("body").on("mousemove." + me.eventId, function(ev) {
        mousemoveFn.call(me, ev);
      });
      $("body").on("mouseup." + me.eventId, function(ev) {
        me.mouseupHandler(ev);
      });
    },
    mouseupHandler(e) {
      let me = this;
      me.dragging = false;
      $("body").off("mousemove." + me.eventId);
      $("body").off("mouseup." + me.eventId);
      me.$emit("positionChangeEnd");
    },
    mousemoveHandler(e) {
      let me = this,
        //正为往右，负为往左
        cgX = e.pageX - me.x_start,
        //正为往下，负为往上
        cgY = e.pageY - me.y_start;

      me.$emit("positionChange", cgX, cgY);
    },
    mouseoverHandler() {
      let me = this;
      me.$emit("dividHover", me, me.shape);
    }
  }
};
</script>
