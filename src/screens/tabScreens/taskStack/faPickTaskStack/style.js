import { rpx2dp, h, w } from "src/functions/responsive";
const CENTERSTYLE = {
  justifyContent: "center",
  alignItems: "center",
};
const CENTERSTYLEWRAP = {
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  flexDirection: "row",
};

const PLUSSTYLE = {
  height: 50,
  width: 50,
  backgroundColor: "rgb(220,220,220)",
};
const MODALSTYLE = {
  display: "flex",
  width: rpx2dp(260),
  height: rpx2dp(180),
  backgroundColor: "rgb(235,235,235)",
  borderRadius: 10,
  padding: 10,
  shadowColor: "#000",
  shadowOpacity: 0.8,
  shadowRadius: 10,
  elevation: 40,
  marginTop: h * 0.35,
  marginLeft: w * 0.16,
  shadowOffset: {
    width: 5,
    height: 5,
  },
};
export { MODALSTYLE, PLUSSTYLE, CENTERSTYLEWRAP, CENTERSTYLE };
