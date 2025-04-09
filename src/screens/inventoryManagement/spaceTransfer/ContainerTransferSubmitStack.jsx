import { View, Text, FlatList, ToastAndroid, Alert } from "react-native";
import React, { useState, useEffect, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import Input from "src/components/Input";
import { CancleIcon, ScanIcon } from "src/icons/index";
import CustomButton from "src/components/CustomButton";
import getTimeId from "src/functions/getTimeId";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import useWindow from "src/hooks/useWindow";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import printImage from "src/functions/printImage";
import { TouchableOpacity } from "react-native-gesture-handler";
import { API_PRINT } from "src/api/apiConfig";
import Notification, { notification } from "src/components/Notification";

const ContainerTransferSubmitStack = ({ route }) => {
  const { list, containerCode, storageBinCode } = route.params;
  const navigation = useNavigation();
  const [Width, Height] = useWindow();
  const [loading, setLoading] = useState(false);
  const { ctxState } = useContext(ContentContext);

  //幂等key;
  const [timestampId, setTimestampId] = useState("");
  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);

  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    setScanResult("");
    if (isFocused) {
      //必须确保当前页面是激活状态！
      setRetake(!reTake);
    }
  }, [isFocused]);

  const cancle = () => {
    setScanResult("");
  };

  const onTextChange = (result) => {
    setScanResult(result);
  };
  const [scanResult, setScanResult] = useState("");
  const [reTake, setRetake] = useState(false);

  const checkToken = (response) => {
    if (response.code == 1400) {
      ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
      navigation.navigate("Login");
      return;
    }
  };

  const handleSubmit = () => {};

  const onComfirm = () => {
    if (!scanResult) {
      ToastAndroid.show("请扫描上架货位编码后提交", ToastAndroid.SHORT);
      return;
    }
    const submitContainer = async () => {
      const response = await fetchData({
        path: "/inside/storageBinTransfer/containerSubmit",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          targetStorageBinCode: scanResult.startsWith(SCAN_TAG)
            ? scanResult.slice(1)
            : scanResult,
          idempotentKey: timestampId,
          containerCode: containerCode,
        },
      });
      // console.log("response", response);
      if (response.code == 200) {
        ToastAndroid.show("转入成功", ToastAndroid.SHORT);
        navigation.navigate("ContainerTransferScanStack");
        setLoading(false);
      } else {
        notification.open({ message: response.msg });
        checkToken(response);
        setLoading(false);
        setScanResult("");
      }
    };
    submitContainer();
  };
  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color }}>{value}</Text>
  );
  const print = async (item) => {
    console.log("item", item);
    await printImage(
      `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=7&storageId=${ctxState?.optSet?.curStorageId}&skuId=${item.skuId}&skuName=${item?.skuName}`,
      `Bearer ${ctxState?.userInfo?.token}`
    );
  };

  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Notification />
      <NoTabHeadBar
        titleA={storageBinCode}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <View
        style={{
          backgroundColor: "#004D92",
          width: "100%",
          height: 90,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Input
          reTake={reTake}
          value={scanResult}
          placeholder={"请扫描上架货位编码"}
          Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
          Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
          onIcon1Fun={cancle}
          onTextChange={onTextChange}
          inputColor={"white"}
          handleSubmit={handleSubmit}
        ></Input>
      </View>
      <View
        style={{
          height: 50,
          width: "100%",
          backgroundColor: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <View
          style={{
            width: "100%",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 10,
          }}
        >
          <Content
            color={"#7A7A7A"}
            fontSize={15}
            value={`  货位上的容器编码:${containerCode ? containerCode : ""}`}
          />
        </View>
      </View>
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
              height: Height * 0.6,
              width: Width * 0.94,
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
                  item?.skuName ? (
                    // <Text style={{ color: "#004D92", fontSize: 18 }}>
                    //   {item?.skuName.length <= 20
                    //     ? item?.skuName
                    //     : item?.skuName.substring(0, 20) + "..."}
                    // </Text>
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
                      <Text style={{ color: "#004D92", fontSize: 18 }}>
                        {item?.skuName.length <= 24
                          ? item?.skuName
                          : item?.skuName.substring(0, 24) + "..."}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    ""
                  )
                }
                item2_left={<Text style={{ fontSize: 15 }}>产品型号</Text>}
                item2_right={
                  item?.skuId ? (
                    <Text style={{ fontSize: 15 }}>
                      {item?.skuId?.length <= 20
                        ? item?.skuId
                        : item?.skuId.substring(0, 20) + "..."}
                    </Text>
                  ) : null
                }
                item3_left={<Text style={{ fontSize: 15 }}>货主</Text>}
                item3_right={
                  <Text style={{ fontSize: 15 }}>{item?.goodsOwner}</Text>
                }
                item4_left={<Text style={{ fontSize: 15 }}>总数量</Text>}
                item4_right={
                  <Text style={{ fontSize: 15, color: "#E28400" }}>
                    {item?.totalNum} {item?.unit}
                  </Text>
                }
                item5_left={<Text style={{ fontSize: 15 }}>可转出数量</Text>}
                item5_right={
                  <Text style={{ fontSize: 15, color: "#E28400" }}>
                    {item?.usableNum} {item?.unit}
                  </Text>
                }
                item6_left={
                  <Text style={{ fontSize: 15, color: "#E28400" }}></Text>
                }
                item6_right={
                  <TouchableOpacity onPress={() => print(item)}>
                    <Text style={{ fontSize: 16, color: "#004D92" }}>
                      打印项次签{">"}
                    </Text>
                  </TouchableOpacity>
                }
                // onPress={() => nav(item)}
              ></GoodsPositionDetailCard>
            )}
            keyExtractor={(item, index) => index}
          ></FlatList>
        </View>
      )}
      <CustomButton
        title="确认转入"
        titleColor="white"
        fontSize={18}
        width={Width * 0.95}
        height={50}
        backgroundColor="#004D92"
        borderRadius={2.5}
        marginTop={10}
        align={{
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onComfirm}
      />
    </View>
  );
};
export default ContainerTransferSubmitStack;
