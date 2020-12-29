<template>
  <div class="ItemEdit">
    <div class="headBar">
      <div class="tabWrap">
        <div class="tabs">
          <Scrollbar>
            <!-- ~ 1 tab循环 首 -->
            <template v-for="ins in theInstances">
              <div
                :key="ins.instanceCode"
                class="oneTab"
                @click="changeIns(ins)"
              >
                <span class="tabTitle">{{ ins.name }}</span>
              </div>
            </template>
          </Scrollbar>
        </div>
        <div class="addNewItemBtn"></div>
      </div>

      <div class="fill"></div>

      <div class="operBtns">
        <div class="item">
          <i class="el-icon-caret-left"></i>
          <span class="text">撤销</span>
        </div>

        <div class="item">
          <span class="text">还原</span>
          <i class="el-icon-caret-right"></i>
        </div>

        <div class="item back" @click="goBackEdit">
          <i class="el-icon-caret-right"></i>
          <span class="text">返回仪表盘</span>
        </div>
      </div>
    </div>

    <div class="editBody">
      <!-- ~ 2 tab循环 体 -->
      <template v-for="ins in theInstances">
        <div
          v-show="nowIns && nowIns.instanceCode === ins.instanceCode"
          :key="ins.instanceCode"
          class="oneTabBody"
        >
          <!-- ~ 3 内部 -->
          <div class="dimensionArea"></div>
          <div class="typeMakeArea"></div>
          <div class="visualArea"></div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "ItemEdit",
  props: {
    addInstances: {
      type: Array,
      required: true
    },
    EditNode: {
      type: Object,
      required: true
    },
    linkDatas: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      canMount: {},
      nowIns: null
    };
  },
  computed: {
    theInstances() {
      return this.addInstances.filter(ins => {
        return !ins.isRoot;
      });
    }
  },
  methods: {
    changeIns(ins) {
      let me = this;
      //~ 1 可mount
      //me.canMount[ins.instanceCode] = true;
      //~ 2 新旧切换
      me.$emit("changeIns", ins, me.nowIns);
      me.nowIns = ins;
    },
    goBackEdit() {
      let me = this;
      me.EditNode.goBackEdit();
    }
  }
};
</script>
