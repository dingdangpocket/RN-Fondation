import { Image, StyleSheet, Text, View, FlatList } from "react-native";
import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import ScanBox from "../comp/ScanBox";
import CustomContainer from "../comp/CustomContainer";
import BottomConfirmButton from "../comp/BottomConfirmButton";
import CustomCard from "../comp/CustomCard";
import Notification, { notification } from "../comp/Notification";
import {
  GreenDashView,
  GreenText,
  RedDashView,
  RedText,
  WarnText,
  WarnView,
} from "../comStyle";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import getScanText from "src/functions/getScanText";

const ContainerCode = ({ route }) => {
  const { taskId } = route.params;
  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const [highlight, setHighlight] = useState("");
  const [data, setData] = useState({});
  const [areaCode, setAreaCode] = useState("");

  const getData = useCallback(
    async (taskId) => {
      try {
        const res = await fetchData({
          path: "/outbound/collectedMove/getPlacementBin",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: { taskId },
        });
        if (res?.code === 200) {
          console.log("container", res);
          setData(res.data);
          setAreaCode(res?.data?.areaCode);
        } else {
          notification.open({ message: res?.msg || "获取数据失败" });
        }
      } catch (error) {
        console.error("getData error:", error);
        notification.open({ message: "获取数据出错，请重试" });
      }
    },
    [ctxState]
  );
  const colorSet = {
    available: {
      viewStyle: GreenDashView,
      textStyle: GreenText,
      text: "空闲",
    },
    occupied: {
      text: "占用",
      viewStyle: RedDashView,
      textStyle: RedText,
    },
  };
  useEffect(() => {
    getData(taskId);
  }, [taskId, getData]);

  const onPress = async () => {
    if (!highlight) {
      notification.open({ message: "请先选择落放位置" });
      return;
    }
    try {
      const res = await fetchData({
        path: "/outbound/collectedMove/placement",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          taskId,
          storageBinCode: highlight,
          storageAreaType: areaCode,
        },
      });
      if (res?.code === 200) {
        notification.open({ message: "落放成功", type: "success" });
        setTimeout(() => {
          navigation.navigate("OutboundTransferStack");
        }, 1000);
      } else {
        notification.open({ message: res?.msg || "操作失败" });
      }
    } catch (error) {
      console.error("onPress error:", error);
      notification.open({ message: "操作出错，请重试" });
    }
  };

  const onKeyEnter = useCallback(
    (input) => {
      handleScan(input, data.storageBinCode);
    },
    [data.storageBinCode]
  );

  const handleScan = useCallback((input, list) => {
    const scanText = getScanText(input);
    const findData = list?.find((item) => item === scanText);
    if (!findData) {
      setData((prevData) => ({
        ...prevData,
        storageBinCode: [scanText, ...(prevData.storageBinCode || [])],
      }));
    }
    setHighlight(scanText);
  }, []);

  const renderStorageBinItem = useCallback(
    ({ item }) => {
      const { viewStyle, textStyle, text } = colorSet["available"];
      return (
        <CustomCard key={item} widthFactor={0.95}>
          <View
            style={{
              ...viewStyle,
              ...(highlight === item ? { backgroundColor: "#DAF8CF" } : {}),
            }}
          >
            <Text style={textStyle}>落放位置编码{item}</Text>
            {highlight === item ? (
              <Image
                source={require("../../../static/CheckCircle.png")}
                style={{ width: 20, height: 20 }}
              />
            ) : (
              <Text style={textStyle}>{text}</Text>
            )}
          </View>
        </CustomCard>
      );
    },
    [highlight]
  );

  return (
    <View style={styles.container}>
      <Notification />
      <ScanBox placeholder="请扫描或输入落放位号" onKeyEnter={onKeyEnter} />
      <CustomContainer>
        {data?.noticeText && (
          <View style={WarnView}>
            <Text style={WarnText}>{data.noticeText}</Text>
          </View>
        )}
        <FlatList
          data={data?.storageBinCode || []}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={true}
          renderItem={renderStorageBinItem}
          keyExtractor={(item) => item}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>暂无落放位置</Text>
          )}
        />
      </CustomContainer>
      <BottomConfirmButton
        title="确认落放"
        onPress={onPress}
        disabled={!highlight}
      />
    </View>
  );
};

export default ContainerCode;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
  },
});
