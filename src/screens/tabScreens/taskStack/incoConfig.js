const func = [
  {
    title: "入库管理",
    id: "X1",
    funcs: [
      {
        name: "到货登记",
        id: "0",
        auth: "1001",
        navStack: "ArrivalRegistrationStack",
        url: require("src/static/ArrivalRegistrationStack.jpg"),
      },
      {
        name: "项次核对",
        id: "1",
        auth: "1002",
        navStack: "OrderGroupeStack",
        url: require("src/static/OrderGroupeStack.jpg"),
      },
      {
        name: "入库清点",
        id: "2",
        auth: "1005",
        navStack: "CountMethodStack",
        url: require("src/static/CheckMethodStack.jpg"),
      },

      {
        name: "容器上架",
        id: "4",
        auth: "1006",
        navStack: "ContainerHandleStack",
        url: require("src/static/ContainerQueryIcon.jpg"),
      },

      {
        name: "商品上架",
        id: "3",
        auth: "1007",
        navStack: "GoodHandleTaskList",
        url: require("src/static/MerchandiseShelfIcon.jpg"),
      },

      {
        name: "残品入库",
        id: "5",
        auth: "1008",
        navStack: "BadGoodshandle",
        url: require("src/static/ScrapsStoredIcon.jpg"),
      },

      {
        name: "质检落放",
        id: "6",
        auth: "1003",
        navStack: "GetGoodsSetListStack",
        url: require("src/static/ReceiveDropIcon.jpg"),
      },

      {
        name: "入库落放",
        id: "7",
        auth: "1004",
        navStack: "PutStorageStack",
        url: require("src/static/PutStorageIcon.jpg"),
      },
    ],
  },
  {
    title: "出库管理",
    id: "X2",
    funcs: [
      {
        name: "缺货拣货",
        id: "0",
        auth: "2001",
        // navStack: "PickingOutOfStockTypeStack",
        navStack: "PickingOutOfStockStack",
        url: require("src/static/PickingNoStockIcon.jpg"),
      },
      {
        name: "出库集合",
        id: "1",
        auth: "2002",
        navStack: "OutboundTransferStack",
        url: require("src/static/OutboundTransferIcon.jpg"),
      },
      {
        name: "出库复核",
        id: "2",
        auth: "2003",
        navStack: "CheckWarehouseStack",
        url: require("src/static/CheckWarehouseIcon.jpg"),
      },
      {
        name: "快递发货",
        id: "3",
        auth: "2005",
        navStack: "ExpressDeliveryStack",
        url: require("src/static/FastDeliveryIcon.jpg"),
      },
      //
      {
        name: "自配发货",
        id: "4",
        auth: "2006",
        navStack: "SelfDeliveryStack",
        url: require("src/static/AutomaticDeliveryIcon.jpg"),
      },
      {
        name: "标准打包",
        id: "5",
        auth: "2004",
        navStack: "OutboundPackingStack",
        url: require("src/static/OutboundPackingIcon.jpg"),
      },
      {
        name: "简单打包",
        id: "6",
        auth: "2009", // to do
        navStack: "OutboundPackingNoDetailStack",
        url: require("src/static/SimplePackingIcon.png"),
      },
      {
        name: "更换包裹",
        id: "7",
        auth: "2007", // 2007
        navStack: "ChangeParcelStack",
        url: require("src/static/ChangeParcel.png"),
      },
      {
        name: "补打标签",
        id: "8",
        auth: "2010", // to do
        navStack: "ReprintOutboundLabelStack",
        url: require("src/static/RePrint.png"),
      },
      {
        name: "领料任务",
        id: "9",
        auth: "2008", // to do
        navStack: "FeatTaskStack",
        url: require("src/static/GetFeat.png"),
      },
    ],
  },
  {
    title: "库内管理",
    id: "X3",
    funcs: [
      {
        name: "货位转移",
        id: "0",
        auth: "3001",
        navStack: "TransferMethodStack",
        url: require("src/static/SpaceTransferIcon.jpg"),
      },
      {
        name: "正品转残",
        id: "1",
        auth: "3002",
        navStack: "TurnGoodToBadStack",
        url: require("src/static/ArrivalRegistrationStack.jpg"),
      },
      {
        name: "容器查询",
        id: "2",
        auth: "3003",
        navStack: "ContainerQueryStack",
        url: require("src/static/ContainerQueryIcon.jpg"),
      },
      {
        name: "库存查询",
        id: "3",
        auth: "3004",
        navStack: "StockQueryStack",
        url: require("src/static/StockCheckIcon.jpg"),
      },
      {
        name: "取消上架",
        id: "4",
        auth: "3006", //3006
        navStack: "CancelDeliveryStack",
        url: require("src/static/CancelDelivery.png"),
      },
      {
        name: "容器绑定",
        id: "5",
        auth: "3007", //3006
        navStack: "ContainerBindScanStack",
        url: require("src/static/ContainerBind.png"),
      },
      {
        name: "组装拆卸",
        id: "6",
        auth: "3008", //3006
        navStack: "TaskListStack",
        url: require("src/static/Task.png"),
      },
    ],
  },
  {
    title: "盘点管理",
    id: "X5",
    funcs: [
      {
        name: "货位盘点",
        id: "0",
        auth: "3005",
        navStack: "StockCountStack",
        url: require("src/static/StockCountIcon.jpg"),
      },
    ],
  },
];
export { func };
