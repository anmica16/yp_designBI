import tool from "@/plugins/js/tool";
export default {
  props: {
    //## 1 可变，外部筛选导致的数据变化
    SummaryData: {
      type: Object,
      required: true
    },
    //## 2 图表类型，通过左上角来进行切换，这个作为一个管理中转站进行管理
    type: {
      type: String,
      default: "line"
    },
    //~ 1 都是一组数据
    // - 1 维度
    //## 3 拖拽过来选择的维度【x轴】类目
    Dims: {
      type: Array
    },
    // - 2 指标
    //## 4 拖拽过来选择的指标【y轴】类目的维度值
    Indices: {
      type: Array
    },
    //## 5 单独设置的表格风格
    theme: {
      type: String
    }
  },

  computed: {
    //@@ 1 一表part1：序列集合基本类型
    dimension() {
      let me = this,
        dims = me.SummaryData.dimension;
      return dims;
    },
    //@@ 2 一表part2：序列值二维数组，首行为header
    aoaData() {
      let me = this;
      return me.SummaryData.aoa;
    },
    //@@ 3 键值对数组
    keySheet() {
      let me = this;
      return me.SummaryData.aoaKey;
    }
  },
  methods: {
    getAxisType(type) {
      switch (type) {
        default:
        case "string":
          return "category";
        case "date":
          return "time";
        case "number":
          return "value";
      }
    },
    getChartDimensionType(type) {
      switch (type) {
        default:
        case "string":
          return "ordinal";
        case "date":
          return "time";
        case "number":
          return "number";
      }
    },
    getAxisDim(dim) {
      let me = this,
        at = this.dimension.findIndex(cDim => {
          return cDim.key === dim.key;
        });
      if (at > -1) {
        let cDim = tool.apply({}, dim, {
          //【update】name换为中文 可设定？
          name: dim.key,
          jsType: dim.type,
          type: me.getAxisType(dim.type)
        });
        return cDim;
      } else {
        return null;
      }
    }
  } //methods
};
