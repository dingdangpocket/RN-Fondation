import React, { createContext, useEffect, useReducer } from "react";
import setAsyncStorage from "src/functions/setAsyncStorage";
export const ContentContext = createContext({});
const reducer = (ctxState, action) => {
  switch (action.type) {
    case "userRouterPermissions":
      return {
        ...ctxState,
        routerPermissions: action.payload,
      };
    case "updateUserInfo":
      return {
        ...ctxState,
        userInfo: action.payload,
      };
    case "updateOptSet":
      return {
        ...ctxState,
        optSet: action.payload,
      };
    default:
      return ctxState;
  }
};
export const ContextProvider = ({ children }) => {
  const [ctxState, dispatch] = useReducer(reducer, {
    userInfo: "",
    optSet: "",
    userRouterPermissions:"",
    outboundPackingOpt: {},
    outboundPackingNoDetailOpt: {},
    changeParcelOpt: {},
  });

  //将ctxState同步到AsyncStorage;
  useEffect(() => {
    const sync = () => {
      setAsyncStorage("userInfo", { ...ctxState });
    };
    sync();
  }, [ctxState]);
  return (
    <ContentContext.Provider value={{ ctxState, dispatch }}>
      {children}
    </ContentContext.Provider>
  );
};
