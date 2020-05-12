export const isValidSnapshot = (snapshot, errorCode) => {
  if (!snapshot || snapshot.val() === null || snapshot.val() === undefined) {
    console.log(`Application error -- Error Code: ${errorCode}`)
    return false
  }
  return true
}
