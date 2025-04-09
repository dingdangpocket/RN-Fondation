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
} from "../comStyle";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import CustomPageHeader from "../comp/CustomPageHeader";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import Notification, { notification } from "../comp/Notification";
import Divider from "../comp/Divider";
import CustomModal from "../comp/CustomModal";
import CustomTag from "../comp/CustomTag";
import { useFocusEffect } from "@react-navigation/native";
import getScanText from "src/functions/getScanText";
import ContentWithNumber from "../comp/ContentWithNumber";
import AlertText from "../comp/AlertText";
import printImage from "src/functions/printImage";
import { handleImageUrl } from "src/functions/handleImageUrl";
import { debounce } from "src/functions/tool";
import CustomLoading from "../comp/CustomLoading";
const OutboundPackingDetailStack = ({ route }) => {
  const { ctxState, dispatch } = useContext(ContentContext);
  const { noPrint } = route?.params ?? {};
  const [data, setData] = useState({});
  const [orderVisible, setOrderVisible] = useState(false);
  const [itemVisible, setItemVisible] = useState(false);
  const [orderModalTitle, setOrderModalTitle] = useState("");
  const [itemModalTitle, setItemModalTitle] = useState("");
  const [packedCount, setPackedCount] = useState(0);
  const [packLoading, setPackLoading] = useState(false);
  const [hasUnpackgedData, setHasUnpackgedData] = useState(false);
  const [highlight, setHighlight] = useState("");
  const [showData, setShowData] = useState({});

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
  // 刷新数据
  const refreshData = (type) => {
    getData(type);
    getPackagedData();
  };
  //获取任务详情(出库单明细 创建打包任务)
  const getData = async (type) => {
    setPackLoading(true);
    const res = await fetchData({
      path: "/outbound/packaging/hasDetail/getOutboundNoteDetails",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.outboundPackingOpt?.taskId,
        outboundNoteId: ctxState?.outboundPackingOpt?.outboundNoteId,
      },
    });
    if (res?.code === 200) {
      setPackLoading(false);
      // 判断是否已完成，有未完成打包的项次，允许已取消的可以打包
      const hasUnpackgedAndNotCancelData = res?.data?.outboundNoteDetails?.some(
        (item) => item?.outboundNoteDetailStatus !== 99
      );
      if (hasUnpackgedAndNotCancelData) {
        setHasUnpackgedData(true);
      } else {
        setHasUnpackgedData(false);
      }

      setData(res?.data ?? {});
      setShowData(res?.data ?? {});
      if (res?.data?.outboundNoteDetails?.length) {
        // 如果是当前加箱页面点击入箱按钮，则不调用加箱接口
        if (type !== "putIntoBox" && !noPrint) {
          onAddPackage();
        }
      }
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 获取已包装
  const getPackagedData = async () => {
    const res = await fetchData({
      path: `/outbound/packaging/hasDetail/getPackageDetails`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.outboundPackingOpt?.taskId,
      },
    });
    if (res?.code === 200) {
      setPackedCount(res?.data?.length ?? 0);
    }
  };
  // 加箱
  const onAddPackage = async (packageNoteNo) => {
    const res = await fetchData({
      path: "/outbound/packaging/hasDetail/addPackageNote",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.outboundPackingOpt?.taskId,
        packageNoteNo,
      },
    });
    if (res?.code === 200) {
      notification.open({ message: "加箱成功,正在打印标签", type: "success" });
      //加箱成功后保存箱号
      const packageNoteNo = res?.data?.packageNoteNo;
      const packageNoteId = res?.data?.packageNoteId;
      dispatch({
        type: "updateOutboundPackingOpt",
        payload: { packageNoteNo, packageNoteId },
      });
      // to do print ok
      printImage(
        handleImageUrl(5, ctxState?.optSet?.curStorageId, {
          packageNoteId,
        }),
        `Bearer ${ctxState?.userInfo?.token}`
      );
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 将sku放入当前箱子
  const handlePackItem = (item, type) => {
    // console.log("item", item);
    let handleData = item;
    if (type === "scan") {
      const findData = data?.outboundNoteDetails?.find(
        (ele) => ele?.pickingNoteDetailIds.includes(Number(item))
      );
      if (findData?.outboundNoteDetailStatus === 99) {
        notification.open({
          message: "项次已取消，已拣商品放置取消待上架区!",
        });
        return;
      }
      if (findData) {
        handleData = findData;
        // sku在列表中，调用获取拣货作业单明细 接口，判断是否可以放入包裹
        getPickingNoteDetail(findData.outboundNoteDetailId, handleData);
      } else {
        notification.open({ message: "请扫描正确的拣货标签" });
      }
    } else {
      // 已取消的sku不能放入包裹
      if (item?.outboundNoteDetailStatus === 99) {
        notification.open({
          message: "项次已取消，已拣商品放置取消待上架区!",
        });
        return;
      }
      getPickingNoteDetail(item.outboundNoteDetailId, handleData);
    }
    /**
     * 拣货明细
     * 如果有多条显示确认包裹页面，如果只有一条直接装入箱子
     */
  };

  const onPackItem = debounce(handlePackItem, 1000); // 1秒的防抖时间
  // 获取拣货作业单明细
  const getPickingNoteDetail = async (outboundNoteDetailId, data) => {
    setPackLoading(true);
    const res = await fetchData({
      path: `/outbound/packaging/hasDetail/getPickingNoteDetails`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        outboundNoteDetailId,
        taskId: ctxState?.outboundPackingOpt?.taskId,
      },
    });
    // setPackLoading(false);
    if (res?.code === 200) {
      /**
       * 拣货明细
       * 如果有多条显示确认包裹页面，如果只有一条直接装入包裹
       */
      if (res?.data?.length > 1) {
        navigation.navigate("ConfirmPackingStack", {
          data: res?.data,
          outboundNoteDetailId,
        });
      } else {
        // 只有一个直接加入包裹
        handlePutIntoPackage(res?.data, {
          skuId: data?.skuId,
          pickingNum: data?.pickingNum,
        });
      }
    } else if (res?.code === 8003) {
      setOrderModalTitle(
        res?.msg || "订单已全部取消，请将所有商品转移至待上架区"
      );
      setOrderVisible(true);
    } else if (res?.code === 8015) {
      setItemModalTitle(res?.msg || "项次已取消，请重新复核");
      setItemVisible(true);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 将sku放入包裹
  const handlePutIntoPackage = async (arr, data) => {
    // setPackLoading(true);
    const arrData = arr?.map((ele) => {
      return {
        taskId: ctxState?.outboundPackingOpt?.taskId,
        packageNoteId: ctxState?.outboundPackingOpt?.packageNoteId,
        pickingNoteDetailId: ele.pickingNoteDetailId,
        pickingNum: data.pickingNum,
        skuId: data?.skuId,
        packageNoteNo: ctxState?.outboundPackingOpt?.packageNoteNo,
        skuName: ele?.skuName,
      };
    });
    const res = await fetchData({
      path: "/outbound/packaging/hasDetail/putIntoPackage",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { packagingPutIntoSubmitDTO: arrData },
    });
    setPackLoading(false);
    if (res?.code === 200) {
      // console.log("打包成功", data, res.data);
      notification.open({ message: "打包成功", type: "success" });
      const pickingNoteDetailId = arr.find(
        (ele) => ele.skuId === data?.skuId
      )?.pickingNoteDetailId;
      // to do print ok出库签
      printImage(
        handleImageUrl(4, ctxState?.optSet?.curStorageId, {
          pickingNoteDetailId,
          packageNoteNo: ctxState?.outboundPackingOpt?.packageNoteNo,
        }),
        `Bearer ${ctxState?.userInfo?.token}`
      );
      // 刷新数据
      refreshData("putIntoBox");
    } else if (res?.code === 8003) {
      setOrderModalTitle(
        res?.msg || "订单已全部取消，请将所有商品转移至待上架区"
      );
      setOrderVisible(true);
    } else if (res?.code === 8015) {
      setItemModalTitle(res?.msg || "项次已取消，请重新复核");
      setItemVisible(true);
    } else {
      notification.open({ message: res?.msg });
    }
  };

  // 整单取消确认
  const onOrderModalConfirm = () => {
    setOrderVisible(false);
    navigation.navigate("OutboundPackingStack");
  };
  // 项次取消确认
  const onItemModalConfirm = () => {
    setItemVisible(false);
    refreshData();
  };
  // 查看已包装页面
  const onViewPacked = () => {
    navigation.navigate("OrderPackagedStack");
  };

  const onKeyEnter = (input) => {
    //  拣货作业单明细id
    const scanText = getScanText(input, "end");
    if (packLoading) {
      onTipAlert();
    } else {
      // // 扫描内容匹配超过1个，重新sort，并且高亮card
      // const filterData = data.outboundNoteDetails.filter((item) => item.skuId === scanText);
      // if (filterData.length > 1) {
      //   //重新sort，将匹配内容放到最前面
      //   const noMatchData = data.outboundNoteDetails.filter((item) => item.skuId !== scanText);
      //   const newDatalist = [...filterData, ...noMatchData];
      //   const newData = { ...data, outboundNoteDetails: newDatalist };
      //   setShowData(newData);
      //   setHighlight(scanText);
      // } else {
        onPackItem(scanText, "scan");
        handleClear();
      // }
    }
  };
  const onTipAlert = () => {
    notification.open({ message: "正在操作中,请稍后再试" });
  };
  const handleClear = () => {
    setHighlight("");
    setShowData({ ...data });
  };

  // 完成打包
  const onComplete = async () => {
    const res = await fetchData({
      path: "/outbound/packaging/hasDetail/finishPackage",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.outboundPackingOpt?.taskId,
        outboundNoteId: ctxState?.outboundPackingOpt?.outboundNoteId,
      },
    });
    if (res?.code === 200) {
      notification.open({ message: "完成打包", type: "success" });
      setTimeout(() => {
        navigation.navigate("OutboundPackingStack");
      }, 100);
    } else {
      notification.open({ message: res?.msg });
    }
  };

  const renderItem = ({ item }) => (
    <CustomCard
      widthFactor={0.90}
      backgroundColor={highlight === item.skuId ? "#EDF6FF" : "#fff"}
      borderColor={highlight === item.skuId ? "#6DBAFF" : "#ffff"}
    >
      <View style={CardTopView}>
        <AlertText text={item?.skuName} style={PrimaryText} />
        <TouchableNativeFeedback
          onPress={() => (packLoading ? onTipAlert() : onPackItem(item))}
        >
          <Image
            source={require("../../../static/save.png")}
            style={{ height: 25, width: 25 }}
          />
        </TouchableNativeFeedback>
      </View>
      <Divider />
      <View style={CardBottomView}>
        <Text style={GrayText}>任务状态</Text>
        <CustomTag text={item?.outboundNoteDetailStatusText} />
      </View>
      <View style={CardBottomView}>
        <Text style={GrayText}>客户产品名称</Text>
        <AlertText text={item?.skuName} />
      </View>
      <View style={CardBottomView}>
        <Text style={GrayText}>数量</Text>
        <Text style={CountText}>
          {item?.pickingNum} {item?.unit}
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
      <Notification />
      <CustomLoading loading={packLoading} setLoading={setPackLoading} />
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
      <CustomPageHeader
        title={"标准打包"}
        rightWidth={43}
        rightContent={
          <ContentWithNumber content="已包装" number={packedCount} />
        }
        onRightPress={onViewPacked}
      />
      <ScanBox
        placeholder="请扫描拣货签"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
        handleClear={handleClear}
      />
      <CustomContainer>
        <FlatList
          data={showData?.outboundNoteDetails}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          renderItem={renderItem}
          keyExtractor={(item) => item?.outboundNoteDetailId.toString()}
        />
      </CustomContainer>
      {/* 有数据时展示加箱按钮 */}
      {hasUnpackgedData ? (
        <BottomConfirmButton
          title="加箱"
          onPress={() =>
            onAddPackage(ctxState?.outboundPackingOpt?.packageNoteNo)
          }
          // 如果全是已取消状态，按钮将被禁用
          disabled={data?.outboundNoteDetails?.every(
            (ele) => ele?.outboundNoteDetailStatus === 99
          )}
        />
      ) : (
        <BottomConfirmButton
          title="完成打包"
          onPress={onComplete}
          disabled={hasUnpackgedData}
        />
      )}
    </View>
  );
};

export default OutboundPackingDetailStack;

const styles = StyleSheet.create({});
