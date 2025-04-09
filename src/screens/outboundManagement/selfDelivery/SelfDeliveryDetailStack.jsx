import { StyleSheet, Text, View } from "react-native";
import React, { useState, useContext, useEffect } from "react";
import CustomContainer from "../comp/CustomContainer";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import CustomCard from "../comp/CustomCard";
import CustomInput from "../comp/CustomInput";
import { CardBottomView, NormalText } from "../comStyle";
import fetchData from "src/api/fetchData";
import Notification, { notification } from "../comp/Notification";
import { ContentContext } from "src/context/ContextProvider";
import getTimeId from "src/functions/getTimeId";
import { useNavigation } from "@react-navigation/native";
const SelfDeliveryDetailStack = () => {
  const [driverName, setDriverName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [idempotentKey, setIdempotentKey] = useState("");
  const { ctxState } = useContext(ContentContext);
  const navigation = useNavigation();
  useEffect(() => {
    setIdempotentKey(getTimeId());
  }, []);
  // 发货完成
  const onPress = async () => {
    // if (plateNumber.length > 30) {
    //   notification.open({ message: "请检查车牌号（最长30字符）" });
    //   return;
    // }
    const res = await fetchData({
      path: "/outbound/selfDelivery/submitDelivery",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.selfDeliveryOpt?.taskId,
        driverName,
        plateNumber,
        idempotentKey,
      },
    });
    if (res?.code === 200) {
      notification.open({ message: "发货成功", type: "success" });
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <CustomContainer>
        <CustomCard widthFactor={0.95} height={52}>
          <View style={{ ...CardBottomView, height: 28, marginTop: 0 }}>
            <Text style={NormalText}>备注</Text>
            <CustomInput
              placeholder="请输入发货司机"
              style={{ height: 20 }}
              value={driverName}
              onChange={setDriverName}
              minWidth={120}
            />
          </View>
        </CustomCard>
        <CustomCard height={52} widthFactor={0.95}>
          <View style={{ ...CardBottomView, height: 28, marginTop: 0 }}>
            <Text style={NormalText}>发货车牌号</Text>
            <CustomInput
              placeholder="请输入发货车牌号"
              style={{ height: 20 }}
              value={plateNumber}
              onChange={setPlateNumber}
              minWidth={120}
            />
          </View>
        </CustomCard>
      </CustomContainer>
      <BottomConfirmButton
        title="发货完成"
        onPress={onPress}
        disabled={!driverName || !plateNumber}
      />
    </View>
  );
};

export default SelfDeliveryDetailStack;

const styles = StyleSheet.create({});
