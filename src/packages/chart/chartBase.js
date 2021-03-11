import tool from "@/plugins/js/tool";
import Vue from "vue";
import loader from "@/plugins/js/loader";
import { Instance } from "@designBI/views/mixins/Entity";
import { Xbase } from "@designBI/views/mixins/X";

const base = {};

const chartBase = tool.apply({}, base, {});

export default {
  mixins: [Instance, Xbase],
  data() {
    return {
      //## 1 可变，外部筛选导致的数据变化
      SummaryData: null,
      //## 2 获取数据方式
      type: "chart", // "treeTable"
      requestData: null,
      ajaxData: null,
      ajaxLoading: false
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
      return me.dataId ? me.EditNode.conditionMap[me.dataId] : null;
    },
    //【update】source的优先级高
    dimension() {
      let me = this,
        dims = this.sourceDims.length
          ? this.sourceDims
          : this.LinkData && this.LinkData.dimension;
      return (
        dims &&
        dims.map(d => {
          d.realKey = me.getRealKey(d);
          return d;
        })
      );
    },
    //%% 2 下面2个 归 item
    //@ 1 下面是默认的 xy
    //## 3 拖拽过来选择的维度【x轴】类目
    Dims() {
      let me = this,
        itemDims = me.record.config_more && me.record.config_more.Dims,
        dims = [];
      if (me.dimension && itemDims) {
        itemDims.forEach(d => {
          tool.each(me.dimension, id => {
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
        itemIdx = me.record.config_more && me.record.config_more.Indices,
        dims = [];
      if (me.dimension && itemIdx) {
        itemIdx.forEach(d => {
          tool.each(me.dimension, id => {
            if (d.key === id.key) {
              dims.push(d);
              return false;
            }
          });
        });
      }
      return dims;
    },
    hasDimension() {
      let me = this;
      return me.Dims.length && me.Indices.length;
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

    getRealKey(dim) {
      let me = this;
      return me._joinTables && me._joinTables.length ? dim.tName : dim.key;
    },

    //## 2 item 全页数据中心
    //~ 1 刷新某id数据
    refreshSource(addOptions) {
      let me = this,
        tableName = me.tableName;
      //console.log(["尝试刷新,查看触发缘故"]);
      if (!tableName || !me.Instance || !me.LinkData) {
        return;
      }
      me.ajaxLoading = true;
      let dataId = me.dataId,
        conditions = me.conditions,
        options = {
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.GetDataDetail,
          data: {
            id: dataId,
            tableName:
              me.LinkData.dataType == "sql"
                ? `${me.LinkData.sourceName}.${me.LinkData.dataBaseName}.dbo.${tableName}`
                : tableName,
            //@ 3 这两个产生个性
            Dims: JSON.stringify(
              me.Dims.map(d => {
                let d2 = tool.apply({}, d);
                delete d2.parentCoating;
                return d2;
              })
            ),
            Indices: JSON.stringify(
              me.Indices.map(d => {
                let d2 = tool.apply({}, d);
                delete d2.parentCoating;
                return d2;
              })
            ),
            //@ 4 明细：
            JoinTables:
              (me.JoinTables &&
                me.JoinTables.length &&
                JSON.stringify(me.JoinTables)) ||
              "",
            type: me.type
          }
        };

      //# 3 条件查询 property type parameters
      if (conditions) {
        options.data.conditions = tool.isArray(conditions)
          ? conditions
          : [conditions];
        let props = ["$id", "dataId", "property", "type", "value"];
        options.data.conditions = JSON.stringify(
          options.data.conditions.map(op => {
            let theOp = {};
            props.forEach(p => {
              theOp[p] = op[p];
            });
            return theOp;
          })
        );
      }

      //# 4 明细 维度范围
      // if (me.sourceDims.length) {
      //   options.data.sourceDims = JSON.stringify(
      //     tool.isArray(options.data.sourceDims)
      //   );
      // }

      if (addOptions) {
        tool.merge(options, addOptions);
      }

      return new Promise((res, rej) => {
        if (me.ajaxData) {
          me.ajaxData.abort();
        }
        me.ajaxData = loader.ajax(options);
        me.ajaxData
          .then(result => {
            me.ajaxData = null;
            let oData = result.data;
            //console.log(["查看堆积sum数据", oData, result]);
            if (oData) {
              me.requestData = oData;
              let data = tool.clone(oData);
              data = data.map(rec => {
                tool.each(rec, (key, val) => {
                  if (tool.isNumber(val)) {
                    val = parseFloat(val.toFixed(2));
                    rec[key] = val;
                  }
                });
                return rec;
              });

              if (me.type === "chart") {
                //# 1 这仅是初始数据
                me.SummaryData = me.getDataSummary(data);
              }
              me.$emit("refreshSource", me.requestData);
              res(me.requestData);
            } else {
              res("noData");
            }
            me.ajaxLoading = false;
          })
          .catch(r => {
            if (r && r.statusText === "abort") {
              me.ajaxData = null;
            } else {
              res(false);
              me.ajaxLoading = false;
            }
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
    },
    //@ 3 选择一条数据
    selectOneRecord(rec, Dims, clickParams) {
      let me = this,
        edit = me.EditNode,
        records = {};

      //console.log(["点击了一个record", rec]);

      Dims.forEach(d => {
        //~~ 1 record
        let dataId = d.dataId;
        let record = records[dataId] || {};
        //~~ 3 先去掉！
        delete edit.selectMap[dataId];

        let val = rec[d.realKey || d.key];
        if (!tool.isNull(val)) {
          //~~ 2 有值的维度，放入对应dataId的rec去
          me.$set(record, d.key, val);
          me.$set(edit.selectMap, dataId, record);
          records[dataId] = record;
        }
      });
    }
  }, //methods
  watch: {
    LinkData(newVal, oldVal) {
      //if (newVal.length !== oldVal.length) {
      //console.log(["【LinkData】尝试刷新,查看触发缘故"]);
      this.refreshSource();
      //}
    },
    conditions(newVal, oldVal) {
      //if (newVal.length !== oldVal.length) {
      //console.log(["【conditions】尝试刷新,查看触发缘故"]);
      this.refreshSource();
      //}
    },
    //自身变动
    Dims(newVal, oldVal) {
      if (newVal.length !== oldVal.length) {
        //console.log(["【Dims】尝试刷新,查看触发缘故"]);
        this.refreshSource();
      }
    },
    Indices(newVal, oldVal) {
      if (newVal.length !== oldVal.length) {
        //console.log(["【Indices】尝试刷新,查看触发缘故"]);
        this.refreshSource();
      }
    },
    JoinTables(newVal, oldVal) {
      let me = this,
        isSame = true;
      if ((newVal && !oldVal) || (!newVal && oldVal)) {
        isSame = false;
      } else if (newVal && oldVal) {
        if (newVal.length != oldVal.length) {
          isSame = false;
        } else {
          for (let i = 0; i < newVal.length; ++i) {
            let nJT = newVal[i],
              oJT = oldVal[i];
            if (nJT.selectRecord != oJT.selectRecord) {
              isSame = false;
              break;
            }
          }
        }
      }
      if (!isSame) {
        //console.log(["【JoinTables】尝试刷新,查看触发缘故"]);
        me.refreshSource();
      }
    },
    ajaxLoading(newVal) {
      this.$emit("ajaxLoading", newVal);
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
