let throttle = {}

export function clearT() {
  throttle = {}
}
export function throttledCall(
  scene,
  func,
  delay,
  id = '',
  key = '' + func + id
) {
  if (!throttle[key]) {
    func()
    throttle[key] = true
    scene.time.delayedCall(delay, () => {
      throttle[key] = false
    })
  }
}
export function debounce(func, delay) {
  let timer
  return () => {
    clearTimeout(timer)
    timer = setTimeout(() => func(arguments), delay)
  }
}
export function randi(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
export function randF(min, max) {
  return Math.random() * (max - min + 1) + min
}
export function addToArrayOnce(item, array) {
  if (!array.find(i => i === item)) array.push(item)
}
