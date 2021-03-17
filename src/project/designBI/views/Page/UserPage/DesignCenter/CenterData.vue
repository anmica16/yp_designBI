<template>
  <div class="CenterData">
    <div class="dataSelect">
      <div class="topArea"></div>
      <div class="selectArea">
        <!-- ~ 1 顶部 -->
        <div class="titleArea">
          <div class="title">数据列表</div>
          <div class="addOption">
            <el-button
              size="small"
              @click="newFolder()"
              type="primary"
              plain
              icon="el-icon-folder-add"
              >新建文件夹</el-button
            >
            <el-popover ref="newDataRef">
              <el-button
                slot="reference"
                size="small"
                type="primary"
                icon="el-icon-document-add"
                >新增数据集</el-button
              >
              <div class="addOption">
                <el-button
                  class="option"
                  size="small"
                  type="success"
                  icon="el-icon-document-add"
                  @click="newData()"
                  >本地上传</el-button
                >
                <el-button
                  class="option"
                  size="small"
                  type="success"
                  icon="el-icon-document-add"
                  @click="newData(null, true)"
                  >数据库查询</el-button
                >
              </div>
            </el-popover>
          </div>
        </div>
        <!-- ~ 2 过滤 -->
        <!-- <div class="filterArea">
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
        </div> -->
        <!-- ~ 3 树结构 -->
        <IndexTree
          ref="tree"
          class="dataTree"
          :records="records"
          valid="exist"
          @node-click="nodeClickFn"
        >
        </IndexTree>
      </div>
    </div>
    <div class="dataStage">
      <div class="topArea"></div>
      <div class="innerStage">
        <template v-if="!nowFileRec">
          <div class="fileNotSelectTip">
            <div class="back"></div>
            <div class="text">请从左侧选择表</div>
          </div>
        </template>
        <!-- ~ 4 先写在这里 再独立 -->
        <template v-else-if="passDetailData">
          <CheckDataStage
            v-loading="DetailDataLoading"
            :DetailData="passDetailData"
          >
          </CheckDataStage>
        </template>
      </div>
    </div>
    <!-- ~ 3 新数据集 fix全局 -->
    <transition name="PageMove">
      <NewDataPage
        v-if="query"
        :is="query.isSql == 1 ? 'NewSqlDataPage' : 'NewDataPage'"
        :id="query.id"
        :dataType="query.isSql == 1 ? 'sql' : 'local'"
        :pIndex="query.pIndex"
        :index="query.index"
        :likeEdit="likeEdit_newData"
        @back="newDataBackFn"
      ></NewDataPage>
    </transition>
  </div>
</template>

<script>
import $ from "@/plugins/js/loader";
import Vue from "vue";
import tool from "@/plugins/js/tool";
import NewDataPage from "./newData/NewDataPage";
import NewSqlDataPage from "./newSqlData/NewSqlDataPage";
import CheckDataStage from "./newData/CheckDataStage";
import dataSelectorMixin from "@designBI/views/component/dealBI/dataSelectorMixin.js";
import LoginUser from "@designBI/views/mixins/LoginUser";
export default {
  name: "CenterData",
  mixins: [dataSelectorMixin, LoginUser],
  components: {
    NewDataPage,
    CheckDataStage,
    NewSqlDataPage
  },
  data() {
    return {
      count: 0,
      tree: null,

      //~ 2 新建
      likeEdit_newData: true
    };
  },
  computed: {
    query() {
      let query = this.$route.query,
        q = tool.apply({}, query);

      ["pIndex", "isSql"].forEach(check => {
        if (!Object.hasOwnProperty.call(query, check)) {
          q = null;
        }
      });
      return q;
    },
    passDetailData() {
      return this.DetailData
        ? tool.apply({}, this.nowFileRec, this.DetailData)
        : null;
    }
  },
  methods: {
    getNewIndex(folderRec) {
      let me = this,
        folder = folderRec || me.nowFolderRec,
        fIndex = folder ? folder.index : "",
        nextIndex = folder
          ? me.tree.getMaxItemIndex(folder) + 1
          : me.tree.firstRecs.length + 1,
        totIndex = fIndex ? `${fIndex}-${nextIndex}` : nextIndex;
      return totIndex;
    },
    //~ 2 新文件夹
    newFolder(folderRec) {
      let me = this,
        h = me.$createElement,
        folder = folderRec || me.nowFolderRec,
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
              //index, //不需要前端算了
              isFolder: true,
              name: "未命名文件夹" + index,
              exist: true
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
                let now = tool.now(true);
                $.ajax({
                  url: Vue.Api.designBI,
                  method: Vue.Api.designBI.AddNewTreeItem,
                  data: {
                    table: "data",
                    records: JSON.stringify([
                      {
                        ...refForm.form,
                        createTime: now,
                        editTime: now,
                        createOperId: me.loginUser.userCode,
                        ownerGroup: me.pageGroupId
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
    newData(folderRec, isSql = false) {
      let me = this,
        pop = me.$refs.newDataRef;
      pop && pop.handleBlur();

      console.log(["打开newData"]);

      me.$store.state.progress = 10;

      //【update】目前没必要刷新，回来时刷新即可
      me.refreshRecords()
        .then(r => {
          me.$store.state.progress = 30;
          let folder = folderRec || me.nowFolderRec,
            pIndex = folder ? folder.index : "";
          //index = me.getNewIndex(folder);

          //let now = tool.now(true);
          // $.ajax({
          //   url: Vue.Api.designBI,
          //   method: Vue.Api.designBI.AddOrUpd,
          //   data: {
          //     table: "data",
          //     records: JSON.stringify([
          //       {
          //         pIndex,
          //         index,
          //         isFolder: false,
          //         createTime: now,
          //         editTime: now,
          //         name: index,
          //         //# 1 表示预备加入
          //         exist: false,

          //         createOperId: me.loginUser.userCode,
          //         ownerGroup: me.pageGroupId
          //       }
          //     ])
          //   }
          // }).then(result => {
          me.$store.state.progress = 60;
          me.likeEdit_newData = false;
          me.$router.push({
            query: {
              pIndex,
              isSql: isSql ? 1 : 0
            }
          });
          //});
        })
        .catch(result => {
          me.$store.state.progress = 100;
          me.$message.error("新建数据集失败，请重试或检查服务器状态！");
        });
    },
    newDataBackFn(detailData) {
      let me = this;
      //~ 1 回到初始值
      me.likeEdit_newData = true;
      me.refreshRecords();
      if (detailData) {
        me.nodeClickFn(detailData);
      }
    }
  },
  mounted() {
    let me = this;
    me.tree = me.$refs.tree;
  }
};
</script>
