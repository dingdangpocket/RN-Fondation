import { StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState, useContext } from "react";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import ScanBox from "../outboundManagement/comp/ScanBox";
import CustomContainer from "../outboundManagement/comp/CustomContainer";
import CustomCard from "../outboundManagement/comp/CustomCard";
import {
  CardBottomView,
  CardTopView,
  GrayText,
  NormalText,
  PrimaryText,
} from "../outboundManagement/comStyle";
import CustomTag from "../outboundManagement/comp/CustomTag";
import Divider from "../outboundManagement/comp/Divider";
import BottomConfirmButton from "../outboundManagement/comp/BottomConfirmButton";
import CustomPageHeader from "../outboundManagement/comp/CustomPageHeader";
import AlertText from "../outboundManagement/comp/AlertText";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, {
  notification,
} from "../outboundManagement/comp/Notification";
import CustomModal from "../outboundManagement/comp/CustomModal";
import getScanText from "src/functions/getScanText";
import { FlatList } from "react-native";

const PassageDetailSkUListStack = ({ route }) => {
  const { countNoteBinDetailId, storageBinCode, noteStatus, row, countNoteId } =
    route.params;
  const { ctxState } = useContext(ContentContext);
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [unknownProduct, setUnknownProduct] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState("");

  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );
  // 获取sku列表
  const getData = async () => {
    const res = await fetchData({
      path: `/inside/count/listCountDetail`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { countNoteBinDetailId },
    });
    if (res?.code === 200) {
      setData(res.data);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const colorSet = {
    0: {
      color: "#E28400",
      backgroundColor: "#FFEFD8CC",
      text: "未提交",
    },
    1: {
      color: "#006DCF",
      backgroundColor: "#006DCF1F",
      text: "已提交",
    },
  };
  const onPress = (item) => {
    getSkuDetail(item.skuId);
  };

  // 点击"完成本货位盘点"按钮时触发
  const onComplete = async () => {
    // 筛选出未提交的SKU
    const unsubmittedSkus = data.filter((item) => item.status === 0);

    // 根据未提交SKU的数量设置不同的确认信息
    if (unsubmittedSkus.length > 0) {
      setConfirmModalTitle(
        `完成货位盘点将导致${unsubmittedSkus.length}个未提交的SKU盘亏为0。是否确认完成？`
      );
    } else {
      setConfirmModalTitle("是否确认完成本货位盘点？");
    }

    // 显示确认弹窗
    setConfirmModalVisible(true);
  };
  // 完成盘点后获取拣货区列表、判断当前列表中是否还有未完成的货位，有则跳转至拣货区列表
  // 否则 获取通道列表，判断通列表中是否还有未提交的盘点货位，有则跳转到通道列表，否则跳转到首页
  const handleJumpToPage = async (curNoteIsFinishState) => {
    //初盘完成、盘点中
    if (curNoteIsFinishState) {
      // 首页
      navigation.navigate("StockCountStack");
    } else {
      // 获取盘点货位
      const res = await fetchData({
        path: `/inside/count/listStorageBin`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          row,
          countNoteId,
        },
      });
      //判断货位是否还有未盘点数据
      const findUnCountStorageBin = res?.data?.find(
        (item) => item?.countNoteBinDetailStatus === 0
      );
      if (findUnCountStorageBin) {
        navigation.navigate("StockCountPassageDetailStack");
      } else {
        // 判断通列表中是否还有未提交的盘点货位，有则跳转到通道列表，否则跳转到首页
        const channelRes = await fetchData({
          path: `/inside/count/listChannel`,
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: {
            countNoteId,
          },
        });
        const findUnsubmitStorageBinChannel = channelRes?.data.find(
          (item) => item?.unsubmitStorageBinCount !== 0
        );
        if (findUnsubmitStorageBinChannel) {
          navigation.navigate("StockCountPassageStack");
        } else {
          // 导航回货位盘点首页
          navigation.navigate("StockCountStack");
        }
      }
    }
  };

  // 确认完成盘点
  const handleConfirmComplete = async () => {
    // 关闭确认弹窗
    setConfirmModalVisible(false);

    // 发送完成盘点的请求
    const res = await fetchData({
      path: "/inside/count/submitStorageBin",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { countNoteBinDetailId },
    });

    if (res?.code === 200) {
      // 盘点成功，显示成功通知
      notification.open({ message: "完成本货位盘点", type: "success" });
      // 跳转判断
      handleJumpToPage(res.data);
    } else {
      notification.open({ message: res?.msg });
    }
  };

  // 处理扫描输入
  const onKeyEnter = (input) => {
    const scanText = getScanText(input, "middle");
    getSkuDetail(scanText);
  };

  // 获取sku详情
  const getSkuDetail = async (input) => {
    // 如果没有找到匹配的SKU，尝试获取未知产品信息
    const res = await fetchData({
      path: `/inside/count/getUnkonwProductInfo`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        skuId: input,
        countNoteBinDetailId,
      },
    });
    if (res?.code === 200) {
      // 在当前数据中查找匹配的SKU
      const findData = data.find((item) => item.skuId === input);
      if (findData) {
        // // 如果找到匹配的SKU，导航到SKU详情页面
        navigation.navigate("PassageDetailSkUItemStack", {
          countNoteBinDetailId,
          storageBinCode,
          data: res.data,
        });
      } else {
        // 如果找到未知产品信息，显示确认添加的弹窗
        setUnknownProduct(res.data);
        setTitle(`【${res.data.skuName}】不存在货位库存中，是否确认添加`);
        setVisible(true);
      }
    } else {
      // 如果未找到SKU信息，显示提示
      notification.open({ message: res?.msg || "未找到该SKU信息" });
    }
  };

  // 确认添加未知产品
  const onConfirmAdd = () => {
    setVisible(false);
    if (unknownProduct) {
      // 导航到SKU详情页面，并标记为新SKU
      navigation.navigate("PassageDetailSkUItemStack", {
        countNoteBinDetailId,
        storageBinCode,
        data: unknownProduct,
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <CustomModal
        visible={visible}
        setVisible={setVisible}
        title={title}
        onConfirm={onConfirmAdd}
      ></CustomModal>
      <CustomPageHeader title={storageBinCode} />
      <ScanBox
        placeholder="请扫描条码添加盘点SKU"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        <FlatList
          data={data}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const { text, color, backgroundColor } = colorSet[item.status];
            return (
              <CustomCard widthFactor={0.95} onPress={() => onPress(item)}>
                <View style={CardTopView}>
                  <AlertText text={item.skuName} style={PrimaryText} />
                  <CustomTag
                    text={text}
                    color={color}
                    backgroundColor={backgroundColor}
                  />
                </View>
                <Divider />
                <View style={CardBottomView}>
                  <Text style={GrayText}>产品名称</Text>
                  <AlertText text={item.skuName} />
                </View>
                <View style={CardBottomView}>
                  <Text style={GrayText}>产品型号</Text>
                  <AlertText text={item.skuId} showLength={30} />
                </View>
              </CustomCard>
            );
          }}
        />
      </CustomContainer>
      <CustomModal
        visible={confirmModalVisible}
        setVisible={setConfirmModalVisible}
        title={confirmModalTitle}
        onConfirm={handleConfirmComplete}
      />
      {noteStatus === 15 && (
        <BottomConfirmButton
          title="完成本货位盘点"
          onPress={onComplete}
          disabled={noteStatus !== 15}
        />
      )}
    </View>
  );
};

export default PassageDetailSkUListStack;

const styles = StyleSheet.create({});
