import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
  Alert,
  TouchableOpacity,
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
import CustomButton from "src/components/CustomButton";
import { h, w } from "src/functions/responsive";
//02货位容器列表；
const ContainerPositionListStack = ({ route }) => {
  const { item } = route.params;
  const navigation = useNavigation();
  const [Width, Height] = useWindow();
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [skuList, setSkulist] = useState("");
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
          path: "/inside/packagingDetach/listBinDetailDown",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: { packagingDetachNoteId: item.packagingDetachNoteId },
        });
        // console.log("SKU表", response);
        if (response.code == 200) {
          setScanResult("");
          setLoading(false);
          if (response.data) {
            response.data.forEach((x) => {
              x.active = false;
            });
            setSkulist(response.data);
          }
        } else {
          if (response.code == 1400) {
            ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
            navigation.navigate("Login");
            return;
          }
          ToastAndroid.show("暂无信息", ToastAndroid.SHORT);
          setLoading(false);
          setSkulist("");
        }
      };
      asyncWrapper();
    }
  }, [isFocused]);

  const cancle = () => {
    setScanResult("");
  };

  const onTextChange = (result) => {
    setScanResult(result);
  };

  //200ms秒延时后如果没有扫描数据进入，说明扫码已经完成;
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
    const res = resultDone.slice(1);
    skuList.forEach((x) => {
      if (x.countNoteBin == res) {
        x.active = true;
      }
    });
    setSkulist([...skuList]);
    cancle();
  }, [resultDone]);

  const handleSubmit = () => {
    setRetake(!reTake);
    navigation.navigate("ItemDetailStack", {
      receivingNoteDetailId: scanResult,
    });
  };

  const onSubmit = () => {
    const packagingDetachNoteBinDetailIds = skuList.map((x) => {
      return x.packagingDetachNoteId;
    });
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: `/inside/packagingDetach/submitDown`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          //待确认;
          packagingDetachNoteId: item?.packagingDetachNoteId,
          packagingDetachNoteBinDetailIds: packagingDetachNoteBinDetailIds,
        },
      });
      // console.log("下架成功", response);
      if (response.code == 200) {
        ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        navigation.navigate("ItemListStack", {
          packagingDetachNoteId: item.packagingDetachNoteId,
        });
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        ToastAndroid.show(`${response?.msg}`, ToastAndroid.SHORT);
      }
    };
    asyncWrapper();
  };
  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"组装拆卸"}
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
        <InputBar
          reTake={reTake}
          value={scanResult}
          placeholder={"请扫描货位编码"}
          Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
          Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
          onIcon1Fun={cancle}
          onTextChange={onTextChange}
          inputColor={"white"}
          handleSubmit={handleSubmit}
        ></InputBar>
      </View>
      {loading ? (
        <View
          style={{
            marginTop: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: Width * 0.8,
            height: Height * 0.64,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {skuList && !loading && (
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: w * 0.8,
          }}
        >
          <FlatList
            style={{
              height: h * 0.7,
              width: w * 0.95,
              marginTop: 5,
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            removeClippedSubviews={true}
            scrollEventThrottle={10}
            data={skuList}
            renderItem={({ item }) => (
              <GoodsPositionDetailCard
                active={item.active}
                marginTop={15}
                item1_left={
                  <Text style={{ color: "#004D92", fontSize: 18 }}>
                    {item?.countNoteBin}
                  </Text>
                }
                item2_left={
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
                      <Text style={{ color: "#004D92", fontSize: 15 }}>
                        {item?.skuId.length <= 17
                          ? item?.skuId
                          : item?.skuId.substring(0, 17) + "..."}
                      </Text>
                    </TouchableOpacity>
                  ) : null
                }
                item3_left={
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
                      <Text style={{ color: "#004D92", fontSize: 15 }}>
                        {item?.skuName.length <= 17
                          ? item?.skuName
                          : item?.skuName.substring(0, 17) + "..."}
                      </Text>
                    </TouchableOpacity>
                  ) : null
                }
                item3_right={
                  <Text style={{ fontSize: 15, color: "#E28400" }}>
                    {item?.packagingDetachNum} {item?.inventoryUnit}
                  </Text>
                }
              ></GoodsPositionDetailCard>
            )}
            keyExtractor={(item, index) => index}
          ></FlatList>
        </View>
      )}
      <CustomButton
        title="确认下架"
        titleColor="white"
        fontSize={18}
        width={w * 0.9}
        height={50}
        backgroundColor="#004D92"
        borderRadius={2.5}
        marginTop={10}
        align={{
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onSubmit}
      />
    </View>
  );
};
export default ContainerPositionListStack;
