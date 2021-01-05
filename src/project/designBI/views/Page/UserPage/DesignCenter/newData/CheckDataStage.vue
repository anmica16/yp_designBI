<template>
  <div class="checkWrap" v-if="dimension">
    <div class="checkHeader">
      <div class="tableName">{{ DetailData.name }}</div>
      <div class="fill"></div>
      <div class="operatorBar">
        <el-button size="small">更新数据</el-button>
        <el-button size="small">编辑</el-button>
        <el-popover>
          <el-button slot="reference" size="small">创建组件</el-button>
          <div class="createSelect">
            <el-form :model="createForm">
              <el-form-item label="名称">
                <el-input v-model="createForm.name"></el-input>
              </el-form-item>
              <el-form-item label="名称">
                <el-input v-model="createForm.folderId"></el-input>
              </el-form-item>
              <div class="bottomBar">
                <el-button size="small">取消</el-button>
                <el-button size="small">确认</el-button>
              </div>
            </el-form>
          </div>
        </el-popover>
      </div>
    </div>
    <div class="checkBody">
      <el-tabs v-model="checkTabAt" type="card">
        <el-tab-pane label="数据预览" name="preview">
          <div class="viewHeader">
            <i class="icon"></i>
            <i class="icon"></i>
            <span>显示{{ viewCount }}行数据</span>
            <i class="icon"></i>
            <div class="fill"></div>
            <el-input placeholder="字段搜索">
              <i slot="prefix" class="icon"></i>
            </el-input>
          </div>
          <div class="viewBody">
            <DimTable
              :data="getStrDateAoa(keySheet)"
              :dimension="dimension"
            ></DimTable>
          </div>
        </el-tab-pane>

        <el-tab-pane label="血缘分析" name="family"></el-tab-pane>

        <el-tab-pane label="关联视图" name="related"></el-tab-pane>

        <el-tab-pane label="更新信息" name="updateInfo"></el-tab-pane>

        <el-tab-pane label="更新进度" name="newUpdate"></el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import X from "@designBI/views/mixins/X";
import { Xplus } from "@designBI/views/mixins/X";
export default {
  name: "CheckDataStage",
  mixins: [X, Xplus],
  data() {
    return {
      //~ 3 check部分
      checkTabAt: "preview",
      createForm: {
        name: "",
        folderId: ""
      },
      viewCount: 5000
    };
  }
};
</script>
