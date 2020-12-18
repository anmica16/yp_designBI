import $ from "jquery";
import tool from "@/plugins/js/tool";
import {
  matchesSelectorToParentElements,
  getComputedSize,
  addEvent,
  removeEvent
} from "../utils/dom";
import {
  computeWidth,
  computeHeight,
  restrictToBounds,
  snapToGrid
} from "../utils/fns";

const events = {
  mouse: {
    start: "mousedown",
    move: "mousemove",
    stop: "mouseup"
  },
  touch: {
    start: "touchstart",
    move: "touchmove",
    stop: "touchend"
  }
};

const userSelectNone = {
  userSelect: "none",
  MozUserSelect: "none",
  WebkitUserSelect: "none",
  MsUserSelect: "none"
};

const userSelectAuto = {
  userSelect: "auto",
  MozUserSelect: "auto",
  WebkitUserSelect: "auto",
  MsUserSelect: "auto"
};

let eventsFor = events.mouse;

export default {
  props: {
    className: {
      type: String,
      default: "vdr"
    },
    classNameDraggable: {
      type: String,
      default: "draggable"
    },
    classNameResizable: {
      type: String,
      default: "resizable"
    },
    classNameDragging: {
      type: String,
      default: "dragging"
    },
    classNameResizing: {
      type: String,
      default: "resizing"
    },
    classNameActive: {
      type: String,
      default: "active"
    },
    classNameHandle: {
      type: String,
      default: "handle"
    },
    disableUserSelect: {
      type: Boolean,
      default: true
    },
    enableNativeDrag: {
      type: Boolean,
      default: false
    },
    preventDeactivation: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: false
    },
    draggable: {
      type: Boolean,
      default: true
    },
    resizable: {
      type: Boolean,
      default: true
    },
    //++ 1 特殊resize模式，不改变当前定位大小，而反映到一个mask对象上，再由外部改变。
    resizeMask: {
      type: Boolean,
      default: false
    },
    dropable: {
      type: Boolean,
      default: true
    },
    canDragTo: {
      type: Boolean,
      default: true
    },
    dragFlag: {
      type: String,
      default: "defaultFlag"
    },
    dropFlag: {
      type: String,
      default: "defaultFlag"
    },
    lockAspectRatio: {
      type: Boolean,
      default: false
    },
    widthMode: {
      type: String,
      default: "",
      validator(val) {
        return ["num", "auto", "per", ""].indexOf(val) > -1;
      }
    },
    heightMode: {
      type: String,
      default: "",
      validator(val) {
        return ["num", "auto", "per", ""].indexOf(val) > -1;
      }
    },
    leftMode: {
      type: String,
      default: "",
      validator(val) {
        return ["num", "per", ""].indexOf(val) > -1;
      }
    },
    topMode: {
      type: String,
      default: "",
      validator(val) {
        return ["num", "per", ""].indexOf(val) > -1;
      }
    },
    w: {
      type: [Number, String],
      default: 200,
      validator: val => {
        if (typeof val === "number") {
          return val > 0;
        }

        return val === "auto" || (val.length && val[val.length - 1] === "%");
      }
    },
    h: {
      type: [Number, String],
      default: 200,
      validator: val => {
        if (typeof val === "number") {
          return val > 0;
        }

        return val === "auto" || (val.length && val[val.length - 1] === "%");
      }
    },
    minWidth: {
      type: Number,
      default: 0,
      validator: val => val >= 0
    },
    minHeight: {
      type: Number,
      default: 0,
      validator: val => val >= 0
    },
    maxWidth: {
      type: Number,
      default: null,
      validator: val => val >= 0
    },
    maxHeight: {
      type: Number,
      default: null,
      validator: val => val >= 0
    },
    x: {
      type: [Number, String],
      default: 0,
      validator: val => {
        if (typeof val === "number") {
          return true;
        }

        return val.length && val[val.length - 1] === "%";
      }
    },
    y: {
      type: [Number, String],
      default: 0,
      validator: val => {
        if (typeof val === "number") {
          return true;
        }

        return val.length && val[val.length - 1] === "%";
      }
    },
    z: {
      type: [String, Number],
      default: "auto",
      validator: val => (typeof val === "string" ? val === "auto" : val >= 0)
    },
    handles: {
      type: Array,
      default: () => ["tl", "tm", "tr", "mr", "br", "bm", "bl", "ml"],
      validator: val => {
        const s = new Set(["tl", "tm", "tr", "mr", "br", "bm", "bl", "ml"]);

        return new Set(val.filter(h => s.has(h))).size === val.length;
      }
    },
    dragHandle: {
      type: String,
      default: null
    },
    dragCancel: {
      type: String,
      default: null
    },
    isAbsolute: {
      type: Boolean,
      default: true
    },
    axis: {
      type: String,
      default: "both",
      validator: val => ["x", "y", "both"].includes(val)
    },
    grid: {
      type: Array,
      default: () => [1, 1]
    },
    parent: {
      type: Boolean,
      default: false
    },
    scale: {
      type: Number,
      default: 1,
      validator: val => val > 0
    },
    onDragStart: {
      type: Function,
      default: () => true
    },
    onDrag: {
      type: Function,
      default: () => true
    },
    onResizeStart: {
      type: Function,
      default: () => true
    },
    onResize: {
      type: Function,
      default: () => true
    },

    //section 2:
    borders: {
      type: Array,
      default: () => ["e", "s", "w", "n"],
      validator: val => {
        let borders = ["e", "s", "w", "n"],
          valid = true;
        val.forEach(p => {
          if (borders.indexOf(p) < 0) {
            valid = false;
            return false;
          }
        });
        return valid;
      }
    },
    borderResizeWidth: {
      type: Number,
      default: 10
    },
    throttleDiv: {
      type: Number,
      default: 1
    }
  },

  data: function() {
    return {
      left: this.x,
      top: this.y,
      //right: null,
      //bottom: null,

      width: null,
      height: null,

      //bounds: null,
      //mouseClickPosition: null,

      widthTouched: false,
      heightTouched: false,

      aspectFactor: null,

      parentWidth: null,
      parentHeight: null,

      minW: this.minWidth,
      minH: this.minHeight,

      maxW: this.maxWidth,
      maxH: this.maxHeight,

      handle: null,
      enabled: this.active,
      resizing: false,
      dragging: false,
      zIndex: this.z
    };
  },

  created: function() {
    // eslint-disable-next-line
    if (this.maxWidth && this.minWidth > this.maxWidth)
      console.warn(
        "[Vdr warn]: Invalid prop: minWidth cannot be greater than maxWidth"
      );
    // eslint-disable-next-line
    if (this.maxWidth && this.minHeight > this.maxHeight)
      console.warn(
        "[Vdr warn]: Invalid prop: minHeight cannot be greater than maxHeight"
      );

    this.resetBoundsAndMouseState();
  },
  mounted: function() {
    if (!this.enableNativeDrag) {
      this.$el.ondragstart = () => false;
    }

    //console.log(["dragresize 的 mounted过程"]);

    const [parentWidth, parentHeight] = this.getParentSize();

    this.parentWidth = parentWidth;
    this.parentHeight = parentHeight;

    const [width, height] = getComputedSize(this.$el);

    this.aspectFactor =
      (this.w !== "auto" ? this.w : width) /
      (this.h !== "auto" ? this.h : height);

    this.width = this.initWH(true);
    this.height = this.initWH(false);

    this.left = this.initLT(true);
    this.top = this.initLT(false);

    // this.right = this.parentWidth - this.width - this.left;
    // this.bottom = this.parentHeight - this.height - this.top;

    addEvent(document.documentElement, "mousedown", this.deselect);
    addEvent(document.documentElement, "touchend touchcancel", this.deselect);

    addEvent(window, "resize", this.checkParentSize);
  },
  beforeDestroy: function() {
    removeEvent(document.documentElement, "mousedown", this.deselect);
    removeEvent(document.documentElement, "touchstart", this.handleUp);
    removeEvent(document.documentElement, "mousemove", this.moveFn);
    removeEvent(document.documentElement, "touchmove", this.moveFn);
    removeEvent(document.documentElement, "mouseup", this.handleUp);
    removeEvent(
      document.documentElement,
      "touchend touchcancel",
      this.deselect
    );

    removeEvent(window, "resize", this.checkParentSize);
  },

  methods: {
    initWH(isWidth = true) {
      let me = this;
      if (isWidth) {
        switch (me.wMode) {
          case "num":
            return me.w;
          case "per":
            return (me.parentWidth / 100) * parseFloat(me.w);
          case "auto":
            return "auto";
        }
      } else {
        switch (me.hMode) {
          case "num":
            return me.h;
          case "per":
            return (me.parentHeight / 100) * parseFloat(me.h);
          case "auto":
            return "auto";
        }
      }
      return 200;
    },
    initLT(isLeft = true) {
      let me = this;
      if (isLeft) {
        switch (me.xMode) {
          case "num":
            return me.x;
          case "per":
            return (me.parentWidth / 100) * parseFloat(me.x);
        }
      } else {
        switch (me.yMode) {
          case "num":
            return me.y;
          case "per":
            return (me.parentHeight / 100) * parseFloat(me.y);
        }
      }
      return 0;
    },
    reReadWHXY() {
      let me = this;
      me.moveHorizontally(me.x);
      me.moveVertically(me.y);
      me.changeWidth(me.w);
      me.changeHeight(me.h);
    },
    resetBoundsAndMouseState() {
      this.mouseClickPosition = {
        mouseX: 0,
        mouseY: 0,
        x: 0,
        y: 0,
        w: 0,
        h: 0
      };

      this.bounds = {
        minLeft: null,
        maxLeft: null,
        minRight: null,
        maxRight: null,
        minTop: null,
        maxTop: null,
        minBottom: null,
        maxBottom: null
      };
    },
    checkParentSize() {
      if (this.parent) {
        const [newParentWidth, newParentHeight] = this.getParentSize();

        //对per模式的高宽要进行处理
        if (this.wMode === "per") {
          this.width = (newParentWidth / this.parentWidth) * this.width;
        }
        if (this.hMode === "per") {
          this.height = (newParentHeight / this.parentHeight) * this.height;
        }

        this.parentWidth = newParentWidth;
        this.parentHeight = newParentHeight;
      }
    },
    getParentSize() {
      if (this.parent) {
        const style = window.getComputedStyle(this.$el.parentNode, null);

        return [
          parseInt(style.getPropertyValue("width"), 10),
          parseInt(style.getPropertyValue("height"), 10)
        ];
      }

      return [null, null];
    },
    elementTouchDown(e) {
      eventsFor = events.touch;

      this.elementDown(e);
    },
    elementMouseDown(e) {
      eventsFor = events.mouse;

      this.elementDown(e);
    },
    elementDown(e) {
      if (e instanceof MouseEvent && e.which !== 1) {
        return;
      }

      const target = e.target || e.srcElement;

      if (e.stopPropagation) e.stopPropagation();

      if (this.$el.contains(target)) {
        if (this.onDragStart(e) === false) {
          return;
        }

        if (
          (this.dragHandle &&
            !matchesSelectorToParentElements(
              target,
              this.dragHandle,
              this.$el
            )) ||
          (this.dragCancel &&
            matchesSelectorToParentElements(target, this.dragCancel, this.$el))
        ) {
          this.dragging = false;

          return;
        }

        if (!this.enabled) {
          this.enabled = true;

          this.$emit("activated");
          this.$emit("update:active", true);
        }

        if (this.draggable) {
          this.dragging = true;
          this.lastDragEvent = e;
        }

        this.mouseClickPosition.mouseX = e.touches
          ? e.touches[0].pageX
          : e.pageX;
        this.mouseClickPosition.mouseY = e.touches
          ? e.touches[0].pageY
          : e.pageY;

        this.mouseClickPosition.left = this.left;
        this.mouseClickPosition.right = this.right;
        this.mouseClickPosition.top = this.top;
        this.mouseClickPosition.bottom = this.bottom;

        if (this.parent) {
          this.bounds = this.calcDragLimits();
        }

        this.$emit("dragstart", e, this);

        addEvent(document.documentElement, eventsFor.move, this.moveFn);
        addEvent(document.documentElement, eventsFor.stop, this.handleUp);
      }
    },
    calcDragLimits() {
      this.checkParentSize();
      return {
        minLeft: this.left % this.grid[0],
        maxLeft:
          Math.floor(
            (this.parentWidth - this.width - this.left) / this.grid[0]
          ) *
            this.grid[0] +
          this.left,
        minRight: this.right % this.grid[0],
        maxRight:
          Math.floor(
            (this.parentWidth - this.width - this.right) / this.grid[0]
          ) *
            this.grid[0] +
          this.right,
        minTop: this.top % this.grid[1],
        maxTop:
          Math.floor(
            (this.parentHeight - this.height - this.top) / this.grid[1]
          ) *
            this.grid[1] +
          this.top,
        minBottom: this.bottom % this.grid[1],
        maxBottom:
          Math.floor(
            (this.parentHeight - this.height - this.bottom) / this.grid[1]
          ) *
            this.grid[1] +
          this.bottom
      };
    },
    deselect(e) {
      const target = e.target || e.srcElement;
      const regex = new RegExp(this.className + "-([trmbl]{2})", "");

      if (!this.$el.contains(target) && !regex.test(target.className)) {
        if (this.enabled && !this.preventDeactivation) {
          this.enabled = false;

          this.$emit("deactivated");
          this.$emit("update:active", false);
        }

        removeEvent(
          document.documentElement,
          eventsFor.move,
          this.handleResizeFn
        );
      }

      this.resetBoundsAndMouseState();
    },
    handleTouchDown(handle, e) {
      eventsFor = events.touch;

      this.handleDown(handle, e);
    },
    handleDown(handle, e) {
      if (e instanceof MouseEvent && e.which !== 1) {
        return;
      }

      if (this.onResizeStart(handle, e) === false) {
        return;
      }

      if (e.stopPropagation) e.stopPropagation();

      // Here we avoid a dangerous recursion by faking
      // corner handles as middle handles
      if (this.lockAspectRatio && !handle.includes("m")) {
        this.handle = "m" + handle.substring(1);
      } else {
        this.handle = handle;
      }

      this.resizing = true;

      this.mouseClickPosition.mouseX = e.touches ? e.touches[0].pageX : e.pageX;
      this.mouseClickPosition.mouseY = e.touches ? e.touches[0].pageY : e.pageY;
      this.mouseClickPosition.left = this.left;
      this.mouseClickPosition.right = this.right;
      this.mouseClickPosition.top = this.top;
      this.mouseClickPosition.bottom = this.bottom;

      this.bounds = this.calcResizeLimits();

      this.$emit("resizeStart", e, this);

      addEvent(document.documentElement, eventsFor.move, this.handleResizeFn);
      addEvent(document.documentElement, eventsFor.stop, this.handleUp);
    },
    calcResizeLimits() {
      let minW = this.minW;
      let minH = this.minH;
      let maxW = this.maxW;
      let maxH = this.maxH;

      const aspectFactor = this.aspectFactor;
      const [gridX, gridY] = this.grid;
      const width = this.width;
      const height = this.height;
      const left = this.left;
      const top = this.top;
      const right = this.right;
      const bottom = this.bottom;

      if (this.lockAspectRatio) {
        if (minW / minH > aspectFactor) {
          minH = minW / aspectFactor;
        } else {
          minW = aspectFactor * minH;
        }

        if (maxW && maxH) {
          maxW = Math.min(maxW, aspectFactor * maxH);
          maxH = Math.min(maxH, maxW / aspectFactor);
        } else if (maxW) {
          maxH = maxW / aspectFactor;
        } else if (maxH) {
          maxW = aspectFactor * maxH;
        }
      }

      maxW = maxW - (maxW % gridX);
      maxH = maxH - (maxH % gridY);

      const limits = {
        minLeft: null,
        maxLeft: null,
        minTop: null,
        maxTop: null,
        minRight: null,
        maxRight: null,
        minBottom: null,
        maxBottom: null
      };

      if (this.parent) {
        limits.minLeft = left % gridX;
        limits.maxLeft = left + Math.floor((width - minW) / gridX) * gridX;
        limits.minTop = top % gridY;
        limits.maxTop = top + Math.floor((height - minH) / gridY) * gridY;
        limits.minRight = right % gridX;
        limits.maxRight = right + Math.floor((width - minW) / gridX) * gridX;
        limits.minBottom = bottom % gridY;
        limits.maxBottom = bottom + Math.floor((height - minH) / gridY) * gridY;

        if (maxW) {
          limits.minLeft = Math.max(
            limits.minLeft,
            this.parentWidth - right - maxW
          );
          limits.minRight = Math.max(
            limits.minRight,
            this.parentWidth - left - maxW
          );
        }

        if (maxH) {
          limits.minTop = Math.max(
            limits.minTop,
            this.parentHeight - bottom - maxH
          );
          limits.minBottom = Math.max(
            limits.minBottom,
            this.parentHeight - top - maxH
          );
        }

        if (this.lockAspectRatio) {
          limits.minLeft = Math.max(limits.minLeft, left - top * aspectFactor);
          limits.minTop = Math.max(limits.minTop, top - left / aspectFactor);
          limits.minRight = Math.max(
            limits.minRight,
            right - bottom * aspectFactor
          );
          limits.minBottom = Math.max(
            limits.minBottom,
            bottom - right / aspectFactor
          );
        }
      } else {
        limits.minLeft = null;
        limits.maxLeft = left + Math.floor((width - minW) / gridX) * gridX;
        limits.minTop = null;
        limits.maxTop = top + Math.floor((height - minH) / gridY) * gridY;
        limits.minRight = null;
        limits.maxRight = right + Math.floor((width - minW) / gridX) * gridX;
        limits.minBottom = null;
        limits.maxBottom = bottom + Math.floor((height - minH) / gridY) * gridY;

        if (maxW) {
          limits.minLeft = -(right + maxW);
          limits.minRight = -(left + maxW);
        }

        if (maxH) {
          limits.minTop = -(bottom + maxH);
          limits.minBottom = -(top + maxH);
        }

        if (this.lockAspectRatio && maxW && maxH) {
          limits.minLeft = Math.min(limits.minLeft, -(right + maxW));
          limits.minTop = Math.min(limits.minTop, -(maxH + bottom));
          limits.minRight = Math.min(limits.minRight, -left - maxW);
          limits.minBottom = Math.min(limits.minBottom, -top - maxH);
        }
      }

      return limits;
    },
    move(e) {
      if (this.resizing) {
        this.handleResize(e);
      } else if (this.dragging) {
        this.handleDrag(e);
      }
    },
    handleDrag(e) {
      let me = this;
      const axis = this.axis;
      const grid = this.grid;
      const bounds = this.bounds;
      const mouseClickPosition = this.mouseClickPosition;
      const nowX = e.touches ? e.touches[0].pageX : e.pageX,
        nowY = e.touches ? e.touches[0].pageY : e.pageY;

      const tmpDeltaX =
        axis && axis !== "y" ? mouseClickPosition.mouseX - nowX : 0;
      const tmpDeltaY =
        axis && axis !== "x" ? mouseClickPosition.mouseY - nowY : 0;

      const [deltaX, deltaY] = snapToGrid(
        grid,
        tmpDeltaX,
        tmpDeltaY,
        this.scale
      );

      const left = restrictToBounds(
        mouseClickPosition.left - deltaX,
        bounds.minLeft,
        bounds.maxLeft,
        15
      );
      const top = restrictToBounds(
        mouseClickPosition.top - deltaY,
        bounds.minTop,
        bounds.maxTop,
        15
      );
      //【update】后续开放
      //# 1 粘性 速度
      //（1）通过返回值判断是否粘性状态
      //（2）通过速度来确定是否位移
      //（3）通过上一次的e来判断速度mouseClickPosition
      // let lastE = this.lastDragEvent;
      // if (lastE) {
      //   let _pastX = lastE.touches ? lastE.touches[0].pageX : lastE.pageX,
      //     _pastY = lastE.touches ? lastE.touches[0].pageY : lastE.pageY,
      //     [pastX, pastY] = snapToGrid(
      //       grid,
      //       _pastX,
      //       _pastY,
      //       this.scale
      //     ),
      //     speedX = Math.abs((nowX - pastX) / me.throttleDiv * 1000),
      //     speedY = Math.abs((nowY - pastY) / me.throttleDiv * 1000);
      //   let speed = Math.pow(Math.pow(speedX, 2) + Math.pow(speedY, 2), 1 / 2);
      //   if ((left === bounds.minLeft || left === bounds.maxLeft) && (top === bounds.minTop || top === bounds.maxTop)) {
      //     console.log(["这个鼠标位移的速度 px/s", speedX, speedY, speed]);
      //   }
      // }
      //（4）记录上一次event
      this.lastDragEvent = e;

      if (this.onDrag(left, top) === false) {
        return;
      }

      // const right = restrictToBounds(
      //   mouseClickPosition.right + deltaX,
      //   bounds.minRight,
      //   bounds.maxRight
      // );
      // const bottom = restrictToBounds(
      //   mouseClickPosition.bottom + deltaY,
      //   bounds.minBottom,
      //   bounds.maxBottom
      // );

      this.left = left;
      this.top = top;
      //this.right = right;
      //this.bottom = bottom;

      this.$emit("dragging", e, this);
    },
    moveHorizontally(_val) {
      let val = this.initLT(true);
      const [deltaX, _] = snapToGrid(this.grid, val, this.top, this.scale);
      if (!tool.isNumber(deltaX)) {
        return;
      }

      const left = restrictToBounds(
        deltaX,
        this.bounds.minLeft,
        this.bounds.maxLeft
      );

      this.left = left;
      //this.right = this.parentWidth - this.width - left;
    },
    moveVertically(_val) {
      let val = this.initLT(false);
      const [_, deltaY] = snapToGrid(this.grid, this.left, val, this.scale);
      if (!tool.isNumber(deltaY)) {
        return;
      }

      const top = restrictToBounds(
        deltaY,
        this.bounds.minTop,
        this.bounds.maxTop
      );

      this.top = top;
      //this.bottom = this.parentHeight - this.height - top;
    },
    handleResize(e) {
      let left = this.left;
      let top = this.top;
      let right = this.right;
      let bottom = this.bottom;

      const mouseClickPosition = this.mouseClickPosition;
      const lockAspectRatio = this.lockAspectRatio;
      const aspectFactor = this.aspectFactor;

      const tmpDeltaX =
        mouseClickPosition.mouseX - (e.touches ? e.touches[0].pageX : e.pageX);
      const tmpDeltaY =
        mouseClickPosition.mouseY - (e.touches ? e.touches[0].pageY : e.pageY);

      if (!this.widthTouched && tmpDeltaX) {
        this.widthTouched = true;
      }

      if (!this.heightTouched && tmpDeltaY) {
        this.heightTouched = true;
      }

      const [deltaX, deltaY] = snapToGrid(
        this.grid,
        tmpDeltaX,
        tmpDeltaY,
        this.scale
      );

      if (this.handle.includes("b")) {
        bottom = restrictToBounds(
          mouseClickPosition.bottom + deltaY,
          this.bounds.minBottom,
          this.bounds.maxBottom
        );

        if (this.lockAspectRatio && this.resizingOnY) {
          right = this.right - (this.bottom - bottom) * aspectFactor;
        }
      } else if (this.handle.includes("t")) {
        top = restrictToBounds(
          mouseClickPosition.top - deltaY,
          this.bounds.minTop,
          this.bounds.maxTop
        );

        if (this.lockAspectRatio && this.resizingOnY) {
          left = this.left - (this.top - top) * aspectFactor;
        }
      }

      if (this.handle.includes("r")) {
        right = restrictToBounds(
          mouseClickPosition.right + deltaX,
          this.bounds.minRight,
          this.bounds.maxRight
        );

        if (this.lockAspectRatio && this.resizingOnX) {
          bottom = this.bottom - (this.right - right) / aspectFactor;
        }
      } else if (this.handle.includes("l")) {
        left = restrictToBounds(
          mouseClickPosition.left - deltaX,
          this.bounds.minLeft,
          this.bounds.maxLeft
        );

        if (this.lockAspectRatio && this.resizingOnX) {
          top = this.top - (this.left - left) / aspectFactor;
        }
      }

      const width = computeWidth(this.parentWidth, left, right);
      const height = computeHeight(this.parentHeight, top, bottom);

      if (this.onResize(this.handle, left, top, width, height) === false) {
        return;
      }
      if (this.resizeMask) {
        this.$emit("resizing", e, {
          left,
          top,
          width,
          height
        });
      } else {
        this.left = left;
        this.top = top;
        //this.right = right;
        //this.bottom = bottom;
        this.width = width;
        this.height = height;
        this.$emit("resizing", e, this);
      }
    },
    changeWidth(_val) {
      let val = this.initWH(true);
      const [newWidth, _] = snapToGrid(this.grid, val, 0, this.scale);
      if (!tool.isNumber(newWidth)) {
        return;
      }

      let right = restrictToBounds(
        this.parentWidth - newWidth - this.left,
        this.bounds.minRight,
        this.bounds.maxRight
      );
      let bottom = this.bottom;

      if (this.lockAspectRatio) {
        bottom = this.bottom - (this.right - right) / this.aspectFactor;
      }

      const width = computeWidth(this.parentWidth, this.left, right);
      const height = computeHeight(this.parentHeight, this.top, bottom);
      //console.log(["宽度改变", width]);
      //this.right = right;
      //this.bottom = bottom;
      this.width = width;
      this.height = height;
    },
    changeHeight(_val) {
      let val = this.initWH(false);
      const [_, newHeight] = snapToGrid(this.grid, 0, val, this.scale);
      if (!tool.isNumber(newHeight)) {
        return;
      }

      let bottom = restrictToBounds(
        this.parentHeight - newHeight - this.top,
        this.bounds.minBottom,
        this.bounds.maxBottom
      );
      let right = this.right;

      if (this.lockAspectRatio) {
        right = this.right - (this.bottom - bottom) * this.aspectFactor;
      }

      const width = computeWidth(this.parentWidth, this.left, right);
      const height = computeHeight(this.parentHeight, this.top, bottom);
      //console.log(["高度改变", height]);

      //this.right = right;
      //this.bottom = bottom;
      this.width = width;
      this.height = height;
    },
    handleUp(e) {
      this.handle = null;

      this.resetBoundsAndMouseState();

      if (this.resizing) {
        this.resizing = false;
        this.$emit("resizestop", e, this);
      }
      if (this.dragging) {
        this.dragging = false;
        this.$emit("dragstop", e, this);
      }

      removeEvent(
        document.documentElement,
        eventsFor.move,
        this.handleResizeFn
      );
    },
    //section 2

    dragResizeMouseDown(e) {
      this.dragResizeDown(e, true);
    },
    dragResizeTouchDown(e) {
      this.dragResizeDown(e, false);
    },
    //内部超过外框的时候不触发，触发范围缩小
    //【v2】外框超过也触发，加参数
    getHandleToward(e, ifOut) {
      let me = this,
        handle = false,
        el = me.$el,
        dom = $(el),
        off = dom.offset(),
        borderResizeWidth = me.borderResizeWidth,
        borders = me.actualBorders;
      let atRight =
          borders.indexOf("e") > -1
            ? e.pageX > off.left + el.offsetWidth - borderResizeWidth &&
              (ifOut || e.pageX <= off.left + el.offsetWidth)
            : false,
        atLeft =
          borders.indexOf("w") > -1
            ? e.pageX < off.left + borderResizeWidth &&
              (ifOut || e.pageX >= off.left)
            : false,
        atTop =
          borders.indexOf("n") > -1
            ? e.pageY < off.top + borderResizeWidth &&
              (ifOut || e.pageY >= off.top)
            : false,
        atBottom =
          borders.indexOf("s") > -1
            ? e.pageY > off.top + el.offsetHeight - borderResizeWidth &&
              (ifOut || e.pageY <= off.top + el.offsetHeight)
            : false,
        allAt = [atRight, atLeft, atTop, atBottom],
        count = 0;

      allAt.forEach(function(a) {
        if (a) {
          ++count;
        }
      });
      //【1】没有点击到四个边上时
      if (count === 0) {
        handle = false;
      }
      //【2】仅一个边上的情况
      else if (count === 1) {
        if (atRight) {
          handle = "mr"; //这个作为 相应事件的 方向标识
        } else if (atLeft) {
          handle = "ml";
        } else if (atTop) {
          handle = "tm";
        } else if (atBottom) {
          handle = "bm";
        }
      }
      //【3】四个角上的情况
      else if (count === 2) {
        //右上
        if (atTop && atRight) {
          handle = "tr";
        }
        //右下
        else if (atBottom && atRight) {
          handle = "br";
        }
        //左下
        else if (atBottom && atLeft) {
          handle = "bl";
        }
        //左上
        else if (atTop && atLeft) {
          handle = "tl";
        }
      }
      return handle;
    },
    //拆分为2个独立函数，便于分离控制
    resizeDownFn(e, isMouse, ifOut) {
      let me = this;
      if (me.resizable) {
        let handle = me.getHandleToward(e, ifOut);
        if (handle) {
          if (isMouse) {
            me.handleDown(handle, e);
          } else {
            me.handleTouchDown(handle, e);
          }
          return true;
        }
      }
      return false;
    },
    dragDownFn(e, isMouse) {
      let me = this;
      if (me.draggable) {
        if (isMouse) {
          me.elementMouseDown(e);
        } else {
          me.elementTouchDown(e);
        }
        return true;
      }
      return false;
    },
    //整合版本的控制器
    dragResizeDown(e, isMouse, ifOut) {
      let me = this;
      //没有resize时才执行drag
      if (!me.resizeDownFn(e, isMouse, ifOut)) {
        me.dragDownFn(e, isMouse);
      }
    },
    //是否显示鼠标提示
    dragResizeMouseMove(e) {
      let me = this;
      if (me.resizable && !me.resizing && !me.dragging) {
        let el = me.$el,
          dom = $(el),
          off = dom.offset(),
          borderResizeWidth = me.borderResizeWidth,
          borders = me.actualBorders;
        let atRight =
            borders.indexOf("e") > -1
              ? e.pageX > off.left + el.offsetWidth - borderResizeWidth
              : false,
          atLeft =
            borders.indexOf("w") > -1
              ? e.pageX < off.left + borderResizeWidth
              : false,
          atTop =
            borders.indexOf("n") > -1
              ? e.pageY < off.top + borderResizeWidth
              : false,
          atBottom =
            borders.indexOf("s") > -1
              ? e.pageY > off.top + el.offsetHeight - borderResizeWidth
              : false,
          allAt = [atRight, atLeft, atTop, atBottom],
          count = 0;

        allAt.forEach(function(a) {
          if (a) {
            ++count;
          }
        });
        //【1】没有点击到四个边上时
        if (count === 0) {
          el.style.cursor = "default";
        }
        //【2】仅一个边上的情况
        else if (count === 1) {
          if (atRight || atLeft) {
            el.style.cursor = "e-resize";
          } else if (atTop || atBottom) {
            el.style.cursor = "n-resize";
          }
        }
        //【3】四个角上的情况
        else if (count === 2) {
          //右上 左下
          if ((atTop && atRight) || (atBottom && atLeft)) {
            el.style.cursor = "ne-resize";
          }
          //右下 左上
          else if ((atBottom && atRight) || (atTop && atLeft)) {
            el.style.cursor = "nw-resize";
          }
        }
      } //[if] resizeable
    }, //mousemove Fn
    dragResizeMouseMoveNotHover() {
      let me = this,
        el = me.$el;
      //console.log(["看卡咋不触发over？"]);
      el.style.cursor = "default";
    },
    getSyncStyle() {
      let me = this,
        style = {};
      style.width =
        (me.widthMode || me.wMode) == "num"
          ? parseFloat(me.computedWidth)
          : me.computedWidth;
      style.height =
        (me.heightMode || me.hMode) == "num"
          ? parseFloat(me.computedHeight)
          : me.computedHeight;
      style.left =
        (me.leftMode || me.xMode) == "num"
          ? parseFloat(me.computedLeft)
          : me.computedLeft;
      style.top =
        (me.topMode || me.yMode) == "num"
          ? parseFloat(me.computedTop)
          : me.computedTop;

      //# 2 z
      style.zIndex = me.zIndex;

      //# 3 基本px的 信息
      tool.apply(style, {
        widthPx: me.width,
        heightPx: me.height,
        leftPx: me.left,
        topPx: me.top
      });

      return style;
    }
  },
  computed: {
    right() {
      return this.parentWidth - this.width - this.left;
    },
    bottom() {
      return this.parentHeight - this.height - this.top;
    },
    wMode() {
      let me = this;
      if (tool.isNumber(me.w)) {
        return "num";
      } else if (tool.isString(me.w)) {
        if (me.w === "auto" || !me.parent) {
          return "auto";
        } else {
          return "per";
        }
      }
    },
    hMode() {
      let me = this;
      if (tool.isNumber(me.h)) {
        return "num";
      } else if (tool.isString(me.h)) {
        if (me.h === "auto" || !me.parent) {
          return "auto";
        } else {
          return "per";
        }
      }
    },
    xMode() {
      let me = this;
      if (tool.isNumber(me.x)) {
        return "num";
      } else if (tool.isString(me.x)) {
        return "per";
      }
    },
    yMode() {
      let me = this;
      if (tool.isNumber(me.y)) {
        return "num";
      } else if (tool.isString(me.y)) {
        return "per";
      }
    },
    style() {
      let css = {
        width: this.computedWidth,
        height: this.computedHeight,
        zIndex: this.zIndex,
        ...(this.dragging && this.disableUserSelect
          ? userSelectNone
          : userSelectAuto)
      };
      if (this.isAbsolute) {
        Object.assign(css, {
          position: "absolute",
          top: this.computedTop,
          left: this.computedLeft
        });
      } else {
        Object.assign(css, {
          transform: `translate(${this.computedLeft}, ${this.computedTop})`
        });
      }
      return css;
    },
    actualHandles() {
      if (!this.resizable) return [];

      return this.handles;
    },
    computedWidth() {
      let me = this,
        temp,
        m = me.widthMode,
        theMode = m || me.wMode;
      //console.log(["宽度计算问题！", me.width, me.parentWidth]);
      switch (theMode) {
        case "num":
          temp = me.width || 10;
          return temp + "px";
        case "per":
          temp = me.width / me.parentWidth || 0.1;
          return (temp * 100).toFixed(2) + "%";
        case "auto":
          if (!me.widthTouched) {
            return "auto";
          }
          break;
      }
      temp = me.width || 10;
      return temp + "px";

      // if (this.wMode === "auto") {
      //   if (!this.widthTouched) {
      //     return "auto";
      //   }
      // } else if (this.wMode === "per") {
      //   return this.width;
      // }

      // return this.width + "px";
    },
    computedHeight() {
      let me = this,
        temp,
        m = me.heightMode,
        theMode = m || me.hMode;
      switch (theMode) {
        case "num":
          temp = me.height || 10;
          return temp + "px";
        case "per":
          temp = me.height / me.parentHeight || 0.1;
          return (temp * 100).toFixed(2) + "%";
        case "auto":
          if (!me.heightTouched) {
            return "auto";
          }
          break;
      }
      temp = me.height || 10;
      return temp + "px";
      // if (this.h === "auto") {
      //   if (!this.heightTouched) {
      //     return "auto";
      //   }
      // }

      // return this.height + "px";
    },
    computedLeft() {
      let me = this,
        temp,
        m = me.leftMode,
        theMode = m || me.xMode;
      switch (theMode) {
        case "num":
        default:
          temp = me.left || 0;
          return temp + "px";
        case "per":
          temp = me.left / me.parentWidth || 0;
          return (temp * 100).toFixed(2) + "%";
      }
    },
    computedTop() {
      let me = this,
        temp,
        m = me.topMode,
        theMode = m || me.yMode;
      switch (theMode) {
        case "num":
        default:
          temp = me.top || 0;
          return temp + "px";
        case "per":
          temp = me.top / me.parentHeight || 0;
          return (temp * 100).toFixed(2) + "%";
      }
    },
    resizingOnX() {
      return (
        Boolean(this.handle) &&
        (this.handle.includes("l") || this.handle.includes("r"))
      );
    },
    resizingOnY() {
      return (
        Boolean(this.handle) &&
        (this.handle.includes("t") || this.handle.includes("b"))
      );
    },
    isCornerHandle() {
      return (
        Boolean(this.handle) && ["tl", "tr", "br", "bl"].includes(this.handle)
      );
    },

    //section 2
    actualBorders() {
      if (!this.resizable) return [];
      return this.borders;
    },
    moveFn(e) {
      let me = this,
        callback = function(ev) {
          //console.log(["看看move"]);
          me.move(ev);
        };
      //100帧左右
      let tFn = tool.throttle(callback, me.throttleDiv);
      return tFn;
    },
    handleResizeFn(e) {
      let me = this,
        callback = function(ev) {
          //console.log(["看看resize"]);
          me.handleResize(ev);
        };
      //100帧左右
      let tFn = tool.throttle(callback, me.throttleDiv);
      return tFn;
    }
  },

  watch: {
    active(val) {
      this.enabled = val;

      if (val) {
        this.$emit("activated");
      } else {
        this.$emit("deactivated");
      }
    },
    z(val) {
      if (val >= 0 || val === "auto") {
        this.zIndex = val;
      }
    },
    x(val) {
      if (this.resizing || this.dragging) {
        return;
      }
      //console.log(["x轴改变！", val]);

      if (this.parent) {
        this.bounds = this.calcDragLimits();
      }

      this.moveHorizontally(val);
    },
    y(val) {
      if (this.resizing || this.dragging) {
        return;
      }

      if (this.parent) {
        this.bounds = this.calcDragLimits();
      }

      this.moveVertically(val);
    },
    lockAspectRatio(val) {
      if (val) {
        this.aspectFactor = this.width / this.height;
      } else {
        this.aspectFactor = undefined;
      }
    },
    minWidth(val) {
      if (val > 0 && val <= this.width) {
        this.minW = val;
      }
    },
    minHeight(val) {
      if (val > 0 && val <= this.height) {
        this.minH = val;
      }
    },
    maxWidth(val) {
      this.maxW = val;
    },
    maxHeight(val) {
      this.maxH = val;
    },
    w(val) {
      if (this.resizing || this.dragging) {
        return;
      }

      if (this.parent) {
        this.bounds = this.calcResizeLimits();
      }

      this.changeWidth(val);
    },
    h(val) {
      if (this.resizing || this.dragging) {
        return;
      }

      if (this.parent) {
        this.bounds = this.calcResizeLimits();
      }

      this.changeHeight(val);
    }
  }
};
