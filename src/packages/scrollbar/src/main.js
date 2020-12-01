// reference https://github.com/noeldelgado/gemini-scrollbar/blob/master/index.js

import {
  addResizeListener,
  removeResizeListener
} from "element-ui/src/utils/resize-event";
import scrollbarWidth from "element-ui/src/utils/scrollbar-width";
import { toObject } from "element-ui/src/utils/util";
import Bar from "./bar";

/* istanbul ignore next */
export default {
  name: "ElScrollbar",

  components: { Bar },

  props: {
    native: Boolean,
    wrapStyle: {},
    wrapClass: {},
    viewClass: {},
    viewStyle: {},
    //最小的 thumb高宽
    minSizeWidth: {
      type: Number,
      default: 20
    },
    minSizeHeight: {
      type: Number,
      default: 20
    },
    windowResize: Boolean, //window来 resize 来替代
    noresize: Boolean, // 如果 container 尺寸不会发生变化，最好设置它可以优化性能
    tag: {
      type: String,
      default: "div"
    }
  },

  data() {
    return {
      sizeWidth: 0, //"0",
      sizeWidthMinExpand: 1,
      sizeHeight: 0, //"0",
      sizeHeightMinExpand: 1,
      moveX: 0,
      moveY: 0,

      wrap: null
    };
  },

  computed: {
    // wrap() {
    //   return this.$refs.wrap;
    // },
    pxSizeWidth() {
      return this.wrap
        ? (this.sizeWidth * this.sizeWidthMinExpand * this.wrap.clientWidth) /
            100
        : this.minSizeWidth;
    },
    pxSizeHeight() {
      return this.wrap
        ? (this.sizeHeight *
            this.sizeHeightMinExpand *
            this.wrap.clientHeight) /
            100
        : this.minSizeHeight;
    }
  },

  render(h) {
    let gutter = scrollbarWidth();
    let style = this.wrapStyle;

    if (gutter) {
      const gutterWith = `-${gutter}px`;
      //【~ 1】添加 高宽为 100% + 滚动条宽度的附加，以适应更多情况
      const gutterStyle = `margin-bottom: ${gutterWith}; margin-right: ${gutterWith}; width: calc(100% + ${gutter}px); height: calc(100% + ${gutter}px); `;

      if (Array.isArray(this.wrapStyle)) {
        style = toObject(this.wrapStyle);
        style.marginRight = style.marginBottom = gutterWith;
        style.width = `calc(100% + ${gutter}px)`;
        style.height = `calc(100% + ${gutter}px)`;
      } else if (typeof this.wrapStyle === "string") {
        style += gutterStyle;
      } else {
        style = gutterStyle;
      }
    }
    const view = h(
      this.tag,
      {
        class: ["el-scrollbar__view", this.viewClass],
        style: this.viewStyle,
        ref: "resize"
      },
      this.$slots.default
    );
    const wrap = (
      <div
        ref="wrap"
        style={style}
        onScroll={this.handleScroll}
        class={[
          this.wrapClass,
          "el-scrollbar__wrap",
          gutter ? "" : "el-scrollbar__wrap--hidden-default"
        ]}
      >
        {[view]}
      </div>
    );
    let nodes;

    if (!this.native) {
      nodes = [
        wrap,
        <Bar
          move={this.moveX}
          size={this.sizeWidth}
          expand={this.sizeWidthMinExpand}
          pxsize={this.pxSizeWidth}
        ></Bar>,
        <Bar
          vertical
          move={this.moveY}
          size={this.sizeHeight}
          expand={this.sizeHeightMinExpand}
          pxsize={this.pxSizeHeight}
        ></Bar>
      ];
    } else {
      nodes = [
        <div
          ref="wrap"
          class={[this.wrapClass, "el-scrollbar__wrap"]}
          style={style}
        >
          {[view]}
        </div>
      ];
    }
    return h("div", { class: "el-scrollbar" }, nodes);
  },

  methods: {
    handleScroll() {
      const wrap = this.wrap;

      // this.moveY = (wrap.scrollTop * 100) / wrap.clientHeight;
      // this.moveX = (wrap.scrollLeft * 100) / wrap.clientWidth;

      //由下列公式推导出：
      //(1): T / (H2 - H) = sT / (H - size)
      //(2): sT / size = move

      this.moveY =
        ((wrap.scrollTop * (wrap.clientHeight - this.pxSizeHeight)) /
          ((wrap.scrollHeight - wrap.clientHeight) * this.pxSizeHeight)) *
        100;
      this.moveX =
        ((wrap.scrollLeft * (wrap.clientWidth - this.pxSizeWidth)) /
          ((wrap.scrollWidth - wrap.clientWidth) * this.pxSizeWidth)) *
        100;
    },
    update() {
      let heightPercentage, widthPercentage;
      const wrap = this.wrap;
      if (!wrap) return;

      //console.log(["wrap的高宽取对了吗？"]);
      heightPercentage = (wrap.clientHeight * 100) / wrap.scrollHeight;
      widthPercentage = (wrap.clientWidth * 100) / wrap.scrollWidth;
      this.sizeHeight = heightPercentage < 100 ? heightPercentage : 100;
      this.sizeWidth = widthPercentage < 100 ? widthPercentage : 100;

      let sizeHeightMin = (this.minSizeHeight / wrap.clientWidth) * 100;
      let sizeWidthMin = (this.minSizeWidth / wrap.clientWidth) * 100;
      sizeHeightMin = sizeHeightMin < 100 ? sizeHeightMin : 100;
      sizeWidthMin = sizeWidthMin < 100 ? sizeWidthMin : 100;

      this.sizeHeightMinExpand =
        sizeHeightMin > this.sizeHeight ? sizeHeightMin / this.sizeHeight : 1;
      this.sizeWidthMinExpand =
        sizeWidthMin > this.sizeWidth ? sizeWidthMin / this.sizeWidth : 1;
    }
  },

  mounted() {
    //console.log(["wrap mounted?", this, this.$refs.wrap]);
    this.wrap = this.$refs.wrap;
    if (this.native) return;
    this.$nextTick(this.update);
    if (!this.noresize) {
      if (this.windowResize) {
        addResizeListener(document.body, this.update);
      } else {
        addResizeListener(this.$refs.resize, this.update);
      }
    }
  },

  beforeDestroy() {
    if (this.native) return;
    if (!this.noresize) {
      if (this.windowResize) {
        removeResizeListener(document.body, this.update);
      } else {
        removeResizeListener(this.$refs.resize, this.update);
      }
    }
  }
};
