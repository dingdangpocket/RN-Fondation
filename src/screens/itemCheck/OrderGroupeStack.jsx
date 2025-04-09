import { View, Text } from "react-native";
import React, { useState } from "react";
import { CellIcon } from "src/icons";
import { useNavigation } from "@react-navigation/native";
import NoTabHeadBar from "src/components/NoTabHeadBar";
import Cell from "src/components/Cell";

//项次核对
export default function OrderGroupeStack(props) {
  const navigation = useNavigation();
  const [stashArray] = useState([
    { name: "采购单", noteType: 100101 },
    { name: "调拨单", noteType: 100501 },
    { name: "销售退货单", noteType: 100401 },
    { name: "废品入库", noteType: 109003 },
    { name: "其他入库", noteType: 109001 },
  ]);
  const onPress = (noteType) => {
    navigation.navigate("ItemCheckScanStack", { noteType: noteType });
  };
  return (
    <View>
      <NoTabHeadBar
        titleA={"项次核对"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {stashArray.map((item) => (
          <View style={{ marginTop: 5 }} key={item.name}>
            <Cell
              name={item.name}
              onPress={() => onPress(item.noteType)}
              right={<CellIcon width="20%" height="20%" />}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
