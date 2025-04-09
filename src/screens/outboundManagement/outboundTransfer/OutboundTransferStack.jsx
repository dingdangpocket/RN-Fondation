import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useCallback, useState, useContext } from "react";
import CustomContainer from "../comp/CustomContainer";
import CustomCard from "../comp/CustomCard";
import Divider from "../comp/Divider";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  CardBottomView,
  PrimaryText,
  CardTopView,
  TimeText,
  GrayText,
  NormalText,
} from "../comStyle";
import fetchData from "src/api/fetchData";
import Notification, { notification } from "../comp/Notification";
import { ContentContext } from "src/context/ContextProvider";

const OutboundTransferStack = () => {
  const { ctxState } = useContext(ContentContext);
  const [data, setData] = useState([]);

  const navigation = useNavigation();

  // 使用 useFocusEffect 在屏幕获得焦点时获取数据
  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );
  const getData = async () => {
    /**
     * taskType  20303：出库集合（集合完毕转移）， 11：复核完毕转移，12：打包完毕转移，20：收货完毕转移，21：质检完毕转移，22：入库清点完毕转移，30：其他
     */
    const res = await fetchData({
      path: "/outbound/collectedMove/getTask",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { taskType: 20303 },
    });
    if (res.code === 200) {
      setData(res.data);
    } else {
      notification.open({ message: res?.msg });
    }
  };
  const onPress = ({ taskId, taskNo }) => {
    navigation.navigate("DropPositionStack", {
      taskId,
      taskNo,
    });
  };
  return (
    <CustomContainer>
      <Notification />
      <FlatList
        data={data}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews={true}
        keyExtractor={(item) => item?.taskId.toString()}
        renderItem={({ item }) => (
          <CustomCard
            widthFactor={0.95}
            onPress={() => onPress(item)}
          >
            <View style={CardTopView}>
              <Text style={PrimaryText}>{item?.taskNo}</Text>
            </View>
            <Divider />
            <View style={CardBottomView}>
              <Text style={GrayText}>出库单ID</Text>
              <Text style={NormalText}>{item?.sourceNoteId}</Text>
            </View>
            <View style={CardBottomView}>
              <Text style={GrayText}>创建时间</Text>
              <Text style={TimeText}>{item.createOn}</Text>
            </View>
          </CustomCard>
        )}
      />
    </CustomContainer>
  );
};

export default OutboundTransferStack;
