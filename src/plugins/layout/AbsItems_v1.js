import tool from "./tool";

export default class AbsItems {
  constructor(config = {}, holder) {
    let noItemsInfo = "AbsItems构建错误，必须传入items参数！";
    if (tool.isArray(config)) {
      config = {
        items: config
      };
    } else if (tool.isObject(config)) {
      if (!tool.isArray(config.items)) {
        throw noItemsInfo;
      }
    } else {
      throw noItemsInfo;
    }

    if (holder) {
      config.holder = holder;
    }

    let baseCfg = {
      //【1】多少列布局？默认为6
      nCol: 6,
      //【2】行高，
      rowHeight: 10,
      //【2-2】识别行高，用于判断height中有多少行
      rowHeightCs: 10,
      //【3】可选，预定的 容器高度
      maxH: null,
      //【3-2】可自行设定
      maxW: null, //[]
      //【3-2】是否按照传递过来的 最left 与最 right来确定maxH？
      maxWidthByItems: false,

      //【4-1】垂直间隙，1.25为了画 border
      spaceVertical: 1.25,
      //【4-2】水平间隙，1.25为了画 border
      spaceLevel: 1.25,

      //【5-1】边距:
      marginRight: 0,
      marginLeft: 0,

      //【6】高度放大倍数
      heightRatio: 1,

      //【7】是否对 传递过来的表单控件 进行特殊处理
      dealFormItems: false,
      //【7-2】是否按照Render之后自动处理
      renderLayout: true,
      //【8】根据 top left来排序
      orderByTopLeft: true,
      //【8-2】按照最左最上方式加入
      inertTopLeft: true,

      //【9】【可选参数】标签宽度是否 百分比
      autoLabelWidth: false,
      //【9-2】为false时，label的 最小默认宽度
      minLabelWidth: 88,
      //【9-3】为true时的 缩放度
      labelRatio: 1,

      //【10】【可选参数】选择是否加入 未设定 left top的 子元素。默认为false
      addUnsetAbs: true,
      //【11-1】【可选参数】是否水平方向的 自动空白补充？
      autoExpandLevel: true,
      autoExpandVertical: false,
      //【11-2】是否按父容器高度百分比化，可替代向下扩展
      percentHT: false,
      percentHTBlank: true, //把空白也用上

      //【12】是否对top进行模糊处理？
      blurTop: 5 //默认有个5px的模糊度
    };
    Object.assign(this, baseCfg, config);
    Object.assign(this, {
      //-----------
      // 储存变量
      //-----------
      //【1】地图变量
      cellsMap: null,
      //下面在 after步骤中获取
      cellsMapVertical: null,
      emptyMapVertical: null,
      //【2】记录原始items
      originItems: [].concat(this.items),
      //【3】父容器高度
      box_height: 0
      //不要变动。默认的fieldset类型
      //fieldsetXtype: "AbsLayout.Fieldset"
    });
  }

  //开始layout！
  run() {
    return this.AbsStep1BeforeAdd(this.items);
  }

  //【F2】根据items来决定最大宽度，从而确定各内部item的 nCol长度
  getMaxWidthByItems(items) {
    let mostLeft, mostRight;
    tool.each(items, function(item) {
      if (
        tool.isNumber(item.left) &&
        tool.isNumber(item.width) &&
        item.width > 0 &&
        !item.hidden
      ) {
        mostLeft = mostLeft || item.left;
        if (mostLeft > item.left) {
          mostLeft = item.left;
        }
        let theR = item.left + item.width;
        mostRight = mostRight || theR;
        if (mostRight < theR) {
          mostRight = theR;
        }
      }
    });
    if (tool.isNumber(mostLeft) && tool.isNumber(mostRight)) {
      let theTotW = mostRight - mostLeft;
      return theTotW;
    } else {
      return null;
    }
  }

  //【Map 1-1 ··地图··构建】返回一个空白格子：
  newEmptyCell() {
    return {
      isEmpty: true, //表示为可用的 空格子
      itemRef: null //表示所引用的 item，以便在最后
    };
  }
  //【Map 1-2 ··地图··构建】创建一个新行，便于添加进 map中，其中 每一个格子是一个 cell对象
  newEmptyRow() {
    let me = this;
    let Row = [];
    for (let i = 0; i < me.nCol; ++i) {
      //要根据 nCol来弄格子！
      Row[i] = me.newEmptyCell();
    }
    return Row;
  }
  //【Map 1-3 ··地图··构建】根据给定的 父容器高度，预先建立一个空格 cellsMap,应是在 checkNth之后运行
  initialCellsMap(rowHeight, maxH) {
    let me = this,
      _rowHeight = rowHeight || me.rowHeight,
      _maxH = maxH || me.maxH,
      // 一共有好多行
      rowCounts = Math.ceil(_maxH / (_rowHeight + me.spaceVertical)),
      cellsMap = [];
    for (let i = 0; i < rowCounts; ++i) {
      cellsMap.push(me.newEmptyRow());
    }
    return cellsMap;
  }
  //【Map 2-1 ··地图··检索】检测某一行 row 指定位置 rowAt是否有满足宽度 nCol要求的 空格子组
  checkNthEmptyRowAt(row, nCol, rowAt) {
    if (rowAt + nCol - 1 >= row.length) {
      return false; // 首先长度要满足要求
    }
    for (let count = 0; count < nCol; ++count) {
      if (!row[rowAt + count].isEmpty) {
        return false; // 这一连续格子必须要可用
      }
    }
    return true; //该row的 start位 是可行的
  }
  //【Map 2-2 ··地图··检索】从指定位开始 检测并返回 满足插入宽度要求 的 行位置坐标组 canInsert []
  checkNthEmptyWhere(row, nCol, start) {
    let me = this;
    start = start || 0; // 起始
    let canInsert = [];
    tool.each(row, function(cell, j) {
      if (j < start) {
        return false; // 从指定开始位开始
      }
      if (me.checkNthEmptyRowAt(row, nCol, j)) {
        canInsert.push(j);
      }
    });
    return canInsert; //.length ? canInsert : [];
  }
  //【Map 2-3 ··地图··检索】在 row行可行指定位的基础上，纵向检测 下方相同区域的 宽是否都为空格子，如果可行，或者下方没有格子了，都会返回下面这个数组，以提示应该 新添加多少行，以及需要的 位置信息。
  checkNthEmptyColAt(cellsMap, nCol, rowH, rowAt, colAt) {
    let me = this;
    let rowLength = 1; //表示已经处理了 一行。
    if (rowH == 1) {
      return {
        rowNum: rowAt,
        colNum: colAt, //始终是 当前 列的 寻找
        colLength: nCol,
        rowLength: rowH, // 高度长度
        rowNewNeed: rowH - rowLength // 表示还需要新增 row的数量
      };
    }
    for (let c2 = 1; c2 < rowH; ++c2) {
      if (!cellsMap[rowAt + c2]) {
        //【1】成功的话，要么 找到了 rows表的最后一行
        return {
          rowNum: rowAt,
          colNum: colAt, //始终是 当前 列的 寻找
          colLength: nCol,
          rowLength: rowH,
          rowNewNeed: rowH - rowLength // 表示还需要新增 row的数量
        };
      }

      if (
        !me.checkNthEmptyRowAt(
          cellsMap[rowAt + c2], // 可能出界
          nCol,
          colAt
        )
      ) {
        //【3】要么就失败，失败者 不用留记录，直接开始下一row的搜索
        return false; // 如果有失败，那么退出当前的 列搜寻
      } else {
        //而如果成功了，看是否是最后一行，如果是，返回 row号、col所在列、和已解决的高度
        ++rowLength; //成功了就 增加1行

        if (c2 + 1 == rowH) {
          //【2】要么就是找到了 合适的地点
          return {
            rowNum: rowAt,
            colNum: colAt,
            colLength: nCol,
            rowLength: rowH,
            rowNewNeed: rowH - rowLength // 表示还需要新增 row的数量
          };
        }
      }
    } // 一个
  }
  //【Map 2-4 ··地图··检索】寻找是否可以在现在的 cellsMap中寻找到 合适的 插入空隙，从上到下对每一行检查 宽度要求，满足则进一步检测 高度要求。 是概括型的 行、列遍历。
  //  ----- 参数：_1 空格子源，_2 宽度，_3 高度，都为必须传递的para；可选的para4 表示从指定行开始往下寻找，原因是因为前面已经找过了，所以就不用再找了，往往是从新加入的行开始查找，主要是为了得到统一的返回对象，即这里面的 canAt对象，这样既便于 添加新行，又便于进行 高宽上左设定，也便于 cellsMap操作
  checkNthEmpty(cellsMap, nCol, rowH, rowBegin) {
    let me = this;
    // 寻找最深(最上面)的 最左边的
    for (let i = 0; i < cellsMap.length; ++i) {
      //i 为行号
      if (i < rowBegin) {
        continue; //开始下一次循环。从rowBegin 开始
      }
      let canInsert = me.checkNthEmptyWhere(cellsMap[i], nCol);

      //console.log(["canInsert:", canInsert]);

      for (let c1 = 0; c1 < canInsert.length; ++c1) {
        //canInsert[c1] 为col号
        let canAt = me.checkNthEmptyColAt(
          cellsMap,
          nCol,
          rowH,
          i,
          canInsert[c1]
        );
        //console.log(["canAt:", canAt]);
        if (canAt) {
          //找到了就返回这个 obj，如果不能则继续寻找
          return canAt;
        }
      }
    } // 找不到就返回 false，然后再通过加入新一行，再在这个新行进行上述查找(必然满足要求)，这一步放在了调用它的地方
    return false;
  }

  //【Map 3-1 ··地图··使用】按照 指定的位置信息 “使用”掉对应的格子，并对这些格子做好相应的记录、引用处理。
  useEmpty(cellsMap, canAt, item) {
    let me = this;
    for (let plus = 0; plus < canAt.rowNewNeed; ++plus) {
      cellsMap.push(me.newEmptyRow()); //增加新行
    }
    for (let i = 0; i < canAt.rowLength; ++i) {
      for (let j = 0; j < canAt.colLength; ++j) {
        cellsMap[i + canAt.rowNum][j + canAt.colNum].isEmpty = false; //表示已经占用
        cellsMap[i + canAt.rowNum][j + canAt.colNum].itemRef = item; //引用起来
      }
    }
  }

  //【Map 3-2 ··地图··使用】后期 移动 or change child的时候，格子相应变化前的 free动作
  freeChildCells(child) {
    let map = child.$cellsMap;
    for (let i = 0; i < child.$rowLength; ++i) {
      for (let j = 0; j < child.$colLength; ++j) {
        map[i + child.$rowNum][j + child.$colNum].isEmpty = true;
        map[i + child.$rowNum][j + child.$colNum].itemRef = null;
      }
    }
    //相应的对 最左上角进行 归历史并消除动作
    //child.$topLeftCellOld = child.$topLeftCell;
    //delete child.$topLeftCell;
  }
  //【Map 3-3 ··地图··使用】后期 移动 or change child的时候，格子相应变化 后的 占用动作
  useChildCells(child) {
    let map = child.$cellsMap;
    for (let i = 0; i < child.$rowLength; ++i) {
      for (let j = 0; j < child.$colLength; ++j) {
        try {
          map[i + child.$rowNum][j + child.$colNum].isEmpty = false;
          map[i + child.$rowNum][j + child.$colNum].itemRef = child;
        } catch (e) {
          console.log(e);
          console.log([map, child]);
        }
      }
    }
    // 给child加上最 左上角的格子引用，以便在后面 以格子为导向的移动变化过程中进行 自适应过程
    //child.$topLeftCell = map[child.$rowNum][child.$colNum];
  }

  //【Map 4-1 ··地图··设定】处理多余的开始、末尾空行
  trimCellsMap(cellsMap) {
    let me = this,
      canDeleteRow = [];
    cellsMap = cellsMap || me.cellsMap;

    let dealRow = function(row) {
      let canTrim = true;
      for (let j = 0; j < row.length; ++j) {
        let cell = row[j];
        if (!cell.isEmpty) {
          canTrim = false;
        }
      }
      if (canTrim) {
        canDeleteRow.push(row);
      }
      return canTrim;
    };
    //开头
    for (let i = 0; i < me.cellsMap.length; ++i) {
      if (!dealRow(me.cellsMap[i])) {
        break;
      }
    }
    //末尾
    for (let i = cellsMap.length - 1; i > -1; --i) {
      if (!dealRow(me.cellsMap[i])) {
        break;
      }
    }
    //处理
    tool.each(canDeleteRow, function(row) {
      let at = cellsMap.indexOf(row);
      if (at > -1) {
        cellsMap.splice(at, 1);
      }
    });
  }
  //【Map 4-2 ··地图··设定】在基于 完毕的 cellsMap进行系列查询操作前，应该初始化补充一些东西
  // --- 在每一次进行插入删除格子操作后，都应该执行一次这个函数
  //  --- 给每一个 cell附上 x y值
  dealCellsMap(cellsMap) {
    let me = this;
    cellsMap = cellsMap || me.cellsMap;
    for (let i = 0; i < cellsMap.length; ++i) {
      for (let j = 0; j < cellsMap[i].length; ++j) {
        let cell = cellsMap[i][j]; //引用类型
        // 【task 1】xy 赋值
        cell.y = i; //【y】别搞反了，显示行 也就是 y
        cell.x = j; //【x】然后才是 每一列的读取，也就是 x
      }
    }
  }

  // <--------- 后期所需的函数 ---------->
  //【Map 5-1 ··地图··Get】获取map的 总高度，以便正确设置 容器的高度
  getMapTotHeight(cellsMap) {
    let me = this,
      totH =
        (cellsMap.length * me.rowHeight +
          (cellsMap.length - 1) * me.spaceVertical) *
        me.heightRatio;
    return totH;
  }

  getMapTotUsedHeight(cellsMap) {
    let me = this,
      itemsMap = me.getEmptyAndItemsMap(cellsMap).itemsMap,
      lastI;
    for (let i = 0; i < itemsMap.length; ++i) {
      let oneRow = itemsMap[i];
      if (oneRow.length) {
        lastI = i;
      }
    }
    !tool.isNumber(lastI) && (lastI = itemsMap.length - 1);
    let totRow = lastI + 1,
      totH =
        (totRow * me.rowHeight + (totRow - 1) * me.spaceVertical) *
        me.heightRatio;

    return totH;
  }

  //【Map 5-2 ··地图··Get】得到为空的 一个map，也是含有每一行，只是每一行内部有的 只是 空的 对象，所以可以遍历了,得到 item的 map
  getEmptyAndItemsMap(cellsMap) {
    let emptyMap = [], // 记录空，随后从 每行最左开始 对连续空格子 进行分配
      itemsMap = []; // 记录 每行有哪些items，以便再 空格分配时，有row针对的范围。
    if (!cellsMap.length) {
      return {
        emptyMap: emptyMap,
        itemsMap: itemsMap
      };
    }
    for (let i = 0; i < cellsMap.length; ++i) {
      let rowItems = []; // row的
      for (let j = 0; j < cellsMap[i].length; ++j) {
        let cell = cellsMap[i][j]; //引用类型
        // 【task 1】寻找空
        emptyMap[i] = emptyMap[i] || [];
        if (cell.isEmpty) {
          emptyMap[i].push(cell); //【空的获取】
        }
        // 【task 2】记录每行 item 且这里是 create好了的 控件形式
        if (
          cell.itemRef &&
          !rowItems.some(function(a) {
            return a == cell.itemRef;
          })
        ) {
          rowItems.push(cell.itemRef); //注意避免 空白格子的 null的加入
        }
      }
      itemsMap.push(rowItems);
    }

    return {
      emptyMap: emptyMap,
      itemsMap: itemsMap
    };
  }

  //【Map 5-3 ··地图··Get】获得以 x轴 纵向遍历 为视角的3个map
  getVerticalMaps(cellsMap) {
    let cellsMapVertical = [];
    if (!cellsMap.length) {
      return cellsMapVertical;
    }
    let rowLen = cellsMap[0].length, //每行长度
      colLen = cellsMap.length; //每列长度

    for (let x = 0; x < rowLen; ++x) {
      for (let y = 0; y < colLen; ++y) {
        let cell = cellsMap[y][x]; //x不变，y在递增,cellsMap是先是纵坐标 再是横坐标
        //【1】cellsMap的纵形
        cellsMapVertical[x] = cellsMapVertical[x] || [];
        cellsMapVertical[x][y] = cell; //这样就转化为了每个 x上 y的集合的形式，x对应每个列
      }
    }
    return cellsMapVertical;
  }

  //【Map 5-4 ··地图··Get】返回child某方向紧邻的格子cells和其中的child引用数组。child可能是空白格子 也可能是控件元素。返回 cells数组与 neighbours数组
  getChildCloses(child, toward) {
    let me = this,
      closeCells = [],
      neighbours = [], //一起寻找，找到紧邻的items
      map = me.cellsMap, //水平方向地图
      mapVertical = me.cellsMapVertical || me.getVerticalMaps(map); //ok
    //【1】空白格子直接返回 空[]
    if (!child || child.isEmpty) {
      //isEmpty表示这只是一个 避免报错的 空{}对象
      return {
        closeCells: closeCells,
        neighbours: neighbours
      }; //直接返回空
    }
    //【2】控件元素就 遍历
    switch (toward.toLowerCase()) {
      case "right":
      case "r": // 假如是右
        for (let i = 0; i < child.$rowLength; ++i) {
          let pCol = child.$colNum + child.$colLength - 1, //最右的位置
            pRow = child.$rowNum + i,
            pToward = pCol + 1; //最右 +1
          if (pToward < map[pRow].length) {
            //保证没有出界
            let cell = map[pRow][pToward];
            //【1】cell格子加入完毕
            closeCells.push(cell);
            //【2】cell格子中的 childRef加入完毕
            if (
              cell.itemRef &&
              !neighbours.some(function(a) {
                return a == cell.itemRef;
              })
            ) {
              neighbours.push(cell.itemRef); //注意避免 空白格子的 null的加入
            }
          } else {
            return {
              closeCells: closeCells,
              neighbours: neighbours
            }; //否则就提前返回，因为这里是矩形规则框框，一个边的点出界了，那么整个边都 出界了。
          }
        }
        break;

      case "left":
      case "l":
        for (let i = 0; i < child.$rowLength; ++i) {
          let pCol = child.$colNum, //最左的位置
            pRow = child.$rowNum + i,
            pToward = pCol - 1; //最左 -1
          if (pToward >= 0) {
            //保证没有出界
            let cell = map[pRow][pToward];
            //【1】cell格子加入完毕
            closeCells.push(cell);
            //【2】cell格子中的 childRef加入完毕
            if (
              cell.itemRef &&
              !neighbours.some(function(a) {
                return a == cell.itemRef;
              })
            ) {
              neighbours.push(cell.itemRef); //注意避免 空白格子的 null的加入
            }
          } else {
            return {
              closeCells: closeCells,
              neighbours: neighbours
            }; //否则就提前返回，因为这里是矩形规则框框，一个边的点出界了，那么整个边都 出界了。
          }
        }
        break;

      case "up":
      case "u":
        for (let i = 0; i < child.$colLength; ++i) {
          let pCol = child.$rowNum, //最左的位置
            pRow = child.$colNum + i,
            pToward = pCol - 1; //最左 -1
          if (pToward >= 0) {
            //保证没有出界
            let cell = mapVertical[pRow][pToward];
            //【1】cell格子加入完毕
            closeCells.push(cell);
            //【2】cell格子中的 childRef加入完毕
            if (
              cell.itemRef &&
              !neighbours.some(function(a) {
                return a == cell.itemRef;
              })
            ) {
              neighbours.push(cell.itemRef); //注意避免 空白格子的 null的加入
            }
          } else {
            return {
              closeCells: closeCells,
              neighbours: neighbours
            }; //否则就提前返回，因为这里是矩形规则框框，一个边的点出界了，那么整个边都 出界了。
          }
        }
        break;

      case "down":
      case "d":
        for (let i = 0; i < child.$colLength; ++i) {
          let pCol = child.$rowNum + child.$rowLength - 1, //最右的位置
            pRow = child.$colNum + i,
            pToward = pCol + 1; //最右 +1
          if (pToward < mapVertical[pRow].length) {
            //保证没有出界
            let cell = mapVertical[pRow][pToward];
            //【1】cell格子加入完毕
            closeCells.push(cell);
            //【2】cell格子中的 childRef加入完毕
            if (
              cell.itemRef &&
              !neighbours.some(function(a) {
                return a == cell.itemRef;
              })
            ) {
              neighbours.push(cell.itemRef); //注意避免 空白格子的 null的加入
            }
          } else {
            return {
              closeCells: closeCells,
              neighbours: neighbours
            }; //否则就提前返回，因为这里是矩形规则框框，一个边的点出界了，那么整个边都 出界了。
          }
        }
        break;

      default:
        throw "没有给定正确的方向！请在up down left right中选择一个！";
    }
    return {
      closeCells: closeCells,
      neighbours: neighbours
    }; //读取完毕 正常返回
  }

  //【Map 5-5 ··地图··Get】获得相反的方向
  getReverseToward(toward) {
    switch (toward) {
      case "right":
      case "r":
        return "l";

      case "left":
      case "l":
        return "r";

      case "up":
      case "u":
        return "d";

      case "down":
      case "d":
        return "u";

      default:
        throw "没有给定正确的方向！请在up down left right中选择一个！";
    }
  }

  //【Map 5-6 ··地图··check】返回方向 首字母小写，确保方向是正确的
  checkToward(toward) {
    toward = toward.toLowerCase();
    switch (toward) {
      case "right":
      case "r":
      case "left":
      case "l":
      case "up":
      case "u":
      case "down":
      case "d":
        return toward[0].toLowerCase();

      default:
        throw "没有给定正确的方向！请在up down left right中选择一个！";
    }
  }

  //【Map 5-7 ··地图··Get】确保child 确实有 movePlan
  checkMovePlan(child, toward) {
    let plan = child.$movePlan;
    if (!plan) {
      //|| !plan.hasOwnProperty(toward)//这个加进来就不太灵活
      throw "请确保对 child 进行了一次 movePlan之后再进行调用!";
    }
    return child.$movePlan[toward];
  }

  //【Move 1 ··移动】【核心1】对child向某方向前进1个格子是否可行进行分析，会对邻近child元素进行迭代分析。一次只对 1格进行分析，不要多了。要多也可以，基于这个一格的method扩展即可
  makeMovePlan(child, toward, moveNbs, closeLevel) {
    //第三个参数表示紧邻程度，用于辨别是否是第一次，因为第一次不能为 null，而后续是可以为 null的
    let me = this;
    let CloseLevel = closeLevel || 0; //0表示自身,还未开始 紧邻扩散
    if (!CloseLevel && (!child || !child.$cellsMap)) {
      //如果为0 且child 为null，那么 plan失败，因为 缺少主体
      // 如果后面需要return false而不是传递 throw，请用 try catch
      console.log(
        "第一次应该传递 后期带有 $cellsMap的 child引用，才可以对其进行move计划"
      ); //，忽略此error 作为false 请使用 try catch处理");
      return false;
    }
    child = child || { isEmpty: true }; //一个避免报错的 空{}对象，在最后判定为 空格子时 变回 null
    toward = toward || "right"; //默认为 向右，初始化阶段即向右
    toward = toward[0].toLowerCase(); //直接变成 方向上的首字母，统一一下
    child.$movePlan = child.$movePlan || {}; //因为可能有多个方向的 plan，调用此planMaker的不仅仅只可能是 自动填充，以后的 主动移动也可以用呀，可以多个方向进行判断，再决定怎么走。

    // 如果 在未实行计划的阶段，即当前plan阶段，就已经通过 扩散传播 获取主动调用该方法，在这个 方向上做了一次 plan，那么就忽略 这个 child接下来的 plan make，因为必然的，该child该方向上后续所有 波及到的 child都已经 make plan成功了，这是因为传播路径是相同的缘故，执行、return路径也相同。
    if (Object.hasOwnProperty.call(child.$movePlan, toward)) {
      //四个方向的首字母的小写 分别是不一样的。
      return child.$movePlan[toward]; // 就可以直接返回这个plan方向的 结论
    }
    // 为了垂直方向做准备
    let cellsAndNbs = me.getChildCloses(child, toward),
      closeCells = cellsAndNbs.closeCells,
      neighbours = cellsAndNbs.neighbours; //获得方向上 紧邻的 格子

    //【++ 1】如果不移动邻居，那么只要存在邻居，就判定为 false
    if (!moveNbs && neighbours && neighbours.length) {
      child.$movePlan[toward] = false;
      return false;
    }

    if (closeCells.length) {
      //【++ 2】如果moveNbs 为 false 那么到这里就表示 全为空格子了
      if (!moveNbs) {
        child.$movePlan[toward] = true;
        child.$movePlan[toward + "Neighbours"] = neighbours; //便于 process的时候逐控件进行遍历
        child.$movePlan[toward + "CloseCells"] = closeCells;
        //child
        return true;
      } else {
        for (let i = 0; i < closeCells.length; ++i) {
          let neighbour = closeCells[i].itemRef; //邻居是 itemRef 而不是cell容器
          if (!me.makeMovePlan(neighbour, toward, moveNbs, CloseLevel + 1)) {
            //对每一个 紧邻格子 也做计划
            child.$movePlan[toward] = false;
            return false; //如果有 某个邻近格子做出了无法 move的判断，那么整个move plan就失败
          }
        }
        // 这里就是 迭代得到全部行可以 move的结论后的位置
        //  --- 提示：到达这里即表示 该控件占有的 全部行 的最右边紧邻格子 均边是 空白格子，这样才会返回下面的true
        child.$movePlan[toward] = true;
        child.$movePlan[toward + "Neighbours"] = neighbours; //便于 process的时候逐控件进行遍历
        child.$movePlan[toward + "CloseCells"] = closeCells;
        //child
        return true;
      }
    } else {
      //没有格子，那么该 child就是 要么是 空白格子null，要么是到达 边界的 child
      // 且必然到达最右边的 child，这个最右边边界格子，要么是中间的 空白格子，要么就是最右边边界的 child
      //【1】自身是 空白格子，进行设置 并返回 ture，这里的xtype检查是因为想实现该函数的迭代功能，但是又避免不了后续传入的 child为 空白格子的 null，造成在null上取属性的 error，因此所以用一个假的临时 空{}对象进行绕过操作，该{}空对象没有xtype定义，所以可以通过这样识别出来。
      if (child === null || child.isEmpty) {
        child = null; //重新设置为 null
        return true;
      } else {
        //【2】到达最右边边界 从而无法移动的 child控件
        child.$movePlan[toward] = false; //该边界 child设定为 该方向上 不可 move
        return false;
      }
    }
  }

  //【Move 2 ··移动】【核心3-1】对child进行一格的移动，其结果暂时不用体现在 浏览器视图中。浏览器视图的展示会在最后完成确定的时候再统一调用一个遍历所有items，对其 top、left、height、width的 change进行重新设定
  moveChild(child, toward) {
    let me = this;
    toward = me.checkToward(toward);
    me.checkMovePlan(child, toward);
    switch (toward) {
      case "right":
      case "r":
        ++child.$colNum;
        break;

      case "left":
      case "l":
        --child.$colNum;
        break;

      case "up":
      case "u":
        --child.$rowNum;
        break;

      case "down":
      case "d":
        ++child.$rowNum;
        break;

      default:
        throw "没有给定正确的方向！请在up down left right中选择一个！";
    }
    //child.$newPosition = newPosition;//绑定好

    child["$positionChanged"] = true; //表示需要重新设定 top left
    return true;
  }

  //【Move 3 ··移动】【核心2】对带有可行movePlan的child进行其movePlan的执行！一般对一次 makePlan的 根child元素进行该方法的调用。当然也可以对非根目录的 child进行调用，不过那样就是很自由化的一次 move行动了，需要很强的自定义整个操作过程调用，有明确目时才这样干。
  processMovePlan(child, toward, moveNbs) {
    if (child.$movePlan["movePlanFinished"]) {
      return true; //已经执行就不要再执行了，不然会重复进行，这既浪费效率，又会出bug
    }
    let me = this;
    toward = me.checkToward(toward);
    let canMove = me.checkMovePlan(child, toward);
    if (canMove) {
      if (moveNbs) {
        let neighbours = child.$movePlan[toward + "Neighbours"];
        for (let i = 0; i < neighbours.length; ++i) {
          me.processMovePlan(neighbours[i], toward, moveNbs); //全都执行一次
        }
      }

      //最右边的child 执行
      me.freeChildCells(child);
      // 移动
      me.moveChild(child, toward);
      // 然后使用格子
      me.useChildCells(child);
    }

    child.$movePlan["movePlanFinished"] = true; //表示已经执行了这一次movePlan
    return true; //必然成功
  }
  //【Move 4 ··移动】【核心3-2】对child的格子进行某方向的扩展，扩展的格子一定时矩形，因为这个layout就是以矩形为基础的。格子 $colLength与 宽度$nCol同步进行增加，$rowLength和 $rowH同理
  expandChildCells(child, toward) {
    // 在扩充之前先free掉，在改变参数了之后再use掉，但是这里是扩充，所以不需要free，因为之前使用的依然在使用中，不会有变数
    let me = this;
    //me.freeChildCells(child);
    toward = me.checkToward(toward);
    me.checkMovePlan(child, toward);
    switch (toward) {
      case "right":
      case "r":
        ++child.$colLength;
        ++child.$nCol;
        break;

      case "left":
      case "l":
        --child.$colNum;
        ++child.$colLength;
        ++child.$nCol;
        break;

      case "up":
      case "u":
        --child.$rowNum;
        ++child.$rowLength;
        ++child.$rowH;
        break;

      case "down":
      case "d":
        ++child.$rowLength;
        ++child.$rowH;
        break;

      default:
        throw "没有给定正确的方向！请在up down left right中选择一个！";
    }
    // 在expand中只需要再使用一次就 ok了，这样其他如 行动的move history也能正常显示
    me.useChildCells(child);
    child["$sizeChanged"] = true;
    child.$movePlan["expanded"] = true; //表示已经扩充了
    return true; //必然成功
  }

  //【Move 5 ··移动】【核心4-1】一次movePlan执行之后，将当前movePlan放入历史，随后删掉当前已过时的movePlan，为下一次makePlan营造良好环境。在一次 完整行动成功之后，应刷新一次move plan，这里的做法是作为历史记录保留
  refreshChildrenMovePlan(itemsMap) {
    let me = this;
    itemsMap = itemsMap || me.getEmptyAndItemsMap(me.cellsMap).itemsMap;
    for (let i = 0; i < itemsMap.length; ++i) {
      for (let n = 0; n < itemsMap[i].length; ++n) {
        let child = itemsMap[i][n];
        if (child.$movePlan) {
          child.$movePlanHistory = child.$movePlanHistory || [];
          child.$movePlanHistory.push(child.$movePlan); //作为一个数组保留下去把，方便debug
          delete child.$movePlan;
        }
      }
    }
  }

  //【Move 6 ··移动】【核心4-2】在所有预想的 move、expand等 plan完成的最后，再进行一次children的 top left的重新设定，以展现出这些plan做完之后的效果
  refreshAbsChildrenWHTL(itemsMap) {
    let me = this;
    itemsMap = itemsMap || me.getEmptyAndItemsMap(me.cellsMap).itemsMap;
    for (let i = 0; i < itemsMap.length; ++i) {
      for (let n = 0; n < itemsMap[i].length; ++n) {
        let child = itemsMap[i][n];
        if (child.$positionChanged) {
          // || child.xtype != "textfield"
          me.makeItemTopLeft(child);
          delete child.$positionChanged; //用完即重置
        }
        if (child.$sizeChanged) {
          //不是textfield的可能会走样 || !tool.isXType(child.xtype, "textfield")
          me.makeItemWidthHeight(child);
          delete child.$sizeChanged; //用完即重置
        }
      }
    }

    // 布局容器高度
    me.box_height = me.getMapTotHeight(me.cellsMap);
    //console.log(["check w s", holderW, holderInnerW, padding]);

    //【=3=】刷新各种map
    delete me.cellsMapVertical;
  }

  //【Move 7 ··移动】【核心0】【总调用函数】全map范围内的对空白格子进行填充。
  //---- 具体过程：按给定方向进行自动填充空白，没有得到可执行的 plan，过程自动结束，如果得到可执行plan，并且执行完毕后，会再一次运行该过程，直到 该指定方向上没有可执行的plan为止。
  autoExpandBlank(toward) {
    let me = this;
    toward = me.checkToward(toward);
    let someMap =
        toward == "u" || toward == "d"
          ? me.getEmptyAndItemsMap(
              me.cellsMapVertical || me.getVerticalMaps(me.cellsMap)
            )
          : me.getEmptyAndItemsMap(me.cellsMap),
      orderKey = toward == "u" || toward == "d" ? "$rowH" : "$nCol",
      emptyMap = someMap.emptyMap,
      itemsMap = someMap.itemsMap;

    // 这里是对有空白各自的行 进行 plan
    for (let i = 0; i < emptyMap.length; ++i) {
      if (emptyMap[i].length) {
        // 将该行按照 补充方向进行 大小排序，比如宽度补充在 宽度最小的 item上
        itemsMap[i].sort(function(a, b) {
          return a[orderKey] - b[orderKey];
        });
        //console.log("itemsMap row", itemsMap[i]);
        // 对该行最感兴趣的item进行plan，依次直到可行，可行就执行这个plan,因为 行号i是共用的，所以可以这样遍历
        for (let n = 0; n < itemsMap[i].length; ++n) {
          let child = itemsMap[i][n];
          //【++ 1】如同 fieldset，可以不自动伸长
          if (!child.notAutoExpand) {
            // 如果有可行计划，那么接下来的动作就一定成功执行并且 刷新 重新进行，不然就会报错
            if (me.makeMovePlan(child, toward, true)) {
              // 移动 然后再对这个对象进行 空白扩充
              let p1 = me.processMovePlan(child, toward, true);
              //在向右移动一个后 左边必然会有一个 blank空白格子
              let p2 = me.expandChildCells(child, me.getReverseToward(toward));
              if (p1 && p2) {
                // 刷新一次 plan
                me.refreshChildrenMovePlan(itemsMap);
                // 再进行一次分配
                me.autoExpandBlank(toward);
                return true;
              } else {
                throw "autoExpandBlank的计划执行过程 不应该出现失败的意外!";
              }
            }
          }
        } //每一个 item
      }
    } //每一空白行
    // 结束的时候再刷新一次，因为那些没有执行的 false plan还没有刷新，所以需要 刷新一次 plan
    me.refreshChildrenMovePlan(itemsMap);
  }

  //【Opt 1 ··附加】可以在abs布局结束后进行 高度 百分比化
  makePercentHT(items) {
    //console.log(["可以在abs布局结束后进行 高度 百分比化："]);

    let layout = this,
      pH = layout.percentHTBlank
        ? layout.getMapTotUsedHeight(layout.cellsMap)
        : layout.getMapTotHeight(layout.cellsMap);

    tool.each(items, function(item) {
      //【=1=】top 要往上一个间隙 才是正确的百分比起始位
      let totH = item.$rowNum
          ? item.height + layout.spaceVertical
          : item.height,
        //【=2=】height要包含间隙 一起的百分比
        totT = item.$rowNum ? item.top - layout.spaceVertical : item.top,
        perH = (totH / pH) * 100,
        perT = (totT / pH) * 100;

      //【=3=】top 要在起始位 往下一个间隙px值
      item.calcT = item.$rowNum
        ? "calc( " +
          (perT + "%") +
          " + " +
          (layout.spaceVertical + 0.05) +
          "px)"
        : perT + "%";
      //【=4=】item的 height 要在包含间隙的 高度上减去 间隙
      item.calcH = item.$rowNum
        ? "calc( " +
          (perH + "%") +
          " - " +
          (layout.spaceVertical - 0.05) +
          "px)"
        : perH + "%";
      //item.calcT = item.$rowNum ? (perT + vPer) + "%" : perT + "%";
      //item.calcH = item.$rowNum ? (perH - vPer) + "%" : perH + "%";
      item.$oldHeight = item.height_dom;
      item.height_dom = item.calcH;
      item.$oldTop = item.calcT;
      item.top_dom = item.calcT;
    });
  }

  //【Form 3】设置items 按照后台top left顺序排列
  makeOrderedItems(items) {
    let me = this;
    //【临时局部】记录top left范围内的顺序排位
    let rows = {},
      rowsNums = [],
      //【临时局部】记录没有定义 left、top的item，以在最后的时候按默认值加入
      unsetAbs = [],
      //【临时局部】记录最底行，方便对 items 进行排序，也便于在 最后加入 未设定 top left的 items
      topMax = 0;

    // 【3-1】absolute部分的准备工作 ---第【1】次遍历，按 top范围值分成各行
    tool.each(items, function(item) {
      if (!tool.isNumber(item.top) || !tool.isNumber(item.left)) {
        unsetAbs.push(item); //-2- 为null or undefined
        return;
      }

      //【20-0320】对top进行一次模糊处理
      if (me.blurTop && tool.isNumber(me.blurTop) && me.blurTop > 0) {
        let fitTop = null,
          minDiv = null;
        tool.each(rows, function(rowTop) {
          let rowTopNum = parseFloat(rowTop),
            closeDiv = Math.abs(rowTopNum - item.top);
          if (closeDiv <= me.blurTop) {
            //如果是小一点的 间距，且以后来的为主
            if (minDiv === null || closeDiv <= minDiv) {
              minDiv = closeDiv;
              fitTop = rowTopNum;
            }
          }
        });
        if (tool.isNumber(fitTop)) {
          item.top = fitTop; //top变为这个模糊后的 top
        }
      }

      // 0805 20：39 决定把此仅作为加入 rows的一个优先度记录元素，具体第几行如上 1 2 3 所属。
      let iTop = item.top; // 代表 top的 上下关系
      topMax = iTop > topMax ? iTop : topMax; // 记录最底row的 top行号

      if (!rows[iTop]) {
        rows[iTop] = [];
        rowsNums.push(iTop);
      }
      rows[iTop].push(item); // 第一次遍历只是放进去，还没有经过处理
    });

    // 【3-2】把unsetAbs按默认值 放进去
    if (me.addUnsetAbs) {
      tool.each(unsetAbs, function(item) {
        topMax++; //新的一行
        item.left = 1; //都设置为1，表示相同的优先度
        rows[topMax] = rows[topMax] || [];
        rows[topMax].push(item);
      });
      //console.log([rows, unsetAbs]);
    } else {
      tool.each(unsetAbs, function(item) {
        item.hidden = true;
      });
    }

    // 【3-3】对items按从上到下 从左到右进行排序,形成新 items，不过还没有定位，这里只是准备工作
    let newItems = [];
    rowsNums.sort(function(a, b) {
      return a - b;
    });
    tool.each(rowsNums, function(rowNum) {
      rows[rowNum].sort(function(a, b) {
        return a.left - b.left;
      });
      newItems = newItems.concat(rows[rowNum]);
    });
    //console.log(["检查rows排列，准备加入默认值", rows,newItems]);

    //【3-4】把排好序的 items赋给 holder,这里返回这个 处理好的 items
    return newItems;
  }

  //【F3-1】$nCol 设置item标准Nth列宽度
  makeStdWidth(item, WHTL) {
    let me = this,
      //auto 当前的标准单位
      stdW = me.stdW;
    if (item.hidden == true) {
      return;
    }
    if (!item.$sizeChanged) {
      //为了传入一个 width重置 width，设置其nCol
      if (WHTL) {
        item.width = WHTL.width;
      }
      // 【2】宽度设置的准备工作 ---默认按照 100 ~ 600的比例尺计算，因为这符合后台传输数据范围
      if (!item.width) {
        item.width = stdW; //按照较小档次计算
      }
      if (tool.isString(item.width) && item.width.indexOf("%") > -1) {
        item.$nCol = Math.round(
          (parseInt(item.width.replace("%", "")) / 100) * me.nCol
        );
      } else {
        item.$nCol = Math.round(item.width / stdW);
      }
      item.$nCol > me.nCol && (item.$nCol = me.nCol); //排除过大超标情况
      item.$nCol <= 0 && (item.$nCol = 1); //排除过小，从而为0的情况
    }

    //【3】宽度设置：
    let widthPercent;

    if (typeof me.spaceLevel == "string" && me.spaceLevel.indexOf("%") > -1) {
      let spaceL = parseFloat(me.spaceLevel.replace("%", ""));
      widthPercent =
        ((100 / (100 - spaceL)) * 99.99 * item.$nCol) / me.nCol - spaceL; //现在是一整个间距了
      widthPercent = widthPercent + "%";
    } else {
      // 正负号也要正确
      widthPercent =
        "calc( " +
        (99.99 * item.$nCol) / me.nCol +
        "%  - " +
        (me.spaceLevel -
          (me.spaceLevel * item.$nCol) / me.nCol +
          ((me.marginLeft + me.marginRight) * item.$nCol) / me.nCol) +
        "px)";
    }

    item.$oldWidth = item.width_dom;
    item.width_dom = widthPercent; // + "%";//减去1整个， 减去一半的话体现不出右边间距的 概念
  }
  //【F3-2】$rowH 设置item标准Nth列高度，规范化
  makeStdHeight(item, WHTL) {
    let me = this;
    if (item.hidden == true) {
      return;
    }

    if (!item.$sizeChanged) {
      if (WHTL) {
        item.height = WHTL.height;
      }

      // 【=1=】高度设置的准备工作
      if (!item.height) {
        item.height = me.rowHeightCs; //默认一行
      }
      if (tool.isString(item.height)) {
        let parseH = parseFloat(item.height);
        console.warn([
          "item的高度不兼容百分比模式，请使用Number类型，已简易转化为parseFloat的形式。",
          item,
          item.height,
          parseH
        ]);
        item.height = parseH;
      }

      let row = Math.round(item.height / me.rowHeightCs);
      row = row > 0 ? row : 1; //避免row为0的情况，最小也是1行
      // 【=2=】解决多行控件高度与间距的问题
      if (row > 1) {
        let realH = row * me.rowHeight,
          addH = (row - 1) * me.spaceVertical,
          realRow = Math.ceil(row * (realH / (realH + addH)));
        item.$rowH = realRow;
      } else {
        item.$rowH = row;
      }
    }

    //【=4=】高度height 设置
    item.$oldHeight = item.height_dom; //高度统一放大到heightRatio倍
    item.height_dom =
      (item.$rowH * me.rowHeight + (item.$rowH - 1) * me.spaceVertical) *
      me.heightRatio; // - spaceVertical;
  }

  //【T1 ··汇总】一个完整的item  高宽 处理，为TOP Left排序做准备
  makeItemWidthHeight(item) {
    let me = this;
    if (!item.$sizeChanged) {
      //【=1=】原始layout
      item.$originWHTL ||
        (item.$originWHTL = {
          width: item.width,
          height: item.height,
          top: item.top,
          left: item.left
        }); //记录传过来的layout信息
      //【=2=】item高宽 地图适用信息处理
      //me.makeSpecialItem(item); //为特殊类型的 控件设置需要的高宽
      me.makeStdHeight(item);
      me.makeStdWidth(item);
      //me.makeSpecialItemAfter(item);
      //【=3=】将地图中的高宽反应到 item上去：
    } else {
      me.makeStdHeight(item);
      me.makeStdWidth(item);
    }
  }
  //【T2 ··汇总】填充到地图中去， cellsMap,要填充的地图， itemsArray是一个加入一个 进行递增的 数组，这里只读
  makeItemIntoMap(item, cellsMap, itemsArray) {
    let me = this;
    if (!tool.isNumber(item.$rowH) || !tool.isNumber(item.$nCol)) {
      me.makeItemWidthHeight(item);
    }

    //【6-1】寻找 map里面 最上最左的合适位置
    //    --- 这一步决定了插入的 核心规则，这里是按照 最上 再看最左的方式进行插入的
    let canAt;
    if (item.inertTopLeft || me.inertTopLeft || itemsArray.length < 2) {
      canAt = me.checkNthEmpty(cellsMap, item.$nCol, item.$rowH);
    } else {
      let withLastItem = itemsArray[itemsArray.length - 2];
      canAt = me.checkNthEmpty(
        cellsMap,
        item.$nCol,
        item.$rowH,
        withLastItem.$rowNum
      );
    }

    //【6-2】没有找到就新加一行，然后从这一新行开始寻找
    if (!canAt) {
      cellsMap.push(me.newEmptyRow());
      //【6-3】在新加入的 最末一行开始寻找，避免重复寻找的无用功
      canAt = me.checkNthEmpty(
        cellsMap,
        item.$nCol,
        item.$rowH,
        cellsMap.length - 1
      );
    }
    //console.log(["可以插入！", canAt, cellsMap, item.fieldLabel]);

    //【6-4】使用map，并在map中的 cells做好有关记录
    //   --- 这里处理一下，不够的 rows就加，并将相应的格子变为占用mode，即false表示
    me.useEmpty(cellsMap, canAt, item);

    //【6-5】给 item 绑定位置信息
    item.$rowNum = canAt.rowNum; //相当于top
    item.$rowLength = canAt.rowLength; //相当于width
    item.$colNum = canAt.colNum; //相当于left
    item.$colLength = canAt.colLength; //相当于hegiht
    item.$cellsMap = cellsMap; //填充到的map 绑定
  }
  //【T3 ··汇总】设置TopLeft，根据已知的 地图填充信息
  makeItemTopLeft(item) {
    let me = this;

    item.$oldTop = item.top_dom;
    item.$oldLeft = item.left_dom;

    //【=1=】top设置
    item.top_dom =
      (item.$rowNum * me.rowHeight + item.$rowNum * me.spaceVertical) *
      me.heightRatio;
    //【=2=】left设置
    //  --- 解决方法：每个格子都有固定大小 间距，当然这个是 可选参数，然后在 高度做数学运算，转化为合适的 纵向格子数，以展示预期的 原始设定高度。即通过 格子高度 + 间距高度 = 设定高度的方式来算格子数量。
    if (typeof me.spaceLevel == "string" && me.spaceLevel.indexOf("%") > -1) {
      let spaceL = parseFloat(me.spaceLevel.replace("%", ""));
      item.left_dom =
        ((100 / (100 - spaceL)) * //此为修正的 left，以实现仅有内部间距的布局
          99.99 *
          item.$colNum) /
          me.nCol +
        "%";
    } else {
      item.left_dom =
        "calc( " +
        (99.99 * item.$colNum) / me.nCol +
        "%  + " +
        ((me.spaceLevel * item.$colNum) / me.nCol +
          me.marginLeft * (1 - item.$colNum / me.nCol) +
          -((me.marginRight * item.$colNum) / me.nCol)) +
        "px)";
    }
  }
  //【T4 ··汇总】对加入之后的 item进行 高宽、top left、title 等设定
  makeItemAfterAdd(item) {
    let me = this;

    if (item.hidden !== true) {
      //【=1=】如果是 后续手动 add进来的 item 那么是没有经过 step1的，所以这里要再检查并重设一下
      if (!item.$originWHTL) {
        me.makeItemIntoMap(item, me.cellsMap, me.items);
        me.makeItemTopLeft(item);
      }
      //【=2=】格子处理完毕后，设置 item 绝对定位，以及其高宽设定，这里统一一下：
      //me.setAbsChildTopLeft(item);
      //me.setAbsChildWidthHeight(item);
      //me.setSpecialChildAdded(item);
      //me.setChildTitle(item);

      item.$cellsMap = me.cellsMap;
      item.$cellsMap[item.$rowNum][item.$colNum].itemRef = item;
    }
  }

  // ==========================================================
  // 【absolute】绝对定位
  // ==========================================================
  // 【一】AbsStep1BeforeitemrenAddOrLayout：对每一个 items进行高宽、上左 进行设定前的 准备工作，并按照 top left信息来 对 items 进行重新排序，以符合 后台布局顺序，而不是随机或者 是按照其他的顺序排序。
  AbsStep1BeforeAdd(items) {
    let me = this;

    //【reload】最开始，可能是 再一次的reload：
    //me.clearMap();
    //me.addItems = [];

    //【++ 2】列不动，此为常用项,应是该设置好，设定好垂直方向的 对齐线密度
    me.maxW = me.maxWidthByItems ? me.getMaxWidthByItems(items) : me.maxW;
    me.maxW = me.maxW || me.getMaxWidthByItems(items); //如果没有给定
    me.stdW = me.maxW / me.nCol;

    //【2】看是否初始化一个cellsMap
    me.cellsMap = me.initialCellsMap(me.rowHeight, me.maxH); //公共的 格子地图

    //【3】首先对 items按照 top left进行一次排序
    items = me.makeOrderedItems(items);

    //【5】处理好fs的 二次 完整layout，这下正确了。
    let tempAddItems = [];
    tool.each(items, function(item) {
      item.$originWHTL = {
        width: item.width,
        height: item.height,
        top: item.top,
        left: item.left
      }; //记录传过来的layout信息
      me.makeItemWidthHeight(item);
      me.makeItemIntoMap(item, me.cellsMap, tempAddItems);
      me.makeItemTopLeft(item);
      //add加入模仿
      tempAddItems.push(item);
      //【=6=】高宽设定
      me.makeItemAfterAdd(item);
    });

    //【7】items记录
    me.items = items;

    console.log(["checkStep1 ed", items]);

    //【8】结尾动作
    return me.AbsStep4AfterAdd(items);
  }
  // 【三】AbsStep3AfterOneitemAdd：在 item dom创建之后，完成 abs layout的布局，即 检索map空隙，插入新行，为每个item获得正确 定位信息，设定好 item 上左，并相应的 “使用”并“记录更新”好 cellsMap中的 信息。
  AbsStep3AfterOneAdd(item) {
    let me = this;
    if (!me.cellsMap) {
      console.warn([
        "【v8】AbsItems布局工具尚未进行初始化，请在子项Item add进入完毕之后，手动调用初始化过程。"
      ]);
      return;
    }
    me.originItems.push(item);
    me.makeItemAfterAdd(item);
    me.items.push(item);
    //console.log(["checkStep3 ed", holder, item, holder.items.length]);
  }

  // 【四】AbsStep4AfteritemrenAddOrLayout：在所有 item完成了 定位初始化工作之后，对 其父容器进行必要的 高宽、position设定，以满足内部定位、展示需要。还会完成一些 布局收尾工作、 控件相关元素绑定等结束工作，以便在初始化后的 生命周期再进行有关 layout cellsMap item的定位改变工作。
  AbsStep4AfterAdd(items) {
    let me = this;

    //【=1=】清理冗余水平末尾空行
    me.trimCellsMap(me.cellsMap);

    //【=2=】-- 对cellsMap进行 x y指定
    me.dealCellsMap(me.cellsMap);

    //【=3=】格子矩阵me.cellsMap中 还有一些没用到的 空格子，这里进行总的分析和再处理，分配给每行最少的几个上，从左往右。 向右 向下 进行自动空白扩充
    if (me.autoExpandLevel) {
      me.autoExpandBlank("right");
    }
    if (me.autoExpandVertical) {
      me.autoExpandBlank("down");
    }

    //【=4=】是否需要将高度 top百分比化，这适用于高度固定场景
    me.percentHT && me.makePercentHT(items);

    //【=5=】刷新所有 itemren的 宽高上左 以及 holder的 高
    me.refreshAbsChildrenWHTL();

    //【=6=】基本信息打印提示debug
    console.log(["【v8.1】绝对定位layout:", me, "cellsMap:", me.cellsMap]);

    //【=7=】返回最终的处理结果 items！
    return items;
  }
}
