let Ywp = {};
import tool from "@/plugins/js/tool";

let Api_custom = {
  designBI: {
    url: "/Api/DesignBIApi.ashx",
    //~ public
    AddOrUpd: "AddOrUpdTable",
    Delete: "DeleteRecords",
    AddNewTreeItem: "AddNewTreeItem",
    DeleteTreeItem: "DeleteTreeItem",
    //~ 1 绘板
    BoardList: "GetBoardList",
    BoardListFolder: "GetBoardListFolderMode",
    InstanceList: "GetInstanceList",
    DeleteBoard: "DeleteBoard",
    //~ 2 data
    GetDataMenus: "GetDataMenus",
    GetDataDetail: "GetDataDetail",
    //~ 2.2 dataV2
    GetLinkData: "GetLinkData",
    CreateOrUpdTable: "CreateOrUpdTable",
    UpdateLocalTable: "UpdateLocalTable",
    GetLinkDetailData: "GetLinkDetailData",
    GetDimensionsInfo: "GetDimensionsInfo",
    //~ 3 数据库查询
    GetSqlSourceList: "GetSqlSourceList",
    AddSqlSource: "AddSqlSource",
    DeleteSqlSource: "DeleteSqlSource",
    GetLinkSourceDBList: "GetLinkSourceDBList",
    GetLinkSourceDBTableList: "GetLinkSourceDBTableList",
    GetLinkSourceDBViewList: "GetLinkSourceDBViewList",
    GetLinkSourceDBProcedureList: "GetLinkSourceDBProcedureList",
    GetLinkSourceDBTableDimList: "GetLinkSourceDBTableDimList",
    GetLinkSourceDBTableData: "GetLinkSourceDBTableData",
    //~ 4 登录页有关
    Login: "Login",
    LoginTest: "LoginTest",
    LoginOut: "LoginOut",
    Register: "Register",
    CheckLogin: "CheckLogin",
    //~ 5 团队有关
    CreateNewGroup: "CreateNewGroup",
    GetUserGroup: "GetUserGroup",
    GetGroupUserList: "GetGroupUserList",
    GetInviteUserList: "GetInviteUserList",
    UpdateUserDefaultGroup: "UpdateUserDefaultGroup",
    DeleteGroup: "DeleteGroup",
    //~ 6 消息传递有关
    SendMessage: "SendMessage",
    GetMessages: "GetMessages",
    //~ 7 图表部分
    GetMenuItems: "GetMenuItems",
    UpdateUserMainPageCode: "UpdateUserMainPageCode"
  },
  //【21 3-4】请将下列消息列表和后端类【MessageMeta】同步更新
  Message: {
    inviteMember: "inviteMember",
    groupNewMemberNotice: "groupNewMemberNotice",
    groupMemberManage: "groupMemberManage"
  },

  Module: {
    DeleteSchemes: "DeleteSchemes",
    SaveSchemes: "SaveSchemes",
    BaseAuditIniParams: "GetBaseAuditIniParams",
    BaseAuditStepData: "GetBaseAuditStepData",
    BaseAuditInfo: "GetBaseAuditInfo",
    BillAuditIniParams: "GetBillAuditIniParams",
    BillAuditStepData: "GetBillAuditStepData",
    BillAuditInfo: "GetBillAuditInfo",
    AuditCounts: "GetStepDataCounts",
    AuditDetailData: "GetAuditDetailData",
    FlowChartData: "GetFlowChartData",
    AttcTreeData: "GetAttcTreeData",
    AttcData: "GetAttcData",
    FlowChartOption: "GetFlowChartOption",
    FlowChartUpdOption: "UpdateFlowChartOption",
    FlowChartUpdPartOption: "UpdatePartFlowChartOption",
    FlowChartUpdAllList: "GetUpdFlowChartList",
    DesktopData: "GetBSDesktopData",
    DesktopModuleData: "GetBSDesktopModuleData",
    DesktopAdminBase: "GetBSDesktopAdminBase",
    UpdDesktop: "UpdBSDesktop",
    DeleteDesktop: "DeleteBSDesktop",
    DesktopExtend: "GetBSDesktopExtend",
    DeskQueryResult: "GetDeskQueryResult",
    DesktopModuleLeft: "GetDesktopModuleLeft",
    DesktopModuleMain: "GetDesktopModuleMain",
    DesktopModuleOper: "GetDesktopModuleOper",
    ModuleOrBase: "CheckModuleOrBill",
    ConvertDllName: "ConvertDllName",
    TimeEvent: "GetTimeEvent",
    BaseRightMenu: "GetModuleRightMenu"
  }
};

let Api_V8 = {
  user: {
    url: "/Api/SysUserAjaxApi.ashx",
    cklogin: "CheckLogin",
    login: "Login",
    loginOut: "LoginOut",
    loginUserInfo: "GetLoginUserInfo",
    DescMobileModule: "DescMobileModule",
    CheckUpdate: "CheckUpdate"
  },
  System: {
    url: "/Api/SystemAjaxApi.ashx",
    getSystemInfo: {
      name: "GetSystemInfo",
      cache: true,
      cacheField: function(pms) {
        return "SystemInfo";
      }
    },
    Sys: {
      name: "GetSystems",
      cache: true,
      cacheField: function(pms) {
        return Ywp.GetOperatorId() + "_" + pms["id"];
      }
    },
    SysMenus: {
      name: "GetSysMenus",
      cache: true,
      cacheField: function(pms) {
        return Ywp.GetOperatorId();
      }
    }
  },
  Module: {
    url: "/Api/ModuleAjaxApi.ashx",
    IniParams: {
      name: "GetModuleIniParams",
      cache: true,
      cacheField: function(pms) {
        return (pms["moduleId"] || pms["ModuleId"]) + "_" + Ywp.GetOperatorId();
      }
    },
    GetModuleData: "GetModuleData",
    GetModuleDetailData: "GetModuleDetailData",
    AddOrUpd: "AddOrUpd",
    Delete: "Delete",
    Audit: "BaseAudit",
    Apply: "BaseApply",
    AuditHistory: "GetAuditHistory",
    AUFields: "GetAddOrUpdFields",
    AUData: "GetAddOrUpdData",
    FieldData: "GetFieldData",
    FieldUnionData: "GetFieldUnionData",
    ExcAuQSql: "ExcAuQuerySql",
    BillState: "GetBillState",
    Condition: {
      name: "GetCondition",
      cache: true,
      cacheField: function(pms) {
        return (
          (pms["moduleId"] || pms["ModuleId"]) +
          "_" +
          pms["detailId"] +
          "_" +
          Ywp.GetOperatorId()
        );
      }
    },
    ModuleDetail: {
      name: "GetModuleDetail",
      cache: true,
      cacheField: function(pms) {
        return (pms["moduleId"] || pms["ModuleId"]) + "_" + Ywp.GetOperatorId();
      }
    },
    BillIniParams: {
      name: "GetBillIniParams",
      cache: true,
      cacheField: function(pms) {
        return (pms["moduleId"] || pms["ModuleId"]) + "_" + Ywp.GetOperatorId();
      }
    },
    BillSourceData: "GetBillSourceData",
    BillSource: "GetBillSource",
    BillAddOrUpd: "GetBillAddOrUpdInfo",
    BillDetailData: "GetBillDetailData",
    BillSave: "SaveBill",
    BillApply: "BillApply",
    BillAudit: "BillAudit",
    BillCancel: "BillCancel",
    ModuleSchemes: {
      name: "ModuleSchemes",
      cache: true,
      cacheField: function(pms) {
        return (pms["moduleId"] || pms["ModuleId"]) + "_" + Ywp.GetOperatorId();
      }
    }
  },
  IM: {
    url: "/Api/IMApi.ashx",
    Info: "GetIMInfo",
    hisMsg: "GetHisMessage"
  },
  File: {
    url: "/Api/FileUploadApi.ashx",
    upload: "DoWebUpload",
    del: "DoDelete"
  },
  Tools: {
    url: "/Api/ToolsHandler.ashx",
    ViewDoc: "ViewDoc",
    LoadPage: "LoadPage"
  },
  Img: {
    //验证码接口
    url: "/Api/ImgCodeApi.ashx",
    MathCode: "MathCode",
    MakeQRCode: "MakeQRCode",
    SaveDataImg: "SaveDataImg"
  },
  Purview: {
    url: "/Api/PurviewAjaxApi.ashx",
    user: "GetUserList",
    role: "GetRoleList",
    dep: "GetDepList",
    menus: "GetMenus",
    PurFields: "GetPurFields",
    Save: "Save"
  }
};

let Api = tool.merge({}, Api_V8, Api_custom);

export default Api;
