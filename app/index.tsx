import React, { useState } from 'react';
import {
  Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';

export default function Home() {
  const { width } = useWindowDimensions();
  const [draft, setDraft] = useState('');
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded) return <View style={styles.loading} />;

  return (
    <View style={styles.screen}>
      <View style={[styles.hero, { paddingHorizontal: width < 600 ? 22 : 36 }]}>
        <Text style={styles.wordmark}>Baybble</Text>

        <Text style={[styles.headline, { fontSize: width < 600 ? 36 : 52, lineHeight: width < 600 ? 44 : 62 }]}>
          Learn a language.{ '\n' }Live the conversation.
        </Text>

        <Text style={styles.description}>
          Build real confidence by speaking with Bay — your AI language companion.
          Practise naturally, explore what interests you, and learn one conversation at a time.
        </Text>

        <View style={[styles.searchBar, { maxWidth: 760, minHeight: width < 600 ? 64 : 76 }]}>
          <Ionicons name="search" size={22} color="#111111" style={styles.searchIcon} />
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message Bay..."
            placeholderTextColor="#777777"
            style={styles.input}
            multiline={false}
            returnKeyType="send"
            accessibilityLabel="Message Bay"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear message"
            onPress={() => setDraft('')}
            disabled={!draft.length}
            style={({ pressed }) => [styles.clearButton, !draft.length && styles.clearButtonHidden, pressed && styles.buttonPressed]}
          >
            <Ionicons name="arrow-up" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#ffffff' },
  screen: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 54,
    paddingBottom: 54,
  },
  wordmark: {
    color: '#000000',
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 30,
    letterSpacing: -1.5,
    marginBottom: 34,
  },
  headline: {
    color: '#000000',
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: -2.1,
    textAlign: 'center',
    maxWidth: 780,
  },
  description: {
    color: '#000000',
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'center',
    maxWidth: 590,
    marginTop: 20,
    marginBottom: 36,
  },
  searchBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e7e7e7',
    borderRadius: 999,
    backgroundColor: '#ffffff',
    paddingLeft: 25,
    paddingRight: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.055,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  searchIcon: { marginRight: 16 },
  input: {
    flex: 1,
    minWidth: 0,
    color: '#000000',
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    paddingVertical: 18,
    outlineStyle: 'none' as any,
  },
  clearButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  clearButtonHidden: { opacity: 0.35 },
  buttonPressed: { transform: [{ scale: 0.94 }], opacity: 0.82 },
});
