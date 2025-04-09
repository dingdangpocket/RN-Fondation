import {
  View,
  Text,
  ToastAndroid,
  FlatList,
  TouchableNativeFeedback,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import useWindow from "src/hooks/useWindow";
import { rpx2dp, h, w } from "src/functions/responsive";

const EmptyPositionStack = () => {
  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const [data, setData] = useState();
  const [Width] = useWindow();
  const [loading, setLoading] = useState(false);
  const getPosition = async () => {
    setLoading(true);
    const response = await fetchData({
      path: `/base/getUsableStorageBin`,
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        storageAreaType: [10, 20],
      },
    });
    if (response.code == 200) {
      response.data.forEach((item) => {
        item.active = false;
      });
      setData(response.data);
      setLoading(false);
      // console.log("response", response);
      ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
    } else {
      if (response.code == 1400) {
        ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
        navigation.navigate("Login");
        return;
      }
      ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
    }
  };
  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    //获取空货位
    if (isFocused) {
      getPosition();
    }
  }, [isFocused]);

  const [goodSetCode, setGoodSetCode] = useState("");
  const [resultDone, setResultDone] = useState("");
  const cancle = () => {
    setGoodSetCode("");
    setAlertText("");
  };
  const onTextChange = (value) => {
    setGoodSetCode(value);
  };

  //200ms秒延时后如果没有扫描数据进入，说明扫码已经完成;
  useEffect(() => {
    if (goodSetCode) {
      const TIMER = setTimeout(() => {
        setGoodSetCode("");
        setResultDone("");
        setResultDone(goodSetCode);
      }, 0);
      return () => clearTimeout(TIMER);
    }
  }, [goodSetCode]);

  const [alertText, setAlertText] = useState("");
  useEffect(() => {
    if (!resultDone.startsWith(SCAN_TAG)) return;
    const checkContainer = async () => {
      const response = await fetchData({
        path: "/base/getStorageBinByContainer",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          code: resultDone.startsWith(SCAN_TAG)
            ? resultDone.slice(1)
            : resultDone,
        },
      });
      // console.log("response", response);
      // console.log("空货位", data);
      if (response.code == 200) {
        if (response.data.binding == 0) {
          ToastAndroid.show("容器暂未绑定货位,请重新扫描", ToastAndroid.SHORT);
          return;
        }
        if (response.data.binding == 1) {
          data.forEach((x) => {
            if (x.storageBins.find((k) => k == response.data.storageBinCode)) {
              setAlertText("容器匹配成功");
              navigation.navigate("ItemDetailStack", {
                containerCode: response.data.containerCode,
                storageBinCode: response.data.containerCod.storageBinCode,
              });
            } else {
              setAlertText("该容器绑定货位为非空货位,请重新扫描");
              return;
            }
          });
        }
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(response.msg, ToastAndroid.SHORT);
      }
    };
    checkContainer();
  }, [resultDone]);

  const onPress = (item) => {
    data.forEach((x) => {
      if (x.row == item.row) {
        x.active = !x.active;
      } else {
        x.active = false;
      }
    });
    setData([...data]);
  };

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"空货位列表"}
        icon={<Text style={{ color: "white", width: 70 }}></Text>}
      ></NoTabHeadBar>
      <InputBar
        value={goodSetCode}
        placeholder={"请扫描上架容器"}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
        onIcon1Fun={cancle}
        onTextChange={onTextChange}
        inputColor={"white"}
      ></InputBar>
      <Text style={{ marginTop: 10 }}>{alertText}</Text>
      {loading ? (
        <View
          style={{
            marginTop: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: w * 0.8,
            height: h * 0.105,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}

      {data && !loading && (
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: w * 0.8,
            padding: 10,
          }}
        >
          <FlatList
            style={{
              height: h * 0.65,
              width: w * 0.95,
              marginTop: 5,
              backgroundColor: "white",
              borderRadius: 10,
              padding: 5,
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            removeClippedSubviews={true}
            scrollEventThrottle={10}
            data={data}
            renderItem={({ item }) => (
              <View
                style={{
                  width: w,
                  marginTop: 10,
                }}
              >
                <TouchableNativeFeedback onPress={() => onPress(item)}>
                  <View
                    style={{
                      width: Width,
                      height: 50,
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "nowrap",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        width: rpx2dp(375),
                        height: 50,
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexDirection: "row",
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>{item.row}</Text>
                      <View
                        style={{
                          height: 50,
                          alignItems: "center",
                          justifyContent: "flex-start",
                          flexDirection: "row",
                          marginRight: 30,
                        }}
                      >
                        <Text style={{ fontSize: 18 }}>
                          空货位数:{item.usableCount}
                        </Text>
                        {item.active ? (
                          <Image
                            source={require("src/static/down.png")}
                            style={{
                              width: 15,
                              height:15,
                            }}
                          />
                        ) : (
                          <Image
                            source={require("src/static/leftdown.png")}
                            style={{
                              width: 20,
                              height: 20,
                            }}
                          />
                        )}
                      </View>
                    </View>
                    <View
                      style={{
                        width: 90,
                        height: 50,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    ></View>
                  </View>
                </TouchableNativeFeedback>
                {item.active ? (
                  <View
                    style={{
                      width: w * 0.7,
                      justifyContent: "center",
                    }}
                  >
                    {item.storageBins.map((x, index) => {
                      return (
                        <View
                          key={index}
                          style={{ padding: 5, width: w * 0.9, margin: 5 }}
                        >
                          <View
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-between",
                              height: 40,
                              alignItems: "center",
                            }}
                          >
                            <Text style={{ fontSize: 20, color: "#006DCF" }}>
                              货位:{x}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            )}
            keyExtractor={(item, index) => index}
          ></FlatList>
        </View>
      )}
    </View>
  );
};
export default EmptyPositionStack;
