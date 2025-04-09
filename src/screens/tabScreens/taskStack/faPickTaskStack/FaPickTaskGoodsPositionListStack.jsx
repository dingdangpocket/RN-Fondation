import React, { useState, useEffect, useContext } from "react";
import {
  View,
  ToastAndroid,
  ActivityIndicator,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import TabAndBackBar from "src/components/TabAndBackBar";
import InputBar from "src/components/InputBar";
import useWindow from "src/hooks/useWindow";
import { CancleIcon, ScanIcon } from "src/icons/index";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { CircleIcon } from "src/icons/index";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import CustomButton from "src/components/CustomButton";
import printImage from "src/functions/printImage";
import { API_PRINT } from "src/api/apiConfig";

const FaPickTaskGoodsPositionListStack = ({ route }) => {
  const { taskDetail } = route.params;
  const [loading, setLoading] = useState(false);
  const { ctxState } = useContext(ContentContext);
  const [goodsSet, setGoodsSet] = useState("");
  const [goodsSetDone, setGoodsSetDone] = useState("");
  const [Width, Height] = useWindow();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("A");
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  //onActivehook
  const isFocused = useIsFocused();
  const getUnpick = async (sort) => {
    setLoading(true);
    const response = await fetchData({
      path: `/task/groupPicking/getStorageBins`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        groupId: taskDetail?.groupId,
        picked: 0,
        sort: sort,
      },
    });
    // console.log("组波拣货货位列表", response);
    if (response.code == 200) {
      setGoodsSet(response.data);
      setLoading(false);
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        return;
      }
      ToastAndroid.show(response.msg, ToastAndroid.SHORT);
      setLoading(false);
    }
  };
  const getPicked = async (sort) => {
    setLoading(true);
    const response = await fetchData({
      path: `/task/groupPicking/getStorageBins`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        groupId: taskDetail?.groupId,
        picked: 1,
        sort: sort,
      },
    });
    // console.log("组波拣货货位列表", response);
    if (response.code == 200) {
      setGoodsSetDone(response.data);
      setLoading(false);
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        return;
      }
      ToastAndroid.show(response.msg, ToastAndroid.SHORT);
      setLoading(false);
    }
  };
  useEffect(() => {
    //通过波次号，获取待拣货位列表数据;
    if (isFocused && activeTab == "A") getUnpick(0);
    if (isFocused && activeTab == "B") getPicked(0);
  }, [isFocused, activeTab]);

  const PageA = ({ list }) => {
    const navigation = useNavigation();
    const [text, setText] = useState("");
    const [resultDone, setResultDone] = useState("");
    const cancle = () => {
      setText("");
    };
    const onTextChange = (value) => {
      setText(value);
      // ToastAndroid.show("匹配中,请稍后", ToastAndroid.SHORT);
    };

    //200ms延时后如果没有扫描数据进入，说明扫码已经完成;
    useEffect(() => {
      if (text) {
        const TIMER = setTimeout(() => {
          setResultDone("");
          setResultDone(text);
        }, 0);
        return () => clearTimeout(TIMER);
      }
    }, [text]);

    useEffect(() => {
      //检查是否为扫码枪输入;
      if (!resultDone.startsWith(SCAN_TAG)) return;
      if (!goodsSet) {
        ToastAndroid.show("暂无数据", ToastAndroid.SHORT);
        return;
      }
      const storageBinCode = resultDone.slice(1);
      const storageItem = goodsSet.find((x) => {
        return x?.containerCode == storageBinCode;
      });
      if (storageItem) {
        const idx = goodsSet.findIndex(
          (x) => x.containerCode == storageItem.containerCode
        );
        const goodsSetMemo = goodsSet;
        goodsSetMemo.splice(idx, 1);
        navigation.navigate("FaPickTaskDetail", {
          faTaskDetail: taskDetail,
          storageItem: storageItem,
          groupId: taskDetail?.groupId,
          nextStorageCode: goodsSetMemo[0]
            ? goodsSetMemo[0]?.pickingStorageBinCode
            : "",
        });
      } else {
        ToastAndroid.show("未匹配到容器,请重新扫描", ToastAndroid.SHORT);
        setText("");
      }
    }, [resultDone]);

    const handleSubmit = () => {
      if (!text) {
        ToastAndroid.show("请输入容器编码", ToastAndroid.SHORT);
        return;
      }
      if (!goodsSet) {
        ToastAndroid.show("暂无数据", ToastAndroid.SHORT);
        return;
      }
      const storageItem = goodsSet.find((x) => {
        return x?.containerCode == text;
      });
      if (storageItem) {
        const idx = goodsSet.findIndex(
          (x) => x.containerCode == storageItem.containerCode
        );
        const goodsSetMemo = goodsSet;
        goodsSetMemo.splice(idx, 1);
        navigation.navigate("FaPickTaskDetail", {
          faTaskDetail: taskDetail,
          storageItem: storageItem,
          groupId: taskDetail?.groupId,
          nextStorageCode: goodsSetMemo[0]
            ? goodsSetMemo[0]?.pickingStorageBinCode
            : "",
        });
      } else {
        ToastAndroid.show("未匹配到容器,请重新扫描", ToastAndroid.SHORT);
        setText("");
      }
    };

    const onDrop = () => {
      navigation.navigate("FaDropTaskStack", {
        groupId: taskDetail?.groupId,
        faTaskDetail: taskDetail,
      });
    };

    return (
      <View style={{ flex: 1, flexDirection: "column", alignItems: "center" }}>
        <InputBar
          value={text}
          placeholder={"请扫描容器编码"}
          Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
          Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
          onIcon1Fun={cancle}
          onTextChange={onTextChange}
          inputColor={"white"}
          handleSubmit={handleSubmit}
        ></InputBar>
        {loading ? (
          <View
            style={{
              marginTop: 50,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: Width * 0.8,
              height: Height * 0.69,
            }}
          >
            <ActivityIndicator size="large" color="rgb(180,180,180)" />
          </View>
        ) : null}
        {list && !loading && (
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: Width * 0.8,
              marginBottom: 0,
            }}
          >
            <FlatList
              style={{
                height: Height * 0.75,
                width: Width * 0.95,
                marginTop: 5,
              }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              removeClippedSubviews={true}
              scrollEventThrottle={10}
              data={list}
              renderItem={({ item }) => (
                <GoodsPositionDetailCard
                  marginTop={15}
                  item1_left={
                    <Text style={{ color: "#004D92", fontSize: 18 }}>
                      {item?.pickingStorageBinCode}
                    </Text>
                  }
                  item2_left={<Text style={{ fontSize: 15 }}>容器编码</Text>}
                  item2_right={
                    <Text style={{ fontSize: 15 }}>{item?.containerCode}</Text>
                  }
                  item3_left={<Text style={{ fontSize: 15 }}>产品名称</Text>}
                  item3_right={
                    item?.skuName ? (
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert(
                            "详细",
                            `${item?.skuName}`,
                            [
                              {
                                text: "确认",
                                onPress: () => console.log(""),
                              },
                            ],
                            { cancelable: false }
                          )
                        }
                      >
                        <Text style={{ fontSize: 15 }}>
                          {item?.skuName.length <= 17
                            ? item?.skuName
                            : item?.skuName.substring(0, 17) + "..."}
                        </Text>
                      </TouchableOpacity>
                    ) : null
                  }
                  item4_left={<Text style={{ fontSize: 15 }}>产品型号</Text>}
                  item4_right={
                    item?.skuId ? (
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert(
                            "详细",
                            `${item?.skuId}`,
                            [
                              {
                                text: "确认",
                                onPress: () => console.log(""),
                              },
                            ],
                            { cancelable: false }
                          )
                        }
                      >
                        <Text style={{ fontSize: 15 }}>
                          {item?.skuId.length <= 30
                            ? item?.skuId
                            : item?.skuId.substring(0, 30) + "..."}
                        </Text>
                      </TouchableOpacity>
                    ) : null
                  }
                  item5_left={<Text style={{ fontSize: 15 }}>应拣</Text>}
                  item5_right={
                    <Text style={{ fontSize: 15, color: "#E28400" }}>
                      {item?.requireNum} {item?.unit}
                    </Text>
                  }
                ></GoodsPositionDetailCard>
              )}
              keyExtractor={(item, index) => index}
            ></FlatList>
          </View>
        )}
        {goodsSet == null ? (
          <CustomButton
            title="去落放"
            titleColor="white"
            fontSize={18}
            width={Width * 0.9}
            height={50}
            backgroundColor="#004D92"
            borderRadius={2.5}
            marginTop={10}
            align={{
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={onDrop}
          />
        ) : null}
      </View>
    );
  };

  const PageB = ({ list }) => {
    const getTaskDetail = async (item) => {
      const response = await fetchData({
        path: `/task/groupPicking/getPickedDetail`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          groupId: taskDetail.groupId,
          pickingStorageBinCode: item?.pickingStorageBinCode,
          skuId: item?.skuId,
        },
      });
      // console.log("当前组波货位任务详情", response);
      if (response.code == 200) {
        const list = response.data;
        if (list) {
          for (const x of list) {
            await printImage(
              `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=3&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=&receivingNoteDetailId=&pickingNoteDetailId=${x.pickingNoteDetailId}&containerCode=${x.containerCode}&packageNoteId=&outboundNoteDetailId=`,
              `Bearer ${ctxState?.userInfo?.token}`
            );
          }
        }
        return;
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
      }
    };
    const onPrint = (item) => {
      getTaskDetail(item);
    };
    return (
      <View style={{ flex: 1, flexDirection: "column", alignItems: "center" }}>
        {loading ? (
          <View
            style={{
              marginTop: 50,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: Width * 0.8,
              height: Height * 0.3,
            }}
          >
            <ActivityIndicator size="large" color="rgb(180,180,180)" />
          </View>
        ) : null}
        {list && !loading && (
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: Width * 0.8,
            }}
          >
            <FlatList
              style={{
                height: Height * 0.8,
                width: Width * 0.94,
                marginTop: 5,
              }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={10}
              data={list}
              renderItem={({ item }) => (
                <GoodsPositionDetailCard
                  marginTop={15}
                  item1_left={
                    <Text style={{ color: "#004D92", fontSize: 18 }}>
                      {item?.pickingStorageBinCode}
                    </Text>
                  }
                  item2_left={
                    <Text style={{ fontSize: 18 }}>
                      {item?.skuName ? (
                        <TouchableOpacity
                          onPress={() =>
                            Alert.alert(
                              "详细",
                              `${item?.skuName}`,
                              [
                                {
                                  text: "确认",
                                  onPress: () => console.log(""),
                                },
                              ],
                              { cancelable: false }
                            )
                          }
                        >
                          <Text style={{ fontSize: 15 }}>
                            {item?.skuName.length <= 17
                              ? item?.skuName
                              : item?.skuName.substring(0, 17) + "..."}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </Text>
                  }
                  item2_right={
                    <Text
                      style={{ fontSize: 15, color: "#E28400" }}
                    >{`${item?.requireNum}${item?.unit}`}</Text>
                  }
                  item3_left={<Text style={{ fontSize: 15 }}></Text>}
                  item3_right={
                    <TouchableOpacity onPress={() => onPrint(item)}>
                      <Text style={{ fontSize: 18, color: "#004D92" }}>
                        打印
                      </Text>
                    </TouchableOpacity>
                  }
                ></GoodsPositionDetailCard>
              )}
              keyExtractor={(item, index) => index}
            ></FlatList>
          </View>
        )}
      </View>
    );
  };
  const [sortState, setSortState] = useState(true);
  const onRightFun = () => {
    if (isFocused && activeTab == "A") {
      getUnpick(sortState ? 1 : 0);
      setSortState(!sortState);
    }
    if (isFocused && activeTab == "B") {
      getPicked(sortState ? 1 : 0);
      setSortState(!sortState);
    }
  };
  return (
    <TabAndBackBar
      titleA={"货位列表"}
      titleB={"已拣列表"}
      listA={goodsSet ?? []}
      listB={goodsSetDone ?? []}
      PageA={PageA}
      PageB={PageB}
      onRightFun={onRightFun}
      handleTabChange={handleTabChange}
      activeTab={activeTab}
      icon={<CircleIcon width={20} height={20} />}
    ></TabAndBackBar>
  );
};
export default FaPickTaskGoodsPositionListStack;
