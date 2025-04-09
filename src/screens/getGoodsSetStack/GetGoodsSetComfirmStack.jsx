import {
  View,
  Text,
  ToastAndroid,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import InputBar from "src/components/InputBar";
import { CancleIcon, ScanIcon } from "src/icons/index";
import { useNavigation } from "@react-navigation/native";
import getTimeId from "src/functions/getTimeId";
import { SCAN_TAG } from "src/scanConfig/scanConfig";
import { ContentContext } from "src/context/ContextProvider";
import fetchData from "src/api/fetchData";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import CustomButton from "src/components/CustomButton";
import useWindow from "src/hooks/useWindow";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import Warn from "src/components/Warn";

//质检落放详情
export default function GetGoodsSetComfirmStack({ route }) {
  const { detail } = route.params;
  const [timestampId, setTimestampId] = useState("");
  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);

  const [Width, Height] = useWindow();
  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const [loading, setLoading] = useState(false);

  //项次扫码框;
  const [reTakeItem, setReTakeItem] = useState(false);
  const [itemCode, setItemCode] = useState();

  const cancleItem = () => {
    setItemCode("");
  };
  const onItemChange = (value) => {
    setItemCode(value);
  };
  const onItemHandleSubmit = () => {};
  useEffect(() => {
    if (itemCode) {
      const TIMER = setTimeout(() => {
        onSubmit();
      }, 100);
      return () => clearTimeout(TIMER);
    }
  }, [itemCode]);
  //确认落放
  const onSubmit = () => {
    // console.log(itemCode, positionInfo, ctxState, timestampId, detail);
    if (!itemCode) {
      ToastAndroid.show(`请扫描货位编码后提交`, ToastAndroid.SHORT);
      return;
    }
    if (!itemCode || !detail || !ctxState || !timestampId) return;
    const asyncWrapper = async () => {
      const response = await fetchData({
        path: `/inbound/inspect/placement/submit`,
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          operateNum: detail?.arrivalNum,
          receivingNoteDetailId: detail?.receivingNoteDetailId,
          idempotentKey: timestampId,
          storageBinCode: itemCode.startsWith(SCAN_TAG)
            ? itemCode.slice(1)
            : itemCode,
        },
      });
      // console.log(response);
      if (response.code == 200) {
        ToastAndroid.show("提交成功", ToastAndroid.SHORT);
        navigation.goBack();
      } else {
        if (response.code == 1400) {
          ToastAndroid.show("登陆已过期，请重新登陆;", ToastAndroid.SHORT);
          navigation.navigate("Login");
          return;
        }
        setItemCode("");
        ToastAndroid.show(`失败${response?.msg}`, ToastAndroid.SHORT);
        onLight();
      }
    };
    asyncWrapper();
  };

  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color }}>{value}</Text>
  );

  //遮罩;
  const [isVisible, setIsVisible] = useState(false);
  const onLight = () => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  };

  return (
    <View
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <Warn light={isVisible}></Warn>
      <NoTabHeadBar
        titleA={"质检落放详情"}
        icon={<Text style={{ color: "white", width: 70 }}></Text>}
      ></NoTabHeadBar>
      <InputBar
        reTake={reTakeItem}
        value={itemCode}
        placeholder={"请扫描落放位"}
        Icon1={<CancleIcon width="60%" height="60%" color="gray" />}
        Icon2={<ScanIcon width="60%" height="60%" color="blue" />}
        onIcon1Fun={cancleItem}
        onTextChange={onItemChange}
        inputColor={"white"}
        handleSubmit={onItemHandleSubmit}
      ></InputBar>
      {loading ? (
        <View
          style={{
            marginTop: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: Width * 0.8,
            height: Height * 0.105,
          }}
        >
          <ActivityIndicator size="large" color="rgb(180,180,180)" />
        </View>
      ) : null}
      {/* 15 = [3,4,1,2,5] */}
      {detail && !loading && (
        <>
          <GoodsPositionDetailCard
            width={"90%"}
            marginTop={10}
            item1_left={
              detail?.skuName ? (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "详细",
                      `${detail?.skuName}`,
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
                  <Content
                    color={"#004D92"}
                    fontSize={18}
                    value={
                      detail?.skuName.length <= 24
                        ? detail?.skuName
                        : detail?.skuName.substring(0, 24) + "..."
                    }
                  />
                </TouchableOpacity>
              ) : null
            }
            item2_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"收货单号"} />
            }
            item2_right={
              <Content
                color={"#7A7A7A"}
                fontSize={15}
                value={detail?.receivingNoteNo}
              />
            }
            item3_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"登记数量:"} />
            }
            item3_right={
              <Content
                color={"#E28400"}
                fontSize={15}
                value={`${detail?.arrivalNum}${detail?.stockUnit}`}
              />
            }
            item4_left={
              <Content color={"#7A7A7A"} fontSize={15} value={"优先级:"} />
            }
            item4_right={
              <Content
                color={"#222222"}
                fontSize={15}
                value={`${detail?.priority >= 0 ? "紧急" : "正常"}`}
              />
            }
          ></GoodsPositionDetailCard>
        </>
      )}
      <CustomButton
        title="确认落放"
        titleColor="white"
        fontSize={18}
        width={Width * 0.9}
        height={50}
        backgroundColor="#004D92"
        borderRadius={2.5}
        marginTop={Height * 0.42}
        align={{
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onSubmit}
      />
    </View>
  );
}
