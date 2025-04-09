import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useCallback, useState, useContext } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import CustomContainer from "../outboundManagement/comp/CustomContainer";
import CustomCard from "../outboundManagement/comp/CustomCard";
import {
  CardBottomView,
  CardTopView,
  PrimaryText,
  TimeText,
} from "../outboundManagement/comStyle";
import CustomTag from "../outboundManagement/comp/CustomTag";
import Divider from "../outboundManagement/comp/Divider";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import Notification, {
  notification,
} from "../outboundManagement/comp/Notification";

const StockCountStack = () => {
  const { ctxState } = useContext(ContentContext);
  const navigation = useNavigation();
  const [data, setData] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );
  //获取盘点单列表
  const getData = async () => {
    const res = await fetchData({
      path: "/inside/count/listCountNote",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
    });
    if (res?.code === 200) {
      setData(res.data);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const colorSet = {
    15: {
      color: "#006DCF",
      backgroundColor: "#006DCF1F",
      opacity: 0.8,
      text: "初盘中",
    },
    25: {
      color: "#E28400",
      backgroundColor: "#FFEFD8CC",
      opacity: 0.8,
      text: "复盘中",
    },
    // submitted: {
    //   color: "#279700",
    //   backgroundColor: "#EAFAE5",
    //   text: "已提交",
    // },
  };
  const onPress = ({ countNoteId, countNoteNo, noteStatus }) => {
    // noteStatus 15初盘， 25复盘
    navigation.navigate("StockCountPassageStack", {
      countNoteId,
      countNoteNo,
      noteStatus,
    });
  };
  return (
    <CustomContainer>
      <Notification />
      <FlatList
        data={data}
        keyboardShouldPersistTaps="always"
        removeClippedSubviews={true}
        keyExtractor={(item, idx) => idx}
        renderItem={({ item }) => (
          <CustomCard widthFactor={0.95} onPress={() => onPress(item)}>
            <View style={CardTopView}>
              <Text style={PrimaryText}> {item?.countNoteNo}</Text>
              <CustomTag
                text={item?.noteStatusText}
                color={colorSet[item?.noteStatus]?.color}
                backgroundColor={colorSet[item?.noteStatus]?.backgroundColor}
                opacity={colorSet[item?.noteStatus]?.opacity}
              />
            </View>
            <Divider />
            <View style={CardBottomView}>
              <Text style={TimeText}>{item.createOn}</Text>
            </View>
          </CustomCard>
        )}
      />
    </CustomContainer>
  );
};

export default StockCountStack;

const styles = StyleSheet.create({});
