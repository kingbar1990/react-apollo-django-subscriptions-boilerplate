export const saveData = (key, token) => {
  const timestamp = +new Date();
  const data = JSON.stringify({ token: token, timestamp });
  window.localStorage.setItem(key, data);
};

export const getBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

export const withPromise = funk => {
  new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(funk);
    }, 200)
  );
};

export function debounce(func, wait, immediate) {
  var timeout;

  return function() {
    var context = this,
      args = arguments;

    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    if (immediate && !timeout) func.apply(context, args);
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
