import { Text, View, ToastAndroid } from "react-native";
import React, { useContext,useState } from "react";
import CustomContainer from "../comp/CustomContainer";
import CustomCard from "../comp/CustomCard";
import {
  PrimaryText,
  CardTopView,
  CardBottomView,
  CountText,
  GrayText,
  NormalText,
} from "../comStyle";
import Divider from "../comp/Divider";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import AlertText from "../comp/AlertText";
import Notification, { notification } from "../comp/Notification";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import { useNavigation } from "@react-navigation/native";
import CustomLoading from "../comp/CustomLoading";
const ConfirmCheckedSKUStack = ({ route }) => {
  const { data, taskId, allData, taskNo } = route.params;
  const { ctxState } = useContext(ContentContext);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const onComplete = async () => {
    setLoading(true);
    const res = await fetchData({
      path: "/outbound/pickingCheck/finishCheck",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { taskId, status: 5 },
    });
    setLoading(false);
    if (res?.code === 200) {
      notification.open({
        message: "复核完成",
        type: "success",
      });
      setTimeout(() => {
        navigation.navigate("CheckWarehouseStack");
      }, 1000);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 确认复核
  const onPress = async () => {
    setLoading(true);
    const res = await fetchData({
      path: "/outbound/pickingCheck/submitCheck",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { pickingNoteDetailId: data.pickingNoteDetailId, taskId },
    });
    if (res?.code === 200) {
      setLoading(false);
      // 无【已取消】最后一个sku复核完成，自动完成任务
      const noCancelAndLastComplete =
        allData.every((ele) => ele.pickingNoteDetailStatus !== 99) &&
        allData?.length === 1;
      if (noCancelAndLastComplete) {
        onComplete();
        return;
      }
      notification.open({ message: "复核通过", type: "success" });
      setTimeout(() => {
        navigation.navigate("CheckedDetailWarehouseStack", {
          status: 0,
          taskId,
        });
      }, 1000);
    } else {
      ToastAndroid.show(res.msg, ToastAndroid.SHORT);
      navigation.navigate("CheckedDetailWarehouseStack", { taskId, taskNo });
      // notification.open({ message: res?.msg || "复核失败，请稍后再试" });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomLoading loading={loading}  setLoading={setLoading} />
      <Notification />
      <CustomContainer>
        <CustomCard widthFactor={0.95}>
          <View style={CardTopView}>
            <AlertText
              text={data?.skuName}
              style={PrimaryText}
              showLength={30}
            />
            <Text style={CountText}>
              {data?.pickingNum} {data?.unit}
            </Text>
          </View>
          <Divider />
          <View style={CardBottomView}>
            <Text style={GrayText}>复核任务号</Text>
            <Text style={NormalText}>{taskNo}</Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>拣货员</Text>
            <Text style={NormalText}>{data?.pickingUser}</Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>拣货货位</Text>
            <Text style={NormalText}>{data?.storageBinCode}</Text>
          </View>
        </CustomCard>
      </CustomContainer>
      <BottomConfirmButton title="确认复核" onPress={onPress} />
    </View>
  );
};

export default ConfirmCheckedSKUStack;
