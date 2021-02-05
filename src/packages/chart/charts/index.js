import Vue from "vue";

import line from "./line.vue";
Vue.component("chart-line", line);
import lineD from "./line-divid.vue";
Vue.component("chart-line-divid", lineD);
import lineR from "./line-range.vue";
Vue.component("chart-line-range", lineR);

import table from "./table.vue";
Vue.component("chart-table", table);
import tableM from "./table-mingxi.vue";
Vue.component("chart-table-mingxi", tableM);

import bar from "./bar.vue";
Vue.component("chart-bar", bar);
import barD from "./bar-divid.vue";
Vue.component("chart-bar-divid", barD);
import barS from "./bar-stack.vue";
Vue.component("chart-bar-stack", barS);
import barC from "./bar-contrast.vue";
Vue.component("chart-bar-contrast", barC);
import barP from "./bar-pubu.vue";
Vue.component("chart-bar-pubu", barP);

import scatter from "./bar.vue";
Vue.component("chart-scatter", scatter);

import lineRadio from "./line-radio.vue";
Vue.component("chart-line-radio", lineRadio);
import pie from "./pie.vue";
Vue.component("chart-pie", pie);
import pieM from "./pie-meigui.vue";
Vue.component("chart-pie-meigui", pieM);

import funnel from "./funnel.vue";
Vue.component("chart-funnel", funnel);
import dashboard from "./dashboard.vue";
Vue.component("chart-dashboard", dashboard);
