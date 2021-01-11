import tool from "@/plugins/js/tool";
import Vue from "vue";
import loader from "@/plugins/js/loader";
import { Instance } from "@designBI/views/mixins/Entity";
import { Xbase } from "@designBI/views/mixins/X";

export default {
  mixins: [Instance, Xbase],
  data() {
    return {
      //## 1 可变，外部筛选导致的数据变化
      SummaryData: null
    };
  },
  computed: {
    //@ 2-2 基础的data配置
    LinkData() {
      let me = this;
      return me.dataId ? me.EditNode.linkDatas[me.dataId] : null;
    },
    tableName() {
      let me = this;
      return me.LinkData ? me.LinkData.tableName : "";
    },
    //@ 2 关联到 Edit汇总公用部分，产生关联
    //%% 1 归属board
    conditions() {
      let me = this;
      return me.LinkData ? me.EditNode.conditionMap[me.dataId] : null;
    },
    dimension() {
      return this.LinkData && this.LinkData.dimension;
    },
    //%% 2 下面2个 归 item
    //@ 1 下面是默认的 xy
    //## 3 拖拽过来选择的维度【x轴】类目
    Dims() {
      let me = this,
        itemDims = me.record.Dims,
        dims = [];
      if (me.dimension && itemDims) {
        me.dimension.forEach(d => {
          tool.each(itemDims, id => {
            if (d.key === id.key) {
              dims.push(d);
              return false;
            }
          });
        });
      }
      return dims;
    },
    //## 4 拖拽过来选择的指标【y轴】类目的维度值
    Indices() {
      let me = this,
        itemIdx = me.record.Indices,
        dims = [];
      if (me.dimension && itemIdx) {
        me.dimension.forEach(d => {
          tool.each(itemIdx, id => {
            if (d.key === id.key) {
              dims.push(d);
              return false;
            }
          });
        });
      }
      return dims;
    },
    //@@ 2 一表part2：序列值二维数组，首行为header
    aoa() {
      let me = this;
      return me.SummaryData && me.SummaryData.aoa;
    },
    aoaData() {
      let me = this;
      return me.SummaryData && me.SummaryData.aoaData;
    },
    //@@ 3 键值对数组
    keySheet() {
      let me = this;
      return me.SummaryData && me.SummaryData.aoaKey;
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
    },

    //## 2 item 全页数据中心
    //~ 1 刷新某id数据
    refreshSource() {
      let me = this,
        tableName = me.tableName;
      //console.log(["尝试刷新"]);
      if (!tableName || !me.Instance) {
        return;
      }
      let dataId = me.dataId,
        conditions = me.conditions,
        options = {
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.GetDataDetail,
          data: {
            id: dataId,
            tableName,
            //@ 3 这两个产生个性
            Dims: me.Dims,
            Indices: me.Indices
          }
        };

      //# 3 条件查询 property type parameters
      if (conditions) {
        options.data.conditions = JSON.stringify(
          tool.isArray(conditions) ? conditions : [conditions]
        );
      }

      return new Promise((res, rej) => {
        if (me.ajaxData) {
          me.ajaxData.abort();
        }
        me.ajaxData = loader.ajax(options);
        me.ajaxData
          .then(result => {
            me.ajaxData = null;
            let data = result.data;
            if (data) {
              //# 1 这仅是初始数据
              let //baseData = datas[0],
                //# 2 总结数据
                sumData = me.getDataSummary(data);
              //# 3 设定好
              me.SummaryData = sumData;
              res(sumData);
            } else {
              res(false);
            }
          })
          .catch(r => {
            if (r && r.statusText === "abort") {
              me.ajaxData = null;
            }
            res(false);
          });
      });
    },
    getDataSummary(data) {
      let me = this,
        LinkData = me.LinkData,
        dimension = LinkData.dimension,
        //# 1 这里是fmt的 date型
        aoaKey = tool.isString(data) ? JSON.parse(data) : data,
        workSheet = me.getSheetFromAoa(aoaKey, dimension),
        //# 2 这里是Date 的date型
        aoa = me.wsToArray(workSheet),
        aoaData = me.getStrDateAoa(aoa);
      return {
        baseData: data,
        dimension,
        aoa,
        aoaData,
        aoaKey,
        workSheet
      };
    }
  }, //methods
  watch: {
    LinkData() {
      this.refreshSource();
    },
    conditions() {
      this.refreshSource();
    },
    //自身变动
    Dims() {
      this.refreshSource();
    },
    Indices() {
      this.refreshSource();
    }
  },
  mounted() {
    let me = this;

    //# 2 脱离不了大框架

    //# 1 第一次就 获取就行，后续互动时刷新
    me.EditNode.getLinkData(me.dataId).then(r => {
      me.refreshSource();
    });
  }
};
