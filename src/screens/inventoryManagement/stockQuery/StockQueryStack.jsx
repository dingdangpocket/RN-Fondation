import {
  Image,
  Text,
  View,
  FlatList,
  TouchableNativeFeedback,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import {
  CardTopView,
  CardBottomView,
  PrimaryText,
  CountText,
  GrayText,
  NormalText,
  TimeText,
} from "../../outboundManagement/comStyle";
import ScanBox from "src/screens/outboundManagement/comp/ScanBox";
import CustomContainer from "src/screens/outboundManagement/comp/CustomContainer";
import CustomCard from "src/screens/outboundManagement/comp/CustomCard";
import Divider from "src/screens/outboundManagement/comp/Divider";
import rightArrowIcon from "../../../static/rightArrow.png";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import { useIsFocused } from "@react-navigation/native";
import getScanText from "src/functions/getScanText";
import Notification, {
  notification,
} from "src/screens/outboundManagement/comp/Notification";
import printImage from "src/functions/printImage";
import { API_PRINT } from "src/api/apiConfig";
import AlertText from "src/screens/outboundManagement/comp/AlertText";

import PrintModal from "src/components/PrintModal";
const StockQueryStack = () => {
  const { ctxState } = useContext(ContentContext);
  const [data, setData] = useState([]);

  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
    }
  }, [isFocused]);

  const getData = async (input) => {
    const res = await fetchData({
      path: `/inside/queryInventory`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        code: input,
        type: 2,
      },
    });
    if (res?.code === 200) {
      setData(res.data);
      if (res.data == []) {
        notification.open({ message: "暂无数据" });
        return;
      }
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const onKeyEnter = (input) => {
    const scanText = getScanText(input);
    getData(scanText);
  };

  //连续打印;
  const [modalVisible, setModalVisible] = useState(false);
  const [printItem, setPrintItem] = useState("");
  const handleCloseModal = () => {
    setModalVisible(false);
  };
  const [order, setOrder] = useState(1);
  const onChangeText = (value) => {
    setOrder(Number(value));
  };
  const handleComfirm = async () => {
    if (printItem) {
      setModalVisible(false);
      for (const x of Array.from({ length: order }, (_, i) => i + 1)) {
        await printImage(
          `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=7&storageId=${ctxState?.optSet?.curStorageId}&skuId=${printItem?.skuId}&skuName=${printItem?.skuName}`,
          `Bearer ${ctxState?.userInfo?.token}`
        );
      }
    }
  };
  const onDecrement = () => {
    if (order <= 1) return;
    setOrder((v) => parseFloat((Number(v) - 1).toFixed(4)));
  };
  const onIncrement = () => {
    setOrder((v) => parseFloat((Number(v) + 1).toFixed(4)));
  };
  // to do print, type为7
  const onPrint = async (item) => {
    // console.log("打印项次签", item);
    setPrintItem(item);
    setModalVisible(true);
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <ScanBox placeholder="请扫描货位" onKeyEnter={onKeyEnter} />
      <CustomContainer>
        <FlatList
          data={data}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={({ item }) => (
            <CustomCard widthFactor={0.95}>
              <View style={CardTopView}>
                <AlertText
                  style={PrimaryText}
                  text={item?.skuName}
                  showLength={30}
                />
              </View>
              <Divider />
              <View style={CardBottomView}>
                <Text style={GrayText}>产品型号</Text>
                <AlertText text={item?.skuId} showLength={30} />
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>批次号</Text>
                <Text style={NormalText}>{item?.batchInventoryNo}</Text>
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>货主</Text>
                <Text style={NormalText}>{item?.goodsOwner}</Text>
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>总数量</Text>
                <Text style={CountText}>{item?.num} 个</Text>
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>占用量</Text>
                <Text style={CountText}>{item?.occupyNum} 个</Text>
              </View>
              <Divider />
              <View
                style={{
                  ...CardBottomView,
                }}
              >
                <Text style={TimeText}>{item?.firstInboundBatchDate}</Text>
                <TouchableNativeFeedback onPress={() => onPrint(item)}>
                  <Text style={{ color: "#006DCF", fontSize: 15 }}>
                    打印项次签
                    <Image
                      source={rightArrowIcon}
                      style={{ width: 20, height: 20 }}
                    />
                  </Text>
                </TouchableNativeFeedback>
              </View>
            </CustomCard>
          )}
        />
      </CustomContainer>
      <View>
        <PrintModal
          order={order}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          modalVisible={modalVisible}
          onChangeText={onChangeText}
          handleCloseModal={handleCloseModal}
          handleComfirm={handleComfirm}
        />
      </View>
    </View>
  );
};
export default StockQueryStack;
