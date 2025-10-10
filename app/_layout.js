import { Slot } from "expo-router";
import { SignalRProvider } from "../context/signalrContext";
import { NotificationStateProvider } from "../context/notificationStateContext";

export default function Layout() {
  return (
      <SignalRProvider>
        <NotificationStateProvider>
          <Slot />
        </NotificationStateProvider>
      </SignalRProvider>
  );
}
