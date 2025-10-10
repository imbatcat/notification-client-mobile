import { CLIENT_METHODS } from "../signalingMethods";

export function registerHandlers(connection, triggerCallback) {
  console.log("Registering handlers");
  connection.on(CLIENT_METHODS.NOTIFICATION_RECEIVED, () => {
    console.log("Notification received");
    triggerCallback(CLIENT_METHODS.NOTIFICATION_RECEIVED);
  });
}

export default registerHandlers;
