export const isValidSnapshot = (snapshot, errorCode) => {
  if (!snapshot || snapshot.val() === null || snapshot.val() === undefined) {
    console.log(`Snapshot error -- Error Code: ${errorCode || ""}`)
    return false
  }
  return true
}
