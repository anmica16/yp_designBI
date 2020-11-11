import tool from "../views/drawer/node_modules/@/plugins/js/tool";
export default class DrawingBoard {
  constructor(cfg) {
    let me = this;
    tool.apply(me, cfg);
  }

  static JsonFields = [];

  //一、props

  //----------------------
  // Section 1 基本参数
  //----------------------
  id = 0;

  //【1】templateCode：绘板唯一码，表示该实例所属绘板是哪个
  templateCode = "";
  //【2】root_instanceCode：根实例对应code
  root_instanceCode = "";
  //【3】name：中文名
  name = "";
  //【4】desp：该控件实例的详细描述
  desp = "";

  //----------------------
  // Section 1.2 创建修改
  //----------------------
  //【++ 1】创建时赋予
  createTime = ""; //Yw.Date.format(new Date(), "yyyy-MM-dd HH:mm:ss")
  //【++ 1.2】创建者 用户表中信息
  createOper = "";
  createOperId = "";

  //【++ 2】修改保存时赋予
  editTime = ""; //Yw.Date.format(new Date(), "yyyy-MM-dd HH:mm:ss")
  //【++ 2.2】修改者 用户表中信息
  editOper = "";
  editOperId = "";
}
