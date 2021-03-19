<template>
  <div class="newView">
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
        <span>步骤2：选择视图</span>
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
</template>

<script>
import tool from "@/plugins/js/tool";
import $ from "@/plugins/js/loader";
import { lastLoader } from "@/plugins/js/loader";
import Vue from "vue";
import UserTable from "./UserTable";
export default {
  name: "newView",
  extends: UserTable,
  data() {
    return {};
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
            me.$message.error("获取数据库下视图列表失败！" + r.msg);
            me.tbLoading = false;
          }
        });
      }
      me.tbListAjax.ajax = {
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetLinkSourceDBViewList,
        data: {
          serverName: me.sqlSource.name,
          dbName: me.dataBaseName,
          query: queryStr
        }
      };
      me.tbListAjax.load();
    },
    submitFn() {
      let me = this;
      me.submitFnBase({
        dataSubType: "view"
      });
    }
  }
};
</script>
