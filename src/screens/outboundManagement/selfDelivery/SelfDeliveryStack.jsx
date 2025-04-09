import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useEffect, useState, useContext, useCallback } from "react";
import CustomContainer from "../comp/CustomContainer";
import CustomCard from "../comp/CustomCard";
import ScanBox, { scanBox } from "../comp/ScanBox";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import {
  CardBottomView,
  CardTopView,
  GrayText,
  NormalText,
  PrimaryText,
} from "../comStyle";
import Divider from "../comp/Divider";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, { notification } from "../comp/Notification";
import CustomModal from "../comp/CustomModal";
import getScanText from "src/functions/getScanText";
import CustomTag from "../comp/CustomTag";

const SelfDeliveryStack = () => {
  const { ctxState, dispatch } = useContext(ContentContext);

  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [outboundApplyNoteId, setOutboundApplyNoteId] = useState(0);
  const [title, setTitle] = useState("");
  const [highlightPackages, setHighlightPackages] = useState([]);

  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);
  useFocusEffect(
    useCallback(() => {
      setHighlightPackages([]);
      getData();
    }, [])
  );

  // 获取未完成的数据
  const getData = async (type) => {
    const res = await fetchData({
      path: "/outbound/selfDelivery/getUndoneTask",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
    });
    if (res?.code === 200) {
      const taskId = res.data?.task?.taskId ?? 0;
      // 更新保存快递发货的taskId
      dispatch({
        type: "updateSelfDeliveryOpt",
        payload: { taskId },
      });
      setData(res?.data?.packages ?? []);
      //
      if (type) {
        const hasCancelData = res.data?.packages?.filter(
          (item) => item.noteStatus === 99
        );
        if (hasCancelData?.length) {
          notification.open({ message: "存在已取消包裹，请先移除!" });
        } else {
          navigation.navigate("SelfDeliveryDetailStack");
        }
      }
    }
  };
  // 扫码添加包裹
  const onAdd = async (input) => {
    // 检查 deliveryNoteId 是否已经存在
    const existingItem = data?.find((item) => item.packageNoteNo === input);
    if (existingItem) {
      // notification.open({ message: "该包裹已存在" });
      // 添加到高亮数组
      if (!highlightPackages.includes(input)) {
        setHighlightPackages((arr) => [...arr, input]);
      }
      return;
    }
    const res = await fetchData({
      path: "/outbound/selfDelivery/addOutboundApplyNote",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.selfDeliveryOpt?.taskId,
        packageNoteNo: input,
      },
    });
    if (res?.code === 200) {
      if (ctxState?.selfDeliveryOpt?.taskId === 0) {
        // 更新保存快递发货的taskId
        const taskId = res.data.task.taskId;
        dispatch({
          type: "updateSelfDeliveryOpt",
          payload: { taskId },
        });
      }
      const addData = res?.data?.packages;
      setData(addData);
      // 成功获取，将扫描包裹高亮一下
      setHighlightPackages((arr) => [...arr, input]);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const onPress = () => {
    if (highlightPackages?.length < data.length) {
      notification.open({ message: "请扫描所有包裹后操作发货!" });
      return;
    }
    // 去发货
    getData(true);
  };
  const onKeyEnter = (input) => {
    // 扫描添加
    const scanText = getScanText(input);
    onAdd(scanText);
  };
  // 长按删除出库申请单
  const onLongPress = (item) => {
    // 包裹编码packageNoteNo 唯一
    //如何判断包裹所在出库申请单下是否有多包裹?判断出库申请单号，outboundApplyNoteNo是否有其他相同的
    const filterData = data.filter(
      (ele) => ele.outboundApplyNoteNo === item.outboundApplyNoteNo
    );
    if (filterData?.length > 1) {
      let titleStr = "出库申请单下有";
      for (const ele of filterData) {
        titleStr += `【${ele.packageNoteNo}】 `;
      }
      titleStr += `${filterData?.length}个包裹,确认全部移除?`;
      setTitle(titleStr);
    }
    if (filterData?.length === 1) {
      setTitle(`确认移除【${item?.packageNoteNo}】?`);
    }

    setVisible(true);
    setOutboundApplyNoteId(item?.outboundApplyNoteId);
  };
  const onConfirm = async () => {
    const res = await fetchData({
      path: "/outbound/selfDelivery/removeOutboundApplyNote",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.selfDeliveryOpt?.taskId,
        outboundApplyNoteId,
      },
    });
    if (res?.code === 200) {
      setVisible(false);
      scanBox.clear();
      notification.open({ message: "移除出库申请单成功", type: "success" });
      getData();
    } else {
      notification.open({ message: res?.msg });
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <CustomModal
        title={title}
        onConfirm={onConfirm}
        visible={visible}
        onCancel={() => setVisible(false)}
      ></CustomModal>
      <ScanBox
        placeholder={"请扫描包裹编码"}
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        <FlatList
          data={data}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item) => item?.packageNoteId.toString()}
          renderItem={({ item }) => {
            const isHighlight = highlightPackages.includes(item?.packageNoteNo);
            return (
              <CustomCard
                height={98}
                widthFactor={0.9}
                onLongPress={() => onLongPress(item)}
                backgroundColor={isHighlight ? "#EDF6FF" : "#fff"}
                borderColor={isHighlight ? "#6DBAFF" : "#ffff"}
              >
                <View style={CardTopView}>
                  <Text style={PrimaryText}>{item?.packageNoteNo}</Text>
                  {item?.noteStatus === 99 && <CustomTag text="已取消" />}
                </View>
                <Divider />
                <View style={CardBottomView}>
                  <Text style={GrayText}>出库申请单号</Text>
                  <Text style={NormalText}>{item?.outboundApplyNoteNo}</Text>
                </View>
              </CustomCard>
            );
          }}
        />
      </CustomContainer>
      {data?.length > 0 ? (
        <BottomConfirmButton
          title="去发货"
          onPress={onPress}
          disabled={highlightPackages.length !== data.length}
        />
      ) : (
        <View></View>
      )}
    </View>
  );
};

export default SelfDeliveryStack;

const styles = StyleSheet.create({});
