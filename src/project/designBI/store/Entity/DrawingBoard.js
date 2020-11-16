import tool from "@/plugins/js/tool";

const BaseCfg = {
  //----------------------
  // Section 1 基本参数
  //----------------------
  id: {
    desp: "数据库id",
    
  },
  templateCode: {
    desp: "绘板唯一码，表示该实例所属绘板是哪个",
    $mapItem: true,
  },

  root_instanceCode: {
    desp: "根实例对应code",
    $mapItem: true,
    
  },
  name: {
    desp: "自定义名称",
    
  },
  desp: {
    desp: "该控件实例的详细描述",
    
  },

  //----------------------
  // Section 1.2 创建修改
  //----------------------
  //【++ 1】创建时赋予
  createTime: {
    desp: "创建时间",
    default: function () {
      return tool.Date.format(new Date(), "yyyy-MM-dd HH:mm:ss");
    },
    
  },
  createOper: {
    desp: "创建者",
    
  },
  createOperId: {
    desp: "创建者ID",
    
  },
  //【++ 2】修改保存时赋予
  editTime: {
    desp: "修改时间",
    default_save: function () {
      return tool.Date.format(new Date(), "yyyy-MM-dd HH:mm:ss");
    },
    
  },
  editOper: {
    desp: "修改者",
    
  },
  editOperId: {
    desp: "修改者ID",
    
  }
};

export default class DrawingBoard {
  constructor(cfg) {
    let me = this;
    tool.apply(me, cfg);
  }
}
