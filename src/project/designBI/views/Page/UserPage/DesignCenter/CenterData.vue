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
              <div class="option" @click="newFolder()">
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
        <MenuTree ref="tree" class="dataTree" :records="records"> </MenuTree>
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
      records: [],
      count: 0,
      tree: null,
      //选择信息
      nowFolderNode: null,
      nowFileNode: null
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
    },
    getNewIndex(folderNode) {
      let me = this,
        folder = folderNode || me.nowFolderNode,
        fIndex = folder ? folder.index : "",
        nextIndex = folder
          ? folder.getMaxItemIndex() + 1
          : me.tree.firstRecs.length + 1,
        totIndex = fIndex ? `${fIndex}-${nextIndex}` : nextIndex;
      return totIndex;
    },
    //~ 2 新文件夹
    newFolder(folderNode) {
      let me = this,
        h = me.$createElement,
        folder = folderNode || me.nowFolderNode,
        fIndex = folder ? folder.index : "",
        index = me.getNewIndex(folder),
        c = me.count++;
      let vForm = Vue.extend({
        name: "vForm" + c,
        template: `<el-form :key="c" :model="form">
            <el-form-item
              prop="name"
              label="文件夹名"
              :rules="{ required: true }"
            >
              <el-input v-model="form.name"></el-input>
            </el-form-item>
          </el-form>`,
        data() {
          return {
            c,
            form: {
              folder: fIndex,
              index,
              name: "未命名文件夹" + index
            }
          };
        }
      });

      me.$msgbox({
        title: "新建文件夹",
        message: h(vForm),
        beforeClose(action, ins, done) {
          if (action === "confirm") {
            console.log(["这个ins 的 form？", ins]);
            let refForm = ins.$slots.default;
            refForm.validate((pass, val) => {
              if (pass) {
                //

                console.log(["form正确", ins]);
                done();
              }
            });
          } else {
            done();
          }
        }
      })
        .then(action => {})
        .catch(r => {});
    }
  },
  created() {
    let me = this;
    me.refreshRecords();
  },
  mounted() {
    let me = this;
    me.tree = me.$refs.tree;
  }
};
</script>
