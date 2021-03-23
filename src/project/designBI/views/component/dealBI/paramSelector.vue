<template>
  <div class="paramSelector">
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
        <el-button v-if="nowDataRec" @click="reSelectRecFn" type="primary"
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
      <div v-if="!nowDataRec" class="selParamRec">
        <IndexTree
          ref="tree"
          class="dataTree"
          :records="filterRecs"
          valid="exist"
          @node-click="nodeClickFn"
        >
        </IndexTree>
      </div>

      <div v-else class="paramLinkArea">
        <div class="areaTitle">
          {{
            nowDataRec.dataSubType == "procedure"
              ? "存储过程选参"
              : "自定义SQL选参"
          }}
        </div>

        <div class="paramSel">
          <div class="title">参数列表</div>
          <div class="body">
            <template v-if="isProcedure">
              <el-table :data="paramList">
                <el-table-column>
                  <template slot-scope="scope">
                    <el-tag
                      effect="dark"
                      :type="
                        scope.row.relatedList.length ? 'success' : 'warning'
                      "
                      ><i
                        :class="
                          scope.row.relatedList.length
                            ? 'el-icon-circle-check'
                            : 'el-icon-circle-close'
                        "
                      ></i
                    ></el-tag>

                    <span class="order">{{ scope.$index + 1 }}、</span>

                    <span class="matchText">{{ scope.row.matchStr }}</span>
                  </template>
                </el-table-column>

                <el-table-column>
                  <template slot-scope="scope">
                    <el-button
                      v-if="!scope.row.relatedList.length"
                      type="success"
                      @click="addRelatedListFn(scope.row)"
                      >选择关联</el-button
                    >
                    <DimTypeTag
                      v-else
                      v-for="dim in scope.row.relatedList"
                      :key="dim.$id"
                      :type="dim.type"
                      :name="dim.chineseName || dim.key"
                    ></DimTypeTag>
                  </template>
                </el-table-column>
              </el-table>
            </template>

            <template v-else-if="isCustom">
              <div></div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import dataSelectorMixin from "./dataSelectorMixin";
export default {
  name: "paramSelector",
  mixins: [dataSelectorMixin],
  data() {
    return {};
  },
  computed: {
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
        rec = tool.parseObject(me.nowFileRec);
        rec.paramList = rec.paramList.map(param => {
          //【update】目前只关联一个，但作为数组处理
          param.relatedList = [];
          return param;
        });
      }

      return rec;
    },
    //# 2 参数列表
    paramList() {
      let me = this,
        rec = me.nowDataRec;
      return rec ? rec.paramList : [];
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
    },
    //# 4 添加一个关联
    addRelatedListFn(theRec) {
      let me = this;
    }
  }
};
</script>
