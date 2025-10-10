import { CLIENT_METHODS } from "../signalingMethods";
export function unregisterHandlers(connection, triggerCallback) {
  connection.off(CLIENT_METHODS.NOTIFICATION_RECEIVED, () => {
    triggerCallback(CLIENT_METHODS.NOTIFICATION_RECEIVED);
  });
}
export default unregisterHandlers;
