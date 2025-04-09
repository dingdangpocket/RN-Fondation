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
const ST = { display: "flex", justifyContent: "center", alignItems: "center" };
//领料任务;
const FeatTaskListStack = ({ route }) => {
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
  const getPicked = async (sort) => {
    setLoading(true);
    const response = await fetchData({
      path: `/task/orderPicking/getStorageBins`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: taskDetail.taskId,
        picked: 1,
        sort: sort,
      },
    });
    // console.log("已拣货位表", response);
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
  const getUnpick = async (sort) => {
    setLoading(true);
    //获取任务下的项次所涉及的货位列表;
    const response = await fetchData({
      path: `/task/orderPicking/getStorageBins`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        taskId: taskDetail.taskId,
        picked: 0,
        sort: sort,
      },
    });
    // console.log("货位表", response);
    if (response.code == 200) {
      setGoodsSet(response.data);
      setLoading(false);
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        return;
      }
      if (response.code == 2001) {
        setLoading(false);
        setGoodsSet("drop");
        return;
      }
      ToastAndroid.show(response.msg, ToastAndroid.SHORT);
      setLoading(false);
      return;
    }
  };

  useEffect(() => {
    //获取未拣货列表;
    if (isFocused && activeTab == "A" && taskDetail) {
      //获取任务下的项次所涉及的货位列表;
      getUnpick(0);
    }
    //获取已拣货列表;
    if (isFocused && activeTab == "B" && taskDetail) {
      getPicked(0);
    }
  }, [isFocused, activeTab, taskDetail]);

  const PageA = ({ list }) => {
    const navigation = useNavigation();
    const [storageBinCode, setStorageBinCode] = useState("");
    const [resultDone, setResultDone] = useState("");
    const cancle = () => {
      setStorageBinCode("");
    };
    const onTextChange = (value) => {
      setStorageBinCode(value);
    };

    //200ms延时后如果没有扫描数据进入，说明扫码已经完成;
    useEffect(() => {
      if (storageBinCode) {
        const TIMER = setTimeout(() => {
          setResultDone("");
          setResultDone(storageBinCode);
        }, 0);
        return () => clearTimeout(TIMER);
      }
    }, [storageBinCode]);

    useEffect(() => {
      //检查是否为扫码枪输入;
      if (!resultDone.startsWith(SCAN_TAG)) return;
      if (!goodsSet?.storageBins) {
        ToastAndroid.show("暂无数据", ToastAndroid.SHORT);
        return;
      }
      const storageItem = goodsSet.storageBins.find(
        (x) => x.containerCode == resultDone.slice(1)
      );
      if (storageItem) {
        const idx = goodsSet.storageBins.findIndex(
          (x) => x.containerCode == storageItem.containerCode
        );
        const goodsSetMemo = goodsSet.storageBins;
        goodsSetMemo.splice(idx, 1);
        navigation.navigate("FeatTaskDetailStack", {
          pickingStorageBinCode: storageItem.pickingStorageBinCode,
          last_taskDetail: taskDetail,
          containerCode: storageItem.containerCode,
          nextStorageCode: goodsSetMemo[0]
            ? goodsSetMemo[0]?.pickingStorageBinCode
            : "",
        });
      } else {
        ToastAndroid.show("未匹配到容器,请重新扫描", ToastAndroid.SHORT);
        setStorageBinCode("");
      }
    }, [resultDone]);

    const handleSubmit = () => {
      if (resultDone.startsWith(SCAN_TAG)) return;
      if (!goodsSet?.storageBins) {
        ToastAndroid.show("暂无数据", ToastAndroid.SHORT);
        return;
      }
      const storageItem = goodsSet.storageBins.find(
        (x) => x.containerCode == storageBinCode
      );
      if (storageItem) {
        const idx = goodsSet.storageBins.findIndex(
          (x) => x.containerCode == storageItem.containerCode
        );
        const goodsSetMemo = goodsSet.storageBins;
        goodsSetMemo.splice(idx, 1);
        navigation.navigate("FeatTaskDetailStack", {
          pickingStorageBinCode: storageItem.pickingStorageBinCode,
          containerCode: storageItem.containerCode,
          last_taskDetail: taskDetail,
          nextStorageCode: goodsSetMemo[0]
            ? goodsSetMemo[0]?.pickingStorageBinCode
            : "",
        });
      } else {
        ToastAndroid.show("未匹配到容器,请重新扫描", ToastAndroid.SHORT);
        setStorageBinCode("");
      }
    };

    const onDrop = () => {
      navigation.navigate("FeatTaskDropStack", {
        taskDetail: taskDetail,
      });
    };

    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <InputBar
          marginTop={5}
          value={storageBinCode}
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
              width: Width * 0.8,
              height: Height * 0.64,
              ...ST,
            }}
          >
            <ActivityIndicator size="large" color="rgb(180,180,180)" />
          </View>
        ) : null}
        {list && !loading && (
          <View
            style={{
              ...ST,
              width: Width * 0.8,
            }}
          >
            <FlatList
              style={{
                height: Height * 0.7,
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
                  item1_right={
                    item?.productTypeText ? (
                      <View
                        style={{
                          backgroundColor: "rgba(0, 109, 207, 0.12)",
                          width: 60,
                          height: 30,
                          borderRadius: 3,
                          ...ST,
                        }}
                      >
                        <Text style={{ fontSize: 18, color: "#006DCF" }}>
                          {item?.productTypeText ?? ""}
                        </Text>
                      </View>
                    ) : (
                      ""
                    )
                  }
                  item2_left={<Text style={{ fontSize: 15 }}>产品名称</Text>}
                  item2_right={
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
                  item3_left={<Text style={{ fontSize: 15 }}>产品型号</Text>}
                  item3_right={
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
                          {item?.skuId.length <= 25
                            ? item?.skuId
                            : item?.skuId.substring(0, 25) + "..."}
                        </Text>
                      </TouchableOpacity>
                    ) : null
                  }
                  item4_left={<Text style={{ fontSize: 15 }}>容器编码</Text>}
                  item4_right={
                    <Text style={{ fontSize: 15 }}>{item?.containerCode}</Text>
                  }
                  item5_left={<Text style={{ fontSize: 15 }}>应拣数量</Text>}
                  item5_right={
                    <Text style={{ fontSize: 15, color: "#E28400" }}>
                      {item?.requireNum}
                    </Text>
                  }
                ></GoodsPositionDetailCard>
              )}
              keyExtractor={(item, index) => index}
            ></FlatList>
          </View>
        )}
        {/* 🚀todo */}
        <CustomButton
          title="去落放"
          titleColor="white"
          fontSize={18}
          width={Width * 0.9}
          height={50}
          backgroundColor="#004D92"
          borderRadius={2.5}
          marginTop={list ? Height * 0.02 : Height * 0.75}
          align={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={onDrop}
        />
        {goodsSet == "drop" ? (
          <CustomButton
            title="去落放"
            titleColor="white"
            fontSize={18}
            width={Width * 0.9}
            height={50}
            backgroundColor="#004D92"
            borderRadius={2.5}
            marginTop={list ? Height * 0.05 : Height * 0.75}
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
    const onPrint = async (item) => {
      await printImage(
        `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=3&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=&receivingNoteDetailId=&pickingNoteDetailId=${item.pickingNoteDetailId}&packageNoteId=&outboundNoteDetailId=`,
        `Bearer ${ctxState?.userInfo?.token}`
      );
    };
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {loading ? (
          <View
            style={{
              marginTop: 50,
              width: Width * 0.8,
              height: Height * 0.3,
              ...ST,
            }}
          >
            <ActivityIndicator size="large" color="rgb(180,180,180)" />
          </View>
        ) : null}
        {list && !loading && (
          <View
            style={{
              ...ST,
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
                  item2_left={<Text style={{ fontSize: 15 }}>产品名称</Text>}
                  item2_right={
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
                  item3_left={<Text style={{ fontSize: 15 }}>产品型号</Text>}
                  item3_right={
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
                          {item?.skuId.length <= 25
                            ? item?.skuId
                            : item?.skuId.substring(0, 25) + "..."}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      ""
                    )
                  }
                  item4_left={<Text style={{ fontSize: 15 }}>应拣数量</Text>}
                  item4_right={
                    <Text style={{ fontSize: 15, color: "#E28400" }}>
                      {item?.requireNum}
                    </Text>
                  }
                  item5_left={<Text></Text>}
                  item5_right={
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
      listA={goodsSet.storageBins}
      listB={goodsSetDone.storageBins}
      PageA={PageA}
      PageB={PageB}
      onRightFun={onRightFun}
      handleTabChange={handleTabChange}
      activeTab={activeTab}
      icon={<CircleIcon width={20} height={20} />}
    ></TabAndBackBar>
  );
};
export default FeatTaskListStack;
