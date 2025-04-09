import { StyleSheet, Text, View } from "react-native";
import React, { useState, useContext } from "react";
import CustomCard from "../comp/CustomCard";
import Divider from "../comp/Divider";
import {
  PrimaryText,
  CardTopView,
  CardBottomView,
  GrayText,
  NormalText,
  CountText,
} from "../comStyle";
import { useNavigation } from "@react-navigation/native";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import CustomContainer from "../comp/CustomContainer";
import AlertText from "../comp/AlertText";
import NumberInput from "../comp/NumberInput";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, { notification } from "../comp/Notification";
const AdjustOrderPackedStack = ({ route }) => {
  const { data } = route.params;
  const { ctxState } = useContext(ContentContext);
  const navigation = useNavigation();
  const [count, setCount] = useState(0);
  const onPress = async () => {
    const res = await fetchData({
      path: "/outbound/packaging/hasDetail/modifyPackageDetail",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.outboundPackingOpt?.taskId,
        packageNoteDetailId: data?.packageNoteDetailId,
        pickingNoteDetailId: data?.pickingNoteDetailId,
        num: count,
      },
    });
    if (res?.code === 200) {
      notification.open({ message: "调整数量成功", type: "success" });
      setTimeout(() => {
        // to navigate
        navigation.navigate("OrderPackagedStack");
      }, 2000);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <CustomContainer>
        <CustomCard
          widthFactor={0.95}
          onPress={() => onPress(data)}
          onLongPress={() => onLongPress(data)}
        >
          <View style={CardTopView}>
            <Text style={PrimaryText}>{data?.packageNoteNo}</Text>
          </View>
          <Divider />
          <View style={CardBottomView}>
            <Text style={GrayText}>客户产品名称</Text>
            <AlertText text={data?.skuName} />
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>数量</Text>
            <Text style={CountText}>
              {data?.pickingNum} {data?.unit}
            </Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>产品型号</Text>
            <AlertText text={data?.skuId} showLength={30} />
          </View>
        </CustomCard>
        <CustomCard height={72} widthFactor={0.95}>
          <View style={CardBottomView}>
            <Text style={GrayText}>包装数量</Text>
            <NumberInput
              initialValue={data.pickingNum}
              value={count}
              onChangeValue={setCount}
              maxValue={data?.pickingNum}
            />
          </View>
        </CustomCard>
      </CustomContainer>
      <BottomConfirmButton title="确认调整" onPress={onPress} />
    </View>
  );
};

export default AdjustOrderPackedStack;

const styles = StyleSheet.create({});
