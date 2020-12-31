<template>
  <div class="ItemEdit">
    <div class="headBar">
      <div class="tabWrap">
        <div class="tabs">
          <Scrollbar>
            <!-- ~ 1 tab循环 首 -->
            <template v-for="ins in theInstances">
              <a :key="ins.instanceCode" class="oneTab" @click="changeIns(ins)">
                <span class="tabTitle">{{ ins.name }}</span>
              </a>
            </template>
          </Scrollbar>
        </div>
        <div class="addNewItemBtn"></div>
      </div>

      <div class="fill"></div>

      <div class="operBtns">
        <div class="item">
          <i class="el-icon-caret-left"></i>
          <span class="text">撤销</span>
        </div>

        <div class="item">
          <span class="text">还原</span>
          <i class="el-icon-caret-right"></i>
        </div>

        <div class="item back" @click="goBackEdit">
          <i class="el-icon-caret-right"></i>
          <span class="text">返回仪表盘</span>
        </div>
      </div>
    </div>

    <div class="editBody">
      <!-- ~ 2 tab循环 体 -->
      <template v-for="ins in theInstances">
        <div
          v-show="nowIns && nowIns.instanceCode === ins.instanceCode"
          v-if="sumData"
          :key="ins.instanceCode"
          class="oneTabBody"
        >
          <!-- ~ 3 内部 -->
          <!-- ~~ 1 维度指标 -->
          <div class="dimensionArea">
            <!-- # 1 表信息 切换 -->
            <div class="pre fileName">
              <span>{{ sumData.baseData.name }}</span>
              <i class="icon el-icon-document-copy"></i>
            </div>
            <!-- # 2 字段搜索 -->
            <div class="pre fileName">
              <el-input
                placeholder="搜索字段"
                prefix-icon="el-icon-search"
                v-model="queryDim"
              ></el-input>
              <i class="icon el-icon-document-copy"></i>
            </div>
            <!-- # 3 维度 -->
            <div class="dimenArea">
              <div class="title">维度</div>
              <ScrollBar class="body">
                <!-- 【update】拖拽 -->
                <DimTypeTag
                  v-for="dim in dimAndIndex.Dims"
                  :key="dim.key"
                  :type="dim.type"
                  :name="dim.key"
                ></DimTypeTag>
              </ScrollBar>
            </div>
            <!-- # 4 指标 -->
            <div class="indexArea">
              <div class="title">指标</div>
              <ScrollBar class="body">
                <!-- 【update】拖拽 -->
                <DimTypeTag
                  v-for="dim in dimAndIndex.Indices"
                  :key="dim.key"
                  :type="dim.type"
                  :name="dim.key"
                ></DimTypeTag>
              </ScrollBar>
            </div>
          </div>
          <!-- ~~ 2 类型属性样式 -->
          <div class="typeMakeArea">
            <!-- # 1 标题 -->
            <div class="nameArea">
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
            </div>
            <!-- # 2 图表类型 -->
            <div class="typeArea">
              <div class="title">图表类型</div>
              <!-- update -->
              <div class="selectArea"></div>
              <div class="desp"></div>
            </div>
            <!-- # 3 属性样式 -->
            <el-tabs class="cssArea">
              <el-tab-pane label="表格属性"></el-tab-pane>
              <el-tab-pane label="组件样式"></el-tab-pane>
            </el-tabs>
            <!-- # 4 过滤 -->
            <div class="filterArea">
              <div class="title">结果过滤器</div>
              <div class="filters"></div>
            </div>
          </div>
          <!-- ~~ 3 拖拽xy结果视图 -->
          <div class="visualArea">
            <!-- # 1 xy -->
            <div class="dropArea">
              <div class="oneDim">
                <div class="dimType">行维度</div>
                <div class="dimsHere">
                  <span class="noTip">请拖入左侧字段</span>
                </div>
              </div>
            </div>
            <!-- # 2 结果 -->
            <div class="visualStage">
              <!-- ~~ 1 chart -->
              <div class="chartArea">
                <!-- <AoaChart
                ref="chart"
                v-if="SummaryData"
                :SummaryData="SummaryData"
                :Dims="Dims"
                :Indices="Indices"
              ></AoaChart> -->
              </div>
              <div class="bottom">
                <el-checkbox v-model="checkAllData">查看所有数据</el-checkbox>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "ItemEdit",
  props: {
    addInstances: {
      type: Array,
      required: true
    },
    EditNode: {
      type: Object,
      required: true
    },
    linkDatas: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      canMount: {},
      nowIns: null,
      //【update】分别放入 容器
      //# 1 小字段
      queryDim: "",
      checkName: true,
      tempName: "",
      checkAllData: false
    };
  },
  computed: {
    theInstances() {
      return this.addInstances.filter(ins => {
        return !ins.isRoot;
      });
    },
    sumData() {
      if (this.nowIns) {
        console.log(["查看sumData", this, this.nowIns.linkDataId]);
        return this.linkDatas[this.nowIns.linkDataId];
      } else {
        return null;
      }
    },
    //【update】改变的？
    dimAndIndex() {
      let me = this,
        sumData = me.sumData,
        Dims = [],
        Indices = [];
      if (sumData) {
        sumData.dimensions.forEach(dim => {
          if (dim.type === "number") {
            Indices.push(dim);
          } else if (["date", "string"].indexOf(dim.type) > -1) {
            Dims.push(dim);
          }
        });
      }
      return { Dims, Indices };
    }
  },
  methods: {
    changeIns(ins) {
      let me = this;
      //~ 1 可mount
      //me.canMount[ins.instanceCode] = true;
      //~ 2 新旧切换
      me.$emit("changeIns", ins, me.nowIns);
      me.nowIns = ins;
    },
    goBackEdit() {
      let me = this;
      me.EditNode.goBackEdit();
    }
  }
};
</script>
