import { Instance } from "@designBI/views/mixins/Entity";
import tool from "@/plugins/js/tool";
import Vue from "vue";
import $ from "jquery";
import loader from "@/plugins/js/loader";
import { singleConds } from "@designBI/store";
export default {
  mixins: [Instance],
  props: {
    //【update】多个非同表同时应用！
    properties: {
      //# 1 key和 dataId的组合
      type: Array,
      required: true
    },
    newCondition: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      infoProps: [],
      infoPropsLoading: false
    };
  },
  computed: {
    singleConds() {
      return singleConds;
    },
    condId() {
      return tool.uniqueStr();
    },
    conditionResult() {
      let me = this;
      return [];
    },
    conditionResultV2() {
      let me = this,
        conds = me.conditionResult;
      return conds.map(c => {
        c.$from = me;
        return c;
      });
    },
    itype() {
      return "";
    }
  },
  methods: {
    assisBlurBase(inEls, blurFn) {
      let me = this;
      inEls = tool.isArray(inEls) ? inEls : [inEls];
      $("body").on(`click.${me.condId}`, function(e) {
        console.log(["assisBlurFn 在工作", e]);
        let t = $(e.target),
          isIn = false;
        tool.each(inEls, el => {
          let isInThis = e.target == el || $(el).find(t).length;
          if (isInThis) {
            isIn = true;
            return false;
          }
        });
        if (!isIn) {
          blurFn();
        }
      });
    },
    blurBase() {
      let me = this;
      $("body").off(`click.${me.condId}`);
    },
    conditionResultValueTest(val) {
      return true;
    },
    getInfoProps() {
      let me = this;
      return new Promise((res, rej) => {
        me.infoPropsLoading = true;
        loader
          .ajax({
            url: Vue.Api.designBI,
            data: {
              method: Vue.Api.designBI.GetDimensionsInfo,
              dimensions: JSON.stringify(me.properties),
              itype: me.itype
            }
          })
          .then(result => {
            me.infoProps = result.data;
            me.infoPropsLoading = false;
            res(result);
          })
          .catch(r => {
            me.$message.warning("获取条件维度信息失败……");
            me.infoPropsLoading = false;
            rej(r);
          });
      });
    }
  },
  watch: {
    conditionResultV2(conds) {
      let me = this,
        props = me.properties,
        edit = me.EditNode;
      //console.log(["conditionResult watch 在工作", conds]);
      if (edit) {
        props.forEach(prop => {
          let dataId = prop.dataId,
            propName = prop.key;
          if (!tool.isArray(edit.conditionMap[dataId])) {
            Vue.set(edit.conditionMap, dataId, []);
          }
          //# 1 找准对应dataid的范畴
          let mapA = edit.conditionMap[dataId],
            //plusA = [],
            minusA = [];

          //~~~~ 1 新增的
          // conds.forEach(c => {
          //   let already = mapA.find(m => {
          //     return c.$id == m.$id;
          //   });
          //   if (!already) {
          //     plusA.push(c);
          //   }
          // });
          //~~~~ 2 减少的
          mapA.forEach(c => {
            let already = conds.find(m => {
              return c.$id == m.$id;
            });
            //++ 1 仅对于 自身的 控件而言
            if (!already && c.$from == me) {
              minusA.push(c);
            }
          });

          //# 2-0 减少的剔除
          minusA.forEach(m => {
            let at = mapA.findIndex(a => {
              return a.$id == m.id;
            });
            mapA.splice(at, 1);
          });

          //# 2 合适的cond形状
          let theConds = conds.map(cond => {
            return {
              ...cond,
              property: propName,
              dataId
            };
          });
          //# 3 再比较、合并、插入
          theConds.forEach(cond => {
            let findAt = mapA.findIndex(a => {
              return a.$id === cond.$id && a.property === cond.property;
            });
            if (findAt > -1) {
              mapA.splice(findAt, 1);
            }
            if (me.conditionResultValueTest(cond.value, cond)) {
              mapA.push(cond);
            }
          });
          //# 4 触发一次
          //Vue.set(edit.conditionMap, dataId, mapA);
        });

        //++ 2 对单个值的处理
        if (singleConds[me.xtype]) {
          me.$set(edit.singleCondMap, me.instanceCode, me.singleValue);
        }
      }
    }
  },
  //【update】可进一步分离 的细分类
  beforeDestroy() {
    let me = this;
    $("body").off(`click.${me.condId}`);
  }
};
