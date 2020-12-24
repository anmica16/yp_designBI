<template>
  <div class="reportWrap" :class="'status-' + healthyType">
    <div class="reportTextArea">
      <p>
        结果：<el-tag
          style="font-size: 14px; padding: 0 20px;"
          :type="
            healthyType === 1
              ? 'success'
              : healthyType === 2
              ? 'warning'
              : 'danger'
          "
          >{{
            healthyType === 1 ? "健康" : healthyType === 2 ? "有风险" : "不健康"
          }}</el-tag
        >
      </p>
      <template v-if="healthyType === 1">
        <p>每个维度下的数据，其类型均完全一致，可放心使用！</p>
      </template>
      <template v-if="healthyType === 2">
        <p>
          个别维度下的数据存在类型不一致的情况，建议仔细检查并修改表格数据后再上传，如果仍然坚持使用，将按照所判断类型进行类型转换！
        </p>
        <p>注：存在数据转换失败的风险！</p>
      </template>
      <template v-if="healthyType === 3">
        <p>
          个别维度发生了严重的数据类型不一致情况，请仔细检查并修改表格数据后再上传！
        </p>
      </template>
    </div>
    <el-table border :data="rows" style="width: 100%; height: 100%"
      ><el-table-column v-for="col in cols" :key="col.prop" v-bind="col">
        <template slot-scope="scope">
          <template v-if="col.prop === 'type'">
            <DimTypeTag :type="scope.row.type"></DimTypeTag>
          </template>
          <template v-else-if="col.prop === 'status'">
            <el-tag
              effect="dark"
              :type="
                scope.row.status === 1
                  ? 'success'
                  : scope.row.status === 2
                  ? 'warning'
                  : 'danger'
              "
              >{{
                scope.row.status === 1
                  ? "健康"
                  : scope.row.status === 2
                  ? "有风险"
                  : "不健康"
              }}</el-tag
            >
          </template>
          <span class="normal" v-else>{{ scope.row[col.prop] }}</span>
        </template>
      </el-table-column></el-table
    >
  </div>
</template>

<script>
export default {
  name: "updDataReport",
  props: {
    rows: {
      type: Array,
      required: true
    },
    analyse: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      cols: [
        {
          label: "维度名",
          prop: "key",
          fixed: true
          //width: 80,
        },
        //~~ 3 评价
        {
          label: "判断类型",
          prop: "type",
          fixed: true
          //width: 100,
        },
        {
          label: "健康程度",
          prop: "status",
          fixed: true
          //width: 100,
        },
        //~~ 1 数字
        {
          label: "日期",
          prop: "date"
          //width: 80,
        },
        {
          label: "字符串",
          prop: "string"
          //width: 80,
        },
        {
          label: "数字",
          prop: "number"
          //width: 80,
        },
        {
          label: "其他",
          prop: "other"
          //width: 80,
        },
        //~~ 2 占比
        {
          label: "日期%",
          prop: "date_per"
          //width: 80,
        },
        {
          label: "字符串%",
          prop: "string_per"
          //width: 80,
        },
        {
          label: "数字%",
          prop: "number_per"
          //width: 80,
        },
        {
          label: "其他%",
          prop: "other_per"
          //width: 80,
        }
      ]
    };
  },
  computed: {
    healthyType() {
      let analyse = this.analyse;
      return analyse.perfect ? 1 : analyse.healthy ? 2 : 3;
    }
  }
};
</script>
