import React, { memo, useCallback } from "react";
import { View, TouchableOpacity } from "react-native";
const ST = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexDirection: "row",
};
const ST1 = {
  height: 45,
  padding: 10,
  borderBottomColor: "rgb(240,240,240)",
};
const styles = {
  centerST: {
    ...ST,
  },
  listItem: {
    ...ST,
    ...ST1,
  },
  listItemFirst: {
    ...ST,
    ...ST1,
    borderBottomWidth: 1,
  },
};
const GoodsPositionDetailCard = ({
  item1_left,
  item1_right,
  item2_left,
  item2_right,
  item3_left,
  item3_right,
  item4_left,
  item4_right,
  item5_left,
  item5_right,
  item6_left,
  item6_right,
  item7_left,
  item7_right,
  item8_left,
  item8_right,
  item9_left,
  item9_right,
  onPress,
  renderKey,
  marginTop,
  width,
  active,
}) => {
  const RenderItem = useCallback(
    ({ left, right, index }) => (
      <View style={index == 0 ? styles.listItemFirst : styles.listItem}>
        <View style={styles.centerST}>{left}</View>
        {right && <View style={{ ...styles.centerST }}>{right}</View>}
      </View>
    ),
    []
  );
  const listItems = [
    { left: item1_left, right: item1_right },
    { left: item2_left, right: item2_right },
    { left: item3_left, right: item3_right },
    { left: item4_left, right: item4_right },
    { left: item5_left, right: item5_right },
    { left: item6_left, right: item6_right },
    { left: item7_left, right: item7_right },
    { left: item8_left, right: item8_right },
    { left: item9_left, right: item9_right },
  ].filter((item) => item.left);
  const ingorn = () => {};
  return (
    <TouchableOpacity
      key={renderKey}
      style={{
        padding: 10,
        marginTop: marginTop,
        width: width ?? "100%",
        backgroundColor: active ? "rgba(220, 240, 255, 1)" : "white",
        borderRadius: 10,
      }}
      onPress={onPress ? onPress : ingorn}
      activeOpacity={0.6}
    >
      {listItems.map((item, index) => (
        <RenderItem
          key={index}
          left={item.left}
          right={item.right}
          index={index}
        />
      ))}
    </TouchableOpacity>
  );
};
export default memo(GoodsPositionDetailCard);
