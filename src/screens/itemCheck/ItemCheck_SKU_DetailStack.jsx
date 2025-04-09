import {
  View,
  Text,
  ToastAndroid,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import GoodsPositionDetailCard from "src/screens/tabScreens/Comp/GoodsPositionDetailCard";
import CustomButton from "src/components/CustomButton";
import { useNavigation } from "@react-navigation/native";
import { ContentContext } from "src/context/ContextProvider";
import getTimeId from "src/functions/getTimeId";
import fetchData from "src/api/fetchData";
import printImage from "src/functions/printImage";
import { API_PRINT } from "src/api/apiConfig";
import { h, w } from "src/functions/responsive";
import CountComp from "src/components/CountComp";

const ItemCheck_SKU_DetailStack = ({ route }) => {
  const { skuDetail, originalNoteNo, inboundApplyNoteDetailId } = route?.params;
  const { ctxState } = useContext(ContentContext);
  const [timestampId, setTimestampId] = useState("");
  useEffect(() => {
    setTimestampId(getTimeId());
  }, []);
  const navigation = useNavigation();
  const onRightFun = () => {
    navigation.navigate("ItemCheck_Done_Stack");
  };
  const onSubmit = async () => {
    if (count <= 0) {
      ToastAndroid.show("请检查提交数量", ToastAndroid.SHORT);
      return;
    }
    // console.log(ctxState, timestampId, inboundApplyNoteDetailId, skuDetail);
    if (!ctxState || !timestampId || !inboundApplyNoteDetailId || !count)
      return;
    //非多单位提交;
    const response = await fetchData({
      path: "/inbound/receiving/addReceivingNoteDetail",
      method: "POST",
      token: ctxState?.userInfo?.token,
      storageId: ctxState?.optSet?.curStorageId,
      bodyParams: {
        idempotentKey: timestampId,
        arrivalNum: Number(count),
        inboundApplyNoteDetailId: inboundApplyNoteDetailId,
        purchaseArrivalNum: Number(count),
        receivingNoteNo: ctxState?.receivingNoteNo,
      },
    });
    // console.log("response", response);
    if (response.code != 200) {
      ToastAndroid.show(response?.msg, ToastAndroid.LONG);
    } else {
      ToastAndroid.show("核对提交成功", ToastAndroid.SHORT);
      printImage(
        `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=2&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=&receivingNoteDetailId=${response.data}&pickingNoteDetailId=&packageNoteId=&outboundNoteDetailId=`,
        `Bearer ${ctxState?.userInfo?.token}`
      );
      navigation.goBack();
      //打印Todo;
    }
  };
  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color }}>{value}</Text>
  );

  //PureCountModal
  const [count, setCount] = useState(0);
  useEffect(() => {
    //0不数数，赋值;1数数,不赋值;
    // skuDetail?.receivingCheckNumber == 0
    //   ? setCount(skuDetail?.purchaseComingNum)
    //   : setCount(0);
    setCount(skuDetail?.purchaseComingNum);
  }, [skuDetail]);

  const onGetValue = (v) => {
    setCount(v);
  };

  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={originalNoteNo}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
        onRightFun={onRightFun}
      ></NoTabHeadBar>
      <GoodsPositionDetailCard
        width={"90%"}
        marginTop={30}
        item1_left={
          skuDetail?.skuName ? (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "详细",
                  `${skuDetail?.skuName}`,
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
                  skuDetail?.skuName.length <= 18
                    ? skuDetail?.skuName
                    : skuDetail?.skuName.substring(0, 18) + "..."
                }
              />
            </TouchableOpacity>
          ) : null
        }
        item1_right={
          <View
            style={{
              width: 70,
              height: 70,
            }}
          >
            {skuDetail?.noInspection == 1 ? (
              <Image
                style={{
                  width: 35,
                  height: 35,
                }}
                source={require("src/static/mianjian.jpg")}
              ></Image>
            ) : null}
          </View>
        }
        item2_left={
          <Content
            color={
              skuDetail?.priority == 0
                ? "red"
                : skuDetail?.priority < 0
                ? "#004D92"
                : "black"
            }
            fontSize={15}
            value={`优先级:${
              skuDetail?.priority == 0
                ? "紧急"
                : skuDetail?.priority < 0
                ? "正常"
                : skuDetail?.priority > 0
                ? "逾期"
                : null
            }`}
          />
        }
        item3_left={
          <Content
            color={"#7A7A7A"}
            fontSize={15}
            value={skuDetail?.purchaseType == 1 ? "MTS" : "MTO"}
          />
        }
        item4_left={
          <Content color={"#7A7A7A"} fontSize={15} value={"产品型号"} />
        }
        item4_right={
          skuDetail?.skuId ? (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "详细",
                  `${skuDetail?.skuId}`,
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
                color={"#222222"}
                fontSize={15}
                value={
                  skuDetail?.skuId?.length <= 30
                    ? skuDetail?.skuId
                    : skuDetail?.skuId.substring(0, 30) + "..."
                }
              />
            </TouchableOpacity>
          ) : null
        }
        item5_left={
          <Content color={"#7A7A7A"} fontSize={15} value={"供应商编码:"} />
        }
        item5_right={
          <Content
            color={"#222222"}
            fontSize={15}
            value={skuDetail?.applicantCode}
          />
        }
        item6_left={
          <Content color={"#7A7A7A"} fontSize={15} value={"采购人员:"} />
        }
        item6_right={
          <Content
            color={"#222222"}
            fontSize={15}
            value={skuDetail?.applicantName}
          />
        }
        item7_left={
          <Content color={"#7A7A7A"} fontSize={15} value={"定向值:"} />
        }
        item7_right={
          <Content
            color={"#222222"}
            fontSize={15}
            value={skuDetail?.targetOccupyValue ?? "-"}
          />
        }
      ></GoodsPositionDetailCard>
      <View
        style={{
          height: 100,
          display: "flex",
          width: "90%",
          marginTop: 1,
          padding: 10,
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
          <Content color={"#7A7A7A"} fontSize={15} value={"在途数量:"} />
          <Content
            color={"#222222"}
            fontSize={15}
            value={skuDetail?.purchaseComingNum ?? "-"}
          />
        </View>
        <View
          style={{
            width: "100%",
            height: 60,
            backgroundColor: "white",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 10,
          }}
        >
          <Content color={"#7A7A7A"} fontSize={15} value={"到货数量:"} />
          <CountComp getValue={onGetValue} initValue={count}></CountComp>
        </View>
      </View>
      <CustomButton
        title="核对并打印"
        titleColor="white"
        fontSize={18}
        width={w * 0.9}
        height={50}
        backgroundColor="#004D92"
        borderRadius={2.5}
        marginTop={h * 0.2}
        align={{
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onSubmit}
      />
    </View>
  );
};
export default ItemCheck_SKU_DetailStack;
