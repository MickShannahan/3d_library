
const throttles = []

export function throttle(fn, delay, ...args) {
  if (throttles.includes(fn)) return
  fn(...args)
  throttles.push(fn)
  setTimeout(() => {
    throttles.splice(throttles.indexOf(fn), 1)
  }, delay)
}