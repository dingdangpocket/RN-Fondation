import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import ScanBox from "../comp/ScanBox";
import CustomContainer from "../comp/CustomContainer";
import CustomCard from "../comp/CustomCard";
import Divider from "../comp/Divider";
import {
  PrimaryText,
  TimeText,
  CardTopView,
  CardBottomView,
  GrayText,
  CountText,
  NormalText,
} from "../comStyle";
import fetchData from "src/api/fetchData";
import Notification, { notification } from "../comp/Notification";
import { ContentContext } from "src/context/ContextProvider";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import CustomModal from "../comp/CustomModal";
import getScanText from "src/functions/getScanText";
import CustomTag from "../comp/CustomTag";
import AlertText from "../comp/AlertText";
import CustomLoading from "../comp/CustomLoading";
const ExpressDeliveryStack = () => {
  const { ctxState, dispatch } = useContext(ContentContext);
  const [data, setData] = useState([]);
  const [isShowMergeBtn, setIsShowMergeBtn] = useState(false);
  const [visible, setVisible] = useState(false);
  const [longPressItem, setLongPressItem] = useState({});
  const [isShowMultiWarehouseModal, setIsShowMultiWarehouseModal] =
    useState(false);
  const [upstreamOriginalNo, setUpstreamOriginalNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [highlightArr, setHighlightArr] = useState([]);

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
      getData();
    }, [])
  );
  // 获取未完成的数据
  const getData = async (type) => {
    setLoading(true);
    setData([]);
    const res = await fetchData({
      path: "/outbound/expressDelivery/getUndoneTask",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
    });
    // taskId>0时,有未完成的数据
    if (res?.code === 200) {
      setLoading(false);
      const taskId = res.data?.taskId;
      // 更新保存快递发货的taskId
      dispatch({
        type: "updateExpressDeliveryOpt",
        payload: { taskId },
      });
      const notes = res?.data?.outboundApplyNotes || [];

      if (notes.length > 0) {
        if (notes.length > 1) {
          setIsShowMergeBtn(true);
        }
        setData([...notes]);
        // 回显已扫描的包裹
        if (highlightArr?.length) {
          for (const highItem of highlightArr) {
            const inPackagesData = notes?.find((item) =>
              item?.packages?.find((ele) => ele.packageNo === highItem)
            );
            if (inPackagesData) {
              renderHighlight(inPackagesData, highItem, notes);
            }
          }
        }
      } else {
        setData([]);
        setIsShowMergeBtn(false);
      }
      //存在已取消包裹
      if (type) {
        // 判断所有出库单是否有未扫描的包裹，有则提示不让跳转页面
        console.log("dddd", data);

        const allIsHightlight = data?.every((ele) =>
          ele.packages?.every((item) => item.isHightlight)
        );
        if (!allIsHightlight) {
          notification.open({ message: "请扫描所有包裹" });
          return;
        }
        const hasCancelData = res.data?.outboundApplyNotes?.filter(
          (item) => item.noteStatus === 1
        );
        if (hasCancelData?.length) {
          notification.open({ message: "存在已取消包裹，请先移除!" });
        } else {
          navigation.navigate("ExpressDeliveryDetailStack");
        }
      }
    }
  };
  const onPress = (item) => {
    // 单个出库单进入详情前需要扫描其下所有包裹
    const allIsHighlight = item?.packages?.every((ele) => ele.isHightlight);
    if (!allIsHighlight) {
      notification.open({ message: "请扫描所有包裹" });
      return;
    }
    if (ctxState?.expressDeliveryOpt?.taskId) {
      setTimeout(() => {
        navigation.navigate("ExpressDeliveryDetailStack");
      }, 100);
    }
  };
  // 高亮渲染
  const renderHighlight = (inPackagesData, scanText, curData) => {
    const renderData = curData ? curData : data;
    // 定位高亮
    const hightDataPackages = [
      ...inPackagesData.packages?.map((item) => {
        if (item.packageNo === scanText) {
          item.isHightlight = true;
        }
        return item;
      }),
    ];
    const tempData = renderData?.map((item) => {
      if (item.outboundApplyNoteNo === inPackagesData.outboundApplyNoteNo) {
        item.packages = hightDataPackages;
      }
      return item;
    });
    setData([...tempData]);
  };
  const onKeyEnter = (input) => {
    const scanText = getScanText(input);
    const inPackagesData = data?.find((item) =>
      item?.packages?.find((ele) => ele.packageNo === scanText)
    );
    // 添加到高亮数组中
    const isInHighlightArr = highlightArr?.find((item) => item === scanText);
    if (!isInHighlightArr) {
      setHighlightArr([...highlightArr, scanText]);
    }

    // 定位高亮
    if (inPackagesData) {
      renderHighlight(inPackagesData, scanText);
    } else {
      // 扫描添加
      onAdd(scanText);
    }
  };
  //新增功能: 新添加出库单前需要进行的判断
  // 1.出库申请单下是否所有拣货作业单状态都是"已打包"，否:根据后端提示，是:进入2判断
  // 2.出库申请单是否跨库，是:使用CustomModal弹框提示 【上游原始单号】有多库包裹，点击弹框确定后的操作？，否: 进行添加操作
  const onConfirmMultiWarehouse = () => {
    onAdd(upstreamOriginalNo);
    setIsShowMultiWarehouseModal(false);
  };

  // 新添加的出库单与当前出库单发货地址是否相同_api
  const onAdd = async (input) => {
    const res = await fetchData({
      path: "/outbound/expressDelivery/addOutboundApplyNote",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.expressDeliveryOpt?.taskId ?? 0,
        packageNo: input,
      },
    });
    console.log(res);
    if (res?.code === 200) {
      // 更新保存快递发货的taskId
      const taskId = res?.data?.taskId;
      dispatch({
        type: "updateExpressDeliveryOpt",
        payload: { taskId },
      });
      const addData = [...(res?.data?.outboundApplyNotes || [])];
      if (addData.length > 1) {
        setIsShowMergeBtn(true);
      } else {
        setIsShowMergeBtn(false);
      }
      const hightlightData = addData.map((item) => {
        if (item.packages.find((ele) => ele?.packageNo === input)) {
          const packages = item.packages.map((i) => {
            if (i.packageNo === input) {
              i.isHightlight = true;
            }
            return i;
          });
          item.packages = packages;
        }
        return item;
      });
      setData(hightlightData);
      // 回显已扫描的包裹
      if (highlightArr?.length) {
        for (const highItem of highlightArr) {
          const inPackagesData = hightlightData?.find((item) =>
            item?.packages?.find((ele) => ele.packageNo === highItem)
          );
          if (inPackagesData) {
            renderHighlight(inPackagesData, highItem, hightlightData);
          }
        }
      }
    } else {
      // 地址不同，提示信息
      notification.open({ message: res?.msg });
    }
  };
  const onMerge = () => {
    // setTimeout(() => {
    //   navigation.navigate("ExpressDeliveryDetailStack");
    // }, 100);
    getData(true);
  };
  const onLongPress = (item) => {
    setVisible(true);
    setLongPressItem(item);
  };
  const onDeleteItem = async () => {
    const res = await fetchData({
      path: "/outbound/expressDelivery/removeOutboundApplyNote",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.expressDeliveryOpt?.taskId,
        outboundApplyNoteId: longPressItem?.outboundApplyNoteId,
      },
    });
    if (res?.code === 200) {
      setVisible(false);
      notification.open({ message: "移除成功", type: "success" });
      // 刷新列表
      getData();
    } else {
      notification.open({ message: res?.msg });
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <CustomLoading loading={loading} setLoading={setLoading} />
      <Notification />
      <CustomModal
        title={`确定要移除【${longPressItem?.outboundApplyNoteNo}】订单?`}
        visible={visible}
        setVisible={setVisible}
        onConfirm={() => onDeleteItem()}
      ></CustomModal>
      <CustomModal
        title={`【${upstreamOriginalNo}】有多库包裹!`}
        visible={isShowMultiWarehouseModal}
        setVisible={setIsShowMultiWarehouseModal}
        onConfirm={() => onConfirmMultiWarehouse()}
      ></CustomModal>
      <ScanBox
        placeholder="请扫描包裹编码"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        <FlatList
          data={data}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <CustomCard
              widthFactor={0.95}
              onPress={() => onPress(item)}
              onLongPress={() => onLongPress(item)}
            >
              <View style={CardTopView}>
                <Text style={PrimaryText}>{item.outboundApplyNoteNo}</Text>
                {item?.noteStatus === 1 && <CustomTag text="已取消" />}
              </View>
              <Divider />
              {item.outboundStoragePackageNumDTOS?.map((item, idx) => (
                <View style={CardBottomView} key={idx}>
                  <Text style={GrayText}>{item.storageCode + "仓库"}</Text>
                  <Text style={CountText}>{item.packageNum + " 个包裹"}</Text>
                </View>
              ))}
              <View style={CardBottomView}>
                <Text style={GrayText}>领取时间</Text>
                <Text style={NormalText}>{item.outboundApplyNoteCreateOn}</Text>
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>物流要求</Text>
                <Text style={NormalText}>
                  {item?.requirementForLogisticsText}
                </Text>
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>发货单要求</Text>
                <AlertText
                  text={item?.requirementForDeliveryNotePrintTypeText}
                />
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>发货其他要求</Text>
                <AlertText
                  text={item?.requirementForOther}
                  showLength={8}
                />
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>发货备注</Text>
                <AlertText
                  text={item?.remark}
                  showLength={8}
                />
              </View>
              <Divider />
              {item?.packages?.map((ele, idx) => {
                return (
                  <View
                    style={
                      ele?.isHightlight
                        ? { ...CardBottomView, ...styles.activeBox }
                        : CardBottomView
                    }
                    key={idx + ele?.packageNo}
                  >
                    <Text style={ele?.isHightlight ? PrimaryText : GrayText}>
                      包裹码
                    </Text>
                    <Text style={ele?.isHightlight ? PrimaryText : GrayText}>
                      {ele?.packageNo}
                    </Text>
                  </View>
                );
              })}
            </CustomCard>
          )}
        />
      </CustomContainer>
      {isShowMergeBtn && data?.length > 1 && (
        <BottomConfirmButton title="合并发货" onPress={onMerge} />
      )}
    </View>
  );
};

export default ExpressDeliveryStack;

const styles = StyleSheet.create({
  activeBox: {
    backgroundColor: "#EDF6FF",
    borderColor: "#6DBAFF",
    borderRadius: 4,
    paddingHorizontal: 5,
  },
  normalBox: {
    backgroundColor: "#fff",
    borderColor: "#ffff",
    borderRadius: 4,
    paddingHorizontal: 5,
  },
});
