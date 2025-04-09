import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useContext } from "react";
import CustomContainer from "../comp/CustomContainer";
import CustomCard from "../comp/CustomCard";
import AlertText from "../comp/AlertText";
import Divider from "../comp/Divider";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import {
  CardTopView,
  CountText,
  GrayText,
  PrimaryText,
  CardBottomView,
} from "../comStyle";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, { notification } from "../comp/Notification";
import { useNavigation } from "@react-navigation/native";
import printImage from "src/functions/printImage";
import { handleImageUrl } from "src/functions/handleImageUrl";
const ConfirmPackingStack = ({ route }) => {
  const { ctxState } = useContext(ContentContext);
  const { data, outboundNoteDetailId } = route.params;
  const navigation = useNavigation();

  const onConfirm = async () => {
    // 需要调整参数结构，传递count
    // const pickingNoteDetailId = data?.map((ele) => ele.pickingNoteDetailId);
    const arrData = data?.map((ele) => {
      return {
        taskId: ctxState?.outboundPackingOpt?.taskId,
        packageNoteId: ctxState?.outboundPackingOpt?.packageNoteId,
        pickingNoteDetailId: ele.pickingNoteDetailId,
        pickingNum: ele.pickingNum,
        skuId: ele?.skuId,
        packageNoteNo: ctxState?.outboundPackingOpt?.packageNoteNo,
        skuName: ele?.skuName,
      };
    });
    const res = await fetchData({
      path: "/outbound/packaging/hasDetail/putIntoPackage",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { packagingPutIntoSubmitDTO: arrData },
    });
    if (res?.code === 200) {
      notification.open({ message: "已打包,正在打印标签...", type: "success" });
      printImage(
        handleImageUrl(4, ctxState?.optSet?.curStorageId, {
          outboundNoteDetailId,
        }),
        `Bearer ${ctxState?.userInfo?.token}`
      );
    } else {
      notification.open({ message: res?.msg });
    }
    setTimeout(() => {
      navigation.navigate("OutboundPackingDetailStack");
    }, 1000);
  };
  return (
    <View style={{ flex: 1 }}>
      <CustomContainer>
        <Notification />
        <CustomCard widthFactor={0.95}>
          <Text>
            共 <Text style={PrimaryText}>{data?.length} </Text>条拣货记录
          </Text>
        </CustomCard>
        <FlatList
          data={data}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item) => item?.pickingNoteDetailId.toString()}
          renderItem={({ item }) => (
            <CustomCard key={item?.pickingNoteDetailId} widthFactor={0.95}>
              <View style={CardTopView}>
                <Text style={PrimaryText}>{item?.skuName}</Text>
                <Text style={CountText}>
                  {item?.pickingNum} {item?.unit}
                </Text>
              </View>
              <Divider />
              <View style={CardBottomView}>
                <Text style={GrayText}>产品型号</Text>
                <AlertText text={item?.skuId} showLength={30} />
              </View>
            </CustomCard>
          )}
        />
      </CustomContainer>
      <BottomConfirmButton title="确认包装" onPress={onConfirm} />
    </View>
  );
};

export default ConfirmPackingStack;

const styles = StyleSheet.create({});
