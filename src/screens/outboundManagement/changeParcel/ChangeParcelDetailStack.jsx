import {
  Image,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
  FlatList,
} from "react-native";
import React, { useState, useContext, useEffect, useCallback } from "react";
import ScanBox from "../comp/ScanBox";
import CustomContainer from "../comp/CustomContainer";
import CustomCard from "../comp/CustomCard";
import {
  PrimaryText,
  CardTopView,
  CountText,
  CardBottomView,
  GrayText,
  NormalText,
} from "../comStyle";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import CustomTag from "../comp/CustomTag";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import CustomPageHeader from "../comp/CustomPageHeader";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import Notification, { notification } from "../comp/Notification";
import Divider from "../comp/Divider";
import CustomModal from "../comp/CustomModal";
import CustomLoading from "../comp/CustomLoading";
import AlertText from "../comp/AlertText";
import getScanText from "src/functions/getScanText";
import { handleImageUrl } from "src/functions/handleImageUrl";
import printImage from "src/functions/printImage";
import { debounce } from "src/functions/tool";

const ChangeParcelDetailStack = ({ route }) => {
  const { packageNoteNos, noPrint } = route.params;
  const { ctxState, dispatch } = useContext(ContentContext);
  const [orderVisible, setOrderVisible] = useState(false);
  const [itemVisible, setItemVisible] = useState(false);
  const [orderModalTitle, setOrderModalTitle] = useState("");
  const [itemModalTitle, setItemModalTitle] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [tabData, setTabData] = useState([]);
  const [packLoading, setPackLoading] = useState(false);
  const [skuData, setSkuData] = useState({});
  const [isHasSku, setIsHasSku] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [taskIsFinish, setTaskIsFinish] = useState(false);
  const navigation = useNavigation();

  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [route])
  );
  const refreshData = (type) => {
    // 进入页面，自动操作【加箱】，并打印包裹码
    if (type !== "putIntoBox" && !noPrint) {
      onAddBox();
    }
    getDetailData(packageNoteNos);
  };
  // 更换包裹,开始更换（获取包裹SKU明细）
  const getDetailData = async (packageNoteNos) => {
    setPackLoading(true);
    const res = await fetchData({
      path: "/outbound/packaging/changePackage/beginChange",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { packageNoteNo: packageNoteNos },
    });
    setPackLoading(false);

    if (res?.code === 200) {
      const taskId = res?.data?.task?.taskId;
      // 更新保存taskId
      dispatch({
        type: "updateChangeParcelOpt",
        payload: { taskId },
      });
      setSkuData(res?.data);
      getTabData(res?.data);
      // 完成打包按钮判断
      const isCompleted = res.data?.originalPackageNotes?.every?.(
        (ele) =>
          ele.packageNoteDetails?.length === 0 ||
          ele.packageNoteDetails.every(
            (item1) => item1.pickingNoteDetailNoteStatus === 99
          )
      );
      if (isCompleted) {
        // 如果当前没有包裹明细，可以展示完成打包按钮，需要判断是否已经完成打包
        setIsComplete(true);
        // 判断是否已经完成打包
        if (res?.data?.task?.taskStatus === 5) {
          setTaskIsFinish(true);
          // 整单取消
          const allCancel = res.data?.originalPackageNotes?.every?.((ele) =>
            ele.packageNoteDetails?.length > 0 &&
            ele.packageNoteDetails?.every(
              (item1) => item1.pickingNoteDetailNoteStatus === 99
            )
          );
          console.log("allCancel", allCancel);

          if (allCancel) {
            notification.open({
              message: "请将订单中已取消的实物放置到取消上架区",
            });
            setData([]);
          } else {
            notification.open({ message: "已完成打包" });
          }
        } else {
          setTaskIsFinish(false);
        }
      } else {
        setIsComplete(false);
      }
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 组装更新对应tab下的包裹数据
  const getTabData = (handleSkuData, curTab) => {
    let allNoteData = [];
    const curActiveTab = curTab ? curTab : activeTab;
    const globalNoteData = handleSkuData?.originalPackageNotes?.reduce((acc, ele) => {
      return [...acc, ...ele.packageNoteDetails];
    }, []);
    // global btn
    if (globalNoteData?.length > 0) {
      setIsHasSku(true);
      // 如果都是已取消状态数据，则加箱按钮不可见
      const isAllCancel = globalNoteData.every(
        (ele) => ele.pickingNoteDetailNoteStatus === 99
      );
      if (isAllCancel) {
        setIsHasSku(false);
      } else {
        setIsHasSku(true);
      }
    } else {
      setIsHasSku(false);
    }
    if (curActiveTab === "all") {
      allNoteData = globalNoteData
    } else {
      allNoteData = handleSkuData?.originalPackageNotes?.find(
        (ele) => ele.packageNoteId == curActiveTab
      )?.packageNoteDetails;
    }


    if (allNoteData?.length > 0) {
      setTabData(allNoteData);
    } else {
      setTabData([]);
    }
  };
  // 去已包装页面
  const onRightPress = () => {
    navigation.navigate("ChangeParcelPackedStack");
  };

  // 加箱
  const onAddBox = async (packageNoteNo) => {
    setPackLoading(true);
    const res = await fetchData({
      path: "/outbound/packaging/hasDetail/addPackageNote",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.changeParcelOpt?.taskId,
        packageNoteNo,
      },
    });
    setPackLoading(false);
    if (res?.code === 200) {
      const packageNoteNo = res?.data?.packageNoteNo;
      const packageNoteId = res?.data?.packageNoteId;
      dispatch({
        type: "updateChangeParcelOpt",
        payload: { packageNoteNo, packageNoteId },
      });
      notification.open({ message: "加箱成功,正在打印标签", type: "success" });
      // to do print ok
      printImage(
        handleImageUrl(5, ctxState?.optSet?.curStorageId, {
          packageNoteId,
        }),
        `Bearer ${ctxState?.userInfo?.token}`
      );
      // 重新获取数据
      getDetailData(packageNoteNos);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 将商品放入包裹
  // 查看档前任务是否已取消，取消状态就提示，不是就进入确认包装页面
  const handlePackItem = (item, type) => {
    let handleData = item;
    if (type === "scan") {
      // 此时scan输入的是skuName，需要确定
      // 判断当前是哪一个tab，是全部则，将originalPackageNotes中所有数据拿出来，
      // 是单个包裹，则找到originalPackageNotes下的packageNoteNo 比较后再判断
      let allNoteData = [];
      if (activeTab === "all") {
        allNoteData = skuData?.originalPackageNotes?.reduce((acc, ele) => {
          return [...acc, ...ele.packageNoteDetails];
        }, []);
      } else {
        allNoteData = skuData?.originalPackageNotes?.find(
          (ele) => ele.packageNoteId == activeTab
        )?.packageNoteDetails;
      }
      const findData = allNoteData?.find(
        (ele) => ele?.pickingNoteDetailId === Number(item)
      );
      if (findData) {
        handleData = findData;
      } else {
        notification.open({ message: "请扫描正确的SKU" });
        return;
      }
    }
    handlePutIntoPackage(handleData);
  };
  const onPackItem = debounce(handlePackItem, 1000); // 1秒的防抖时间
  // 将sku放入包裹
  const handlePutIntoPackage = async (item) => {
    setPackLoading(true);
    const pickingNoteDetailId = item?.pickingNoteDetailId;
    const packageNoteDetailId = item?.packageNoteDetailId;
    const outboundNoteDetailId = item?.outboundNoteDetailId;
    const pickingNum = item?.num;
    const res = await fetchData({
      path: "/outbound/packaging/hasDetail/putIntoPackage",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        packagingPutIntoSubmitDTO: [
          {
            taskId: ctxState?.changeParcelOpt?.taskId,
            packageNoteId: ctxState?.changeParcelOpt?.packageNoteId,
            packageNoteNo: ctxState?.changeParcelOpt?.packageNoteNo,
            // packageNoteId: skuData?.newPackageNote?.packageNoteId,
            pickingNoteDetailId,
            packageNoteDetailId,
            skuId: item?.skuId,
            skuName: item?.skuName,
            pickingNum,
          },
        ],
      },
    });
    /**
     * 200：成功
     * 8003: 整单被取消
     * 8015: 项次被取消
     */
    setPackLoading(false);
    if (res?.code === 200) {
      notification.open({ message: "已打包", type: "success" });
      // to do print ok出库签
      if (pickingNoteDetailId) {
        printImage(
          handleImageUrl(4, ctxState?.optSet?.curStorageId, {
            pickingNoteDetailId,
            packageNoteNo: ctxState?.changeParcelOpt?.packageNoteNo,
          }),
          `Bearer ${ctxState?.userInfo?.token}`
        );
      } else {
        printImage(
          handleImageUrl(4, ctxState?.optSet?.curStorageId, {
            outboundNoteDetailId,
            packageNoteNo: ctxState?.changeParcelOpt?.packageNoteNo,
          }),
          `Bearer ${ctxState?.userInfo?.token}`
        );
      }

      // 刷新数据
      refreshData("putIntoBox");
    } else if (res?.code === 8003) {
      // 整单取消  msg:订单取消，请将所有商品转移至待上架区
      setOrderModalTitle(
        res?.msg || "订单已全部取消，请将所有商品转移至待上架区"
      );
      setOrderVisible(true);
    } else if (res?.code === 8015) {
      // 项次被取消    msg:【项次编码】已取消，请转移至待上架区
      setItemModalTitle(res?.msg || "项次已取消，请重新复核");
      setItemVisible(true);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 整单取消确认
  const onOrderModalConfirm = () => {
    setOrderVisible(false);
    // navigation.navigate("ChangeParcelStack");
    onBackPress();
  };
  // 项次取消确认
  const onItemModalConfirm = () => {
    setItemVisible(false);
  };
  const onTipAlert = () => {
    notification.open({ message: "正在操作中,请稍后再试" });
  };
  const onKeyEnter = (input) => {
    const scanText = getScanText(input, "end");
    onPackItem(scanText, "scan");
  };
  const onChangeTab = (tab) => {
    setActiveTab(tab);
    getTabData(skuData, tab);
  };
  const onViewConfirmPage = (item) => {
    navigation.navigate("ConfirmParcelPageStack", {
      data: item,
      packageNoteNos
    });
  };
    // 完成打包
    const onComplete = async () => {
      const res = await fetchData({
        path: "/outbound/packaging/hasDetail/finishPackage",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: { taskId: ctxState?.changeParcelOpt?.taskId },
      });
      if (res?.code === 200) {
        notification.open({ message: "完成打包", type: "success" });
        setTimeout(() => {
          onBackPress();
        }, 1000);
        // navigation.navigate("ChangeParcelStack");
      } else {
        notification.open({ message: res?.msg });
      }
    };
  const renderTabItem = ({ item }) => (
    <TouchableNativeFeedback onPress={() => onChangeTab(item.packageNoteId)}>
      <View style={styles.tabItem}>
        <Text
          style={
            activeTab === item.packageNoteId
              ? { ...PrimaryText, ...styles.tabText }
              : { ...styles.tabText }
          }
        >
          {item.packageNoteNo}
        </Text>
      </View>
    </TouchableNativeFeedback>
  );
  const onBackPress = () => {
    navigation.navigate("ChangeParcelStack", {
      backPackageNoteNos: packageNoteNos,
      noPrint: false,
    });
  };
  const renderContentItem = ({ item }) => (
    <CustomCard widthFactor={0.95} onPress={() => onViewConfirmPage(item)}>
      <View style={CardTopView}>
        <AlertText text={item?.skuName} style={PrimaryText} showLength={30} />
        <TouchableNativeFeedback
          onPress={() => (packLoading ? onTipAlert() : onPackItem(item))}
          hitSlop={20}
        >
          <Image
            source={require("../../../static/save.png")}
            style={{ height: 25, width: 25 }}
          />
        </TouchableNativeFeedback>
      </View>
      <Divider />
      {item.pickingNoteDetailNoteStatus === 99 && (
        <View style={CardBottomView}>
          <Text style={GrayText}>任务状态</Text>
          <CustomTag text={item?.pickingNoteDetailNoteStatusText} />
        </View>
      )}
      <View style={CardBottomView}>
        <Text style={GrayText}>客户SKU名称</Text>
        <AlertText text={item?.skuName} />
      </View>
      <View style={CardBottomView}>
        <Text style={GrayText}>拣货明细ID</Text>
        <Text style={NormalText}>{item?.pickingNoteDetailId}</Text>
      </View>
      <View style={CardBottomView}>
        <Text style={GrayText}>数量</Text>
        <Text style={CountText}>
          {item?.num} {item?.unit}
        </Text>
      </View>
      <View style={CardBottomView}>
        <Text style={GrayText}>产品型号</Text>
        <AlertText text={item?.skuId} showLength={30} />
      </View>
    </CustomCard>
  );

  return (
    <View style={{ flex: 1 }}>
      <CustomLoading loading={packLoading} setLoading={setPackLoading} />
      <Notification />
      <CustomModal
        title={orderModalTitle}
        visible={orderVisible}
        setVisible={setOrderVisible}
        onConfirm={onOrderModalConfirm}
      ></CustomModal>
      <CustomModal
        title={itemModalTitle}
        visible={itemVisible}
        setVisible={setItemVisible}
        onConfirm={onItemModalConfirm}
      ></CustomModal>
      <CustomPageHeader onBackPress={onBackPress} title={"更换包裹"} />
      <ScanBox
        placeholder="请扫描包裹编码"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        {/* tab切换栏 */}
        {skuData?.originalPackageNotes?.length > 0 && (
          <CustomCard widthFactor={0.95}>
            <FlatList
              data={[
                { packageNoteId: "all", packageNoteNo: "全部" },
                ...skuData?.originalPackageNotes,
              ]}
              renderItem={renderTabItem}
              keyboardShouldPersistTaps="always"
              removeClippedSubviews={true}
              keyExtractor={(item) => item.packageNoteId}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabView}
            />
          </CustomCard>
        )}

        {/* 内容显示 */}
        <FlatList
          data={tabData}
          renderItem={renderContentItem}
          keyExtractor={(item, idx) => idx.toString()}
        />
      </CustomContainer>
      {isHasSku && (
        <BottomConfirmButton
          title="加箱"
          onPress={() => onAddBox(ctxState?.changeParcelOpt?.packageNoteNo)}
        />
      )}
      {isComplete && !taskIsFinish && (
        <BottomConfirmButton title={"完成打包"} onPress={onComplete} />
      )}
    </View>
  );
};

export default ChangeParcelDetailStack;

const styles = StyleSheet.create({
  tabView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabItem: {
    marginHorizontal: 10,
  },
  tabText: {
    marginLeft: 4,
  },
});
