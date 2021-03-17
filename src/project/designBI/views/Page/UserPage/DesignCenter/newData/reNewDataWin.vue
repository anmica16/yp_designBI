<template>
  <div class="reNewDataWin">
    <template v-if="isBad">
      <div class="topTip">
        <el-tag type="danger">上传失败</el-tag>
        <span class="text"
          >出于对数据的前后兼容问题考虑，再次上传的数据必须符合原数据的所有【维度】，不可减少，也不可改变类型</span
        >
      </div>

      <div v-if="hasVacant">
        <div class="pre">缺少：</div>
        <div class="inner">
          <DimTypeTag
            v-for="v in vacantA"
            :key="v.key"
            :type="v.type"
            :name="v.chineseName || v.key"
            xtype="span"
          >
          </DimTypeTag>
        </div>
      </div>

      <div v-if="hasChange">
        <div class="pre">类型改变：</div>
        <div class="inner">
          <el-table border :data="typeCgA">
            <el-table-column label="字段名" prop="key"></el-table-column>

            <el-table-column label="旧">
              <template slot-scope="scope">
                <DimTypeTag :type="scope.row.old.type" xtype="span">
                </DimTypeTag>
              </template>
            </el-table-column>

            <el-table-column label="新">
              <template slot-scope="scope">
                <DimTypeTag :type="scope.row.new.type" xtype="span">
                </DimTypeTag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="topTip">
        <el-tag type="success">上传成功</el-tag>
        <span class="text"
          >当前所上传数据维度既无类型改变，也无缺少，符合要求</span
        >
      </div>

      <div v-if="hasPlus">
        <div class="pre">新增：</div>
        <div class="inner">
          <DimTypeTag
            v-for="v in plusA"
            :key="v.key"
            :type="v.type"
            :name="v.chineseName || v.key"
            xtype="span"
          >
          </DimTypeTag>
        </div>
      </div>

      <div class="plusOption">
        <div class="desp">是否新增维度？</div>
        <div class="selArea">
          <el-radio v-model="ifNewDim" :label="false">不新增</el-radio>
          <el-radio v-model="ifNewDim" :disabled="!hasPlus" :label="true"
            >新增</el-radio
          >
        </div>
      </div>

      <div class="plusOption">
        <div class="desp">追加还是重新上传？</div>
        <div class="selArea">
          <el-radio v-model="ifReUpload" :label="false">追加上传</el-radio>
          <el-radio v-model="ifReUpload" :label="true">重新上传</el-radio>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "reNewDataWin",
  props: {
    vacantA: {
      type: Array,
      required: true
    },
    typeCgA: {
      type: Array,
      required: true
    },
    plusA: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      ifNewDim: false,
      ifReUpload: false,
      queryFlag: "reNewDataWin"
    };
  },
  computed: {
    hasVacant() {
      return this.vacantA.length;
    },
    hasChange() {
      return this.typeCgA.length;
    },
    hasPlus() {
      return this.plusA.length;
    },
    //是否失败
    isBad() {
      return this.hasVacant || this.hasChange;
    }
  },
  methods: {
    getResult() {
      let me = this;
      if (me.isBad) {
        return false;
      } else {
        return {
          ifNewDim: me.ifNewDim,
          ifReUpload: me.ifReUpload
        };
      }
    }
  }
};
</script>
