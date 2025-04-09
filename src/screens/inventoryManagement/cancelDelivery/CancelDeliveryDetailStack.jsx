import { Text, View } from "react-native";
import React, { useEffect, useState, useContext, useCallback } from "react";
import CustomContainer from "src/screens/outboundManagement/comp/CustomContainer";
import CustomCard from "src/screens/outboundManagement/comp/CustomCard";
import {
  CardBottomView,
  CardTopView,
  CountText,
  GrayText,
  NormalText,
  PrimaryText,
} from "src/screens/outboundManagement/comStyle";
import Divider from "src/screens/outboundManagement/comp/Divider";
import BottomConfirmButton from "src/screens/outboundManagement/comp/BottomConfirmButton";
import fetchData from "src/api/fetchData";
import getTimeId from "src/functions/getTimeId";
import { ContentContext } from "src/context/ContextProvider";
import Notification, {
  notification,
} from "src/screens/outboundManagement/comp/Notification";
import ScanBox, { scanBox } from "src/screens/outboundManagement/comp/ScanBox";
import { useIsFocused } from "@react-navigation/native";
import getScanText from "src/functions/getScanText";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import BindContainer from "src/screens/outboundManagement/comp/BindContainer";
import AlertText from "src/screens/outboundManagement/comp/AlertText";
import useStorageBinCode from "src/hooks/useStorageBinCode";
const CancelDeliveryDetailStack = ({ route }) => {
  const { data, bindStorageBinCode } = route.params;
  const { ctxState } = useContext(ContentContext);
  const [storageBinCode, setStorageBinCode] = useState("");
  const [idempotentKey, setIdempotentKey] = useState("");
  const [containerCode, setContainerCode] = useState("");
  const [reTake, setRetake] = useState(false);
  const [bindLoading, setBindLoading] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { getStorageBinCodeByContainerCode } = useStorageBinCode(
    setStorageBinCode,
    setContainerCode,
    notification,
    setBindLoading
  );

  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  useEffect(() => {
    setIdempotentKey(getTimeId());
  }, []);

  useFocusEffect(
    useCallback(() => {
      // clear data
      setContainerCode("");
      setStorageBinCode("");
      // getData(activeTab);
    }, [])
  );
  useEffect(() => {
    setStorageBinCode(bindStorageBinCode);
    // 清除输入框内容
    if (bindStorageBinCode) {
      scanBox.clear();
    }
  }, [bindStorageBinCode]);

  // 确认上架
  const onPress = async () => {
    const res = await fetchData({
      path: "/inside/cancelPutaway/submit",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        idempotentKey,
        storageBinCode,
        cancelPutawayNoteDetailId: data?.cancelPutawayNoteDetailId,
        taskId: data?.taskId,
      },
    });
    if (res?.code === 200) {
      notification.open({
        message: "上架成功",
        type: "success",
      });
      setTimeout(() => {
        navigation.navigate("CancelDeliveryStack");
      }, 100);
    } else {
      notification.open({ message: res?.msg });
    }
  };

  const onKeyEnter = (input) => {
    const scanText = getScanText(input);
    // 通过容器编码拿到货位编码
    getStorageBinCodeByContainerCode(scanText);
  };

  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <ScanBox
        placeholder={"请扫描容器编码"}
        onKeyEnter={onKeyEnter}
        reTake={reTake}
        onClose
      />
      <CustomContainer>
        <BindContainer
          targetStorageBinCode={storageBinCode}
          containerCode={containerCode}
          fromPage="CancelDeliveryDetailStack"
          bindLoading={bindLoading}
          notification={notification}
        />
        <CustomCard widthFactor={0.95}>
          <View style={CardTopView}>
            <Text style={PrimaryText}>{data?.taskNo}</Text>
          </View>
          <Divider />
          <View style={CardBottomView}>
            <Text style={GrayText}>SKU名称</Text>
            <AlertText text={data?.skuName} />
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>产品型号</Text>
            <AlertText text={data?.skuId} showLength={30} />
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>客户编码</Text>
            <Text style={NormalText}>{data?.customerCode}</Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>上游原始单号</Text>
            <Text style={NormalText}>{data?.originalNo}</Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>推荐上架货位</Text>
            <Text style={NormalText}>{data?.suggestStorageBinCode}</Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>推荐上架货位组</Text>
            <Text style={NormalText}>{data?.groupName}</Text>
          </View>
        </CustomCard>
        <CustomCard widthFactor={0.95}>
          <View style={CardBottomView}>
            <Text style={GrayText}>上架数量</Text>
            <Text style={CountText}>
              {" "}
              {data?.num} {data?.unit}
            </Text>
          </View>
        </CustomCard>
      </CustomContainer>
      <BottomConfirmButton
        title="确认上架"
        onPress={onPress}
        disabled={!storageBinCode}
      />
    </View>
  );
};

export default CancelDeliveryDetailStack;
