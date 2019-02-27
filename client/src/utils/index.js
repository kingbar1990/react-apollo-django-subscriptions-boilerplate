export const saveData = (key, value) => {
  const timestamp = +new Date()
  const data = JSON.stringify({ token: value, timestamp })
  window.localStorage.setItem(key, data)
}

export const getBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })

export function debounce(func, wait, immediate) {
  var timeout

  return function() {
    var context = this,
      args = arguments

    var later = function() {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    if (immediate && !timeout) func.apply(context, args)
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
