import Vue from "vue";

import VueRouter from "vue-router";
Vue.use(VueRouter);

import { theStore } from "../store";

import App from "../views/App.vue";
import Login from "../views/Page/Login/Login.vue";
import UserPage from "../views/Page/UserPage/UserPage.vue";
import DesignCenter from "../views/Page/UserPage/DesignCenter/DesignCenter.vue";
import DesignEdit from "../views/Page/UserPage/DesignEdit/DesignEdit.vue";

const routes = [
  {
    path: "/",
    name: "App",
    component: App,
    children: [
      {
        path: "login",
        name: "Login",
        component: Login
      },
      {
        path: "user/:id",
        name: "UserPage",
        component: UserPage,
        children: [
          {
            path: "center",
            name: "DesignCenter",
            component: DesignCenter
          },
          {
            path: "edit",
            name: "DesignEdit",
            component: DesignEdit
          }
        ]
      }
    ]
  }
  // {
  //   path: "/error/:msg",
  //   name: "Error",
  //   component: () => import("../views/user/Error.vue")
  // }
];

const router = new VueRouter({
  routes
});

export default router;
