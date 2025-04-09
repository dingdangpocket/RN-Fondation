import { Text, View, useWindowDimensions, Image } from "react-native";
import React, { useEffect, useState, useContext, useCallback } from "react";
import ScanBox from "../comp/ScanBox";
import CustomCard from "../comp/CustomCard";
import CustomContainer from "../comp/CustomContainer";
import {
  CardTopView,
  CardBottomView,
  PrimaryText,
  TimeText,
  GrayText,
  NormalText,
} from "../comStyle";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import Divider from "../comp/Divider";
import CustomTag from "../comp/CustomTag";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, { notification } from "../comp/Notification";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import getScanText from "src/functions/getScanText";

const OutboundPackingStack = () => {
  const { ctxState, dispatch } = useContext(ContentContext);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [data, setData] = useState({});
  const [outboundNoteId, setOutboundNoteId] = useState(0);
  const [taskId, setTaskId] = useState(0);
  const [reTake, setRetake] = useState(false);
  const [hasUnpackgedData, setHasUnpackgedData] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      setData({});
      getData();
    }, [])
  );
  // 获取未完成
  const getData = async () => {
    const res = await fetchData({
      path: "/outbound/packaging/hasDetail/getUndoneTask",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
    });
    if (res?.code === 200) {
      if (!res?.data?.outboundNote) {
        notification.open({ message: "暂无数据" });
        return;
      }
      const taskId = res.data.task?.taskId;
      if (taskId) {
        const outboundNoteId = res.data.outboundNote?.outboundNoteId;
        // 更新保存taskId
        setOutboundNoteId(outboundNoteId);
        setTaskId(taskId);
        dispatch({
          type: "updateOutboundPackingOpt",
          payload: { taskId, outboundNoteId },
        });
        // 获取任务详情,判断是否还有未完成打包的sku，有则打包按钮置灰，无则可以打包
        getUnpackgedData(taskId, outboundNoteId);
        setData(res.data);
      }
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 联系内勤打印?
  const onPrint = () => {
    console.log("onPrint", data);
    // to do print ?
    // navigation.navigate("OutboundPackingDetailStack");
  };
  const onKeyEnter = (input) => {
    const scanText = getScanText(input, "end");
    //没有未完成的打包任务时，taskId为0，此时才可扫描获取? 前端不做判断,后端提示?
    handleScan(scanText);
  };
  //获取出库申请单
  const handleScan = async (input) => {
    const res = await fetchData({
      path: `/outbound/packaging/hasDetail/getOutboundNote`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        pickingNoteDetailId: input,
      },
    });
    if (res?.code === 200) {
      if (!res?.data?.outboundNote) {
        notification.open({ message: "暂无数据" });
        return;
      }
      const taskId = res.data.task?.taskId;
      // 出库单id
      const outboundNoteId = res.data?.outboundNote?.outboundNoteId;
      setOutboundNoteId(outboundNoteId);
      // 更新保存taskId
      setTaskId(taskId);
      dispatch({
        type: "updateOutboundPackingOpt",
        payload: { taskId, outboundNoteId },
      });
      setData(res.data);
      // 自动领取
      if (res?.data?.task?.taskId) {
        onViewItem(taskId, outboundNoteId);
      }
      // 获取任务详情,判断是否还有未完成打包的sku，有则打包按钮置灰，无则可以打包
      getUnpackgedData(taskId, outboundNoteId);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 进入打包任务详情
  const onViewItem = (tid, outId) => {
    navigation.navigate("OutboundPackingDetailStack", {
      taskId: tid ? tid : taskId,
      outboundNoteId: outId ? outId : outboundNoteId,
    });
  };
  //获取任务详情
  const getUnpackgedData = async (taskId, outboundNoteId) => {
    const res = await fetchData({
      path: "/outbound/packaging/hasDetail/getOutboundNoteDetails",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId,
        outboundNoteId,
      },
    });
    if (res?.code === 200) {
      // 有未完成打包的项次，允许已取消的可以打包
      const hasUnpackgedAndNotCancelData = res?.data?.outboundNoteDetails?.some(
        (item) => item?.outboundNoteDetailStatus !== 99
      );
      if (hasUnpackgedAndNotCancelData) {
        setHasUnpackgedData(true);
      } else {
        setHasUnpackgedData(false);
      }
    }
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
      setData({});
      // 刷新页面
      getData();
    } else {
      notification.open({ message: res?.msg });
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <ScanBox
        placeholder="请扫描拣货签"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        {data?.task?.taskId && (
          <CustomCard widthFactor={0.95} onPress={onViewItem}>
            <View style={CardTopView}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={PrimaryText}>
                  {data?.outboundNote?.outboundNoteNo}
                </Text>
                {data?.outboundNote?.showSmile === 1 && (
                  <Image
                    source={require("../../../static/smile.png")}
                    style={{
                      width: 30,
                      height: 30,
                      marginLeft: 4,
                      marginBottom: 4,
                    }}
                  />
                )}
              </View>
              <CustomTag text={data?.task?.taskStatusText} />
            </View>
            <Divider />
            <View style={CardBottomView}>
              <Text style={GrayText}>标签要求</Text>
              <Text style={NormalText}>
                {data?.outboundNote?.labelRequireText}
              </Text>
            </View>
            <View style={CardBottomView}>
              <Text style={GrayText}>包装要求</Text>
              <Text style={NormalText}>
                {data?.outboundNote?.packageRequireText}
              </Text>
            </View>
            <View style={CardBottomView}>
              <Text style={GrayText}>发货单要求</Text>
              <Text style={NormalText}>
                {data?.outboundNote?.deliveryRequireText}
              </Text>
            </View>
            <View style={CardBottomView}>
              <Text style={TimeText}>{data?.task?.taskCreateOn}</Text>
            </View>
          </CustomCard>
        )}
      </CustomContainer>
      {/* {data?.task?.taskId && (
        <BottomConfirmButton
          title="完成打包"
          onPress={onComplete}
          disabled={hasUnpackgedData}
        />
      )} */}
    </View>
  );
};

export default OutboundPackingStack;
