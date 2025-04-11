import Main from "src/screens/stackScreens/main/Main";
import Home from "src/screens/stackScreens/home/Home";
import Goods from "src/screens/stackScreens/home/goods/Goods";

const MainStackRoutes = [
  {
    name: "Main",
    component: Main,
    option: { title: "Main" },
    headerShown: true,
  },
];

const HomeStack = [
  {
    name: "Home",
    component: Home,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
  {
    name: "Goods",
    component: Goods,
    option: { header: () => null, title: "" },
    headerShown: true,
  },
];

export const containStackRoutes = [...HomeStack, ...MainStackRoutes];
