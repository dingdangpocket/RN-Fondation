import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useState, useEffect, useContext } from "react";
import ScanBox from "../comp/ScanBox";
import CustomModal from "../comp/CustomModal";
import NumberInput from "../comp/NumberInput";
import CustomCard from "../comp/CustomCard";
import { ContentContext } from "src/context/ContextProvider";
import { useIsFocused } from "@react-navigation/native";
import {
  CardTopView,
  GrayText,
  NormalText,
  PrimaryText,
  CardBottomView,
  CountText,
} from "../comStyle";
import Divider from "../comp/Divider";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import CustomContainer from "../comp/CustomContainer";
import getScanText from "src/functions/getScanText";
import AlertText from "../comp/AlertText";
import Notification, { notification } from "../comp/Notification";
import fetchData from "src/api/fetchData";
import { handleImageUrl } from "src/functions/handleImageUrl";
import printImage from "src/functions/printImage";
import { API_PRINT } from "src/api/apiConfig";

const ReprintOutboundLabelStack = () => {
  const { ctxState } = useContext(ContentContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [printCount, setPrintCount] = useState(1);
  const [reTake, setReTake] = useState(false);
  const isFocused = useIsFocused();
  const [data, setData] = useState([]);

  const [curItem, setCurItem] = useState({});

  useEffect(() => {
    if (isFocused) {
      setReTake(!reTake);
    }
  }, [isFocused]);

  const onKeyEnter = (value) => {
    const scanText = getScanText(value);
    // setModalVisible(true);
    getData(scanText);
  };

  const getData = async (packageNoteNo) => {
    const res = await fetchData({
      path: `/outbound/packaging/changePackage/listPackagingDetailByPackageNoteNo`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { packageNoteNo },
    });
    if (res?.code === 200) {
      setData(res.data);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const handleCancel = () => {
    setModalVisible(false);
  };

  // 打印单个多份
  const handleConfirm = async () => {
    notification.open({ message: "正在打印标签...", type: "success" });
    // to do print  遍历打印
    for (let i = 0; i < printCount; i++) {
      await printImage(
        handleImageUrl(4, ctxState?.optSet?.curStorageId, {
          pickingNoteDetailId: curItem?.pickingNoteDetailId,
          outboundNoteDetailId: curItem?.outboundNoteDetailId,
          packageNoteNo: curItem?.packageNoteNo,
        }),
        `Bearer ${ctxState?.userInfo?.token}`
      );
    }
    setModalVisible(false);
  };
  const onLongPress = (item) => {
    setCurItem(item);
    setModalVisible(true);
    console.log("onLongPress", item);
  };
  const onPressAll = async () => {
    notification.open({ message: "正在补打全部标签...", type: "success" });
    // to do print  遍历打印
    for (const item of data) {
      await printImage(
        handleImageUrl(4, ctxState?.optSet?.curStorageId, {
          pickingNoteDetailId: item?.pickingNoteDetailId,
          outboundNoteDetailId: item?.outboundNoteDetailId,
          packageNoteNo: item?.packageNoteNo,
        }),
        `Bearer ${ctxState?.userInfo?.token}`
      );
    }
  };

  const renderItem = ({ item }) => (
    <CustomCard widthFactor={0.95} key={item} onPress={() => onLongPress(item)}>
      <View style={CardTopView}>
        <Text style={PrimaryText}>{item?.packageNoteNo}</Text>
      </View>
      <Divider />
      <View style={CardBottomView}>
        <Text style={GrayText}>产品名称</Text>
        <AlertText text={item?.skuName} />
      </View>
      <View style={CardBottomView}>
        <Text style={GrayText}>产品型号</Text>
        <AlertText text={item?.skuId} showLength={30} />
      </View>
      <View style={CardBottomView}>
        <Text style={GrayText}>包装数量</Text>
        <Text style={CountText}>{item?.packageNum + item?.skuUnit}</Text>
      </View>
    </CustomCard>
  );

  return (
    <View style={{ flex: 1 }}>
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
      <Notification />
      <ScanBox
        placeholder="请扫描包裹编码"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        <FlatList
          data={data}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          renderItem={renderItem}
          keyExtractor={(item, idx) => idx}
        />
      </CustomContainer>
      {data.length !== 0 && (
        <BottomConfirmButton title="全部补打" onPress={onPressAll} />
      )}
    </View>
  );
};

export default ReprintOutboundLabelStack;

const styles = StyleSheet.create({});
