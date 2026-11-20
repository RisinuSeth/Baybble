import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

export default function Home() {
  const { width } = useWindowDimensions();
  const [draft, setDraft] = useState('');
  const compact = width < 600;

  return (
    <View style={styles.screen}>
      <View style={[styles.hero, { paddingHorizontal: compact ? 22 : 36 }]}>
        <Text style={styles.wordmark}>Baybble</Text>
        <Text style={[styles.headline, { fontSize: compact ? 36 : 52, lineHeight: compact ? 44 : 62 }]}>
          Learn a language.{ '\n' }Live the conversation.
        </Text>
        <Text style={styles.description}>
          Build real confidence by speaking with Bay — your AI language companion.
          Practise naturally, explore what interests you, and learn one conversation at a time.
        </Text>
        <View style={[styles.searchBar, { minHeight: compact ? 64 : 76 }]}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message Bay..."
            placeholderTextColor="#777777"
            style={styles.input}
            returnKeyType="send"
            accessibilityLabel="Message Bay"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: '100%', width: '100%', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  hero: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingTop: 54, paddingBottom: 54 },
  wordmark: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 30, letterSpacing: -1.5, marginBottom: 34 },
  headline: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', letterSpacing: -2.1, textAlign: 'center', maxWidth: 780 },
  description: { color: '#000000', fontFamily: 'Manrope', fontWeight: '500', fontSize: 15, lineHeight: 26, textAlign: 'center', maxWidth: 590, marginTop: 20, marginBottom: 36 },
  searchBar: { width: '100%', maxWidth: 760, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e7e7e7', borderRadius: 999, backgroundColor: '#ffffff', paddingLeft: 25, paddingRight: 25, shadowColor: '#000000', shadowOpacity: 0.055, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  searchIcon: { color: '#111111', fontFamily: 'Manrope', fontSize: 27, marginRight: 14 },
  input: { flex: 1, minWidth: 0, color: '#000000', fontFamily: 'Manrope', fontWeight: '500', fontSize: 16, paddingVertical: 18, outlineStyle: 'none' as any },
});
