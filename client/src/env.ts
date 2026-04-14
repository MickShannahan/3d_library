
export const isDev = window.origin.includes('localhost')

export const baseURL = isDev ? 'http://localhost:3000' : window.origin