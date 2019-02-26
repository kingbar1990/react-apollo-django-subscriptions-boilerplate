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
