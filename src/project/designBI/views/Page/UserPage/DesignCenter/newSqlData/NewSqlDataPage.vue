<template>
  <div class="NewDataPage NewSqlDataPage">
    <div class="headBar">
      <div class="dataName">
        <span class="pre">表名</span>
        <el-input
          v-model="subName[dataSubType]"
          placeholder="请输入表名"
        ></el-input>
      </div>
      <div class="fill"></div>
      <div class="yesno">
        <el-button ref="cancel" type="info" @click="cancelFn">取消</el-button>
        <el-button
          v-loading="submitLoading"
          ref="submit"
          :type="canSubmit[dataSubType] ? 'primary' : ''"
          :disabled="!canSubmit[dataSubType]"
          @click="submitFn"
          >确定</el-button
        >
      </div>
    </div>
    <div class="operateBody operateBodySql">
      <div class="leftArea" v-loading="refreshSqlListLoading">
        <div class="addRemoveBar">
          <el-button
            class="option"
            size="small"
            type="success"
            icon="el-icon-document-add"
            @click="addSqlSource()"
            >新增数据源</el-button
          >
          <el-dialog
            title="新增数据源（SQL Server）"
            :visible.sync="openAddSqlSource"
            width="500px"
            :destroy-on-close="true"
            :append-to-body="true"
            :close-on-click-modal="false"
          >
            <AddSqlSource
              v-loading="refreshSqlListLoading"
              @submit="addSqlSubmitFn"
              @cancel="addSqlCancelFn"
            ></AddSqlSource>
          </el-dialog>
        </div>
        <div class="listBody">
          <div class="emptyTip" v-if="!sqlSourceList.length">
            尚未添加数据源
          </div>
          <Scrollbar>
            <template v-for="(server, i) in sqlSourceLS">
              <div
                class="oneServer"
                :class="{ selected: sqlSource == server }"
                :key="server.name"
                @click="oneServerClickFn(server)"
              >
                <div class="id">#{{ i + 1 }}</div>
                <div class="name">
                  <span>数据源：</span>
                  <span>{{ server.name }}</span>
                </div>
                <div class="ip">
                  <span>地址：</span>
                  <span>{{ server.ip }}</span>
                </div>
                <div class="username">
                  <span>用户：</span>
                  <span>{{ server.username }}</span>
                </div>
                <div class="operDate">
                  <span>于{{ server.operDate }}</span>
                  <span>加入</span>
                </div>
                <div class="deleteArea">
                  <el-button
                    class="option"
                    size="small"
                    type="success"
                    icon="el-icon-document-add"
                    @click="deleteSqlSource(server)"
                    >删除</el-button
                  >
                </div>
              </div>
            </template>
          </Scrollbar>
        </div>
        <div class="pager">
          <Pager
            ref="sourcePager"
            :pageSize="5"
            :total="sqlSourceList.length"
          ></Pager>
        </div>
      </div>
      <div class="rightArea">
        <div class="waitSqlSourceTip" v-if="!sqlSource">
          <div class="back"></div>
          <div class="text">请先从左侧选择数据源</div>
        </div>

        <el-tabs v-else v-model="dataSubType">
          <el-tab-pane label="用户表" name="U">
            <UserTable
              ref="U"
              :PageNode="me"
              :name.sync="subName['U']"
              :sqlSource="sqlSource"
              :canSubmit.sync="canSubmit['U']"
            ></UserTable>
          </el-tab-pane>

          <el-tab-pane label="视图" name="V">
            <ViewTable
              ref="V"
              :PageNode="me"
              :name.sync="subName['V']"
              :sqlSource="sqlSource"
              :canSubmit.sync="canSubmit['V']"
            ></ViewTable>
          </el-tab-pane>

          <el-tab-pane label="存储过程" name="P">
            <Procedure
              ref="P"
              :PageNode="me"
              :name.sync="subName['P']"
              :sqlSource="sqlSource"
              :canSubmit.sync="canSubmit['P']"
            ></Procedure>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import $ from "@/plugins/js/loader";
import { lastLoader } from "@/plugins/js/loader";
import Vue from "vue";
//import X from "@designBI/views/mixins/X";
import NewDataPage from "../newData/NewDataPage";
import AddSqlSource from "./AddSqlSource";

import UserTable from "./subType/UserTable";
import ViewTable from "./subType/View";
import Procedure from "./subType/Procedure";

export default {
  name: "NewSqlDataPage",
  extends: NewDataPage,
  components: {
    AddSqlSource,
    UserTable,
    ViewTable,
    Procedure
  },
  data() {
    return {
      //~~ 强调
      name: "",
      //~~ 1 数据源
      sqlSource: null,
      sqlSourceList: [],
      //~~ 0 候选 数据源
      refreshSqlListLoading: false,
      refreshSqlListAjax: null,
      //--------
      // 工具
      //--------
      sourcePager: null,
      openAddSqlSource: false,
      addSqlLoading: false,

      //~~ 5 提交
      submitLoading: false,

      //## 二 分开的subDataType
      dataSubType: "U",
      canSubmit: {
        U: false,
        V: false,
        P: false
      },
      subName: {
        U: "",
        V: "",
        P: ""
      }
    };
  },
  computed: {
    me() {
      return this;
    },
    sqlSourceLS() {
      let me = this,
        pager = me.sourcePager;
      if (pager) {
        return me.sqlSourceList.slice(pager.start, pager.end);
      } else {
        return me.sqlSourceList;
      }
    }
  },
  methods: {
    oneServerClickFn(server) {
      this.sqlSource = server;
    },
    //^^ 0 获取数据源列表
    getSqlSourceList() {
      let me = this;

      me.refreshSqlListLoading = true;
      if (!me.refreshSqlListAjax) {
        me.refreshSqlListAjax = new lastLoader({
          ajax: {
            url: Vue.Api.designBI,
            method: Vue.Api.designBI.GetSqlSourceList,
            data: {
              groupId: me.pageGroupId
            }
          },
          then(result) {
            let ls = result.data;
            me.sqlSourceList = ls;
            me.refreshSqlListLoading = false;
          },
          catch(result) {
            me.$message.error("获取数据源列表失败！" + result.msg);
            me.refreshSqlListLoading = false;
          }
        });
      }
      me.refreshSqlListAjax.load();
    },
    //^^ 1-1 新数据源
    addSqlSource() {
      let me = this;
      me.openAddSqlSource = true;
    },
    //^^ 1-2 删除数据源
    deleteSqlSource(server) {
      let me = this;
      me.$msgbox({
        type: "warning",
        title: "确认",
        message: "确认要删除该数据源吗？",
        showCancelButton: true
      })
        .then(r => {
          me.deleteSqlSourceBase(server);
        })
        .catch(r => {});
    },
    deleteSqlSourceBase(server) {
      let me = this;
      me.refreshSqlListLoading = true;
      //console.log(["1-2 删除数据源", server]);
      $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.DeleteSqlSource,
        data: {
          name: server.name,
          groupId: me.pageGroupId
        }
      })
        .then(r => {
          me.$message.success("成功删除了该数据源");
          me.getSqlSourceList();
        })
        .catch(r => {
          me.$message.error("删除数据源失败！" + r.msg);
          me.refreshSqlListLoading = false;
        });
    },
    //^^ 1-3 新加入：ajax
    addSqlSubmitFn(formData, addNode) {
      let me = this;
      //console.log(["1-3 新加入：ajax", arguments]);
      //# 1 验证是否是ok的 数据库链接
      me.addSqlLoading = true;
      $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.AddSqlSource,
        data: {
          ...formData,
          createOperId: me.loginUser.userCode,
          groupId: me.pageGroupId
        }
      })
        .then(result => {
          console.log(["1-3 新加入：ajax", result]);
          me.$message.success("新增数据源成功！");
          me.getSqlSourceList();
          me.openAddSqlSource = false;
        })
        .catch(result => {
          me.$message.error("新增数据源失败！" + result.msg);
        })
        .finally(r => {
          me.addSqlLoading = false;
        });
    },
    addSqlCancelFn() {
      let me = this;
      me.openAddSqlSource = false;
    },
    //^^ 5-2 v2的 新建，后端处理index，然后变为一次性
    submitFn() {
      let me = this,
        uTable = me.$refs.U,
        vTable = me.$refs.V,
        pTable = me.$refs.P;
      if (me.dataSubType == "U") {
        uTable.submitFn();
      } else if (me.dataSubType == "V") {
        vTable.submitFn();
      } else if (me.dataSubType == "P") {
        pTable.submitFn();
      }
    }
  },
  mounted() {
    let me = this;
    me.sourcePager = me.$refs.sourcePager;
    //# 1 刷新数据源列表
    me.getSqlSourceList();
  }
};
</script>
