// (1)测设环境API服务-UAT3;
// export const VERSION = 15.4;
// export const KEY = "uat3";
// //测试服务API;
// export const API_URL_TEST = "http://39.102.213.84:8000/mock/12/wms-pda-api";
// //登陆服务API请求头;
// export const API_URL_LOGIN = "http://ams.uat3.ant2world.com";
// //打印标签服务API请求头;
// export const API_PRINT = "http://ams.uat3.ant2world.com";
// //数据接口API请求头;
// export const API_URL = "http://ams.uat3.ant2world.com/api/at-wms-pda-api";
// // 获取快递发货地址接口
// export const API_GET_EXPRESS_ADDRESS =
// "http://ams.uat3.ant2world.com/api/at-base-api/area/list/";

//(2)正式生产环境服务API-PROD;
export const VERSION = 15.7;
export const API_URL_TEST = "http://39.102.213.84:8000/mock/12/wms-pda-api";
export const KEY = "prod";
//登陆服务API请求头;
export const API_URL_LOGIN = "http://ams.prod.ant2world.com";
//打印标签服务API请求头;
export const API_PRINT = "http://ams.prod.ant2world.com";
//数据接口API请求头;
export const API_URL = "http://ams.prod.ant2world.com/api/at-wms-pda-api";
// 获取快递发货地址接口;
export const API_GET_EXPRESS_ADDRESS =
  "http://ams.prod.ant2world.com/api/at-base-api/area/list/";
