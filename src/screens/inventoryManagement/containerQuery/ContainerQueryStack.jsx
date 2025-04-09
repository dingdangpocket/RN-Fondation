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
import AlertText from "src/screens/outboundManagement/comp/AlertText";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import { useIsFocused } from "@react-navigation/native";
import getScanText from "src/functions/getScanText";
import Notification, {
  notification,
} from "src/screens/outboundManagement/comp/Notification";
import printImage from "src/functions/printImage";
import { API_PRINT } from "src/api/apiConfig";
const ContainerQueryStack = () => {
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
        type: 1,
      },
    });
    if (res?.code === 200) {
      setData(res.data);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const onKeyEnter = (input) => {
    const scanText = getScanText(input);
    getData(scanText);
  };
  // to do print  type为7,当前没有skuId
  const onPrint = (item) => {
    printImage(
      `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=7&storageId=${ctxState?.optSet?.curStorageId}&skuId=${item?.skuId}&skuName=${item?.skuName}`,
      `Bearer ${ctxState?.userInfo?.token}`
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <ScanBox
        placeholder="请扫描容器号"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        <FlatList
          data={data}
          keyExtractor={(item, idx) => idx.toString()}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          renderItem={({ item }) => (
            <CustomCard widthFactor={0.95}>
              <View style={CardTopView}>
                <Text style={PrimaryText}>{item?.skuName}</Text>
              </View>
              <Divider />
              <View style={CardBottomView}>
                <Text style={GrayText}>产品型号</Text>
                <AlertText text={item?.skuId} showLength={30} />
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>数量</Text>
                <Text style={CountText}>{item?.num} 个</Text>
              </View>

              <View style={CardBottomView}>
                <Text style={GrayText}>供应商</Text>
                <Text style={NormalText}>{item?.goodsOwner}</Text>
              </View>
              <Divider />
              <View style={CardBottomView}>
                <Text style={TimeText}>{item?.firstInboundBatchDate}</Text>
                <TouchableNativeFeedback onPress={() => onPrint(item)}>
                  <Text style={{ color: "#006DCF" }}>
                    打印项次签{" "}
                    <Image
                      source={rightArrowIcon}
                      style={{ width: 16, height: 16 }}
                    />
                  </Text>
                </TouchableNativeFeedback>
              </View>
            </CustomCard>
          )}
        />
      </CustomContainer>
    </View>
  );
};

export default ContainerQueryStack;
