<template>
  <div class="oneTabBody">
    <!-- ~ 3 内部 -->
    <!-- ~~ 1 维度指标 -->
    <div class="dimensionArea">
      <!-- # + 1 控件名称 -->
      <div class="controlName">
        <div class="pre">控件名称：</div>
        <div class="name">
          <el-input
            size="small"
            v-model="controlName"
            @change="controlNameCg"
          ></el-input>
        </div>
      </div>

      <!-- # 1 表信息 切换 -->
      <div class="fileName">
        <div class="tableName">
          <div class="line1">
            <span class="pre">数据类型：</span>
            <span class="type" :class="sourceType">{{ sourceType }}</span>
          </div>
          <div class="theName">
            <span class="pre">表名：</span>
            <span class="text">{{ sourceTableName }}</span>
          </div>
        </div>
        <div class="cgBtnArea">
          <el-button
            v-if="_joinTables && _joinTables.length"
            type="primary"
            icon="el-icon-office-building"
            size="mini"
            title="修改关联数据配置"
            @click="configDetail"
          ></el-button>
          <el-button
            v-else
            type="primary"
            icon="el-icon-s-data"
            size="mini"
            title="修改数据源"
            @click="configData"
          ></el-button>
        </div>
      </div>
      <!-- # 2 字段搜索 -->
      <!-- <div class="searchDim">
        <el-input
          placeholder="搜索字段"
          prefix-icon="el-icon-search"
          v-model="queryDim"
        ></el-input>
        <i class="icon el-icon-plus"></i>
      </div> -->
      <!-- # 3 维度 -->
      <div class="dimenArea">
        <div class="title">维度</div>
        <Scrollbar class="body">
          <!-- 【update】拖拽 -->
          <CandyDimTag
            class="edit"
            v-for="dim in dimAndIndex.Dims"
            :key="dim.$id"
            :Dim="dim"
            dimXtype="div"
            :candyMaster="candyMaster"
          ></CandyDimTag>
        </Scrollbar>
      </div>
      <!-- # 4 指标 -->
      <div class="indexArea">
        <div class="title">指标</div>
        <Scrollbar class="body">
          <!-- 【update】拖拽 -->
          <CandyDimTag
            class="edit"
            v-for="dim in dimAndIndex.Indices"
            :key="dim.$id"
            :Dim="dim"
            dimXtype="div"
            :candyMaster="candyMaster"
          ></CandyDimTag>
        </Scrollbar>
      </div>
    </div>
    <!-- ~~ 2 类型属性样式 -->
    <div class="typeMakeArea">
      <!-- # 1 标题 -->
      <!-- <div class="nameArea">
        <div class="title">
          <span class="pre">标题</span>
          <span class="nameOk">
            显示
            <el-checkbox v-model="checkName"></el-checkbox>
          </span>
        </div>
        <div class="name">
          <el-input v-model="tempName"></el-input>
        </div>
      </div> -->
      <!-- # 2 图表类型 -->
      <div class="typeArea">
        <div class="title">图表类型</div>
        <!-- update -->
        <div class="selectArea">
          <template v-for="type in selectTypes">
            <div
              :key="type.type"
              class="typeWrap"
              :class="{
                select: type === selectType,
                hover: type === hoverType
              }"
              @mouseenter="mouseenterFn(type)"
              @mouseleave="mouseleaveFn(type)"
              @click="selectTypeFn(type)"
            >
              <i :class="['icon', 'bi', type.icon]"></i>
            </div>
          </template>
        </div>
        <div class="desp">{{ theDesp }}</div>
        <div class="nowType">当前类型：{{ selectType && selectType.name }}</div>
      </div>
      <!-- # 3 属性样式 -->
      <!-- <el-tabs class="cssArea">
        <el-tab-pane label="表格属性"></el-tab-pane>
        <el-tab-pane label="组件样式"></el-tab-pane>
      </el-tabs> -->
      <!-- # 4 过滤 -->
      <!-- <div class="filterArea">
        <div class="title">结果过滤器</div>
        <div class="filters"></div>
      </div> -->
      <!-- # 5 自定义名 -->
      <div class="cusDimNameArea" v-if="itemCusDimNames">
        <div class="title">自定义名</div>

        <div class="tableWrap">
          <el-table
            :data="sumData.dimension"
            border
            style="width: 100%"
            height="100%"
          >
            <el-table-column label="自定义名" prop="chineseName">
              <template slot-scope="scope">
                <el-input
                  size="small"
                  @change="cusNameCgFn(scope.row.$id)"
                  v-model="itemCusDimNames[scope.row.$id]"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column label="原名称" prop="type">
              <template slot-scope="scope">
                <DimTypeTag
                  :type="scope.row.type"
                  :name="scope.row.chineseName || scope.row.key"
                >
                </DimTypeTag>
              </template>
            </el-table-column>
            <el-table-column label="字段名" prop="key"></el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <!-- ~~ 3 拖拽xy结果视图 -->
    <div class="visualArea">
      <!-- # 1 xy -->
      <div class="dropArea">
        <div class="oneDim">
          <div class="dimType">行维度</div>
          <div class="dimsHere">
            <CoatingDim
              style="height: 30px;"
              :candyMaster="candyMaster"
              ref="Dims"
              :receiveCheck="receiveCheckDims"
            >
              <span class="noTip">请拖入左侧维度</span>
            </CoatingDim>
          </div>
        </div>

        <div class="oneDim">
          <div class="dimType">列指标</div>
          <div class="dimsHere">
            <CoatingDim
              style="height: 30px;"
              :candyMaster="candyMaster"
              ref="Indices"
              :receiveCheck="receiveCheckIndices"
            >
              <span class="noTip">请拖入左侧指标</span>
            </CoatingDim>
          </div>
        </div>
      </div>
      <!-- # 2 结果 -->
      <div class="visualStage">
        <!-- ~~ 1 chart -->
        <div class="chartArea">
          <BIBase
            ref="chart"
            :Entity="Instance"
            :EditNode="EditNode"
            :nowBoard="nowBoard"
            v-if="isShow && sumData"
          ></BIBase>
        </div>
        <!-- <div class="bottom">
          <el-checkbox v-model="checkAllData">查看所有数据</el-checkbox>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import { CandyMaster } from "@designBI/views/component/dropCandy";
import Vue from "vue";
const CandyMasterCtor = Vue.extend(CandyMaster);
import { Instance } from "@designBI/views/mixins/Entity";

import CandyDimTag from "@designBI/views/component/dropCandy/CandyDimTag";
import CoatingDim from "@designBI/views/component/dropCandy/CoatingDim";
import tool from "@/plugins/js/tool";

const selectTypes = [
  //~ 1 table表
  {
    type: "table-mingxi",
    icon: "bi-table-mingxi",
    name: "明细表",
    desp: ""
  },
  {
    type: "table",
    icon: "bi-table",
    name: "分组表",
    desp: ""
  },
  // {
  //   type: "table-cross",
  //   icon: "bi-table-cross",
  //   name: "交叉表",
  //   desp: ""
  // },
  //~ 2 柱状图
  {
    type: "bar-divid",
    icon: "bi-bar-divid",
    name: "分区柱状图",
    desp: "建议至少1个维度，至少1个指标"
  },
  {
    type: "bar-stack",
    icon: "bi-bar-stack",
    name: "堆积柱形图",
    desp: "建议至少1个维度，至少2个指标"
  },
  {
    type: "bar",
    icon: "bi-bar",
    name: "多系列柱形图",
    desp: "建议至少1个维度，至少2个指标"
  },
  {
    type: "bar-contrast",
    icon: "bi-bardiagram",
    name: "对比柱状图",
    desp: "建议1个维度，2个指标"
  },
  {
    type: "bar-pubu",
    icon: "bi-pubutu",
    name: "瀑布图",
    desp: "建议至少1个维度，2个指标"
  },
  //~ 3 折线图
  {
    type: "line-divid",
    icon: "bi-line-divid",
    name: "分区折线图",
    desp: "建议至少1个维度，至少1个指标"
  },
  {
    type: "line",
    icon: "bi-zhexiantu",
    name: "多系列折线图",
    desp: "建议至少1个维度，至少2个指标"
  },
  {
    type: "line-radio",
    icon: "bi-leidatu",
    name: "折线雷达图",
    desp: "建议至少1个维度，至少1个指标"
  },
  {
    type: "line-range",
    icon: "bi-range",
    name: "范围面积图",
    desp: "建议至少1个维度，2个指标"
  },
  //~ 4 散点
  {
    type: "scatter",
    icon: "bi-sandian",
    name: "散点图",
    desp: "建议至少1个维度，至少1个指标"
  },
  //~ 5 饼图
  {
    type: "pie",
    icon: "bi-pie",
    name: "饼图",
    desp: "建议1个维度，1个指标"
  },
  {
    type: "pie-meigui",
    icon: "bi-meiguitu",
    name: "玫瑰图",
    desp: "建议1个维度，2个指标"
  },
  //~ 6 漏斗
  {
    type: "funnel",
    icon: "bi-loudoutu",
    name: "漏斗图",
    desp: "建议1个维度，1个指标"
  },
  //~ 7 仪表盘
  {
    type: "dashboard",
    icon: "bi-yibiaopan",
    name: "仪表盘",
    desp: "建议0个维度，1个指标"
  }
];

export default {
  name: "OneItemEdit",
  components: {
    CoatingDim,
    CandyDimTag
  },
  mixins: [Instance],
  props: {
    sumData: {
      type: Object
    },
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      //# 1 小字段
      queryDim: "",
      checkName: true,
      controlName: "",
      checkAllData: false,
      //# 2 拖拽管理器
      candyMaster: null,
      //# 3 选择类型
      hoverType: null,
      selectType: null,

      //# 4 自定义名加入，辅助v
      itemCusDimNames: null //{}
    };
  },
  computed: {
    selectTypes() {
      return selectTypes;
    },
    trueDimensions() {
      let me = this,
        sumData = me.sumData,
        cusNames = me._cusDimNames,
        r = [];

      if (sumData && sumData.dimension) {
        sumData.dimension.forEach(_dim => {
          let dim = tool.apply({}, _dim);
          //+ 6 自定义名
          if (cusNames && cusNames[dim.$id]) {
            dim.chineseName = cusNames[dim.$id];
          }
          r.push(dim);
        });
      }
      return r;
    },
    //【update】改变的？
    dimAndIndex() {
      let me = this,
        trueDims = me.trueDimensions,
        Dims = [],
        Indices = [];
      if (trueDims.length) {
        trueDims.forEach(dim => {
          if (dim.type === "number") {
            Indices.push(dim);
          } else if (["date", "string"].indexOf(dim.type) > -1) {
            Dims.push(dim);
          }
        });
      }
      return { Dims, Indices };
    },
    //# 3 表有关
    Dims() {
      let me = this,
        result = [],
        dimsR = me.$refs.Dims;
      if (dimsR) {
        result = dimsR.candies;
      }
      return result;
    },
    Indices() {
      let me = this,
        result = [],
        idxR = me.$refs.Indices;
      if (idxR) {
        result = idxR.candies;
      }
      return result;
    },
    theDesp() {
      let me = this,
        theType = me.hoverType || me.selectType;
      if (!theType) {
        return "";
      }
      return theType.name + (theType.desp ? `:${theType.desp}` : "");
    },
    DetailData() {
      let me = this,
        edit = me.EditNode,
        id = me.dataId,
        rec = edit.linkDatas[id];
      return rec;
    },
    //+ 1 类型提示
    sourceType() {
      let me = this,
        d = me.DetailData,
        r = "";
      if (d) {
        r = d.dataType == "sql" ? d.dataType : d.fileType || d.dataType;
      }
      return r;
    },
    sourceTableName() {
      let me = this,
        d = me.DetailData,
        r = "",
        type = me.sourceType;
      if (d) {
        if (type == "sql") {
          r = `[${d.sourceName}].[${d.dataBaseName}].dbo.[${d.tableName}]`;
        } else {
          r = d.fileName;
        }
      }
      return r;
    }
  },
  methods: {
    getPureDim(d) {
      let d2 = tool.apply({}, d);
      delete d2.parentCoating;
      return d2;
    },
    // 初始化用？
    getPropDim(d) {
      let at = this.trueDimensions.find(a => {
          return a.$id === d.$id;
        }),
        r = {};
      if (at) {
        r = tool.apply({}, at);
      }
      return r;
    },
    initDims() {
      //# 2 来自ins的数据
      let me = this;
      let cfg = me.Instance.getData("config_more");
      //console.log(["查看如何添加到candy"]);
      if (cfg) {
        cfg.Dims &&
          (me.$refs.Dims.candies = cfg.Dims.map(d => {
            let d2 = me.getPropDim(d);
            d2.parentCoating = me.$refs.Dims;
            return d2;
          }));
        cfg.Indices &&
          (me.$refs.Indices.candies = cfg.Indices.map(d => {
            let d2 = me.getPropDim(d);
            d2.parentCoating = me.$refs.Indices;
            return d2;
          }));
      }
    },
    //@ 1 选择BI类型
    selectTypeFn(type) {
      let me = this;
      me.selectType = type;
      me.Instance.setData({
        chartType: type.type
      });
      me.Instance.save();
    },
    mouseenterFn(type) {
      this.hoverType = type;
    },
    mouseleaveFn() {
      this.hoverType = null;
    },
    getType(typeStr) {
      return this.selectTypes.find(a => {
        return a.type === typeStr;
      });
    },
    //~~ 2 看是否可加入
    receiveCheckDims(candy) {
      let me = this,
        cDim = candy.Dim;
      return ["number", "date", "string"].indexOf(cDim.type) > -1;
    },
    receiveCheckIndices(candy) {
      let me = this,
        cDim = candy.Dim;
      return ["number"].indexOf(cDim.type) > -1;
    },
    controlNameCg(newVal) {
      let me = this,
        ins = me.Instance;
      ins.setData({
        name: newVal
      });
      ins.save();
    },
    //++ 3 自定义名改变函数
    cusNameCgFn(dimId) {
      let me = this;
      //=1= ins的 config_more中改变，然后导致输入d i改变
      me.Instance.setData({
        config_more: {
          CusDimNames: {
            [dimId]: me.itemCusDimNames[dimId]
          }
        }
      });

      me.$nextTick(() => {
        //=2= 当前所选的看有没得，有则改变
        me.candyMaster.coatings.forEach(ct => {
          let cs = ct.candies.slice();
          cs.forEach(c => {
            if (c.$id == dimId) {
              ct.candyLeave({ Dim: c });
              let trueC = me.trueDimensions.find(dim => {
                return dim.$id == dimId;
              });
              ct.candyAddSimple({ Dim: trueC });
            }
          });
        });

        //=3= 同步一下
        console.log(["同步检查"]);
        me.syncDimIndexFn();
      });
    },
    syncDimIndexFn() {
      let me = this;
      me.Instance.setData({
        config_more: {
          Dims: me.Dims.map(me.getPureDim),
          Indices: me.Indices.map(me.getPureDim)
        }
      });
      me.Instance.save();
      me.$refs.chart.refreshSource();
    }
  },
  created() {
    let me = this;
    me.candyMaster = new CandyMasterCtor();
    //# 1 只有可能是
    me.candyMaster.$on("dropEnd", () => {
      //save一次
      //console.log(["赋值保存一次", me.candyMaster]);
      me.syncDimIndexFn();
    });
  },
  mounted() {
    let me = this;
    me.controlName = me.name;
  },
  watch: {
    "sumData.dimension": function(newVal) {
      let me = this;
      if (newVal && !me.$initDims) {
        me.$initDims = true;
        me.initDims();

        //+ 4 自定义名 初始
        let cusDimNames = {},
          _cusNames = me._cusDimNames;
        newVal.forEach(dim => {
          cusDimNames[dim.$id] =
            (_cusNames && _cusNames[dim.$id]) || dim.chineseName || dim.key;
        });
        me.itemCusDimNames = cusDimNames;
      }
    },
    // "sumData.name": function(newVal) {
    //   if (!this.$sumData_name && newVal) {
    //     this.$sumData_name = true;
    //     this.tempName = newVal;
    //   }
    // },
    // name(newVal, oldVal) {
    //   if (newVal != oldVal) this.controlName = newVal;
    // },
    "Instance.recordData.chartType": function(val) {
      if (
        !this.selectType ||
        (this.selectType && val !== this.selectType.type)
      ) {
        let theType = this.getType(val);
        this.selectType = theType;
      }
    }
  }
};
</script>
