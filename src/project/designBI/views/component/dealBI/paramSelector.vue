<template>
  <div class="paramSelector" v-loading="confirmLoading">
    <div class="TipArea">
      <div class="leftPart">
        <div class="boardTip">
          <span class="pre">所选参数数据：</span>
          <span class="el-icon-s-data"></span>
          <span class="text">{{
            nowDataRec ? nowDataRec.name : "未选择"
          }}</span>
          <span v-if="nowDataRec">{{ nowDataRec.dataSubType }}</span>
        </div>
      </div>

      <div class="fill"></div>

      <div class="rightPart">
        <el-button v-if="nowDataRec" @click="reSelectRecFn" type="info"
          >重选参数数据</el-button
        >
      </div>
    </div>
    <div
      class="selectArea"
      :style="{
        height: `calc(100% - ${rowCount * 21 + 34}px)`
      }"
    >
      <!-- =1= 选择有参数的表 -->
      <div v-show="!nowDataRec" class="selParamRec">
        <IndexTree
          ref="tree"
          class="dataTree"
          :records="filterRecs"
          valid="exist"
          @node-click="nodeClickFn"
        >
        </IndexTree>
      </div>

      <div v-show="nowDataRec" class="paramLinkArea">
        <div class="areaTitle">
          {{
            nowDataRec && nowDataRec.dataSubType == "procedure"
              ? "存储过程选参"
              : "自定义SQL选参"
          }}
        </div>

        <div class="sourceEffectType">
          <span class="pre">参数来源相互作用类型：</span>

          <el-radio-group v-model="sourceEffect">
            <el-radio label="comprise">共同作用</el-radio>
            <el-radio label="divid">单独作用</el-radio>
          </el-radio-group>
        </div>

        <div class="sourceSel">
          <div class="titleArea">
            <span class="text">选择参数数据来源：</span>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-circle-plus"
              @click="addNewParamSourceFn"
              >添加来源</el-button
            >
          </div>

          <div class="body">
            <el-table :data="paramSources">
              <el-table-column label="来源类型">
                <template slot-scope="scope">
                  <span class="order">{{ scope.$index + 1 }}、</span>

                  <span class="type">{{ scope.row.type }}</span>
                </template>
              </el-table-column>

              <el-table-column label="来源控件名">
                <template slot-scope="scope">
                  <span class="name">{{ scope.row.insName }}</span>
                </template>
              </el-table-column>

              <el-table-column label="条件匹配值">
                <template slot-scope="scope">
                  <el-input
                    v-if="scope.row.type == 'condition'"
                    class="condKey"
                    v-model="scope.row.condKey"
                  ></el-input>
                </template>
              </el-table-column>

              <el-table-column>
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    icon="el-icon-delete"
                    circle
                    type="danger"
                    @click="removeOneSource(scope.row)"
                  ></el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-dialog
            :append-to-body="true"
            :visible.sync="dimDialogShow"
            :key="dimDialogKey"
            :destroy-on-close="true"
            :before-close="dimDialogClose"
            title="参数关联选择"
          >
            <BoardInsPropSelector
              ref="dimSelector"
              :stepRange="[2]"
              :start="2"
              :preBoard="EditNode.nowBoard.recordData"
              :itemListFilter="itemListFilter"
              @item-select="dimDialogItemSel"
            ></BoardInsPropSelector>

            <span class="foot">
              <el-button type="primary" size="small" @click="dimDialogConfirm"
                >确定</el-button
              >
            </span>
          </el-dialog>
        </div>

        <div class="paramSel">
          <div class="title">参数列表</div>
          <div class="body">
            <el-table :data="paramList">
              <el-table-column label="匹配字符串">
                <template slot-scope="scope">
                  <span class="order">{{ scope.$index + 1 }}、</span>

                  <span class="matchText">{{
                    scope.row.matchStr || `\{ ${scope.row.matchKey} \}`
                  }}</span>
                </template>
              </el-table-column>

              <el-table-column label="匹配关键字">
                <template slot-scope="scope">
                  <span class="matchKey">{{
                    (scope.row.matchStr && scope.row.matchStr.substr(1)) ||
                      scope.row.matchKey
                  }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import dataSelectorMixin from "./dataSelectorMixin";
import LoginUser from "@designBI/views/mixins/LoginUser";
import BoardInsPropSelector from "@designBI/views/component/dealBI/BoardInsPropSelector.vue";

import { singleConds } from "@designBI/store";

export default {
  name: "paramSelector",
  mixins: [dataSelectorMixin, LoginUser],
  components: {
    BoardInsPropSelector
  },
  props: {
    Instance: Object,
    EditNode: Object
  },
  data() {
    return {
      queryFlag: "paramSelector",
      confirmLoading: false,

      paramSources: [],

      sourceEffect: "comprise",

      dimDialogShow: false,
      dimDialogKey: tool.uniqueStr(),
      dimDialogItem: null
    };
  },
  computed: {
    singleConds() {
      return singleConds;
    },
    //# 1 过滤后的 文件夹+ 参数数据
    filterRecs() {
      let me = this;
      return me.records.filter(rec => {
        return rec.isFolder || rec.paramList;
      });
    },
    nowDataRec() {
      let me = this,
        rec = null;
      if (me.nowFileRec) {
        rec = tool.apply({}, me.nowFileRec);
        rec.paramList = tool.isString(rec.paramList)
          ? JSON.parse(rec.paramList)
          : rec.paramList;
      }

      return rec;
    },
    dataId() {
      return this.nowDataRec.id;
    },
    //# 2 参数列表
    paramList() {
      let me = this,
        rec = me.nowDataRec;
      return rec ? rec.paramList : [];
    },
    //# 3 是否ok
    selectResult() {
      let me = this,
        listOK = true,
        result = null;
      if (!me.paramSources.length) {
        return result;
      }

      tool.each(me.paramSources, param => {
        if (param.type == "condition" && !param.condKey) {
          listOK = false;
          return false;
        }
      });

      if (listOK) {
        result = {
          linkDataId: me.dataId,
          paramSources: me.paramSources,
          sourceEffect: me.sourceEffect
        };
      }

      return result;
    },
    rowCount() {
      let me = this,
        tot = 0;
      if (me.nowDataRec) {
        tot++;
      }
      return tot;
    },
    isProcedure() {
      return this.nowDataRec
        ? this.nowDataRec.dataSubType == "procedure"
        : false;
    },
    isCustom() {
      return this.nowDataRec ? this.nowDataRec.dataSubType == "custom" : false;
    }
  },
  methods: {
    //~ 2 点击演算
    nodeClickFn(rec, nodeData, node) {
      let me = this;
      return new Promise((res, rej) => {
        //~ 1 有子集
        if (rec.isFolder) {
          me.nowFolderRec = rec;
          res(false);
        } else {
          me.nowFileRec = rec;
          if (rec.$parent) {
            me.nowFolderRec = rec.$parent;
          } else {
            //~ 2 可能是根的 file选中，那么就无选中父节点了。
            me.nowFolderRec = null;
          }
        }
      });
    },
    //# 3 重选
    reSelectRecFn() {
      let me = this;
      me.nowFileRec = null;
    },
    itemListFilter(itemList) {
      let me = this;
      return itemList.filter(item => {
        return (
          [10, 11, 12].indexOf(item.useType) > -1 || me.singleConds[item.xtype]
        );
      });
    },
    //# 4-1 特殊item选择
    dimDialogItemSel(itemData) {
      let me = this;
      me.dimDialogItem = itemData;
    },
    //# 4-4 关闭初始，仅清除
    dimDialogClose(done) {
      let me = this;

      me.dimDialogItem = null;
      //me.dimDialogShow = false;
      done();
    },

    //@ 2 新增一个新来源
    addNewParamSourceFn() {
      let me = this;
      me.dimDialogKey = tool.uniqueStr();
      me.dimDialogShow = true;
    },
    //@ 3 来源版本
    dimDialogConfirm() {
      let me = this,
        addSource = null,
        selItem = me.dimDialogItem;

      if (!selItem) {
        me.$message.warning("尚未选择来源子控件");
        return;
      }

      //=1= 第一种 过滤组件
      if (selItem.useType == 20) {
        addSource = {
          $id: tool.uniqueStr(),
          type: "condition",
          insCode: selItem.instanceCode,
          insName: selItem.name,
          condKey: ""
        };
      } else {
        //=2= 第二种 图表控件
        addSource = {
          $id: tool.uniqueStr(),
          type: "item",
          insCode: selItem.instanceCode,
          insName: selItem.name,
          dataId: me.dataId
        };
      }
      let already = me.paramSources.find(p => {
        return p.insCode == addSource.insCode;
      });
      if (already) {
        me.$message.warning("已经添加该子控件作为来源，请不要重复添加！");
        return;
      }

      me.paramSources.push(addSource);

      me.dimDialogShow = false;
    },
    //@ 4 移除一个来源
    removeOneSource(theSource) {
      let me = this,
        at = me.paramSources.indexOf(theSource);
      if (at > -1) {
        me.paramSources.splice(at, 1);
      }
    }
  },
  created() {
    let me = this,
      ins = me.Instance;
    if (me.isLoadByHand) {
      me.refreshRecords().then(result => {
        me.$nextTick(() => {
          let rec = me.filterRecs.find(r => {
            return r.id == ins.instanceVue.dataId;
          });
          me.nodeClickFn(rec);

          //=2= 值加入
          me.sourceEffect = ins.recordData.sourceEffect;
          me.paramSources = tool.clone(ins.recordData.paramSources || []);
        });
      });
    }
  }
};
</script>
