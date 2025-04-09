import Error from "../screens/errorStack/Error";
import ArrivalRegistrationStack from "../screens/arrivalRegistration/ArrivalRegistrationStack";
import OrderGroupeStack from "../screens/itemCheck/OrderGroupeStack";
import ItemCheckScanStack from "../screens/itemCheck/ItemCheckScanStack";
import CountMethodStack from "../screens/InventoryCheck/CountMethodStack";
import PrintTestingStack from "../screens/printTesting/PrintTestingStack";
import CarPickGoodsPositionListStack from "../screens/tabScreens/taskStack/carPickTaskStack/CarPickGoodsPositionListStack";
import FaPickTaskGoodsPositionListStack from "../screens/tabScreens/taskStack/faPickTaskStack/FaPickTaskGoodsPositionListStack";
import GoodsDetailStack from "../screens/tabScreens/taskStack/carPickTaskStack/GoodsDetailStack";
import DropPositionDetailStack from "../screens/tabScreens/taskStack/carPickTaskStack/DropPositionDetailStack";
import PickTaskDropStack from "../screens/tabScreens/taskStack/pickTaskStack/PickTaskDropStack";
import PickTaskGoodsPositionListStack from "../screens/tabScreens/taskStack/pickTaskStack/PickTaskGoodsPositionListStack";
import PickTaskDetailStack from "../screens/tabScreens/taskStack/pickTaskStack/PickTaskDetailStack";
import FaPickTaskDetail from "../screens/tabScreens/taskStack/faPickTaskStack/FaPickTaskDetail";
import FaDropConfirmStack from "../screens/tabScreens/taskStack/faPickTaskStack/FaDropConfirmStack";
import FaDropTaskStack from "../screens/tabScreens/taskStack/faPickTaskStack/FaDropTaskStack";
import ItemCheck_WR_DetailStack from "../screens/itemCheck/ItemCheck_WR_DetailStack";
import ItemCheck_SKU_DetailStack from "../screens/itemCheck/ItemCheck_SKU_DetailStack";
import ItemCheck_SKU_ExtUnit_DetailStack from "src/screens/itemCheck/ItemCheck_SKU_ExtUnit_DetailStack";
import ItemCheck_Done_Stack from "../screens/itemCheck/ItemCheck_Done_Stack";
import ItemCheckSearchStack from "../screens/itemCheck/ItemCheckSearchStack";
import ItemCheck_Sync_SKU_DetailStack from "src/screens/itemCheck/ItemCheck_Sync_SKU_DetailStack";
import ItemCheck_Sync_SKU_ExtUnit_DetailStack from "src/screens/itemCheck/ItemCheck_Sync_SKU_ExtUnit_DetailStack";
import ItemCheck_Sync_WR_DetailStack from "src/screens/itemCheck/ItemCheck_Sync_WR_DetailStack";
import ItemCheck_Sync_Done_Stack from "src/screens/itemCheck/ItemCheck_Sync_Done_Stack";
import ChooseCountDoorStack from "../screens/InventoryCheck/ChooseCountDoorStack";
import CountMainListStack from "../screens/InventoryCheck/CountMainListStack";
import BindContainerStack from "../screens/InventoryCheck/BindContainerStack";
import CloseContainerStack from "../screens/InventoryCheck/CloseContainerStack";
import StartCountStack from "src/screens/InventoryCheck/StartCountStack";
import Count_SKU from "src/screens/InventoryCheck/Count_SKU";
import ContainerHandleStack from "src/screens/containerHandleStack/ContainerHandleStack";
import ContainerSkuListStack from "src/screens/containerHandleStack/ContainerSkuListStack";
import ContainerAlreadyHandleStack from "src/screens/containerHandleStack/ContainerAlreadyHandleStack";
import ContainerHandleConfirmStack from "src/screens/containerHandleStack/ContainerHandleConfirmStack";
import ContainerEmptyListStack from "src/screens/containerHandleStack/ContainerEmptyListStack";
import GoodHandleTaskDetail from "src/screens/goodsHandleStack/GoodHandleTaskDetail";
import GoodHandleSearchPositionStack from "src/screens/goodsHandleStack/GoodHandleSearchPositionStack";
import GoodHandleTaskList from "src/screens/goodsHandleStack/GoodHandleTaskList";
import BadGoodshandle from "src/screens/badGoodsHandle/BadGoodshandle";
import BadGoodsHandleDetail from "src/screens/badGoodsHandle/BadGoodsHandleDetail";
import GetGoodsSetComfirmStack from "src/screens/getGoodsSetStack/GetGoodsSetComfirmStack";
import GetGoodsSetListStack from "src/screens/getGoodsSetStack/GetGoodsSetListStack";
import PutStorageStack from "src/screens/putStorage/PutStorageStack";
import PutStorageScanSkuStack from "src/screens/putStorage/PutStorageScanSkuStack";
import AblePositionStack from "src/screens/tabScreens/taskStack/pickTaskStack/AblePositionStack";
import CommonContainerBindStack from "src/screens/commonBindStack/CommonContainerBindStack";

import PickingOutOfStockTypeStack from "../screens/outboundManagement/pickingOutOfStock/PickingOutOfStockTypeStack";
import PickingOutOfStockStack from "../screens/outboundManagement/pickingOutOfStock/PickingOutOfStockStack";
import LocationDetailStack from "../screens/outboundManagement/pickingOutOfStock/LocationDetailStack";
import DropLocationStack from "src/screens/outboundManagement/pickingOutOfStock/DropLocationStack";
import ReceiveDropStack from "../screens/outboundManagement/pickingOutOfStock/ReceiveDropStack";
import OutboundTransferStack from "../screens/outboundManagement/outboundTransfer/OutboundTransferStack";
import DropPositionStack from "../screens/outboundManagement/outboundTransfer/DropPositionStack";
import ContainerCodeStack from "../screens/outboundManagement/outboundTransfer/ContainerCodeStack";
import CheckWarehouseStack from "../screens/outboundManagement/checkWarehouse/CheckWarehouseStack";
import CheckedDetailWarehouseStack from "../screens/outboundManagement/checkWarehouse/CheckedDetailWarehouseStack";
import ConfirmCheckedSKUStack from "../screens/outboundManagement/checkWarehouse/ConfirmCheckedSKUStack";
import ExpressDeliveryStack from "../screens/outboundManagement/expressDelivery/ExpressDeliveryStack";
import ExpressDeliveryDetailStack from "../screens/outboundManagement/expressDelivery/ExpressDeliveryDetailStack";
import SelectLogisticsCompanyStack from "../screens/outboundManagement/expressDelivery/SelectLogisticsCompanyStack";
import OutboundPackingStack from "../screens/outboundManagement/outboundPacking/OutboundPackingStack";
import OutboundPackingDetailStack from "../screens/outboundManagement/outboundPacking/OutboundPackingDetailStack";
import OrderPackagedStack from "../screens/outboundManagement/outboundPacking/OrderPackagedStack";
import AdjustOrderPackedStack from "../screens/outboundManagement/outboundPacking/AdjustOrderPackedStack";
import SpaceTransferStack from "src/screens/inventoryManagement/spaceTransfer/SpaceTransferStack";
import TurnGoodToBadStack from "src/screens/inventoryManagement/turnGoodToBad/TurnGoodToBadStack";
import ContainerQueryStack from "src/screens/inventoryManagement/containerQuery/ContainerQueryStack";
import StockQueryStack from "src/screens/inventoryManagement/stockQuery/StockQueryStack";
import TransferMethodStack from "src/screens/inventoryManagement/spaceTransfer/TransferMethodStack";
import TransferShelfStack from "src/screens/inventoryManagement/spaceTransfer/TransferShelfStack";
import TransferTakedownStack from "src/screens/inventoryManagement/spaceTransfer/TransferTakedownStack";
import ContainerTransferScanStack from "src/screens/inventoryManagement/spaceTransfer/ContainerTransferScanStack";
import ContainerTransferSubmitStack from "src/screens/inventoryManagement/spaceTransfer/ContainerTransferSubmitStack";
import SKUSelectionStack from "src/screens/inventoryManagement/turnGoodToBad/SKUSelectionStack";
import ConfirmRemovalStack from "src/screens/inventoryManagement/turnGoodToBad/ConfirmRemovalStack";
import BatchDefectiveShelvingStack from "src/screens/inventoryManagement/turnGoodToBad/BatchDefectiveShelvingStack";
import SingleDefectiveShelvingStack from "src/screens/inventoryManagement/turnGoodToBad/SingleDefectiveShelvingStack";
import StockCountStack from "../screens/stockCount/StockCountStack";
import StockCountPassageStack from "src/screens/stockCount/StockCountPassageStack";
import StockCountPassageDetailStack from "../screens/stockCount/StockCountPassageDetailStack";
import PassageDetailSkUListStack from "src/screens/stockCount/PassageDetailSkUListStack";
import PassageDetailSkUItemStack from "src/screens/stockCount/PassageDetailSkUItemStack";
import AddressInfoStack from "src/screens/outboundManagement/expressDelivery/AddressInfoStack";
import SelfDeliveryStack from "src/screens/outboundManagement/selfDelivery/SelfDeliveryStack";
import SelfDeliveryDetailStack from "src/screens/outboundManagement/selfDelivery/SelfDeliveryDetailStack";
import ConfirmPackingStack from "src/screens/outboundManagement/outboundPacking/ConfirmPackingStack";
import CheckedSKUListStack from "src/screens/outboundManagement/checkWarehouse/CheckedSKUListStack";
import OutboundPackingNoDetailPackedStack from "src/screens/outboundManagement/outboundPackingNoDetail/OutboundPackingNoDetailPackedStack";
import OutboundPackingNoDetailStack from "src/screens/outboundManagement/outboundPackingNoDetail/OutboundPackingNoDetailStack";
import PackingNoDetailOutboundNoteStack from "src/screens/outboundManagement/outboundPackingNoDetail/PackingNoDetailOutboundNoteStack";
import ChangeParcelStack from "src/screens/outboundManagement/changeParcel/ChangeParcelStack";
import ChangeParcelDetailStack from "src/screens/outboundManagement/changeParcel/ChangeParcelDetailStack";
import ChangeParcelPackedStack from "src/screens/outboundManagement/changeParcel/ChangeParcelPackedStack";
import CancelDeliveryDetailStack from "src/screens/inventoryManagement/cancelDelivery/CancelDeliveryDetailStack";
import CancelDeliveryStack from "src/screens/inventoryManagement/cancelDelivery/CancelDeliveryStack";
import ConfirmParcelPageStack from "src/screens/outboundManagement/changeParcel/ConfirmParcelPageStack";
import ReprintOutboundLabelStack from "src/screens/outboundManagement/reprintOutboundLabel/ReprintOutboundLabelStack";
import ContainerBindScanStack from "src/screens/inventoryManagement/containerBind/ContainerBindScanStack";
import FeatAblePositionStack from "src/screens/outboundManagement/featTask/FeatAblePositionStack";
import FeatTaskDetailStack from "src/screens/outboundManagement/featTask/FeatTaskDetailStack";
import FeatTaskDropStack from "src/screens/outboundManagement/featTask/FeatTaskDropStack";
import FeatTaskListStack from "src/screens/outboundManagement/featTask/FeatTaskListStack";
import FeatTaskStack from "src/screens/outboundManagement/featTask/FeatTaskStack";
import EmptyPositionStack from "src/screens/inventoryManagement/assemblyAndDisassembly/EmptyPositionStack";
import TaskListStack from "src/screens/inventoryManagement/assemblyAndDisassembly/TaskListStack";
import ContainerPositionListStack from "src/screens/inventoryManagement/assemblyAndDisassembly/ContainerPositionListStack";
import ItemListStack from "src/screens/inventoryManagement/assemblyAndDisassembly/ItemListStack";
import ItemDetailStack from "src/screens/inventoryManagement/assemblyAndDisassembly/ItemDetailStack";

//huangsiyuStack;
const ErrorStackRoutes = [
  {
    name: "Error",
    component: Error,
    option: { title: "错误页面" },
    headerShown: true,
  },
];

const CommonStack = [
  {
    name: "CommonContainerBindStack",
    component: CommonContainerBindStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
];

//叉车拣货stack页面；
const CarPickTaskStack = [
  {
    name: "CarPickGoodsPositionListStack",
    component: CarPickGoodsPositionListStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
  {
    name: "GoodsDetailStack",
    component: GoodsDetailStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
  {
    name: "DropPositionDetailStack",
    component: DropPositionDetailStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
];

//拣货任务stack页面；
const PickTaskStack = [
  {
    name: "PickTaskDropStack",
    component: PickTaskDropStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
  {
    name: "PickTaskGoodsPositionListStack",
    component: PickTaskGoodsPositionListStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
  {
    name: "PickTaskDetailStack",
    component: PickTaskDetailStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
  {
    name: "AblePositionStack",
    component: AblePositionStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
];

//FA拣货stack页面；
const FaPickTaskStack = [
  {
    name: "FaPickTaskGoodsPositionListStack",
    component: FaPickTaskGoodsPositionListStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
  {
    name: "FaPickTaskDetail",
    component: FaPickTaskDetail,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
  {
    name: "FaDropConfirmStack",
    component: FaDropConfirmStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
  {
    name: "FaDropTaskStack",
    component: FaDropTaskStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
];

//到货登记Stack页面
const ArrivalRegistration = [
  {
    name: "ArrivalRegistrationStack",
    component: ArrivalRegistrationStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
];

//项次核对Stack页面
const ItemCheck = [
  {
    name: "OrderGroupeStack",
    component: OrderGroupeStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ItemCheckScanStack",
    component: ItemCheckScanStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ItemCheck_WR_DetailStack",
    component: ItemCheck_WR_DetailStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ItemCheck_SKU_DetailStack",
    component: ItemCheck_SKU_DetailStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ItemCheck_Done_Stack",
    component: ItemCheck_Done_Stack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ItemCheckSearchStack",
    component: ItemCheckSearchStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ItemCheck_SKU_ExtUnit_DetailStack",
    component: ItemCheck_SKU_ExtUnit_DetailStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ItemCheck_Sync_WR_DetailStack",
    component: ItemCheck_Sync_WR_DetailStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ItemCheck_Sync_SKU_DetailStack",
    component: ItemCheck_Sync_SKU_DetailStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ItemCheck_Sync_SKU_ExtUnit_DetailStack",
    component: ItemCheck_Sync_SKU_ExtUnit_DetailStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ItemCheck_Sync_Done_Stack",
    component: ItemCheck_Sync_Done_Stack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
];

//入库清点Stack页面
const InventoryCheck = [
  {
    name: "CountMethodStack",
    component: CountMethodStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ChooseCountDoorStack",
    component: ChooseCountDoorStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "CountMainListStack",
    component: CountMainListStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "BindContainerStack",
    component: BindContainerStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "CloseContainerStack",
    component: CloseContainerStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "StartCountStack",
    component: StartCountStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "Count_SKU",
    component: Count_SKU,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  //...
];
//入库清点Stack页面
const PrintTesting = [
  {
    name: "PrintTestingStack",
    component: PrintTestingStack,
    option: { title: "打印测试" },
    headerShown: true,
  },
  //...
];

//容器上架Stack页面
const ContainerHandle = [
  {
    name: "ContainerHandleStack",
    component: ContainerHandleStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ContainerSkuListStack",
    component: ContainerSkuListStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ContainerAlreadyHandleStack",
    component: ContainerAlreadyHandleStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ContainerHandleConfirmStack",
    component: ContainerHandleConfirmStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "ContainerEmptyListStack",
    component: ContainerEmptyListStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
];

//商品上架Stack页面
const GoodsHandle = [
  {
    name: "GoodHandleTaskList",
    component: GoodHandleTaskList,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "GoodHandleTaskDetail",
    component: GoodHandleTaskDetail,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "GoodHandleSearchPositionStack",
    component: GoodHandleSearchPositionStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
];
//残品上架Stack页面
const BadGoodsHandle = [
  {
    name: "BadGoodshandle",
    component: BadGoodshandle,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "BadGoodsHandleDetail",
    component: BadGoodsHandleDetail,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
];

//收获落放Stack
const GetGoodsSet = [
  {
    name: "GetGoodsSetListStack",
    component: GetGoodsSetListStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "GetGoodsSetComfirmStack",
    component: GetGoodsSetComfirmStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
];
//入库落放Stack
const PutStorage = [
  {
    name: "PutStorageStack",
    component: PutStorageStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "PutStorageScanSkuStack",
    component: PutStorageScanSkuStack,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
];

/*出库管理页面*/
// 拣货缺货Stack页面
const PickingOutOfStock = [
  {
    name: "PickingOutOfStockStack",
    component: PickingOutOfStockStack,
    option: {
      title: "缺货拣货",
    },
  },
  {
    name: "PickingOutOfStockTypeStack",
    component: PickingOutOfStockTypeStack,
    option: {
      title: "缺货拣货",
    },
  },
  // 货位详情
  {
    name: "LocationDetailStack",
    component: LocationDetailStack,
    option: {
      header: () => null,
      headerShown: false,
    },
  },
  // 已处理查看落放页面
  {
    name: "DropLocationStack",
    component: DropLocationStack,
    option: {
      header: () => null,
      headerShown: false,
    },
  },
  // 落放页面
  {
    name: "ReceiveDropStack",
    component: ReceiveDropStack,
    option: {
      header: () => null,
      headerShown: false,
    },
  },
];
// 出库集合(原出库转移)
const OutboundTransfer = [
  // 货架列表
  {
    name: "OutboundTransferStack",
    component: OutboundTransferStack,
    option: {
      title: "出库集合",
      headerShown: true,
    },
  },
  // 落放列表
  {
    name: "DropPositionStack",
    component: DropPositionStack,
    option: {
      header: () => null,
      headerShown: false,
    },
  },
  // 容器编码
  {
    name: "ContainerCodeStack",
    component: ContainerCodeStack,
    option: {
      title: "容器编码",
      headerShown: true,
    },
  },
];
// 出库复核
const CheckWarehouse = [
  // 复核列表
  {
    name: "CheckWarehouseStack",
    component: CheckWarehouseStack,
    option: {
      title: "出库复核",
      headerShown: true,
    },
  },
  // 已复核列表
  {
    name: "CheckedSKUListStack",
    component: CheckedSKUListStack,
    option: {
      header: () => null,
      headerShown: false,
    },
  },
  // 已复核详情
  {
    name: "CheckedDetailWarehouseStack",
    component: CheckedDetailWarehouseStack,
    option: {
      header: () => null,
      headerShown: false,
    },
  },
  // SKU复核详情
  {
    name: "ConfirmCheckedSKUStack",
    component: ConfirmCheckedSKUStack,
    option: {
      title: "出库复核",
      headerShown: true,
    },
  },
];
// 快递发货
const ExpressDelivery = [
  // 快递订单列表
  {
    name: "ExpressDeliveryStack",
    component: ExpressDeliveryStack,
    option: {
      title: "快递发货",
      headerShown: true,
    },
  },
  // 订单详情
  {
    name: "ExpressDeliveryDetailStack",
    component: ExpressDeliveryDetailStack,
    option: {
      title: "快递发货",
      headerShown: true,
    },
  },
  // 选择快递公司
  {
    name: "SelectLogisticsCompanyStack",
    component: SelectLogisticsCompanyStack,
    option: {
      title: "选择快递公司",
      headerShown: true,
    },
  },
  // 收货地址
  {
    name: "AddressInfoStack",
    component: AddressInfoStack,
    option: {
      title: "",
      headerShown: false,
    },
  },
];
// 自配发货
const SelfDelivery = [
  {
    name: "SelfDeliveryStack",
    component: SelfDeliveryStack,
    option: {
      title: "自配发货",
      headerShown: true,
    },
  },
  {
    name: "SelfDeliveryDetailStack",
    component: SelfDeliveryDetailStack,
    option: {
      title: "自配发货",
      headerShown: true,
    },
  },
];
// 出库打包-有明细
const OutboundPacking = [
  // 订单
  {
    name: "OutboundPackingStack",
    component: OutboundPackingStack,
    option: {
      title: "标准打包",
      headerShown: true,
    },
  },
  // 订单SKU列表
  {
    name: "OutboundPackingDetailStack",
    component: OutboundPackingDetailStack,
    option: {
      header: () => null,
      headerShown: false,
    },
  },
  // 订单已包装SKU列表
  {
    name: "OrderPackagedStack",
    component: OrderPackagedStack,
    option: {
      header: () => null,
      headerShown: false,
    },
  },
  // 调整订单包装数量
  {
    name: "AdjustOrderPackedStack",
    component: AdjustOrderPackedStack,
    option: {
      title: "已包装",
      headerShown: true,
    },
  },
  // 确认包装
  {
    name: "ConfirmPackingStack",
    component: ConfirmPackingStack,
    option: {
      title: "确认包装",
      headerShown: true,
    },
  },
];
// 出库打包-无明细
const OutboundPackingNoDetail = [
  {
    name: "OutboundPackingNoDetailStack",
    component: OutboundPackingNoDetailStack,
    option: {
      title: "简单打包",
      headerShown: true,
    },
  },
  // 出库单
  {
    name: "PackingNoDetailOutboundNoteStack",
    component: PackingNoDetailOutboundNoteStack,
    option: {
      header: () => null,
      headerShown: false,
    },
  },
  // 已包装
  {
    name: "OutboundPackingNoDetailPackedStack",
    component: OutboundPackingNoDetailPackedStack,
    option: {
      header: () => null,
      headerShown: false,
    },
  },
];
// 更换包裹
const ChangeParcel = [
  {
    name: "ChangeParcelStack",
    component: ChangeParcelStack,
    option: {
      title: "更换包裹",
      headerShown: true,
    },
  },
  // 包裹详情
  {
    name: "ChangeParcelDetailStack",
    component: ChangeParcelDetailStack,
    option: {
      header: () => null,
      headerShown: false,
    },
  },
  // 已包装
  {
    name: "ChangeParcelPackedStack",
    component: ChangeParcelPackedStack,
    option: {
      header: () => null,
      headerShown: false,
    },
  },
  //确认打包
  {
    name: "ConfirmParcelPageStack",
    component: ConfirmParcelPageStack,
    option: {
      header: () => null,
      headerShown: false,
    },
  },
];
// 重新打印出库标签
const ReprintOutboundLabel = [
  {
    name: "ReprintOutboundLabelStack",
    component: ReprintOutboundLabelStack,
    option: {
      title: "重新打印出库标签",
      headerShown: true,
    },
  },
];

//领料任务
const FeatTask = [
  {
    name: "FeatTaskListStack",
    component: FeatTaskListStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
  {
    name: "FeatTaskDropStack",
    component: FeatTaskDropStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
  {
    name: "FeatTaskDetailStack",
    component: FeatTaskDetailStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
  {
    name: "FeatAblePositionStack",
    component: FeatAblePositionStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
  {
    name: "FeatTaskStack",
    component: FeatTaskStack,
    option: { header: () => null, title: "" },
    headerShown: false,
  },
];

/*库内管理*/
// 货位转移
const SpaceTransfer = [
  {
    name: "TransferMethodStack",
    component: TransferMethodStack,
    option: {
      header: () => null,
      headerShown: false,
    },
  },
  {
    name: "SpaceTransferStack",
    component: SpaceTransferStack,
    option: {
      title: "货位转移",
      headerShown: true,
    },
  },
  {
    name: "TransferShelfStack",
    component: TransferShelfStack,
    option: {
      title: "转移上架",
      headerShown: true,
    },
  },
  {
    name: "TransferTakedownStack",
    component: TransferTakedownStack,
    option: {
      title: "转移下架",
      headerShown: true,
    },
  },
  {
    name: "ContainerTransferScanStack",
    component: ContainerTransferScanStack,
    option: {
      title: "容器转移",
      headerShown: false,
    },
  },
  {
    name: "ContainerTransferSubmitStack",
    component: ContainerTransferSubmitStack,
    option: {
      title: "容器转移提交",
      headerShown: false,
    },
  },
];
// 正品转残
const TurnGoodToBad = [
  // 正品转残品任务列表主页面
  {
    name: "TurnGoodToBadStack",
    component: TurnGoodToBadStack,
    option: {
      title: "正品转残",
      headerShown: true,
    },
  },
  // 显示可选择的SKU列表页面
  {
    name: "SKUSelectionStack",
    component: SKUSelectionStack,
    option: {
      title: "",
      headerShown: false,
    },
  },
  // 确认下架（从良品库位移除）的页面
  {
    name: "ConfirmRemovalStack",
    component: ConfirmRemovalStack,
    option: {
      title: "正品下架",
      headerShown: true,
    },
  },
  // 批量残品上架页面
  {
    name: "BatchDefectiveShelvingStack",
    component: BatchDefectiveShelvingStack,
    option: {
      title: "正品转残",
      headerShown: true,
    },
  },
  //单个残品上架页面
  {
    name: "SingleDefectiveShelvingStack",
    component: SingleDefectiveShelvingStack,
    option: {
      title: "正品转残",
      headerShown: true,
    },
  },
];
// 容器查询
const ContainerQuery = [
  {
    name: "ContainerQueryStack",
    component: ContainerQueryStack,
    option: {
      title: "容器查询",
      headerShown: true,
    },
  },
];
// 库存查询
const StockQuery = [
  {
    name: "StockQueryStack",
    component: StockQueryStack,
    option: {
      title: "库存查询",
      headerShown: true,
    },
  },
];
// 取消上架
const CancelDelivery = [
  {
    name: "CancelDeliveryStack",
    component: CancelDeliveryStack,
    option: {
      title: "取消上架",
      headerShown: true,
    },
  },
  {
    name: "CancelDeliveryDetailStack",
    component: CancelDeliveryDetailStack,
    option: {
      title: "取消上架",
      headerShown: true,
    },
  },
];

// 绑定容器
const BindContainer = [
  {
    name: "ContainerBindScanStack",
    component: ContainerBindScanStack,
    option: {
      title: "货位容器绑定",
      headerShown: false,
    },
  },
];

// 组装拆卸任务
const AssemblyAndDisassembly = [
  {
    name: "TaskListStack",
    component: TaskListStack,
    option: { header: () => null, title: "" },
  },
  {
    name: "ContainerPositionListStack",
    component: ContainerPositionListStack,
    option: { header: () => null, title: "" },
  },
  {
    name: "ItemListStack",
    component: ItemListStack,
    option: { header: () => null, title: "" },
  },
  {
    name: "ItemDetailStack",
    component: ItemDetailStack,
    option: { header: () => null, title: "" },
  },
  {
    name: "EmptyPositionStack",
    component: EmptyPositionStack,
    option: { header: () => null, title: "" },
  },
];

/*盘点管理*/
// 货位盘点
const StockCount = [
  // 货位盘点主页面：显示盘点单列表
  {
    name: "StockCountStack",
    component: StockCountStack,
    option: {
      title: "货位盘点",
      headerShown: true,
    },
  },
  // 通道列表页面：显示某个盘点单下的所有通道
  {
    name: "StockCountPassageStack",
    component: StockCountPassageStack,
    option: {
      title: "",
      headerShown: false,
    },
  },
  // 通道详情页面：显示某个通道下的所有货位
  {
    name: "StockCountPassageDetailStack",
    component: StockCountPassageDetailStack,
    option: {
      title: "",
      headerShown: false,
    },
  },
  // 包裹SKU列表页面：显示某个货位下的所有SKU
  {
    name: "PassageDetailSkUListStack",
    component: PassageDetailSkUListStack,
    option: {
      title: "",
      headerShown: false,
    },
  },
  // 单个SKU详情页面：显示并允许编辑某个SKU的盘点信息
  {
    name: "PassageDetailSkUItemStack",
    component: PassageDetailSkUItemStack,
    option: {
      title: "",
      headerShown: false,
    },
  },
];

//其他...
// const Other=[
//   {
//     name: "Play",
//     component: Play,
//     option: {
//       title: "货位容器绑定",
//       headerShown: false,
//     },
//   },
// ]

export const containStackRoutes = [
  ...CommonStack,
  ...ErrorStackRoutes,
  ...ArrivalRegistration,
  ...ItemCheck,
  ...InventoryCheck,
  ...PrintTesting,
  ...PickingOutOfStock,
  ...CarPickTaskStack,
  ...PickTaskStack,
  ...FaPickTaskStack,
  ...ContainerHandle,
  ...GoodsHandle,
  ...BadGoodsHandle,
  ...GetGoodsSet,
  ...PutStorage,
  ...OutboundTransfer,
  ...CheckWarehouse,
  ...ExpressDelivery,
  ...OutboundPacking,
  ...OutboundPackingNoDetail,
  ...SpaceTransfer,
  ...TurnGoodToBad,
  ...ContainerQuery,
  ...StockQuery,
  ...StockCount,
  ...SelfDelivery,
  ...ChangeParcel,
  ...CancelDelivery,
  ...BindContainer,
  ...ReprintOutboundLabel,
  ...FeatTask,
  ...AssemblyAndDisassembly,
];
