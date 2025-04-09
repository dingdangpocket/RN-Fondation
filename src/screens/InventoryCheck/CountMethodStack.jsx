import { View, Image, Text } from "react-native";
import React, { useState } from "react";
import Cell from "src/components/Cell";
import { useNavigation } from "@react-navigation/native";
import NoTabHeadBar from "src/components/NoTabHeadBar";
//清点方式；
export default function CountMethodStack(props) {
  // console.log("props", props.route.params);
  const navigation = useNavigation();
  const [stashArray] = useState([
    { name: "清点台", nav: () => navigation.navigate("ChooseCountDoorStack") },
    { name: "SKU清点", nav: () => navigation.navigate("Count_SKU") },
  ]);

  return (
    <View>
      <NoTabHeadBar
        titleA={"清点方式"}
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
