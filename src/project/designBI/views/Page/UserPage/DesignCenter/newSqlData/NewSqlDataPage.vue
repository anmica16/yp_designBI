<template>
  <div class="NewDataPage NewSqlDataPage">
    <div class="headBar">
      <div class="dataName">
        <span class="pre">表名</span>
        <el-input v-model="name" placeholder="请输入表名"></el-input>
      </div>
      <div class="fill"></div>
      <div class="yesno">
        <el-button ref="cancel" type="info" @click="cancelFn">取消</el-button>
        <el-button
          ref="submit"
          :type="workSheet ? 'primary' : ''"
          :disabled="!workSheet"
          @click="submitFn"
          >{{ addNewData ? "保存" : "确定" }}</el-button
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
          <Scrollbar>
            <template v-for="server in sqlSourceLS">
              <div
                class="oneServer"
                :class="{ selected: sqlSource == server }"
                :key="server.name"
                @click="oneServerClickFn(server)"
              >
                <div class="id">#{{ server.id }}</div>
                <div class="name">{{ server.name }}</div>
                <div class="ip">
                  <span>ip：</span>
                  <span>{{ server.ip }}</span>
                </div>
                <div class="username">
                  <span>user：</span>
                  <span>{{ server.username }}</span>
                </div>
                <div class="operDate">
                  <span>{{ server.operDate }}</span>
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
          <Pager ref="sourcePager" :total="sqlSourceList.length"></Pager>
        </div>
      </div>
      <div class="rightArea">
        <div class="tableSelect">
          <span>步骤1：</span>
        </div>
        <div class="tableDataArea">
          <div class="dimensionArea"></div>
          <div class="dataTableArea"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import $ from "@/plugins/js/loader";
import Vue from "vue";
//import X from "@designBI/views/mixins/X";
import NewDataPage from "../newData/NewDataPage";
import AddSqlSource from "./AddSqlSource";
export default {
  name: "NewSqlDataPage",
  extends: NewDataPage,
  components: {
    AddSqlSource
  },
  data() {
    return {
      //~~ 强调
      name: "",
      //~~ 1 数据源
      sqlSource: null,
      sqlSourceList: [],
      //~~ 2 所选 数据库 表
      dataBaseName: "",
      selTableName: "",
      //~~ 3 字段候选
      tableDims: [],
      //~~ 4 选择维度
      dimension: [],
      //~~ 5【展示用】 表与字段结合 ajax的 数据
      tableData: [],

      //--------
      // 工具
      //--------
      sourcePager: null,
      refreshSqlListLoading: false,
      openAddSqlSource: false,
      addSqlLoading: false
    };
  },
  computed: {
    orderProps() {
      return [
        "sqlSource",
        "dataBaseName",
        "selTableName",
        "tableDims",
        "dimension",
        "tableData"
      ];
    },
    //# 1 单纯的一个保存对象
    dataSource() {
      let me = this;
      return {
        sourceName: me.sqlSource && me.sqlSource.name,
        dataBaseName: me.dataBaseName
      };
    },
    //# 2 一个 dataId的 对象
    dataRecord() {
      let me = this,
        editTime = tool.now(true),
        record = {
          id: me.id,
          name: me.name,
          //## 1 name！
          tableName: me.selTableName,
          dataSource: me.dataSource,
          editTime,
          dataType: me.dataType,
          //## 2 维度！
          dimension: me.dimension.map(d => {
            d.dataId = me.id;
            d.tTable = `t${d.dataId}`;
            d.tName = `${d.key}_t${d.dataId}`;
            return d;
          }),
          exist: true
        };

      return record;
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
    //@#@ 1 为空 时的后续属性操作
    emptyClear(propName) {
      let me = this,
        props = me.orderProps,
        at = props.indexOf(propName);
      for (let i = at + 1; i < props.length; ++i) {
        let key = props[i];

        if (tool.isArray(me[key])) {
          me[key] = [];
        } else {
          me[key] = "";
        }
      }
    },
    //^^ 0 获取数据源列表
    getSqlSourceList() {
      let me = this;
      me.refreshSqlListLoading = true;
      $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetSqlSourceList
      })
        .then(result => {
          let ls = result.data;
          me.sqlSourceList = ls;
        })
        .catch(result => {
          me.$message.error("获取数据源列表失败！" + result.msg);
        })
        .finally(r => {
          me.refreshSqlListLoading = false;
        });
    },
    //^^ 1-1 新数据源
    addSqlSource() {
      let me = this;
      me.openAddSqlSource = true;
    },
    //^^ 1-2 删除数据源
    deleteSqlSource(server) {
      console.log(["1-2 删除数据源", server]);
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
          operDate: tool.now()
        }
      })
        .then(result => {
          console.log(["1-3 新加入：ajax", result]);
          me.$message.success("新增数据源成功！");
          me.getSqlSourceList();
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
    }
  },
  watch: {
    sqlSource(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.emptyClear("sqlSource");
      }
    },
    dataBaseName(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.emptyClear("dataBaseName");
      }
    },
    selTableName(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.emptyClear("selTableName");
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
