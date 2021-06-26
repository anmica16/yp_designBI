import Vue from "vue";

import VueRouter from "vue-router";
Vue.use(VueRouter);

import Page from '../views/Page.vue';

const routes = [
  {
    path: "/",
    name: "Page",
    component: Page,
  }
];

const router = new VueRouter({
  routes
});
export default router;
