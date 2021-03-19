<template>
  <div class="newProcedure">
    <div class="dbTableSelectArea" v-show="sqlSource">
      <div class="leftPart">
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
          <span>步骤2：选择存储过程</span>
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

      <div class="rightPart">
        <div class="paramListArea" v-show="selTableName">
          <div class="tipRow">
            <el-tag :type="paramPass ? 'success' : 'danger'">{{
              paramPass ? "合适" : "不符合"
            }}</el-tag>
            <span class="tipText">{{ paramInfo }}</span>
          </div>
          <el-table :data="paramList">
            <el-table-column prop="matchStr" label="匹配参数"></el-table-column>

            <el-table-column prop="type" label="参数类型"></el-table-column>

            <el-table-column
              prop="sqlType"
              label="数据库类型"
            ></el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <div class="tableDataArea" v-show="selTableName && paramPass && dimAjax">
      <template v-if="!badProcedure">
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
      </template>

      <template v-else>
        <div>
          {{ badProcedureInfo }}
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import $ from "@/plugins/js/loader";
import { lastLoader } from "@/plugins/js/loader";
import Vue from "vue";
import UserTable from "./UserTable";
export default {
  name: "newProcedure",
  extends: UserTable,
  data() {
    return {
      paramList: [],
      //~ 1 错误的存储过程
      badProcedure: false,
      badProcedureInfo: "",

      paramInfo: ""
    };
  },

  computed: {
    dataSubType() {
      return "procedure";
    },
    paramPass() {
      let me = this,
        ok = true;
      me.paramInfo = "";
      tool.each(me.paramList, param => {
        if (param.type != "string") {
          ok = false;
          me.paramInfo =
            "BI数据预备的存储过程参数必须都为字符串类型，请修改或另选一存储过程！";
          return false;
        }
      });

      return ok;
    }
  },

  methods: {
    //^^ 2-2 获取数据源数据库下的表列表，前100个
    getDBTableList(queryStr) {
      let me = this;
      me.tbLoading = true;
      if (!me.tbListAjax) {
        me.tbListAjax = new lastLoader({
          then(r) {
            let ls = r.data;
            me.tbList = ls;
            me.tbLoading = false;
          },
          catch(r) {
            me.$message.error("获取数据库下存储过程列表失败！" + r.msg);
            me.tbLoading = false;
          }
        });
      }
      me.tbListAjax.ajax = {
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetLinkSourceDBProcedureList,
        data: {
          serverName: me.sqlSource.name,
          dbName: me.dataBaseName,
          query: queryStr
        }
      };
      me.tbListAjax.load();
    },

    //^^ 2-3 获取表下 列配置列表，所有
    getTBDimList() {
      let me = this;
      me.dimLoading = true;

      if (!me.dimAjax) {
        me.dimAjax = new lastLoader({
          then(r) {
            let ls = r.data.dimension,
              pmLs = r.data.paramList;
            me.tableDims = ls.map(d => {
              d.$id = tool.uniqueStr();
              return d;
            });
            me.paramList = pmLs;
            me.dimLoading = false;
            me.badProcedure = false;
            me.badProcedureInfo = "";
          },
          catch(r) {
            if (r.data && r.data.paramList) {
              me.paramList = r.data.paramList;
            }

            let msg = "获取存储过程返回表列配置失败！" + r.msg;
            me.$message.error(msg);
            me.dimLoading = false;
            me.badProcedure = true;
            me.badProcedureInfo = msg;
          }
        });
      }
      me.dimAjax.ajax = {
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetLinkSourceDBTableDimList,
        data: {
          serverName: me.sqlSource.name,
          dbName: me.dataBaseName,
          tableName: me.selTableName,
          dataSubType: me.dataSubType
        }
      };
      me.dimAjax.load();
    },
    submitFn() {
      let me = this;
      me.submitFnBase({
        dataSubType: me.dataSubType,
        paramList: me.paramList.length ? JSON.stringify(me.paramList) : ""
      });
    }
  }
};
</script>
