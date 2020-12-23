<template>
  <div class="CenterData">
    <div class="dataSelect">
      <div class="topArea"></div>
      <div class="selectArea">
        <!-- ~ 1 顶部 -->
        <div class="titleArea">
          <span class="title">数据列表</span>
          <el-popover trigger="hover" placement="bottom">
            <template slot="reference">
              <div class="option">
                <i class="icon el-icon-plus"></i>
                <span class="text">新增</span>
              </div>
            </template>
            <div class="addOption">
              <div class="option" @click="newData()">
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
          <el-popover trigger="hover" placement="bottom">
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
        <MenuTree
          ref="tree"
          class="dataTree"
          :records="records"
          @select="selectFn"
        >
        </MenuTree>
      </div>
    </div>
    <div class="dataStage">
      <div class="topArea"></div>
      <div class="innerStage"></div>
    </div>
    <!-- ~ 3 新数据集 fix全局 -->
    <router-view></router-view>
  </div>
</template>

<script>
import $ from "@/plugins/js/loader";
import Vue from "vue";
import tool from "@/plugins/js/tool";
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
    refreshRecords(ifReturn) {
      let me = this;
      return new Promise((res, rej) => {
        $.ajax({
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.GetDataMenus
        })
          .then(result => {
            let recs = result.data;
            me.records = recs;
            ifReturn && res(result);
          })
          .catch(r => {
            Vue.$message.error("获取数据集菜单失败");
            ifReturn && rej(r);
          });
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
        pIndex = folder ? folder.index : "",
        index = me.getNewIndex(folder),
        c = me.count++;
      let vForm = Vue.extend({
        name: "vForm" + c,
        template: `<el-form ref="form" :key="c" :model="form">
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
            queryFlag: "innerForm",
            c,
            form: {
              pIndex,
              index,
              isFolder: true,
              name: "未命名文件夹" + index
            }
          };
        }
      });

      me.$msgbox({
        title: "新建文件夹",
        message: h(vForm),
        closeOnClickModal: false,
        showCancelButton: true,
        beforeClose(action, ins, done) {
          if (action === "confirm") {
            console.log(["这个ins 的 form？", ins]);
            let refForm = ins.down("innerForm");
            refForm.$refs.form.validate((pass, val) => {
              if (pass) {
                let now = tool.now();
                $.ajax({
                  url: Vue.Api.designBI,
                  method: Vue.Api.designBI.AddOrUpd,
                  data: {
                    table: "data",
                    records: JSON.stringify([
                      {
                        ...refForm.form,
                        createTime: now,
                        editTime: now
                      }
                    ])
                  }
                })
                  .then(r => {
                    done();
                    me.$message.success("新建文件夹成功！");
                    me.refreshRecords();
                  })
                  .catch(r => {
                    me.$message.error("新建文件夹失败");
                  });
              }
            });
          } else {
            done();
          }
        }
      })
        .then(action => {})
        .catch(r => {});
    },
    //~ 3 新data
    newDataBase(folderNode) {
      let me = this,
        folder = folderNode || me.nowFolderNode,
        pIndex = folder ? folder.index : "",
        index = me.getNewIndex(folder);
      me.$router.push({
        name: me.$route.name + "-new",
        query: { index, pIndex }
      });
    },
    newData(folderNode) {
      let me = this;
      me.$store.state.progress = 10;
      me.refreshRecords(true)
        .then(r => {
          me.$store.state.progress = 30;
          let folder = folderNode || me.nowFolderNode,
            pIndex = folder ? folder.index : "",
            index = me.getNewIndex(folder);

          let now = tool.now();
          $.ajax({
            url: Vue.Api.designBI,
            method: Vue.Api.designBI.AddOrUpd,
            data: {
              table: "data",
              records: JSON.stringify([
                {
                  pIndex,
                  index,
                  isFolder: false,
                  createTime: now,
                  editTime: now,
                  name: index,
                  //# 1 表示预备加入
                  readyAdd: true
                }
              ])
            }
          }).then(result => {
            me.$store.state.progress = 60;
            me.$router.push({
              name: "DesignCenter-data-new",
              query: { index, pIndex, id: result.other }
            });
          });
        })
        .catch(result => {
          me.$store.state.progress = 100;
          me.$message.error("新建数据集失败，请重试或检查服务器状态！");
        });
    },
    selectFn(treeNode) {
      let me = this;
      if (treeNode.isFolder) {
        me.nowFolderNode = treeNode;
      } else {
        treeNode.parentNode && (me.nowFolderNode = treeNode.parentNode);
        me.nowFileNode = treeNode;
      }
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
