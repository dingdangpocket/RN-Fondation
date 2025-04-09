import {
  View,
  Text,
  FlatList,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import CustomButton from "src/components/CustomButton";
import fetchData from "src/api/fetchData";
import { ContentContext } from "src/context/ContextProvider";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import { h, rpx2dp, w } from "src/functions/responsive";

const ItemCheckScanStack = ({ route }) => {
  const navigation = useNavigation();
  const { ctxState, dispatch } = useContext(ContentContext);
  const { noteType } = route.params;
  const [scanResult, setScanResult] = useState("");
  const [resultDone, setResultDone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  //作为子组件Effect_Focus响应状态通知依赖；
  const [reTake, setRetake] = useState(false);

  //onActivehook
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setScanResult("");
      setRetake(!reTake);
    }
  }, [isFocused]);

  const cancle = () => {
    setScanResult("");
  };

  const onTextChange = (result) => {
    setScanResult(result);
  };

  useEffect(() => {
    if (scanResult) {
      const TIMER = setTimeout(() => {
        setResultDone("");
        setResultDone(scanResult);
      }, 0);
      return () => clearTimeout(TIMER);
    }
  }, [scanResult]);

  const getList = async (code) => {
    const response = await fetchData({
      path: "/inbound/receiving/getInboundApplyNotes",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: { receivingNoteNo: code, noteType: noteType },
    });
    // console.log("response", response);
    if (response.code == 200) {
      setNotes(response?.data);
      setScanResult("");
      // setIsFlatListLoaded(true);
    } else {
      if (response.code == 9001) {
        // setIsFlatListLoaded(true);
        setScanResult("");
        ToastAndroid.show(response.msg, ToastAndroid.SHORT);
        setNotes("");
        return;
      }
      if (response.code == 9002) {
        // setIsFlatListLoaded(true);
        navigation.navigate("ItemCheckSearchStack", {
          noteType: noteType,
        });
        return;
      }
      checkToken(response);
      // setIsFlatListLoaded(true);
      ToastAndroid.show(response.msg, ToastAndroid.SHORT);
      setScanResult("");
    }
  };
  useEffect(() => {
    //检查是否为扫码枪输入;
    if (!scanResult) return;
    if (!resultDone.startsWith(SCAN_TAG)) return;
    if (
      !resultDone.startsWith("\nSH1") &&
      !resultDone.startsWith("\nSH2") &&
      resultDone &&
      noteType
    ) {
      ToastAndroid.show("收货签不正确", ToastAndroid.SHORT);
      setLoading(false);
      return;
    }
    // setIsFlatListLoaded(false);
    if (resultDone.startsWith("\nSH2") && resultDone && noteType) {
      dispatch({ type: "updateReceivingNoteNo", payload: resultDone.slice(1) });
      //  如果扫描收货单据来源是协同;
      navigation.navigate("ItemCheck_Sync_WR_DetailStack", {
        sh_code: resultDone.slice(1),
        noteType: noteType,
      });
      setLoading(false);
      return;
    }
    if (resultDone.startsWith("\nSH1") && resultDone && noteType) {
      dispatch({ type: "updateReceivingNoteNo", payload: resultDone.slice(1) });
      getList(resultDone.slice(1));
    }
  }, [resultDone]);

  const handleSubmit = () => {
    if (!scanResult.startsWith(SCAN_TAG)) {
      setRetake(!reTake);
      //如果扫描收货单据来源是协同;
      if (scanResult.startsWith("SH2") && scanResult && noteType) {
        dispatch({ type: "updateReceivingNoteNo", payload: scanResult });
        navigation.navigate("ItemCheck_Sync_WR_DetailStack", {
          noteType: noteType,
        });
        return;
      }
      if (scanResult.startsWith("SH1") && scanResult && noteType) {
        dispatch({ type: "updateReceivingNoteNo", payload: scanResult });
        const asyncWrapper = async () => {
          const response = await fetchData({
            path: "/inbound/receiving/getInboundApplyNotes",
            method: "POST",
            token: ctxState?.userInfo?.token,
            storageId: ctxState?.optSet?.curStorageId,
            bodyParams: { receivingNoteNo: scanResult, noteType: noteType },
          });
          console.log("response", response);
          if (response.code == 200) {
            setNotes(response?.data);
            setScanResult("");
          } else {
            setNotes("");
            setScanResult("");
            checkToken(response);
            if (response.code == 9001) {
              ToastAndroid.show(response.msg, ToastAndroid.SHORT);
              setNotes("");
              return;
            }
            if (response.code == 9002) {
              navigation.navigate("ItemCheckSearchStack", {
                noteType: noteType,
              });
              return;
            }
            ToastAndroid.show(response.msg, ToastAndroid.SHORT);
          }
        };
        asyncWrapper();
      }
    }
  };
  const nav = (item) => {
    if (item?.inboundNoteStatus == 1) {
      ToastAndroid.show(
        `入库中申请单${item.noteStatusText}`,
        ToastAndroid.SHORT
      );
      return;
    }
    navigation.navigate("ItemCheck_WR_DetailStack", {
      poNote: item,
    });
  };
  const onWrite = () => {
    navigation.navigate("ItemCheckSearchStack", {
      noteType: noteType,
    });
  };
  const checkToken = (response) => {
    if (response.code == 1400) {
      ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
      navigation.navigate("Login");
      return;
    }
  };
  const onRightFun = () => {
    navigation.navigate("ItemCheck_Done_Stack");
  };
  return (
    <View
      style={{
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={"项次核对"}
        icon={
          notes ? (
            <Text style={{ color: "white", marginRight: 10, width: 45 }}>
              已核对
            </Text>
          ) : (
            <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
          )
        }
        onRightFun={onRightFun}
      ></NoTabHeadBar>
      <InputBar
        reTake={reTake}
        value={scanResult}
        placeholder={"请扫描收货标签"}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
        onIcon1Fun={cancle}
        onTextChange={onTextChange}
        inputColor={"white"}
        handleSubmit={handleSubmit}
      ></InputBar>
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: w * 0.8,
        }}
      >
        {!loading && notes && (
          <FlatList
            style={{
              height: h * 0.7,
              width: w * 0.9,
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            removeClippedSubviews={true}
            data={notes}
            renderItem={({ item }) => (
              <GoodsPositionDetailCard
                marginTop={20}
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
                  <Text
                    style={{
                      fontSize: 15,
                      color: "#004D92",
                    }}
                  >
                    {item?.noteTypeText}
                  </Text>
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
                    采购订单号
                  </Text>
                }
                item3_right={
                  <Text
                    style={{
                      fontSize: 15,
                    }}
                  >
                    {item?.poNo}
                  </Text>
                }
                item4_left={
                  <Text
                    style={{
                      fontSize: 15,
                    }}
                  >
                    上游原始单号
                  </Text>
                }
                item4_right={
                  <Text
                    style={{
                      fontSize: 15,
                    }}
                  >
                    {item?.originalNoteNo}
                  </Text>
                }
                item5_left={
                  <Text style={{ fontSize: 15 }}>{item?.createTime}</Text>
                }
                onPress={() => nav(item)}
              ></GoodsPositionDetailCard>
            )}
            keyExtractor={(item, index) => index}
          ></FlatList>
        )}
      </View>
      {notes && (
        <CustomButton
          title="手动填写"
          titleColor="white"
          fontSize={18}
          width={w * 0.9}
          height={50}
          backgroundColor="#004D92"
          borderRadius={2.5}
          marginTop={rpx2dp(10, false)}
          align={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={onWrite}
        />
      )}
    </View>
  );
};
export default ItemCheckScanStack;
