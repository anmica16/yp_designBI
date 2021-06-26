<template>
  <div class="page">
    <div class="head page-wrap">
      <div class="page-inner">
        <div class="topBar">
          <div
            class="oneTab"
            :class="{ active: 0 === content }"
            @click="changeContent(0)"
          >
            主页
          </div>

          <template v-for="(bar, i) in contentBar">
            <div
              :key="i"
              class="oneTab"
              :class="{ active: i == content }"
              @click="changeContent(i + 1)"
            >
              <span class="icon" :class="bar.icon"></span>
              <span class="text">{{ bar.text }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="middle page-wrap">
      <div class="page-inner">
        <div class="contentStage">
          <div class="oneContent main" v-show="content === 0">
            <div class="delegateImg"></div>
            <!-- 【1】描述语言 -->
            <div class="delegateText"></div>
          </div>

          <template v-for="(bar, i) in contentBar">
            <div
              :key="i"
              :class="['oneContent', bar.xtype]"
              v-show="content === i + 1"
            >
              <div :is="bar.xtype"></div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="foot page-wrap">
      <div class="page-inner"></div>
    </div>
  </div>
</template>

<script>
import education from "./contents/education.vue";
import experience from "./contents/experience.vue";
import lifeshow from "./contents/lifeshow.vue";
import resume from "./contents/resume.vue";

export default {
  name: "App",
  components: {
    education,
    experience,
    lifeshow,
    resume
  },
  data() {
    return {
      content: 0,
      contentBar: [
        {
          icon: "a",
          text: "个人简历",
          xtype: "resume"
        },
        {
          icon: "a",
          text: "工作经历",
          xtype: "experience"
        },
        {
          icon: "a",
          text: "教育经历",
          xtype: "education"
        },
        {
          icon: "a",
          text: "生活写照",
          xtype: "lifeshow"
        }
      ]
    };
  },
  methods: {
    changeContent(num) {
      let me = this;
      me.content = num;
    }
  }
};
</script>
