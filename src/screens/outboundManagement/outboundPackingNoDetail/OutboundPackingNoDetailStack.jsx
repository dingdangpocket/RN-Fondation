import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Image,
} from "react-native";
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
import getScanText from "src/functions/getScanText";
import CustomModal from "../comp/CustomModal";
const OutboundPackingNoDetailStack = () => {
  const { ctxState, dispatch } = useContext(ContentContext);
  const navigation = useNavigation();
  const [data, setData] = useState({});
  const [visible, setVisible] = useState(false);
  const [outboundNoteId, setOutboundNoteId] = useState("");
  const [reTake, setRetake] = useState(false);
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
      path: "/outbound/packaging/noDetail/getUndoneTask",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
    });
    if (res?.code === 200) {
      if (!res?.data?.outboundNote) {
        notification.open({ message: "暂无数据" });
        return;
      }
      const taskId = res?.data?.task?.taskId;
      if (taskId) {
        const outboundNoteId = res?.data?.outboundNote?.outboundNoteId;
        const outboundNoteNo = res?.data?.outboundNote?.outboundNoteNo;
        // 更新保存taskId、outboundNoteId、outboundNoteNo
        dispatch({
          type: "updateOutboundPackingNoDetailOpt",
          payload: { taskId, outboundNoteId, outboundNoteNo },
        });
        setData(res?.data);
      }
    } else {
      notification.open({ message: res?.msg });
    }
  };

  const onKeyEnter = (input) => {
    const scanText = getScanText(input, "end");
    handleScan(scanText, ctxState?.outboundPackingNoDetailOpt?.taskId);
  };
  //获取出库申请单
  const handleScan = async (input) => {
    const res = await fetchData({
      path: `/outbound/packaging/noDetail/getOutboundNote`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.outboundPackingNoDetailOpt?.taskId,
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
      const outboundNoteId = res.data.outboundNote?.outboundNoteId;
      const outboundNoteNo = res.data.outboundNote?.outboundNoteNo;

      // 更新保存taskId
      dispatch({
        type: "updateOutboundPackingNoDetailOpt",
        payload: { taskId, outboundNoteId, outboundNoteNo },
      });
      // 已完成状态时弹出作废弹框
      if (res.data?.task?.taskStatus ===5) {
        setOutboundNoteId(outboundNoteId);
        setData({});
        setVisible(true);
        return
      }else{
        setOutboundNoteId('')
      }
      setData(res.data);
      // 自动进入任务
      if (res.data?.task?.taskId) {
        onViewItem();
      }
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 打包作废
  const onAbandon = async (taskId) => {
    const res = await fetchData({
      path: "/outbound/packaging/noDetail/invalidPackageCancel",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId,
      },
    });
    setVisible(false);
    if (res?.code === 200) {
      notification.open({ message: "包裹作废成功", type: "success" });
      const taskId = res.data.task?.taskId;
      // 出库单id
      const outboundNoteId = res.data.outboundNote?.outboundNoteId;
      const outboundNoteNo = res.data.outboundNote?.outboundNoteNo;
      // 更新保存taskId
      dispatch({
        type: "updateOutboundPackingNoDetailOpt",
        payload: { taskId, outboundNoteId, outboundNoteNo },
      });
      setData(res.data)
    } else {
      setData({});
      notification.open({ message: res?.msg });
    }
  };
  const onViewItem = () => {
    navigation.navigate("PackingNoDetailOutboundNoteStack");
  };
  const onRePack = () => {
    onAbandon(ctxState?.outboundPackingNoDetailOpt?.taskId);
  };
  return (
    <View style={{ flex: 1 }}>
      <CustomModal
        title={`【${outboundNoteId}】已打包完成,是否重新打包?`}
        visible={visible}
        setVisible={setVisible}
        onConfirm={onRePack}
      ></CustomModal>
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
              <CustomTag text={data?.task?.taskStatusText ?? ""} />
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
    </View>
  );
  d;
};

export default OutboundPackingNoDetailStack;

const styles = StyleSheet.create({});
