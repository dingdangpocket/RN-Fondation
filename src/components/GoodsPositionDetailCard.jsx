import React from "react";
import { View, TouchableNativeFeedback } from "react-native";
const styles = {
  centerST: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    height: 50,
    padding: 10,
    borderBottomColor: "rgb(230,230,230)",
  },
  itemText: {
    fontSize: 16,
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
  item10_left,
  item10_right,
  onPress,
  renderKey,
  marginTop,
  width,
}) => {
  const RenderItem = ({ left, right }) => (
    <View style={styles.listItem}>
      <View style={styles.centerST}>{left}</View>
      {right && <View style={{ ...styles.centerST }}>{right}</View>}
    </View>
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
    { left: item10_left, right: item10_right },
  ].filter((item) => item.left);
  return (
    <View
      key={renderKey}
      style={{
        marginTop: marginTop,
        width: width ?? "100%",
        padding: 10,
        backgroundColor: "white",
        borderRadius: 10,
      }}
    >
      {onPress ? (
        <TouchableNativeFeedback onPress={onPress}>
          <View>
            {listItems.map((item, index) => (
              <RenderItem key={index} left={item.left} right={item.right} />
            ))}
          </View>
        </TouchableNativeFeedback>
      ) : (
        listItems.map((item, index) => (
          <RenderItem key={index} left={item.left} right={item.right} />
        ))
      )}
    </View>
  );
};
export default GoodsPositionDetailCard;
