import { View, Text } from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import ScanBox, { scanBox } from "src/screens/outboundManagement/comp/ScanBox";
import CustomContainer from "src/screens/outboundManagement/comp/CustomContainer";
import CustomCard from "src/screens/outboundManagement/comp/CustomCard";
import {
  CardTopView,
  CardBottomView,
  PrimaryText,
  CountText,
  NormalText,
  GrayText,
} from "../../outboundManagement/comStyle";
import BottomConfirmButton from "src/screens/outboundManagement/comp/BottomConfirmButton";
import Divider from "src/screens/outboundManagement/comp/Divider";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, {
  notification,
} from "src/screens/outboundManagement/comp/Notification";
import getTimeId from "src/functions/getTimeId";
import getScanText from "src/functions/getScanText";
import BindContainer from "src/screens/outboundManagement/comp/BindContainer";
import useStorageBinCode from "src/hooks/useStorageBinCode";
import AlertText from "src/screens/outboundManagement/comp/AlertText";
const SingleDefectiveShelvingStack = ({ route }) => {
  const navigation = useNavigation();
  const { data, bindStorageBinCode } = route.params;
  const { ctxState } = useContext(ContentContext);
  const [idempotentKey, setIdempotentKey] = useState("");
  const [bindLoading, setBindLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [targetStorageBinCode, setTargetStorageBinCode] = useState("");
  const [containerCode, setContainerCode] = useState("");

  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  useEffect(() => {
    setIdempotentKey(getTimeId());
    getDetailData();
  }, []);

  useEffect(() => {
    setTargetStorageBinCode(bindStorageBinCode);
    if (bindStorageBinCode) {
      scanBox.clear();
    }
  }, [bindStorageBinCode]);

  const { getStorageBinCodeByContainerCode } = useStorageBinCode(
    setTargetStorageBinCode,
    setContainerCode,
    notification,
    setBindLoading
  );
  const getDetailData = async () => {
    const res = await fetchData({
      path: "/inside/qualityToDefective/getStorageBinTransferNoteDetail",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: data?.taskId,
        storageBinTransferNoteId: data?.storageBinTransferNoteId,
      },
    });
    if (res?.code === 200) {
      setDetailData(res?.data);
    }
  };

  const onPress = async () => {
    if (!targetStorageBinCode) {
      notification.open({ message: "请先扫描目标货位编码" });
      return;
    }

    setIsLoading(true);
    const pdaUndoneTaskPutawayDTOS = [
      {
        taskId: data?.taskId,
        storageBinTransferNoteId: data?.storageBinTransferNoteId,
        storageBinTransferNoteDetailIds: [data?.storageBinTransferNoteDetailId],
        idempotentKey,
        targetStorageBinCode,
      },
    ];
    const res = await fetchData({
      path: "/inside/qualityToDefective/putaway",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        pdaUndoneTaskPutawayDTOS,
      },
    });

    if (res?.code === 200) {
      notification.open({ message: "上架成功", type: "success" });
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } else {
      notification.open({ message: res?.msg || "上架失败" });
    }

    setIsLoading(false);
  };

  const onKeyEnter = (input) => {
    const scanText = getScanText(input);
    getStorageBinCodeByContainerCode(scanText);
  };

  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <ScanBox
        placeholder="请扫描容器编码"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
        value={targetStorageBinCode}
      />
      <CustomContainer>
        <BindContainer
          targetStorageBinCode={targetStorageBinCode}
          containerCode={containerCode}
          fromPage="SingleDefectiveShelvingStack"
          bindLoading={bindLoading}
          notification={notification}
        />
        <CustomCard widthFactor={0.95}>
          <View style={CardTopView}>
            <Text style={PrimaryText}>{data?.skuName}</Text>
          </View>
          <Divider />
          <View style={CardBottomView}>
            <Text style={GrayText}>产品型号</Text>
            <AlertText text={data?.skuId} showLength={30} />
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>下架货位</Text>
            <Text style={NormalText}>{data?.sourceStorageBinCode || ""}</Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>货主</Text>
            <Text style={NormalText}>{data?.goodsOwner}</Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>上架数量</Text>
            <Text style={CountText}>
              {data?.num} {data?.unit}
            </Text>
          </View>
        </CustomCard>
      </CustomContainer>
      <BottomConfirmButton
        title="确认上架"
        onPress={onPress}
        disabled={!targetStorageBinCode}
        isLoading={isLoading}
        loadingText="处理中..."
      />
    </View>
  );
};

export default SingleDefectiveShelvingStack;
