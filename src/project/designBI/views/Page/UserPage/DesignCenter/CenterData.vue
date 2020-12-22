<template>
  <div class="CenterData">
    <div class="dataSelect">
      <div class="topArea"></div>
      <div class="selectArea">
        <!-- ~ 1 顶部 -->
        <div class="titleArea">
          <span class="title">数据列表</span>
          <el-popover placement="bottom">
            <template slot="reference">
              <div class="option">
                <i class="icon el-icon-plus"></i>
                <span class="text">新增</span>
              </div>
            </template>
            <div class="addOption">
              <div class="option">
                <i class="icon"></i>
                <span class="text">新增数据集</span>
              </div>
              <div class="option">
                <i class="icon"></i>
                <span class="text">新建文件夹</span>
              </div>
            </div>
          </el-popover>
        </div>
        <!-- ~ 2 过滤 -->
        <div class="filterArea">
          <el-input placeholder="搜索文件夹和数据集">
            <i slot="prefix" class="el-icon-search"></i>
          </el-input>
          <el-popover placement="bottom">
            <template slot="reference">
              <div class="option">
                <i class="icon el-icon-s-operation"></i>
              </div>
            </template>
            <div class="addOption">
              <div class="option">
                <i class="icon"></i>
                <span class="text">按时间排序</span>
              </div>
              <div class="option">
                <i class="icon"></i>
                <span class="text">按字母排序</span>
              </div>
            </div>
          </el-popover>
        </div>
        <!-- ~ 3 树结构 -->
        <MenuTree class="dataTree" :records="records"> </MenuTree>
      </div>
    </div>
    <div class="dataStage">
      <div class="topArea"></div>
      <div class="innerStage"></div>
    </div>
  </div>
</template>

<script>
import $ from "@/plugins/js/loader";
import Vue from "vue";
export default {
  name: "CenterData",
  data() {
    return {
      records: []
    };
  },
  methods: {
    //~ 1 简单替换即可。
    refreshRecords() {
      let me = this;
      $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetDataMenus
      })
        .then(result => {
          let recs = result.data;
          me.records = recs;
        })
        .catch(r => {
          Vue.$message.error("获取数据集菜单失败");
        });
    }
  },
  created() {
    let me = this;
    me.refreshRecords();
  }
};
</script>
