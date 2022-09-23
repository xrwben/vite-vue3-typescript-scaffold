const getImageUrl = (url: string) => {
  return new URL(`../assets/${url}`, import.meta.url).href
}
export {
  getImageUrl
}