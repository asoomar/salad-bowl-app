import Fire from '../Fire';
import Events from '../constants/Events';
import Errors from '../constants/Errors';

export const isValidSnapshot = (snapshot, errorCode) => {
  if (!snapshot || snapshot.val() === null || snapshot.val() === undefined) {
    console.log(`Application error -- Error Code: ${errorCode}`)

    // Log error to firebase
    Fire.db.logEvent(Events.SNAPSHOT_ERROR, {
      errorCode: errorCode,
      description: Errors[errorCode]
    })
    return false
  }
  return true
}
