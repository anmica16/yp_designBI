<template>
  <div class="AliMain">
    <div class="Header">
      <div class="left">
        <div class="logo"></div>
        <div class="version">
          <span class="iconL"></span>
          <span class="text">标准版</span>
          <span class="iconR"></span>
        </div>
      </div>

      <div class="center">
        <template v-for="(center, i) in centers">
          <div
            class="center-item"
            :class="{
              selected: center === nowSelect
            }"
            :key="i"
          >
            <router-link
              class="link"
              :to="center.to"
              @click.native="selectCenter(center)"
              >{{ center.text }}</router-link
            >
            <div class="border"></div>
          </div>
        </template>
      </div>

      <div class="right">
        <el-popover placement="bottom-end">
          <div slot="reference" class="alertInfo">
            <span class="icon"></span>
          </div>
          <div class="alertInfo-pop">待补充</div>
        </el-popover>

        <el-popover placement="bottom-end">
          <div slot="reference" class="helpInfo">
            <span class="icon"></span>
          </div>
          <div class="helpInfo-pop">待补充</div>
        </el-popover>

        <el-popover placement="bottom-end">
          <div slot="reference" class="helpInfo">
            <span class="icon"></span>
          </div>
          <div class="helpInfo-pop">待补充</div>
        </el-popover>
      </div>
    </div>
    <div class="Body">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: "AliMain",
  data() {
    return {
      nowSelect: null,
      centers: [
        {
          text: "我的",
          to: {
            name: "aliMyPage"
          }
        },
        {
          text: "工作空间",
          to: {
            name: "aliWorkSpace"
          }
        },
        {
          text: "创作区",
          to: {
            name: "aliCreatorArea"
          }
        }
      ]
    };
  },
  methods: {
    selectCenter(center) {
      this.nowSelect = center;
    }
  },
  mounted() {
    let me = this;
    me.nowSelect = me.centers[0];
  }
};
</script>
