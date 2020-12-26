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
      </div>
    </div>
    <!-- ~ 3 新数据集 fix全局 -->
    <transition name="PageMove">
      <NewDataPage
        v-if="query"
        :id="query.id"
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
import X from "./newData/X";
export default {
  name: "CenterData",
  mixins: [X],
  components: {
    NewDataPage
  },
  data() {
    return {
      records: [],
      count: 0,
      tree: null,
      //~ 1 选择信息
      //【update】文件夹选择提示
      nowFolderRec: null,
      nowFileRec: null,
      DetailData: null,

      //~ 2 新建
      likeEdit_newData: true
    };
  },
  computed: {
    query() {
      let query = this.$route.query,
        q = tool.apply({}, query);

      ["id", "pIndex", "index"].forEach(check => {
        if (!Object.hasOwnProperty.call(query, check)) {
          q = null;
        }
      });
      return q;
    }
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
              index,
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
    newData(folderRec) {
      let me = this;
      me.$store.state.progress = 10;
      me.refreshRecords(true)
        .then(r => {
          me.$store.state.progress = 30;
          let folder = folderRec || me.nowFolderRec,
            pIndex = folder ? folder.index : "",
            index = me.getNewIndex(folder);

          let now = tool.now(true);
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
                  exist: false
                }
              ])
            }
          }).then(result => {
            me.$store.state.progress = 60;
            me.likeEdit_newData = false;
            me.$router.push({
              query: { index, pIndex, id: result.other }
            });
          });
        })
        .catch(result => {
          me.$store.state.progress = 100;
          me.$message.error("新建数据集失败，请重试或检查服务器状态！");
        });
    },
    //# 1 叶子的 文件或文件夹
    nodeClickFn(rec, nodeData, node) {
      let me = this;
      //~ 1 有子集 
      if (rec.$items && rec.$items.length) {
        me.nowFolderRec = rec;
      } else {
        me.nowFileRec = rec;
        if (rec.$parent) {
          me.nowFolderRec = rec.$parent;
        } else {
          //~ 2 可能是根的 file选中，那么就无选中父节点了。
          me.nowFolderRec = null;
        }
      }
    },
    newDataBackFn(detailData) {
      let me = this;
      //~ 1 回到初始值
      me.likeEdit_newData = true;
      me.refreshRecords();
      if (detailData) {
        //【update】
        me.DetailData = detailData;
      }
    },
    //~~ 1 center的获取数据
    //【update】
    getDetailData(theId) {
      let me = this;
      return new Promise((res, rej) => {
        $.ajax({
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.GetDataDetail,
          data: {
            id: theId
          }
        })
          .then(result => {
            let datas = result.data;
            if (!datas || !datas.length) {
              //# 1 数据不存在！页面不允许访问！
              let info = {
                title: "错误提示",
                message: "选中数据集所获取到的数据为空！",
                type: "warning"
              };
              me.$msgbox(info);
              rej(info);
              return;
            }
            //# 2 center选中的 都应是完整确立的数据！
            let data = datas[0];
            me.DetailData = data;

            res(true);
          })
          .catch(r => {
            let info = {
              title: "错误提示",
              message: "从服务器获取数据集数据失败",
              type: "error"
            };
            me.$msgbox(info);
            rej(info);
          });
      });
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

<style lang="scss">
.PageMove-enter-active {
  transition: all 0.6s;
}
.PageMove-leave-active {
  transition: all 0.3s;
}
.PageMove-enter,
.PageMove-leave-to {
  transform: translateX(100%);
}
</style>
