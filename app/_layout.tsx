import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import '../global.css';

export default function RootLayout() {
  const [iconsLoaded] = useFonts(Ionicons.font);

  // Keep the app from rendering icon glyphs before the Ionicons font is ready.
  // This prevents the browser from briefly (or persistently) showing missing-glyph boxes.
  if (!iconsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }} />
    </>
  );
}
