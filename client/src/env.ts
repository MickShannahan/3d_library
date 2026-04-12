
export const baseURL = window.origin.includes('localhost') ? 'http://localhost:3000' : window.origin.slice(0, window.origin.indexOf('.com' + 4))