import { Instance } from "@designBI/views/mixins/Entity";
import tool from "@/plugins/js/tool";
import Vue from "vue";
import $ from "jquery";
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
  computed: {
    condId() {
      return tool.uniqueStr();
    },
    conditionResult() {
      let me = this;
      return [];
    }
  },
  methods: {
    assisBlurBase(inEls, blurFn) {
      let me = this;
      inEls = tool.isArray(inEls) ? inEls : [inEls];
      $("body").on(`click.${me.condId}`, function(e) {
        //console.log(["assisBlurFn 在工作", e]);
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
    }
  },
  watch: {
    conditionResult(conds) {
      let me = this,
        props = me.properties,
        edit = me.EditNode;
      console.log(["conditionResult watch 在工作", conds]);
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
          //   let already = mapA.forEach(m => {
          //     return c.$id == m.$id;
          //   });
          //   if (!already) {
          //     plusA.push(c);
          //   }
          // });
          //~~~~ 2 减少的
          mapA.forEach(c => {
            let already = conds.forEach(m => {
              return c.$id == m.$id;
            });
            if (!already) {
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
      }
    }
  },
  beforeDestroy() {
    let me = this;
    $("body").off(`click.${me.condId}`);
  }
};
