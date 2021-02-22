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
          v-loading="submitLoading"
          ref="submit"
          :type="tableData.length ? 'primary' : ''"
          :disabled="!tableData.length"
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
          <Scrollbar>
            <template v-for="server in sqlSourceLS">
              <div
                class="oneServer"
                :class="{ selected: sqlSource == server }"
                :key="server.name"
                @click="oneServerClickFn(server)"
              >
                <div class="id">#{{ server.id }}</div>
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
        <div class="waitSqlSourceTip" v-show="!sqlSource">
          <div class="back"></div>
          <div class="text">请先从左侧选择</div>
        </div>
        <div class="dbTableSelectArea" v-show="sqlSource">
          <div class="dbSelect">
            <span>步骤1：选择数据库</span>
            <el-select
              v-model="dataBaseName"
              filterable
              remote
              :clearable="true"
              :loading="dbListLoading"
              :remote-method="getDBList"
              @visible-change="getDBListReFn"
            >
              <el-option
                v-for="db in dbList"
                :key="db.name"
                :label="db.name"
                :value="db.name"
                >{{ db.name }}</el-option
              >
            </el-select>
          </div>

          <div class="tableSelect" v-show="dataBaseName">
            <span>步骤2：选择表</span>
            <el-select
              v-model="selTableName"
              filterable
              remote
              :clearable="true"
              :loading="tbLoading"
              :remote-method="getDBTableList"
              @visible-change="getDBTableListReFn"
            >
              <el-option
                v-for="tb in tbList"
                :key="tb.name"
                :label="tb.name"
                :value="tb.name"
                >{{ tb.name }}</el-option
              >
            </el-select>
          </div>
        </div>
        <div class="tableDataArea" v-show="selTableName">
          <div class="dimensionArea">
            <div>步骤3：选择表维度</div>
            <Scrollbar v-loading="dimLoading">
              <el-tree
                class="dimTree"
                :data="tableDims"
                :check-on-click-node="true"
                show-checkbox
                node-key="name"
                @check="dimCheckFn"
              >
                <span class="dimOption" slot-scope="{ data }">
                  <span class="theText">{{ data.name }}</span>
                  <span class="midText">名：</span>
                  <el-input
                    @click.native.stop
                    class="nameText"
                    size="mini"
                    @change="dimChangeName(data)"
                    v-model="data.chineseName"
                  ></el-input>
                </span>
              </el-tree>
            </Scrollbar>
          </div>
          <div class="dataTableArea">
            <div>步骤4：确认表数据</div>
            <DimTable
              ref="table"
              v-loading="tbDTLoading"
              :data="tableData"
              :dimension="dimension"
            ></DimTable>
          </div>
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
      openAddSqlSource: false,
      addSqlLoading: false,

      //~~ 0 候选 数据源
      refreshSqlListLoading: false,
      refreshSqlListAjax: null,

      //~~ 1 候选 数据库s
      dbListLoading: false,
      dbListAjax: null,
      dbList: [],
      //~~ 2 候选 表s
      tbLoading: false,
      tbListAjax: null,
      tbList: [],
      //~~ 3 候选 字段
      dimLoading: false,
      dimAjax: null,
      //~~ 4 table 读取
      tbDTLoading: false,
      tbDTAjax: null,

      //~~ 5 提交
      submitLoading: false
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
          sourceName: me.sqlSource && me.sqlSource.name,
          dataBaseName: me.dataBaseName,
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
      me.refreshSqlListAjax && me.refreshSqlListAjax.abort();
      me.refreshSqlListAjax = $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetSqlSourceList
      });

      me.refreshSqlListAjax
        .then(result => {
          let ls = result.data;
          me.sqlSourceList = ls;
          me.refreshSqlListLoading = false;
        })
        .catch(result => {
          if (result && result.statusText === "abort") {
            //
          } else {
            me.$message.error("获取数据源列表失败！" + result.msg);
            me.refreshSqlListLoading = false;
          }
        });
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
          name: server.name
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
          ...formData
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
    //^^ 2-1 获取数据源下的数据库列表，前100个
    getDBList(queryStr) {
      let me = this;
      // console.log([
      //   "加载 ^^ 2-1 获取数据源下的数据库列表",
      //   queryStr,
      //   arguments
      // ]);
      me.dbListLoading = true;
      me.dbListAjax && me.dbListAjax.abort();
      me.dbListAjax = $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetLinkSourceDBList,
        data: {
          serverName: me.sqlSource.name,
          query: queryStr
        }
      });
      me.dbListAjax
        .then(r => {
          let ls = r.data;
          me.dbList = ls;
          me.dbListLoading = false;
        })
        .catch(r => {
          if (r && r.statusText === "abort") {
            //
          } else {
            me.$message.error("获取数据库列表失败！" + r.msg);
            me.dbListLoading = false;
          }
        });
    },
    getDBListReFn(ifShow) {
      let me = this;
      if (!ifShow) {
        me.getDBList(me.dataBaseName);
      }
    },
    //^^ 2-2 获取数据源数据库下的表列表，前100个
    getDBTableList(queryStr) {
      let me = this;
      me.tbLoading = true;
      //console.log(["刷新了！2-2 获取数据源数据库下的表列表"]);
      me.tbListAjax && me.tbListAjax.abort();
      me.tbListAjax = $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetLinkSourceDBTableList,
        data: {
          serverName: me.sqlSource.name,
          dbName: me.dataBaseName,
          query: queryStr
        }
      });
      me.tbListAjax
        .then(r => {
          let ls = r.data;
          me.tbList = ls;
          me.tbLoading = false;
        })
        .catch(r => {
          if (r && r.statusText === "abort") {
            //
          } else {
            me.$message.error("获取数据库下表列表失败！" + r.msg);
            me.tbLoading = false;
          }
        });
    },
    getDBTableListReFn(ifShow) {
      let me = this;
      if (!ifShow) {
        me.getDBTableList(me.selTableName);
      }
    },
    //^^ 2-3 获取表下 列配置列表，所有
    getTBDimList() {
      let me = this;
      me.dimLoading = true;
      me.dimAjax && me.dimAjax.abort();
      me.dimAjax = $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetLinkSourceDBTableDimList,
        data: {
          serverName: me.sqlSource.name,
          dbName: me.dataBaseName,
          tableName: me.selTableName
        }
      });
      me.dimAjax
        .then(r => {
          let ls = r.data;
          me.tableDims = ls.map(d => {
            d.$id = tool.uniqueStr();
            return d;
          });
          me.dimLoading = false;
        })
        .catch(r => {
          if (r && r.statusText === "abort") {
            //
          } else {
            me.$message.error("获取表列配置失败！" + r.msg);
            me.dimLoading = false;
          }
        });
    },
    dimChangeName(data) {
      let me = this,
        tDim = me.dimension.find(d => {
          return d.$id === data.$id;
        }),
        tableDim = me.tableDims.find(d => {
          return d.$id === data.$id;
        });
      me.$set(tDim, "chineseName", tableDim["chineseName"]);
    },
    //@#@ 3 选择了一个
    dimCheckFn(cNode, checkInfo) {
      let me = this,
        result = [],
        checkNodes = checkInfo.checkedNodes;
      checkNodes.forEach(n => {
        let t = `t${me.dataId}`,
          dim = {
            $id: n.$id,
            key: n.name,
            chineseName: n.chineseName,
            dataId: me.id,
            type: n.type,
            tTable: t,
            tName: `${n.name}_${t}`
          };
        result.push(dim);
      });
      me.dimension = result;
      me.$nextTick(() => {
        me.$refs.table.doLayout();
      });
      //# 2 维度选择后，进行数据刷新
      if (!result.length) {
        me.tableData = [];
      } else {
        me.getResultTableData();
      }
    },
    //^^ 4 获取维度决定后的 表数据
    getResultTableData() {
      let me = this;
      me.tbDTLoading = true;
      me.tbDTAjax && me.tbDTAjax.abort();
      me.tbDTAjax = $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetLinkSourceDBTableData,
        data: {
          serverName: me.sqlSource.name,
          dbName: me.dataBaseName,
          tableName: me.selTableName,
          dimension: JSON.stringify(me.dimension)
        }
      });
      me.tbDTAjax
        .then(r => {
          let ls = r.data;
          me.tableData = ls;
          me.tbDTLoading = false;
        })
        .catch(r => {
          if (r && r.statusText === "abort") {
            //
          } else {
            me.$message.error("获取表列配置失败！" + r.msg);
            me.tbDTLoading = false;
          }
        });
    },
    //^^ 5 终于，提交新建/补充该 record了！
    submitFn() {
      let me = this;
      if (!me.name) {
        me.$message.warning("请命名所需提交的数据！（界面左上角）");
        return;
      }
      $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.AddOrUpd,
        data: {
          records: JSON.stringify(me.dataRecord),
          table: "data"
        }
      })
        .then(r => {
          me.$message.success("保存成功！");
          //# 2 返回
          me.backPage(me.dataRecord);
        })
        .catch(r => {
          me.$message.error("保存失败！" + r);
        });
      console.log(["尝试提交", me, me.dataRecord]);
    }
  },
  watch: {
    sqlSource(newVal, oldVal) {
      let me = this;
      if (newVal !== oldVal) {
        this.emptyClear("sqlSource");
        newVal && me.getDBList();
      }
    },
    dataBaseName(newVal, oldVal) {
      let me = this;
      if (newVal !== oldVal) {
        this.emptyClear("dataBaseName");
        newVal && me.getDBTableList();
      }
    },
    selTableName(newVal, oldVal) {
      let me = this;
      if (newVal !== oldVal) {
        this.emptyClear("selTableName");
        newVal && me.getTBDimList();
      }
      //#2 name的 变化
      if (!newVal && oldVal) {
        //~ 1 变空了！
        me.name = "";
      } else if (newVal && !oldVal) {
        //~ 2 选择了新的
        me.name = newVal;
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
