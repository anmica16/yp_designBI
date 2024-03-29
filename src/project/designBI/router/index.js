import Vue from "vue";

import VueRouter from "vue-router";
Vue.use(VueRouter);

import { theStore } from "../store";
import loader from "@/plugins/js/loader";
import tool from "@/plugins/js/tool";

import App from "../views/App.vue";
import Login from "../views/Page/Login/Login.vue";
import Error from "../views/Page/Error/Error.vue";
import UserPage from "../views/Page/UserPage/UserPage.vue";
//import DesignCenter from "../views/Page/UserPage/DesignCenter/DesignCenter.vue";
//import DesignEdit from "../views/Page/UserPage/DesignEdit/DesignEdit.vue";

//--------
// 阿里云皮肤
//--------
// import aliLogin from "../views/Page_ali/Login.vue";
// import aliMain from "../views/Page_ali/Main.vue";
// import aliMyPage from "../views/Page_ali/main/MyPage.vue";
// import aliWorkSpace from "../views/Page_ali/main/WorkSpace.vue";
// import aliCreatorArea from "../views/Page_ali/main/CreatorArea.vue";

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
      //21 0301 团队设置页
      {
        path: "group",
        name: "Group",
        component: () =>
          import(
            /* webpackChunkName: "bi-group" */ "../views/Page/Group/Group.vue"
          )
      },
      {
        //21 0303 user存于session，groupId存于url路径
        path: "user/:groupId",
        name: "UserPage",
        meta: {
          needDefaultGroup: true
        },
        component: UserPage,
        children: [
          {
            path: "center",
            name: "DesignCenter",
            component: () =>
              import(
                /* webpackChunkName: "bi-center" */ "../views/Page/UserPage/DesignCenter/DesignCenter.vue"
              ),
            children: [
              {
                path: "menu",
                name: "DesignCenter-menu",
                components: {
                  menu: () =>
                    import(
                      /* webpackChunkName: "bi-center" */ "../views/Page/UserPage/DesignCenter/CenterMenu.vue"
                    )
                }
              },
              {
                path: "data",
                name: "DesignCenter-data",
                components: {
                  data: () =>
                    import(
                      /* webpackChunkName: "bi-center" */ "../views/Page/UserPage/DesignCenter/CenterData.vue"
                    )
                }
              }
            ] // center
          },
          {
            path: "edit/:templateCode",
            name: "DesignEdit",
            component: () =>
              import(
                /* webpackChunkName: "bi-edit" */ "../views/Page/UserPage/DesignEdit/DesignEdit.vue"
              )

            //DesignEdit
          }
        ]
      },
      {
        path: "error",
        name: "Error",
        component: Error
      },
      {
        path: "bv/:linkCode",
        name: "BoardView",
        component: () =>
          import(
            /* webpackChunkName: "bi-edit" */ "../views/Page/PubPage/BoardView.vue"
          )
      }

      // {
      //   path: "ali/login",
      //   name: "aliLogin",
      //   component: aliLogin
      // },
      // {
      //   path: "ali/main",
      //   name: "aliMain",
      //   component: aliMain,
      //   children: [
      //     {
      //       path: "mypage",
      //       name: "aliMyPage",
      //       component: aliMyPage
      //     },
      //     {
      //       path: "work",
      //       name: "aliWorkSpace",
      //       component: aliWorkSpace
      //     },
      //     {
      //       path: "creator",
      //       name: "aliCreatorArea",
      //       component: aliCreatorArea
      //     }
      //   ]
      // }
    ]
  }
];

const router = new VueRouter({
  routes
});

//【=1=】检查是否登录
router.beforeEach((to, from, next) => {
  //${//to and from are Route Object,next() must be called to resolve the hook}
  console.log(["to 和 from", to, from]);

  //【=4=】不需要守卫的页面：
  let purePages = ["Error", "BoardView"];
  if (purePages.indexOf(to.name) > -1) {
    next();
    return;
  }
  //再检查一次也无所谓
  //【=4-2=】直接说明了不需要检查登录的to页面
  // if (to.moreParams && to.moreParams.noCheck) {
  //   next();
  //   return;
  // }

  let hasLoginFn = function(loginUser) {
    //~~ 0 首先确定一下loginUser
    theStore.dispatch("loginIn", loginUser);

    //~~ 1 再次访问login无效，弹回选择绘板页
    if (to.name === "Login" || to.name === "App") {
      if (loginUser.defaultGroup) {
        next({
          name: "DesignCenter-menu"
          //params: { groupId: loginUser.defaultGroup }
        });
      } else {
        next({ name: "Group" });
      }
    } else {
      //~~ 2 如果访问user下的用户页，那么至少也要有一个group才行
      let toGroup = false;
      tool.each(to.matched, r => {
        if (r.meta.needDefaultGroup && !loginUser.defaultGroup) {
          toGroup = true;
          return false;
        }
      });
      if (toGroup) {
        next({ name: "Group" });
      } else {
        next();
      }
    }
  };
  let noLoginFn = function() {
    //【=5.1=】已经在登录页
    if (to.name === "Login") {
      next();
    } else {
      //【=5.2=】跳转到登录页
      next({
        name: "Login"
      });
    }
  };

  //【=1-1=】参数登录的形式，如果给出参数中
  if (to.query) {
    let userCode = "",
      password = "";
    tool.each(to.query, (key, val) => {
      let theKey = (key + "").toLowerCase();
      if (["usercode", "username"].indexOf(theKey) > -1) {
        userCode = val;
      } else if (["password"].indexOf(theKey) > -1) {
        password = val;
      }
    });
    if (userCode) {
      theStore
        .dispatch("loginRequest", { userCode, password })
        .then(({ result }) => {
          Vue.$message.success("浏览器参数登录成功！");
          let user = result.data;
          hasLoginFn(user);
        })
        .catch(r => {
          Vue.$message.warning("浏览器参数登录请求失败！" + (r.msg || ""));
          noLoginFn();
        });
      return;
    }
  }

  //【=1=】已经登录
  let loginUserStr = sessionStorage.getItem("loginUser");
  if (loginUserStr) {
    let loginUser = JSON.parse(loginUserStr);
    hasLoginFn(loginUser);
    return;
  }
  //console.log(["router的 导航首位", store]);
  //【=3=】session未有，检测服务端是否有登录信息
  theStore.state.progress = 10;
  loader
    .ajax({
      url: Vue.Api.designBI,
      data: {
        method: Vue.Api.designBI.CheckLogin
      }
    })
    .then(function(result) {
      let user = result.data;
      theStore.state.progress = 100;
      if (user) {
        hasLoginFn(user);
      } else {
        //【=5=】确定未登录
        noLoginFn();
      }
    })
    .catch(function(result) {
      //console.error(["错误信息页", error, arguments]);
      theStore.state.progress = 100;
      if (result.other) {
        noLoginFn();
      } else {
        Vue.$msgbox({
          type: "warning",
          message:
            "检测登录失败！" +
            `${result.msg ? "错误信息如下：\n" + result.msg : ""}`
        })
          .catch(() => {})
          .finally(() => {
            if (result.msg) {
              theStore.state.errorPageMsg = result.msg;
            }
            next({ name: "Error" });
          });
      }
    });
});

//【=2=】全局守卫2，专门用于特殊路径处理
router.beforeEach((to, from, next) => {
  //# 1 UserPage 下需要确定groupId参数，然后赋值给 store，这样简便、统一

  // ~~ (1)切换前置
  let findUserPage = to.matched.find(m => {
    return m.name === "UserPage";
  });
  //~~ (2)切换后置
  if (findUserPage) {
    let go = tool.clone(to);

    let goTestFn = function(theGO) {
      theStore
        .dispatch("waitPageGroupId", go.params.groupId)
        .then(r => {
          if (theGO) {
            next(go);
          } else {
            next();
          }
        })
        .catch(r => {
          Vue.$msgbox({
            type: "warning",
            message: "用户访问的团队未查询到，请返回团队设置页重试！"
          }).catch(() => {});
          next({ name: "Group" });
        });

      // let theGroup = theStore.state.pageGroups.find(g => {
      //   return g.id == go.params.groupId;
      // });
      // if (!theGroup) {
      //   Vue.$msgbox({
      //     type: "warning",
      //     message: "用户访问的团队未查询到，请返回团队设置页重试！"
      //   }).catch(() => {});
      //   next({ name: "Group" });
      // } else {
      //   if (theGO) {
      //     next(go);
      //   } else {
      //     next();
      //   }
      // }
    };
    //console.log(["user的 守卫正在发挥作用"]);
    if (!go.params.groupId) {
      go.params.groupId = theStore.state.loginUser.defaultGroup;
      //还是没有groupId，那么就应该跳转到group进行选择
      if (!go.params.groupId) {
        Vue.$msgbox({
          type: "warning",
          message: "用户没有设置默认团队，将跳转至团队设置页，请于该页设置！"
        }).catch(() => {});
        go = { name: "Group" };
      } else {
        goTestFn(go);
      }
    } else {
      goTestFn();
    }

    //=2= 如果最后有groupId，那么就set一下store的值
    if (go.params.groupId) {
      theStore.state.pageGroupId = go.params.groupId;
    }
  } else {
    //~~ (3)切换最末跳转调用
    next();
  }
});

export default router;
