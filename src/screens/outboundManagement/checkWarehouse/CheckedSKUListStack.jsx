import { Text, View, FlatList } from "react-native";
import React, { useCallback, useContext, useState } from "react";
import CustomContainer from "../comp/CustomContainer";
import CustomCard from "../comp/CustomCard";
import { CardTopView, CardBottomView, CountText, GrayText } from "../comStyle";
import Divider from "../comp/Divider";
import Notification, { notification } from "../comp/Notification";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import CustomPageHeader from "../comp/CustomPageHeader";
import { useFocusEffect } from "@react-navigation/native";
import AlertText from "../comp/AlertText";
const CheckedSKUListStack = ({ route }) => {
  const { taskId } = route.params;
  const { ctxState } = useContext(ContentContext);
  const [data, setData] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );

  // 获取已复核任务
  const getData = async () => {
    const res = await fetchData({
      path: "/outbound/pickingCheck/getTaskDetail",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { taskId, status: 1 },
    });

    if (res?.code === 200) {
      setData(res.data);
    } else {
      notification.open({ message: res?.msg });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Notification />
      <CustomPageHeader
        title={`已复核(${data?.length > 0 ? data?.length : 0})`}
      />
      <CustomContainer>
        <FlatList
          data={data}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          keyExtractor={(item, idx) => idx}
          renderItem={(
            { item } // 渲染每个项
          ) => (
            <CustomCard widthFactor={0.95}>
              <View style={CardTopView}>
                <AlertText text={item?.skuId} showLength={30} />
              </View>
              <Divider />
              <View style={CardBottomView}>
                <Text style={GrayText}>数量</Text>
                <Text style={CountText}>
                  {item?.pickingNum} {item?.unit}
                </Text>
              </View>
              <View style={CardBottomView}>
                <Text style={GrayText}>产品名称</Text>
                <AlertText text={item?.skuName} />
              </View>
            </CustomCard>
          )}
        />
      </CustomContainer>
    </View>
  );
};

export default CheckedSKUListStack;
