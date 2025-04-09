import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useState, useContext, useEffect } from "react";
import ScanBox from "../comp/ScanBox";
import CustomContainer from "../comp/CustomContainer";
import CustomCard from "../comp/CustomCard";
import {
  PrimaryText,
  CardTopView,
  CountText,
  CardBottomView,
  GrayText,
} from "../comStyle";
import { useNavigation } from "@react-navigation/native";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import CustomPageHeader from "../comp/CustomPageHeader";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import Notification, { notification } from "../comp/Notification";
import Divider from "../comp/Divider";
import CustomModal from "../comp/CustomModal";
import CustomTag from "../comp/CustomTag";
import NumberInput from "../comp/NumberInput";
import AlertText from "../comp/AlertText";
import { handleImageUrl } from "src/functions/handleImageUrl";
import printImage from "src/functions/printImage";
const PackingNoDetailOutboundNoteStack = () => {
  const { ctxState, dispatch } = useContext(ContentContext);
  const [data, setData] = useState({});
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelText, setCancelText] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    getData();
  }, []);
  //获取出库单明细
  const getData = async (type) => {
    const res = await fetchData({
      path: "/outbound/packaging/noDetail/getOutboundNoteDetails",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.outboundPackingNoDetailOpt?.taskId,
        outboundNoteId: ctxState?.outboundPackingNoDetailOpt?.outboundNoteId,
      },
    });
    if (res?.code === 200) {
      // 包裹id
      const packageNoteId = res.data?.packageNoteId;
      dispatch({
        type: "updateOutboundPackingNoDetailOpt",
        payload: { packageNoteId },
      });
      setData(res.data);
      const totalPickingNum = res.data?.outboundNoteDetails?.reduce(
        (acc, detail) => {
          return acc + detail.pickingNum;
        },
        0
      );
      setMaxCount(totalPickingNum);
      // 更新弹框提示内容
      if (type === "pack") {
        // 订单全部取消
        const allcancelSku = res?.data?.outboundNoteDetails?.every(
          (item) => item?.outboundNoteDetailStatus === 99
        );
        if (allcancelSku) {
          notification.open({
            message: "订单已全部取消，请放置到取消待上架区",
          });
          setTimeout(() => {
            navigation.navigate("OutboundPackingNoDetailStack");
          }, 100);
          return;
        }

        //如果有已取消sku，则提示已取消内容
        const cancelSku = res?.data?.outboundNoteDetails?.filter(
          (item) => item?.outboundNoteDetailStatus === 99
        );
        if (cancelSku?.length) {
          const cancelSkuName = cancelSku
            ?.map((item) => `【${item?.skuName}】`)
            .join(" ");
          setCancelText(
            cancelSkuName + "已取消，打包将不包含取消项次是否继续打包？"
          );
          setCancelModalVisible(true);
        } else {
          setVisible(true);
        }
      }
    } else {
      notification.open({ message: res?.msg });
    }
  };
  // 打包
  const onPress = () => {
    // 打包前更新一下sku状态
    getData("pack");
  };
  // 打包
  const onPack = async () => {
    const res = await fetchData({
      path: "/outbound/packaging/noDetail/putIntoPackage",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.outboundPackingNoDetailOpt?.taskId,
        packageNum: count,
      },
    });
    if (res?.code === 200) {
      // 更新taskId
      const taskId = res.data?.taskId;
      dispatch({
        type: "updateOutboundPackingNoDetailOpt",
        payload: { taskId },
      });
      console.log("打包成功,正在打印标签", res);
      notification.open({ message: "打包成功,正在打印标签", type: "success" });
      // to do print  遍历打印包裹签
      for (const label of res?.data?.packageLabel) {
        // console.log("label", label);
        await printImage(
          handleImageUrl(5, ctxState?.optSet?.curStorageId, {
            packageNoteId: label,
          }),
          `Bearer ${ctxState?.userInfo?.token}`
        );
      }

      // 打印出库签
      for (const item of data?.outboundNoteDetails) {
        if (data?.outboundNoteDetailStatus != 99) {
          const outboundNoteDetailId = item?.outboundNoteDetailId;
          await printImage(
            handleImageUrl(4, ctxState?.optSet?.curStorageId, {
              outboundNoteDetailId,
            }),
            `Bearer ${ctxState?.userInfo?.token}`
          );
        }
      }

      navigation.navigate("OutboundPackingNoDetailStack");
    } else {
      notification.open({ message: res?.msg });
    }
  };

  const onModalConfirm = () => {
    setVisible(false);
    if (count > 0) {
      onPack();
    } else {
      notification.open({ message: "请输入包裹数量" });
    }
  };
  const onCancelModalConfirm = () => {
    setCancelModalVisible(false);
    setTimeout(() => {
      setVisible(true);
    }, 100);
  };

  const renderItem = ({ item }) => (
    <CustomCard widthFactor={0.95} key={item?.outboundNoteDetailId}>
      <View style={CardTopView}>
        <AlertText text={item?.skuName} style={PrimaryText} />
        <CustomTag text={item?.outboundNoteDetailStatusText} />
      </View>
      <Divider />
      <View style={CardBottomView}>
        <Text style={GrayText}>客户产品名称</Text>
        <AlertText text={item?.skuName} />
      </View>
      <View style={CardBottomView}>
        <Text style={GrayText}>数量</Text>
        <Text style={CountText}>
          {item?.pickingNum} {item?.unit}
        </Text>
      </View>
      <View style={CardBottomView}>
        <Text style={GrayText}>产品型号</Text>
        <AlertText text={item?.skuId} showLength={30} />
      </View>
    </CustomCard>
  );

  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <CustomModal
        title={"包裹数量"}
        visible={visible}
        setVisible={setVisible}
        onConfirm={onModalConfirm}
      >
        <NumberInput count={count} onChangeValue={setCount} maxValue={999} />
      </CustomModal>
      {/* 提示已取消内容 */}
      <CustomModal
        title={cancelText}
        visible={cancelModalVisible}
        setVisible={setCancelModalVisible}
        onConfirm={onCancelModalConfirm}
      />
      <CustomPageHeader
        title={ctxState?.outboundPackingNoDetailOpt?.outboundNoteNo}
      />
      {/* <ScanBox placeholder="请扫描包裹编码" /> */}
      <CustomContainer>
        <FlatList
          data={data?.outboundNoteDetails}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          renderItem={renderItem}
          keyExtractor={(item) => item?.outboundNoteDetailId.toString()}
        />
      </CustomContainer>
      {data?.outboundNoteDetails?.length ? (
        <BottomConfirmButton title="打包" onPress={() => onPress()} />
      ) : (
        <View></View>
      )}
    </View>
  );
};

export default PackingNoDetailOutboundNoteStack;

const styles = StyleSheet.create({});
