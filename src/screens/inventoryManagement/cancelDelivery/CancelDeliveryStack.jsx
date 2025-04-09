import { Text, View, FlatList, ActivityIndicator } from "react-native";
import React, { useEffect, useState, useContext, useCallback } from "react";
import ScanBox from "src/screens/outboundManagement/comp/ScanBox";
import CustomContainer from "src/screens/outboundManagement/comp/CustomContainer";
import CustomCard from "src/screens/outboundManagement/comp/CustomCard";
import {
  CardBottomView,
  CountText,
  GrayText,
  NormalText,
  PrimaryText,
} from "src/screens/outboundManagement/comStyle";
import Divider from "src/screens/outboundManagement/comp/Divider";
import AlertText from "src/screens/outboundManagement/comp/AlertText";
import fetchData from "src/api/fetchData";
import Notification, {
  notification,
} from "src/screens/outboundManagement/comp/Notification";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { ContentContext } from "src/context/ContextProvider";
import getScanText from "src/functions/getScanText";
import useWindow from "src/hooks/useWindow";
import { TouchableOpacity } from "react-native-gesture-handler";

const CancelDeliveryStack = () => {
  const { ctxState } = useContext(ContentContext);
  const [Width, Height] = useWindow();
  const [data, setData] = useState([]);
  const navigation = useNavigation();
  const [reTake, setRetake] = useState(false);
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isFocused) {
      getData();
      setRetake(!reTake);
    }
  }, [isFocused]);
  // 获取取消上架任务
  const getData = async (code) => {
    setLoading(true);
    const res = await fetchData({
      path: "/inside/cancelPutaway/getCancelPutawayTask",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        code: code,
      },
    });
    if (res?.code === 200) {
      setLoading(false);
      const responseData = res.data || [];
      if (code) {
        if (responseData.length === 0) {
          notification.open({ message: "没有数据" });
          return;
        } else if (responseData.length === 1) {
          navigation.navigate("CancelDeliveryDetailStack", {
            data: responseData[0],
          });
          return;
        }
      }
      setData(responseData);
    } else {
      notification.open({ message: res?.msg });
      setLoading(false);
    }
  };
  const onViewDetail = (item) => {
    navigation.navigate("CancelDeliveryDetailStack", { data: item });
  };
  const onKeyEnter = (input) => {
    if (!input) return;
    const scanText = getScanText(input, "end");
    if (scanText) {
      getData(scanText);
      return;
    }
  };
  const renderItem = useCallback((item) => {
    return (
      <TouchableOpacity activeOpacity={0.5} onPress={() => onViewDetail(item)}>
        <CustomCard widthFactor={0.95}>
          <Text style={PrimaryText}>{item?.taskNo}</Text>
          <Divider />
          <View style={CardBottomView}>
            <Text style={GrayText}>SKU名称</Text>
            <AlertText text={item?.skuName} />
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>产品型号</Text>
            <AlertText text={item?.skuId} showLength={30} />
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>数量</Text>
            <Text style={CountText}>
              {item?.num} {item?.unit}
            </Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>客户名称编码</Text>
            <Text style={NormalText}>{item?.customerCode}</Text>
          </View>
          <View style={CardBottomView}>
            <Text style={GrayText}>上游原始单号</Text>
            <Text style={NormalText}>{item?.originalNo}</Text>
          </View>
        </CustomCard>
      </TouchableOpacity>
    );
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <ScanBox
        placeholder={"请扫描拣货标签"}
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        {loading ? (
          <View
            style={{
              marginTop: 50,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: Width * 0.8,
              height: Height * 0.64,
            }}
          >
            <ActivityIndicator size="large" color="rgb(180,180,180)" />
          </View>
        ) : null}
        {!loading && data && (
          <FlatList
            data={data}
            keyExtractor={(item) => item?.cancelPutawayNoteId}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            removeClippedSubviews={true}
            scrollEventThrottle={10}
            renderItem={({ item }) => renderItem(item)}
          />
        )}
      </CustomContainer>
    </View>
  );
};
export default CancelDeliveryStack;
