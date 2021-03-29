<template>
  <div class="newProcedure newCustom">
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
          <span class="step"
            >步骤2：输入自定义SQL<span class="subTitle"
              >(花括号作为插入容器，花括号内部为关键字)</span
            ></span
          >
          <el-input
            type="textarea"
            :rows="3"
            placeholder="请输入自定义SQL"
            v-model="cusSql"
          ></el-input>
        </div>
      </div>

      <div class="rightPart">
        <div class="paramListArea" v-if="dataBaseName">
          <div class="execArea">
            <el-button size="small" type="primary" @click="getTBDimList"
              >执行SQL</el-button
            >
            <el-tag :type="needExec ? 'danger' : 'info'">{{
              needExec ? "需执行" : "已执行"
            }}</el-tag>

            <el-tag :type="!badProcedure ? 'success' : 'danger'">{{
              !badProcedure ? "可执行SQL" : "不可执行SQL"
            }}</el-tag>

            <div class="tipText">{{ badProcedureInfo }}</div>
          </div>
          <div class="tipRow">
            <el-tag :type="paramList.length ? 'success' : 'info'">{{
              paramList.length ? "带参数" : "无参数"
            }}</el-tag>
            <span class="tipText"
              >当前出现<span class="number">{{ paramList.length }}</span
              >个参数</span
            >
          </div>

          <el-table :data="paramList" :show-header="false">
            <el-table-column>
              <template slot-scope="scope">
                <span class="order">#</span>
                <span class="matchKey">{{
                  `匹配值：\{${scope.row.matchKey}\}，出现${scope.row.matchs.length}次`
                }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <div class="tableDataArea">
      <template v-if="!badProcedure">
        <div class="dimensionArea">
          <div>步骤3：选择表维度</div>
          <Scrollbar v-loading="dimLoading">
            <el-tree
              ref="dimTree"
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
  name: "newCustom",
  extends: UserTable,
  data() {
    return {
      cusSql: "",

      paramMap: {},
      needExec: true,
      //~ 1 错误的存储过程
      badProcedure: true,
      badProcedureInfo: "",

      paramPass: false,
      paramInfo: ""
    };
  },

  computed: {
    dataSubType() {
      return "custom";
    },
    isNowPage() {
      return this.PageNode.dataSubType == "C";
    },
    regBrace() {
      return new RegExp("{\\s*([^{}]*)}");
    },
    paramList() {
      let me = this,
        resultA = [],
        map = me.paramMap;
      tool.each(map, (key, val) => {
        let rec = {
          matchKey: key,
          matchs: val
        };
        resultA.push(rec);
      });
      return resultA;
    }
  },

  methods: {
    findResult(str) {
      let me = this,
        findMap = {},
        reg = me.regBrace,
        m = reg.exec(str);
      while (m) {
        let matchStr = m[0],
          matchKey = m[1],
          begin = str.indexOf(matchStr),
          end = begin + matchStr.length,
          newStr = str.substr(end);

        matchKey = matchKey.trim();

        findMap[matchKey] = findMap[matchKey] || [];
        findMap[matchKey].push({ matchStr, begin, end });

        m = reg.exec(newStr);
      }

      return findMap;
    },

    //^^ 2-3 获取表下 列配置列表，所有
    getTBDimList() {
      let me = this;
      me.dimLoading = true;

      let map = me.findResult(me.cusSql);
      me.paramMap = map;

      if (!me.dimAjax) {
        me.dimAjax = new lastLoader({
          then(r) {
            let ls = r.data;
            me.tableDims = ls.map(d => {
              d.$id = tool.uniqueStr();
              return d;
            });

            me.needExec = false;

            me.dimLoading = false;
            me.badProcedure = false;
            me.badProcedureInfo = "";
          },
          catch(r) {
            let msg = "获取存储过程返回表列配置失败！" + r.msg;
            me.$message.error(msg);
            me.needExec = true;

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
          dataSubType: me.dataSubType,
          groupId: me.pageGroupId,
          // cus ++
          moreParams: JSON.stringify({
            cusSql: me.cusSql,
            paramList: me.paramList
          })
        }
      };
      return me.dimAjax.load();
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
            tName: `${n.name}_${t}`,

            //++ 1 转换类型，某些特殊类型
            originType: n.originType
          };
        result.push(dim);
      });
      me.dimension = result;
      me.$nextTick(() => {
        me.$refs.table.doLayout();
      });
      //# 2 维度选择后，进行数据刷新
      // if (!result.length) {
      //   me.tableData = [];
      // } else {
      //   me.getResultTableData();
      // }
    },
    submitFn() {
      let me = this,
        cfg = {
          dataSubType: me.dataSubType,
          paramList: me.paramList.length ? JSON.stringify(me.paramList) : "",
          dataSource: me.cusSql
        };

      if (me.PageNode.isEdit) {
        me.submitEdit(cfg);
      } else {
        me.submitFnBase(cfg);
      }
    },
    //@@ 10 再次进入 编辑
    editMounted() {
      let me = this,
        page = me.PageNode,
        detailData = page.DetailData;
      me.cusSql = detailData.dataSource;
      me.editMountedBase();
    }
  },

  watch: {
    // cusSql(newVal, oldVal) {
    //   let me = this;
    //   if (newVal != oldVal) {
    //     me.needExec = true;
    //   }
    //   if (newVal) {
    //     let map = me.findResult(newVal);
    //     me.paramMap = map;
    //   } else {
    //     me.paramMap = {};
    //   }
    // },
    needExec(newVal) {
      let me = this;
      me.$emit("update:canSubmit", !newVal);
    }
  }
};
</script>
