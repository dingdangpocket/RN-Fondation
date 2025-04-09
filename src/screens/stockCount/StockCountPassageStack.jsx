import { StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState, useContext } from "react";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import CustomContainer from "../outboundManagement/comp/CustomContainer";
import ScanBox from "../outboundManagement/comp/ScanBox";
import CustomCard from "../outboundManagement/comp/CustomCard";
import {
  CardBottomView,
  CardTopView,
  GrayText,
  CountText,
  PrimaryText,
} from "../outboundManagement/comStyle";
import Divider from "../outboundManagement/comp/Divider";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, {
  notification,
} from "../outboundManagement/comp/Notification";
import CustomPageHeader from "../outboundManagement/comp/CustomPageHeader";
import getScanText from "src/functions/getScanText";
import { FlatList } from "react-native";

const StockCountPassageStack = ({ route }) => {
  const { countNoteId, countNoteNo, noteStatus } = route.params;
  const { ctxState } = useContext(ContentContext);

  const navigation = useNavigation();
  const [data, setData] = useState([]);

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
  // 获取盘点通道
  const getData = async () => {
    const res = await fetchData({
      path: `/inside/count/listChannel`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        countNoteId,
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
    const findData = data.find((item) => item.row === scanText);
    if (findData) {
      navigation.navigate("StockCountPassageDetailStack", {
        row: findData.row,
        countNoteId,
        noteStatus,
      });
    } else {
      notification.open({ message: "请扫描正确的通道号" });
    }
  };
  const onPress = ({ row }) => {
    navigation.navigate("StockCountPassageDetailStack", {
      row,
      countNoteId,
      noteStatus,
    });
  };
  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <CustomPageHeader title={countNoteNo} />
      <ScanBox
        placeholder="请输入盘点通道号查询"
        onKeyEnter={onKeyEnter}
        reTake={reTake}
      />
      <CustomContainer>
        <FlatList
          data={data}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item, idx) => idx}
          renderItem={({ item }) => (
            <CustomCard widthFactor={0.95} onPress={() => onPress(item)}>
              <View style={CardTopView}>
                <Text style={PrimaryText}>通道 {item?.row}</Text>
              </View>
              <Divider />
              <View style={CardBottomView}>
                <Text style={GrayText}>未提交盘点货位</Text>
                <Text style={CountText}>{item?.unsubmitStorageBinCount}</Text>
              </View>
            </CustomCard>
          )}
        />
      </CustomContainer>
    </View>
  );
};

export default StockCountPassageStack;

const styles = StyleSheet.create({});
