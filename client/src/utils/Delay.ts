
export async function delay(timeout: number): Promise<void> {
  return new Promise((res, rej) => {
    setTimeout(res, timeout)
  })
}