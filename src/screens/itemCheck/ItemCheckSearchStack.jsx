import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import { useNavigation } from "@react-navigation/native";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import CustomButton from "src/components/CustomButton";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import { h, w } from "src/functions/responsive";
const ST = { display: "flex", justifyContent: "center", alignItems: "center" };

const ItemCheckSearchStack = ({ route }) => {
  const { noteType } = route.params;
  const navigation = useNavigation();
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [notes, setNotes] = useState("");
  const { ctxState } = useContext(ContentContext);
  const [loading, setLoading] = useState(false);

  const cancle = () => {
    setScanResult("");
  };
  const onTextChange = (result) => {
    setScanResult(result);
  };
  useEffect(() => {
    setResultDone("");
    setResultDone(scanResult);
  }, [scanResult]);

  const nav = (item) => {
    //入库申请单
    if (item.inboundNoteStatus == 1) {
      ToastAndroid.show(
        `入库中申请单${item.noteStatusText}`,
        ToastAndroid.SHORT
      );
      return;
    }
    navigation.navigate("ItemCheck_WR_DetailStack", { poNote: item });
  };
  const onSearch = () => {
    // console.log("ctxState", ctxState);
    if (!resultDone) {
      ToastAndroid.show(`请输入单号后查询`, ToastAndroid.SHORT);
    }
    if (resultDone) {
      setLoading(true);
      const asyncWrapper = async () => {
        const response = await fetchData({
          path: "/inbound/receiving/getInboundApplyNotes",
          method: "POST",
          token: ctxState?.userInfo?.token,
          storageId: ctxState?.optSet?.curStorageId,
          bodyParams: {
            originalNoteNo: resultDone.startsWith(SCAN_TAG)
              ? resultDone.slice(1)
              : resultDone,
            noteType: noteType,
          },
        });
        // console.log("response", response);
        if (response.code == 200) {
          if (response?.data?.length > 1) {
            setLoading(false);
            setNotes(response?.data);
            return;
          }
          //case1.1匹配到唯一一单、如果未入库、放行；
          if (
            response?.data?.length == 1 &&
            response?.data[0]?.inboundNoteStatus == 0
          ) {
            setLoading(false);
            navigation.navigate("ItemCheck_WR_DetailStack", {
              poNote: response?.data[0],
            });
            return;
          }
          //case1.2匹配到唯一一单、如果已入库、拦截；
          if (
            response?.data?.length == 1 &&
            response?.data[0]?.inboundNoteStatus == 1
          ) {
            ToastAndroid.show(
              `入库中申请单${response?.data[0]?.noteStatusText}`,
              ToastAndroid.SHORT
            );
            setLoading(false);
            return;
          }
          setLoading(false);
          setNotes(response?.data);
        } else {
          if (response.code == 1400) {
            ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
            navigation.navigate("Login");
            return;
          }
          ToastAndroid.show(response?.msg, ToastAndroid.SHORT);
          setScanResult("");
          setNotes("");
          setLoading(false);
        }
      };
      asyncWrapper();
    }
  };
  const onRightFun = () => {
    navigation.navigate("ItemCheck_Done_Stack");
  };
  const handleSubmit = () => {
    onSearch();
  };
  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"项次核对"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
        onRightFun={onRightFun}
      ></NoTabHeadBar>
      <InputBar
        value={scanResult}
        placeholder={"请输入或扫描单号(至少后六位)"}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
        onIcon1Fun={cancle}
        onTextChange={onTextChange}
        inputColor={"white"}
        handleSubmit={handleSubmit}
      ></InputBar>
      <View
        style={{
          ...ST,
          width: w * 0.8,
        }}
      >
        {loading ? (
          <View
            style={{
              ...ST,
              marginTop: 50,
              width: w * 0.8,
              height: h * 0.1,
            }}
          >
            <ActivityIndicator size="large" color="rgb(180,180,180)" />
          </View>
        ) : null}
        {notes && (
          <FlatList
            style={{
              height: h * 0.7,
              width: w * 0.95,
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            removeClippedSubviews={true}
            scrollEventThrottle={10}
            data={notes}
            renderItem={({ item }) => (
              <GoodsPositionDetailCard
                marginTop={25}
                item1_left={
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        "详细",
                        `${item?.supplierName}`,
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
                    <Text style={{ fontSize: 18, color: "#004D92" }}>
                      {item?.supplierName.length <= 14
                        ? item?.supplierName
                        : item?.supplierName.substring(0, 14) + ".."}
                    </Text>
                  </TouchableOpacity>
                }
                item1_right={
                  <View
                    style={{
                      ...ST,
                      padding: 5,
                      width: 90,
                      height: 35,
                      backgroundColor: "#006DCF1F",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        color: "#004D92",
                      }}
                    >
                      {item?.noteTypeText}
                    </Text>
                  </View>
                }
                item2_left={
                  <Text
                    style={{
                      fontSize: 15,
                    }}
                  >
                    入库申请单号
                  </Text>
                }
                item2_right={
                  <Text
                    style={{
                      fontSize: 15,
                    }}
                  >
                    {item?.inboundApplyNoteNo}
                  </Text>
                }
                item3_left={
                  <Text
                    style={{
                      fontSize: 15,
                    }}
                  >
                    上游原始单号
                  </Text>
                }
                item3_right={
                  <Text
                    style={{
                      fontSize: 15,
                    }}
                  >
                    {item?.originalNoteNo}
                  </Text>
                }
                item4_left={
                  <Text
                    style={{
                      fontSize: 15,
                    }}
                  >
                    {item?.createTime}
                  </Text>
                }
                onPress={() => nav(item)}
              ></GoodsPositionDetailCard>
            )}
            keyExtractor={(item, index) => index}
          ></FlatList>
        )}
      </View>
      <CustomButton
        title="查询"
        titleColor="white"
        fontSize={18}
        width={w * 0.9}
        height={50}
        backgroundColor="#004D92"
        borderRadius={2.5}
        marginTop={loading ? h * 0.55 : h * 0.65}
        align={{
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onSearch}
      />
    </View>
  );
};
export default ItemCheckSearchStack;
