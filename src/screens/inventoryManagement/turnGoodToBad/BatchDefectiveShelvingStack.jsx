import { Text, View, FlatList } from "react-native";
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
import CustomTag from "src/screens/outboundManagement/comp/CustomTag";
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

const BatchDefectiveShelvingStack = ({ route }) => {
  const navigation = useNavigation();
  const { data, bindStorageBinCode, bindContainerCode } = route.params;
  const { ctxState } = useContext(ContentContext);
  const [idempotentKey, setIdempotentKey] = useState("");
  const [targetStorageBinCode, setTargetStorageBinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [containerCode, setContainerCode] = useState("");
  const [reTake, setRetake] = useState(false);
  const [bindLoading, setBindLoading] = useState(false);
  const isFocused = useIsFocused();
  const { getStorageBinCodeByContainerCode } = useStorageBinCode(
    setTargetStorageBinCode,
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
  useEffect(() => {
    setTargetStorageBinCode(bindStorageBinCode);
    // 清除输入框内容
    if (bindStorageBinCode) {
      scanBox.clear();
    }
  }, [bindStorageBinCode]);

  const onPress = async () => {
    if (!targetStorageBinCode) {
      notification.open({ message: "请先扫描目标货位编码" });
      return;
    }

    setIsLoading(true);
    const pdaUndoneTaskPutawayDTOS = data?.map((item) => ({
      taskId: item.taskId,
      storageBinTransferNoteId: item?.storageBinTransferNoteId,
      storageBinTransferNoteDetailIds: [item.storageBinTransferNoteDetailId],
      idempotentKey,
      targetStorageBinCode,
    }));
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
    // 通过容器编码拿到货位编码
    getStorageBinCodeByContainerCode(scanText);
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <ScanBox
        placeholder="请扫描容器编码"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        <BindContainer
          targetStorageBinCode={targetStorageBinCode}
          containerCode={containerCode}
          fromPage="BatchDefectiveShelvingStack"
          bindLoading={bindLoading}
          notification={notification}
        />
        <FlatList
          data={data}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <CustomCard widthFactor={0.95}>
              <View style={CardTopView}>
                <Text style={PrimaryText}>{item?.skuName}</Text>
                <CustomTag text="待上架" />
              </View>
              <Divider />
              <View style={CardBottomView}>
                <Text style={GrayText}>产品型号</Text>
                <AlertText text={item?.skuId} showLength={30} />
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>数量</Text>
                <Text style={CountText}>
                  {" "}
                  {item.num} {item?.unit}
                </Text>
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>货位</Text>
                <Text style={NormalText}>{item?.sourceStorageBinCode}</Text>
              </View>
            </CustomCard>
          )}
        />
      </CustomContainer>
      <BottomConfirmButton
        title="确认上架"
        onPress={onPress}
        disabled={!targetStorageBinCode}
        isLoading={isLoading}
      />
    </View>
  );
};

export default BatchDefectiveShelvingStack;
