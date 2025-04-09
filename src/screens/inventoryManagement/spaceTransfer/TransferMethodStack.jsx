import { View, Image,Text } from "react-native";
import React, { useState } from "react";
import Cell from "src/components/Cell";
import { useNavigation } from "@react-navigation/native";
import NoTabHeadBar from "src/components/NoTabHeadBar";

//转移方式；
export default function TransferMethodStack() {
  const navigation = useNavigation();
  const [stashArray] = useState([
    { name: "商品转移", nav: () => navigation.navigate("SpaceTransferStack") },
    {
      name: "容器转移",
      nav: () => navigation.navigate("ContainerTransferScanStack"),
    },
  ]);
  const onPress = () => {
    navigation.navigate("ChooseCountDoorStack");
  };
  return (
    <View>
      <NoTabHeadBar
        titleA={"货位转移"}
        icon={
          <Text style={{ color: "white", marginRight: 10, width: 45 }}></Text>
        }
      ></NoTabHeadBar>
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        {stashArray.map((item, index) => (
          <View style={{ marginTop: 5 }} key={item.name}>
            <Cell
              name={item.name}
              onPress={() => item.nav()}
              right={
                <Image
                  source={require("src/static/blackLeftArrow.png")}
                  style={{ width: 20, height: 20, marginRight: 20 }}
                ></Image>
              }
            />
          </View>
        ))}
      </View>
    </View>
  );
}
