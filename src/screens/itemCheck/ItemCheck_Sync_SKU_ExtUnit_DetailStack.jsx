import {
  View,
  Text,
  ToastAndroid,
  Image,
  Alert,
  TouchableOpacity,
  Keyboard,
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
import { h, w } from "src/functions/responsive";
import CountComp from "src/components/CountComp";
const ST = {
  width: "100%",
  height: 60,
  backgroundColor: "white",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 10,
};
const ItemCheck_Sync_SKU_ExtUnit_DetailStack = ({ route }) => {
  const { skuDetail, receivingNoteNo, receivingCheckNumber } = route?.params;
  const navigation = useNavigation();
  const { ctxState } = useContext(ContentContext);
  const [timestampId, setTimestampId] = useState("");
  const [PurchaseUnit, setPurchaseUnit] = useState();
  const [StockUnit, setStockUnit] = useState();
  const [units, setUnits] = useState();
  useEffect(() => {
    const res = JSON.parse(skuDetail?.extUnit);
    if (res) {
      setUnits(res);
    }
    setTimestampId(getTimeId());
  }, []);

  //当units辅助计量单位发生变化时，检测辅助计量单位都有值;
  //如果有都值返回乘积;
  //如果没有不返回任何值;
  useEffect(() => {
    if (units) {
      const res = units.reduce((product, item) => product * item.num, 1);
      const x = parseFloat(Number(res).toFixed(4));
      setStockUnit(x);
    }
  }, [units, PurchaseUnit]);
  const onSubmit = async () => {
    const fet = async () => {
      if (!ctxState || !timestampId || !receivingNoteNo || !units) {
        ToastAndroid.show("提交不完整,请检查", ToastAndroid.SHORT);
        return;
      }
      //多单位提交;
      const response = await fetchData({
        path: "/inbound/receiving/addReceivingNoteDetailSupplier",
        method: "POST",
        token: ctxState?.userInfo?.token,
        storageId: ctxState?.optSet?.curStorageId,
        bodyParams: {
          idempotentKey: timestampId,
          //到货数量（采购单位）是否拦截？
          purchaseArrivalNum: Number(PurchaseUnit),
          //到货数量（库存单位）是否拦截？
          arrivalNum: Number(StockUnit),
          //arrivalExtNum[{"name":"到货根数","num":0,"unit":"根"} {"name":"单根米数","num":0,"unit":"米"}]]
          arrivalExtNum: JSON.stringify(units),
          receivingNoteDetailId: skuDetail.id,
          receivingNoteNo: receivingNoteNo,
        },
      });
      if (response.code != 200) {
        ToastAndroid.show(response?.msg, ToastAndroid.SHORT);
      } else {
        ToastAndroid.show("核对提交成功", ToastAndroid.SHORT);
        printImage(
          `${API_PRINT}/api/at-wms-adapter-api/printer/getPrintLabelImage?printLabelType=2&storageId=${ctxState?.optSet?.curStorageId}&receivingNoteId=&receivingNoteDetailId=${response.data}&pickingNoteDetailId=&packageNoteId=&outboundNoteDetailId=`,
          `Bearer ${ctxState?.userInfo?.token}`
        );
        navigation.goBack();
      }
    };
    const convertVal =
      Number(PurchaseUnit) != 0 && Number(StockUnit) != 0
        ? Number(PurchaseUnit) / Number(StockUnit)
        : 0;
    if (skuDetail?.unitConvert) {
      if (skuDetail?.unitConvert - convertVal < 0) {
        Alert.alert(
          "提示",
          `产品型号${skuDetail?.skuId},米重小于正常值，请联系技术确认！`,
          [
            {
              text: "确认",
              onPress: () => fet(),
            },
            // 如果你还需要一个取消按钮，可以添加如下代码
            {
              text: "取消",
              onPress: () => console.log(""),
              style: "cancel", // 这个样式属性会让这个按钮成为默认的取消按钮
            },
          ],
          { cancelable: false }
        );
        return;
      }
    }
    fet();
  };
  const Content = ({ fontSize, color, value }) => (
    <Text style={{ fontSize: fontSize, color: color }}>{value}</Text>
  );
  const onRightFun = () => {
    navigation.navigate("ItemCheck_Done_Stack");
  };
  const getPurchaseUnit = (value) => {
    setPurchaseUnit(value);
  };
  const getStockUnit = (value) => {
    setStockUnit(value);
  };
  const onUnit1 = (value) => {
    units[0].num = value;
    setUnits([...units]);
  };
  const onUnit2 = (value) => {
    units[1].num = value;
    setUnits([...units]);
  };

  const [mg, setMg] = useState(false);
  Keyboard.addListener("keyboardDidShow", () => {
    setMg(true);
  });
  Keyboard.addListener("keyboardDidHide", () => {
    setMg(false);
  });
  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <NoTabHeadBar
        titleA={receivingNoteNo}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
        onRightFun={onRightFun}
      ></NoTabHeadBar>
      <GoodsPositionDetailCard
        width={"90%"}
        marginTop={0}
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
                value={`多单位${
                  skuDetail?.skuName.length <= 18
                    ? skuDetail?.skuName
                    : skuDetail?.skuName.substring(0, 18) + "..."
                }`}
              />
            </TouchableOpacity>
          ) : null
        }
        item1_right={
          skuDetail?.noInspection == 1 ? (
            <Image
              style={{
                width: 35,
                height: 35,
              }}
              source={require("src/static/mianjian.jpg")}
            ></Image>
          ) : null
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
          <Content color={"#7A7A7A"} fontSize={15} value={"供应商编码"} />
        }
        item5_right={
          <Content
            color={"#222222"}
            fontSize={15}
            value={skuDetail?.applicantCode}
          />
        }
        item6_left={
          <Content color={"#7A7A7A"} fontSize={15} value={"采购类型"} />
        }
        item6_right={
          <Content
            color={"#222222"}
            fontSize={15}
            value={skuDetail?.purchaseType == 1 ? "MTS" : "MTO"}
          />
        }
        item7_left={
          <Content color={"#7A7A7A"} fontSize={15} value={"采购人员"} />
        }
        item7_right={
          <Content
            color={"#222222"}
            fontSize={15}
            value={skuDetail?.applicantName}
          />
        }
      ></GoodsPositionDetailCard>
      <View
        style={{
          height: 100,
          display: "flex",
          width: "95%",
          padding: 10,
          marginBottom: mg ? 600 : 0,
        }}
      >
        <View
          style={{
            width: "100%",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            borderRadius: 5,
            padding: 10,
          }}
        >
          <Content
            color={"#7A7A7A"}
            fontSize={14}
            value={"在途采购单位数量:"}
          />
          <Content
            color={"#222222"}
            fontSize={14}
            value={
              `${skuDetail?.purchaseComingNum}${skuDetail?.purchaseUnit}` ?? "-"
            }
          />
        </View>
        <View
          style={{
            width: "100%",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            borderRadius: 5,
            padding: 10,
          }}
        >
          <Content
            color={"#7A7A7A"}
            fontSize={14}
            value={"本次到货在途数量:"}
          />
          <Content
            color={"#222222"}
            fontSize={14}
            value={
              `${skuDetail?.stockComingNum ?? "-"}${skuDetail?.stockUnit}` ??
              "-"
            }
          />
        </View>
        {/* 采购单位到货数量 */}
        <View
          style={{
            ...ST,
          }}
        >
          <Content
            color={"#7A7A7A"}
            fontSize={14}
            value={`采购单位到货数量（${skuDetail?.purchaseUnit ?? "-"}）`}
          />
          <CountComp
            iconWH={35}
            getValue={getPurchaseUnit}
            initValue={skuDetail?.purchaseComingNum}
            iptWidth={100}
          ></CountComp>
        </View>
        {/* 库存单位到货数量 */}
        <View
          style={{
            ...ST,
          }}
        >
          <Content
            color={"#7A7A7A"}
            fontSize={14}
            value={`库存单位到货数量（${skuDetail?.stockUnit ?? "-"}）`}
          />
          {/* <CountModal getValue={getStockUnit} value={StockUnit}></CountModal> */}
          <CountComp
            iconWH={35}
            getValue={getStockUnit}
            initValue={StockUnit}
            iptWidth={100}
          ></CountComp>
        </View>
        {/* 辅助单位 */}
        {units && (
          <View
            style={{
              ...ST,
            }}
          >
            <Text>
              {units[0]?.name}（ {units[0].unit}）
            </Text>
            <CountComp
              iconWH={35}
              getValue={onUnit1}
              initValue={units[0].num}
              iptWidth={100}
            ></CountComp>
          </View>
        )}
        {units && (
          <View
            style={{
              ...ST,
            }}
          >
            <Text>
              {units[1]?.name}（ {units[1].unit}）
            </Text>
            <CountComp
              iconWH={35}
              getValue={onUnit2}
              initValue={units[1].num}
              iptWidth={100}
            ></CountComp>
          </View>
        )}
      </View>
      <CustomButton
        title="核对并打印"
        titleColor="white"
        fontSize={18}
        width={w * 0.9}
        height={50}
        backgroundColor="#004D92"
        borderRadius={2.5}
        marginTop={h * 0.28}
        align={{
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onSubmit}
      />
    </View>
  );
};
export default ItemCheck_Sync_SKU_ExtUnit_DetailStack;
