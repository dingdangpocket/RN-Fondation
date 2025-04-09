import { View, Image,Text } from "react-native";
import React, { useState } from "react";
import Cell from "src/components/Cell";
import { useNavigation } from "@react-navigation/native";
import CustomContainer from "../comp/CustomContainer";

//拣货类型；
export default function PickingOutOfStockTypeStack() {
  const navigation = useNavigation();
  const [stashArray] = useState([
    { name: "领料缺货", nav: () => navigation.navigate("PickingOutOfStockStack",{secondType:1}) },
    {
      name: "常规缺货",
      nav: () => navigation.navigate("PickingOutOfStockStack",{secondType:2}),
    },
  ]);
  return (
    <View style={{ flex: 1 }}>
      <CustomContainer>
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
      </CustomContainer>
    </View>
  );
}
