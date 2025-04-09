import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import useWindow from "src/hooks/useWindow";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
const ST = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const ContainerHandleStack = ({ route }) => {
  const navigation = useNavigation();
  const [Width, Height] = useWindow();
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { ctxState } = useContext(ContentContext);

  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setRetake(!reTake);
      const asyncWrapper = async () => {
        setLoading(true);
        const response = await fetchData({
          path: "/inbound/putAway/container/getContainers",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
        });
        // console.log("容器表", response);
        if (response.code == 200) {
          setNotes(response?.data);
          setLoading(false);
          return;
        } else {
          if (response.code == 1400) {
            ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
            navigation.navigate("Login");
            return;
          }
          setNotes("");
          ToastAndroid.show(response.msg, ToastAndroid.SHORT);
          setLoading(false);
        }
      };
      asyncWrapper();
    }
  }, [isFocused]);

  const cancle = () => {
    setScanResult("");
    // setNotes("");
  };

  const onTextChange = (result) => {
    setScanResult(result);
  };

  //1秒延时后如果没有扫描数据进入，说明扫码已经完成;
  useEffect(() => {
    if (scanResult) {
      const TIMER = setTimeout(() => {
        setResultDone("");
        setResultDone(scanResult);
      }, 0);
      return () => clearTimeout(TIMER);
    }
  }, [scanResult]);

  useEffect(() => {
    //检查是否为扫码枪输入;
    if (!resultDone.startsWith(SCAN_TAG)) return;
    const containerCode = resultDone.slice(1);
    const res = notes.find((x) => x.containerCode == containerCode);
    if (res) {
      navigation.navigate("ContainerSkuListStack", {
        containerCode: containerCode,
      });
    } else {
      ToastAndroid.show(`匹配失败`, ToastAndroid.SHORT);
    }
  }, [resultDone]);

  const handleSubmit = () => {
    // console.log("scanResult", scanResult);
    if (!scanResult) {
      ToastAndroid.show(`请扫描容器编码后提交`, ToastAndroid.SHORT);
      return;
    }
    setRetake(!reTake);
    const res = notes.find((x) => x.containerCode == scanResult);
    if (res) {
      navigation.navigate("ContainerSkuListStack", {
        containerCode: scanResult,
      });
    } else {
      ToastAndroid.show(`匹配失败`, ToastAndroid.SHORT);
    }
  };
  const onRightFun = () => {
    navigation.navigate("ItemCheck_Done_Stack", {
      receivingNoteNo: resultDone.startsWith(SCAN_TAG)
        ? resultDone.slice(1)
        : resultDone,
    });
  };

  const nav = (item) => {
    navigation.navigate("ContainerSkuListStack", {
      containerCode: item?.containerCode,
    });
  };
  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"容器上架"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
        onRightFun={onRightFun}
      ></NoTabHeadBar>
      <InputBar
        reTake={reTake}
        value={scanResult}
        placeholder={"请扫描容器编码"}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
        onIcon1Fun={cancle}
        onTextChange={onTextChange}
        inputColor={"white"}
        handleSubmit={handleSubmit}
      ></InputBar>
      {notes.length == 0 && <Text style={{ marginTop: 15 }}>暂无数据</Text>}
      {loading ? (
        <View
          style={{
            marginTop: 50,
            width: Width * 0.8,
            height: Height * 0.65,
            ...ST,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {notes &&
        (!loading ? (
          <View
            style={{
              width: Width * 0.8,
              ...ST,
            }}
          >
            <FlatList
              style={{
                height: Height * 0.7,
                width: Width * 0.94,
                marginTop: 5,
              }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              removeClippedSubviews={true}
              scrollEventThrottle={10}
              data={notes}
              renderItem={({ item }) => (
                <GoodsPositionDetailCard
                  marginTop={15}
                  item1_left={
                    <Text style={{ fontSize: 18, color: "#004D92" }}>
                      {item?.containerCode}
                    </Text>
                  }
                  item1_right={
                    <View
                      style={{
                        backgroundColor: "rgba(0, 109, 207, 0.12)",
                        width: 80,
                        height: 35,
                        ...ST,
                      }}
                    >
                      <Text style={{ fontSize: 15, color: "#006DCF" }}>
                        {item?.statusText}
                      </Text>
                    </View>
                  }
                  item2_left={<Text style={{ fontSize: 15 }}>货位分组</Text>}
                  item2_right={
                    <Text style={{ fontSize: 15 }}>
                      {item?.storageBinGroupName}
                    </Text>
                  }
                  item3_left={<Text style={{ fontSize: 15 }}>项次数量</Text>}
                  item3_right={
                    <Text style={{ fontSize: 15, color: "#E28400" }}>
                      {item?.skuCount}
                    </Text>
                  }
                  onPress={() => nav(item)}
                ></GoodsPositionDetailCard>
              )}
              keyExtractor={(item, index) => index}
            ></FlatList>
          </View>
        ) : null)}
    </View>
  );
};
export default ContainerHandleStack;
