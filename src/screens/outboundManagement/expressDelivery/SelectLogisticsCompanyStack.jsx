import {  Text, View, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import CustomContainer from "../comp/CustomContainer";
import CustomCard from "../comp/CustomCard";
import { NormalText, PrimaryText } from "../comStyle";

const SelectLogisticsCompanyStack = ({ route }) => {
  const { expressList, selectedCompany } = route.params;
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [selectedExpressId, setSelectedExpressId] = useState(0);
  useEffect(() => {
    setData(expressList);
    if (selectedCompany?.expressCompanyId) {
      setSelectedExpressId(selectedCompany?.expressCompanyId);
    } else {
      const findDefault = expressList?.find((item) => item.isDefault === 1);
      if (findDefault) {
        setSelectedExpressId(findDefault?.expressCompanyId);
      }
    }
  }, []);
  const onSelect = (item) => {
    navigation.navigate("ExpressDeliveryDetailStack", {
      expressItem: item,
    });
  };
  return (
    <CustomContainer>
      <FlatList
        data={data}
        keyboardShouldPersistTaps="always"
        removeClippedSubviews={true}
        keyExtractor={(item) => item?.expressCompanyId.toString()}
        renderItem={({ item }) => (
          <CustomCard
            height={52}
            widthFactor={0.95}
            backgroundColor={
              item.expressCompanyId === selectedExpressId ? "#D6ECFF" : "#fff"
            }
            onPress={() => onSelect(item)}
          >
            <View style={{ height: 28 }}>
              <Text
                style={
                  item.expressCompanyId === selectedExpressId
                    ? PrimaryText
                    : NormalText
                }
              >
                {item?.expressCompanyName}
              </Text>
            </View>
          </CustomCard>
        )}
      />
    </CustomContainer>
  );
};

export default SelectLogisticsCompanyStack;
