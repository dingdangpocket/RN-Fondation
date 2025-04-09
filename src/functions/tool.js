export const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    const context = this;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};
export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function (...args) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

let navigation = null;
let ToastAndroid = null;

export const setNavigation = (nav) => {
  navigation = nav;
};

export const getNavigation = () => navigation;

export const setToastAndroid = (toast) => {
  ToastAndroid = toast;
};

export const getToastAndroid = () => ToastAndroid;
