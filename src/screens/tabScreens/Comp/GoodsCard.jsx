import React from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
const { width, height } = Dimensions.get("window");
const centerST = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexDirection: "row",
};
const GoodsCard = ({ goodsPositionNum, num, goods, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.3}
      delayPressIn={2}
      delayPressOut={6}
      style={{
        marginTop: 10,
        width: "92%",
        padding: 10,
        backgroundColor: "white",
        borderRadius: 10,
      }}
      onPress={onPress}
    >
      <View
        style={{
          ...centerST,
          height: 60,
          padding: 10,
          borderBottomWidth: 2,
          borderBottomColor: "rgb(230,230,230)",
        }}
      >
        <View
          style={{
            ...centerST,
          }}
        >
          <Text>{goodsPositionNum}</Text>
        </View>

        <View
          style={{
            ...centerST,
            marginRight: 30,
          }}
        >
          <Text
            style={{
              backgroundColor: "#FFF7EA",
              padding: 10,
              fontSize: 15,
              color: "#B48032",
            }}
          >
            {num}
          </Text>
        </View>
      </View>
      <View>
        <View
          style={{
            ...centerST,
            height: 60,
            padding: 10,
          }}
        >
          <View
            style={{
              ...centerST,
            }}
          >
            <Text>{goods}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
export default GoodsCard;
