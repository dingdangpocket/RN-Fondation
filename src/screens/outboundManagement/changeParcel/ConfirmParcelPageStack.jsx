import { Text, View, TouchableOpacity, StyleSheet, Image } from "react-native";
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
import NumberInput from "../comp/NumberInput";
import AlertText from "../comp/AlertText";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, { notification } from "../comp/Notification";
import { handleImageUrl } from "src/functions/handleImageUrl";
import printImage from "src/functions/printImage";
import CustomModal from "../comp/CustomModal";
import CustomPageHeader from "../comp/CustomPageHeader";
const ConfirmParcelPageStack = ({ route }) => {
  const { data, packageNoteNos } = route.params;
  const { ctxState } = useContext(ContentContext);
  const [orderVisible, setOrderVisible] = useState(false);
  const [itemVisible, setItemVisible] = useState(false);
  const [orderModalTitle, setOrderModalTitle] = useState("");
  const [itemModalTitle, setItemModalTitle] = useState("");
  const navigation = useNavigation();
  const [count, setCount] = useState(0);
  const [packLoading, setPackLoading] = useState(false);

  const onPress = async () => {
    const res = await fetchData({
      path: "/outbound/packaging/hasDetail/modifyPackageDetail",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.changeParcelOpt?.taskId,
        packageNoteDetailId: data?.packageNoteDetailId,
        pickingNoteDetailId: data?.pickingNoteDetailId,
        num: data.num - count,
      },
    });
    if (res?.code === 200) {
      // notification.open({ message: "调整数量成功", type: "success" });
      handlePutIntoPackage(data);
      // setTimeout(() => {
      //   // to navigate
      //   navigation.navigate("ChangeParcelDetailStack");
      // }, 1000);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 将sku放入包裹
  const handlePutIntoPackage = async (item) => {
    setPackLoading(true);
    const pickingNoteDetailId = item?.pickingNoteDetailId;
    const packageNoteDetailId = item?.packageNoteDetailId;
    const outboundNoteDetailId = item?.outboundNoteDetailId;
    const pickingNum = count;
    const res = await fetchData({
      path: "/outbound/packaging/hasDetail/putIntoPackage",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        packagingPutIntoSubmitDTO: [
          {
            taskId: ctxState?.changeParcelOpt?.taskId,
            packageNoteId: ctxState?.changeParcelOpt?.packageNoteId,
            packageNoteNo: ctxState?.changeParcelOpt?.packageNoteNo,
            // packageNoteId: skuData?.newPackageNote?.packageNoteId,
            pickingNoteDetailId,
            packageNoteDetailId,
            skuId: item?.skuId,
            skuName: item?.skuName,
            pickingNum,
          },
        ],
      },
    });
    /**
     * 200：成功
     * 8003: 整单被取消
     * 8015: 项次被取消
     */
    setPackLoading(false);
    if (res?.code === 200) {
      notification.open({ message: "已打包", type: "success" });
      // to do print ok出库签
      if(pickingNoteDetailId){
        printImage(
          handleImageUrl(4, ctxState?.optSet?.curStorageId, {
            pickingNoteDetailId,
            packageNoteNo: ctxState?.changeParcelOpt?.packageNoteNo,
          }),
          `Bearer ${ctxState?.userInfo?.token}`
        );
      }else{
        printImage(
          handleImageUrl(4, ctxState?.optSet?.curStorageId, {
            outboundNoteDetailId,
            packageNoteNo: ctxState?.changeParcelOpt?.packageNoteNo,
          }),
          `Bearer ${ctxState?.userInfo?.token}`
        );
      }
      setTimeout(() => {
        // navigation.navigate("ChangeParcelDetailStack");
        onBackPress()
      }, 100);
    } else if (res?.code === 8003) {
      // 整单取消  msg:订单取消，请将所有商品转移至待上架区
      setOrderModalTitle(
        res?.msg || "订单已全部取消，请将所有商品转移至待上架区"
      );
      setOrderVisible(true);
    } else if (res?.code === 8015) {
      // 项次被取消    msg:【项次编码】已取消，请转移至待上架区
      setItemModalTitle(res?.msg || "项次已取消，请重新复核");
      setItemVisible(true);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 整单取消确认
  const onOrderModalConfirm = () => {
    setOrderVisible(false);
    navigation.navigate("ChangeParcelStack");
  };
  // 项次取消确认
  const onItemModalConfirm = () => {
    setItemVisible(false);
    onBackPress()
  };
  // 返回
  const onBackPress = () => {
    navigation.navigate("ChangeParcelDetailStack", { packageNoteNos, noPrint: true });
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <CustomPageHeader
        title="更换包裹"
        onBackPress={onBackPress}
      />
      <CustomModal
        title={orderModalTitle}
        visible={orderVisible}
        setVisible={setOrderVisible}
        onConfirm={onOrderModalConfirm}
      ></CustomModal>
      <CustomModal
        title={itemModalTitle}
        visible={itemVisible}
        setVisible={setItemVisible}
        onConfirm={onItemModalConfirm}
      ></CustomModal>
      <CustomContainer>
        <CustomCard widthFactor={0.95}>
          <View style={CardTopView}>
            <Text style={PrimaryText}>
              {ctxState?.changeParcelOpt?.packageNoteNo}
            </Text>
          </View>
          {[data]?.map((ele, idx) => {
            return (
              <View key={idx}>
                <Divider />
                <View style={CardBottomView}>
                  <Text style={GrayText}>客户SKU名称</Text>
                  <AlertText text={ele?.skuName} />
                </View>
                <View style={CardBottomView}>
                  <Text style={GrayText}>数量</Text>
                  <Text style={CountText}>
                    {ele?.num} {ele?.unit}
                  </Text>
                </View>
                <View style={CardBottomView}>
                  <Text style={GrayText}>产品型号</Text>
                  <AlertText text={ele?.skuId} showLength={30} />
                </View>
              </View>
            );
          })}
        </CustomCard>
        <CustomCard height={72} widthFactor={0.95}>
          <View style={CardBottomView}>
            <Text style={GrayText}>包装数量</Text>
            <NumberInput
              initialValue={data.count}
              value={count}
              onChangeValue={setCount}
            />
          </View>
        </CustomCard>
      </CustomContainer>
      <BottomConfirmButton
        title="确认打包"
        onPress={() => handlePutIntoPackage(data)}
        disabled={!count && !packLoading}
      />
    </View>
  );
};

export default ConfirmParcelPageStack;
