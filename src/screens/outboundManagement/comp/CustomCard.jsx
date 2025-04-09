import {
  StyleSheet,
  View,
  useWindowDimensions,
  Text,
  Pressable,
} from "react-native";
import React from "react";

const CustomCard = ({
  onPress,
  onLongPress,
  height,
  customStyle = {},
  marginVertical = 8,
  widthFactor = 1,
  backgroundColor = "#ffff",
  borderColor = "#fff",
  cardTagColor,
  children,
}) => {
  const { width } = useWindowDimensions();
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };
  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress();
    }
  };
  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={{
        ...styles.cardContainer,
        marginVertical,
        backgroundColor,
        borderColor,
        height,
        width: widthFactor * width,
        ...customStyle,
      }}
    >
      {cardTagColor && (
        <Text
          style={{
            ...styles.tagBar,
            backgroundColor: cardTagColor,
            height,
          }}
        />
      )}
      <View>{children}</View>
    </Pressable>
  );
};

export default CustomCard;

const styles = StyleSheet.create({
  cardContainer: {
    padding: 12,
    borderRadius: 8,
    position: "relative",
    borderWidth: 1,
  },
  tagBar: {
    width: 8,
    backgroundColor: "red",
    position: "absolute",
    left: 0,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
});
