import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableNativeFeedback,
} from "react-native";
import React, { useEffect, useState, useContext, useCallback } from "react";
import ScanBox from "../comp/ScanBox";
import CustomContainer from "../comp/CustomContainer";
import CustomCard from "../comp/CustomCard";
import Divider from "../comp/Divider";
import AlertText from "../comp/AlertText";
import {
  PrimaryText,
  CardTopView,
  CardBottomView,
  NormalText,
  CountText,
  GrayText,
} from "../comStyle";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import CustomTag from "../comp/CustomTag";
import CustomPageHeader from "../comp/CustomPageHeader";
import CustomModal from "../comp/CustomModal";
import NumberInput from "../comp/NumberInput";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, { notification } from "../comp/Notification";
import getScanText from "src/functions/getScanText";
import printImage from "src/functions/printImage";
import { handleImageUrl } from "src/functions/handleImageUrl";

const OrderPackagedStack = () => {
  const { ctxState } = useContext(ContentContext);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [printCount, setPrintCount] = useState(1);
  const [data, setData] = useState([]);
  const [packedCount, setPackedCount] = useState(0);
  const [printItem, setPrintItem] = useState({});
  const [highlight, setHighlight] = useState("");

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
  // 获取已包装
  const getData = async () => {
    const res = await fetchData({
      path: `/outbound/packaging/hasDetail/getPackageDetails`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: ctxState?.outboundPackingOpt?.taskId,
      },
    });

    if (res?.code === 200) {
      setData(res.data);
      setPackedCount(res.data?.length ?? 0);
    } else {
      notification.open({ message: res?.msg });
    }
  };

  // 扫描或点击sku,弹出补打弹框,长按跳转调整页面
  const onPress = (ele) => {
    setPrintItem(ele);
    setModalVisible(true);
  };
  const onLongPress = (item, ele) => {
    /**
     *   待打包:50, 打包中:53, 已打包:58, 已取消:99
     */
    // 已打包不能再调整数量，当前返回的是55
    if (item?.packageNoteStatus === 55) {
      notification.open({ message: "已打包不能再调整数量" });
      return;
    }
    // 待打包和打包中可以调整数量
    navigation.navigate("AdjustOrderPackedStack", {
      data: { ...ele, packageNoteNo: item?.packageNoteNo },
    });
  };
  const onKeyEnter = (input) => {
    const scanText = getScanText(input);
    const findData = data?.find((item) => item?.packageNoteNo === scanText);
    if (findData) {
      setHighlight(scanText);
    } else {
      setHighlight("");
      notification.open({ message: "未找到数据" });
    }
  };
  // to do print 打印
  const handlePrint = async () => {
    // 打印份数
    for (let i = 0; i < printCount; i++) {
      await printImage(
        handleImageUrl(4, ctxState?.optSet?.curStorageId, {
          pickingNoteDetailId: printItem?.pickingNoteDetailId,
          packageNoteNo: ctxState?.outboundPackingOpt?.packageNoteNo,
        }),
        `Bearer ${ctxState?.userInfo?.token}`
      );
    }
  };
  const handleConfirm = () => {
    handlePrint();
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };
const onBackPress = () => {
  navigation.navigate("OutboundPackingDetailStack",{noPrint: true});
};
  const renderItem = ({ item }) => {
    const isHighlight = highlight === item?.packageNoteNo;
    return (
      <CustomCard
        widthFactor={0.93}
        backgroundColor={isHighlight ? "#EDF6FF" : "#fff"}
        borderColor={isHighlight ? "#6DBAFF" : "#ffff"}
      >
        <View style={CardTopView}>
          <Text style={PrimaryText}>{item?.packageNoteNo}</Text>
          {item?.packageNoteStatus === 55 && (
            <CustomTag text={"封装"} color="#fff" backgroundColor="#56B947" />
          )}
        </View>
        {item?.packageNoteDetails?.map((ele, idx) => (
          <TouchableNativeFeedback
            onPress={() => onPress(ele)}
            onLongPress={() => onLongPress(item, ele)}
            key={idx}
          >
            <View>
              <Divider />
              <View style={CardBottomView}>
                <Text style={GrayText}>客户产品名称</Text>
                <AlertText text={ele?.skuName} />
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>数量</Text>
                <Text style={CountText}>
                  {ele?.pickingNum} {ele?.unit}
                </Text>
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>产品型号</Text>
                <AlertText text={ele?.skuId} showLength={30} />
              </View>
            </View>
          </TouchableNativeFeedback>
        ))}
      </CustomCard>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <CustomPageHeader title={`已包装 (${packedCount})`}  onBackPress={onBackPress}/>
      <ScanBox
        placeholder="请扫描包裹码"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomModal
        visible={modalVisible}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title="打印份数"
      >
        <NumberInput
          initialValue={1}
          value={printCount}
          onChangeValue={setPrintCount}
        />
      </CustomModal>
      <CustomContainer>
        <FlatList
          data={data}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item) => item?.packageNoteNo}
          renderItem={renderItem}
        />
      </CustomContainer>
    </View>
  );
};

export default OrderPackagedStack;

const styles = StyleSheet.create({});
