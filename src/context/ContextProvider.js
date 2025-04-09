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
    case "updateInventoryCheckOpt":
      return {
        ...ctxState,
        inventoryCheckOpt: action.payload,
      };
    case "updateExpressDeliveryOpt":
      return {
        ...ctxState,
        expressDeliveryOpt: action.payload,
      };
    case "updateSelfDeliveryOpt":
      return {
        ...ctxState,
        selfDeliveryOpt: action.payload,
      };
    case "updateOutboundPackingOpt":
      return {
        ...ctxState,
        outboundPackingOpt: {
          ...ctxState.outboundPackingOpt,
          ...action.payload,
        },
      };
    case "updateOutboundPackingNoDetailOpt":
      return {
        ...ctxState,
        outboundPackingNoDetailOpt: {
          ...ctxState.outboundPackingNoDetailOpt,
          ...action.payload,
        },
      };
    case "updateChangeParcelOpt":
      return {
        ...ctxState,
        changeParcelOpt: {
          ...ctxState.changeParcelOpt,
          ...action.payload,
        },
      };
    case "updateReceivingNoteNo":
      return {
        ...ctxState,
        receivingNoteNo: action.payload,
      };
    default:
      return ctxState;
  }
};
export const ContextProvider = ({ children }) => {
  const [ctxState, dispatch] = useReducer(reducer, {
    userInfo: "",
    optSet: "",
    inventoryCheckOpt: "",
    expressDeliveryOpt: { taskId: 0 },
    selfDeliveryOpt: { taskId: 0 },
    outboundPackingOpt: {
      taskId: 0,
      outboundNoteId: 0,
      packageNoteId: 0,
      packageNoteNo: "",
    },
    outboundPackingNoDetailOpt: {
      taskId: 0,
      outboundNoteId: 0,
      packageNoteId: 0,
      outboundNoteNo: "",
    },
    changeParcelOpt: {
      taskId: 0,
      outboundNoteId: 0,
      packageNoteId: 0,
      packageNoteNo: "",
    },
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
