import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

const navItems = ['Product', 'Use Cases', 'Pricing', 'Resources'];

export default function Home() {
  const { width } = useWindowDimensions();
  const [draft, setDraft] = useState('');
  const compact = width < 760;

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.artwork}>
        <View style={styles.blueGlow} />
        <View style={styles.pinkGlow} />
      </View>

      <View style={[styles.header, { paddingHorizontal: compact ? 20 : 52 }]}>
        <Pressable accessibilityRole="link" accessibilityLabel="Baybble home" style={styles.brand}>
          <View style={styles.logoMark}>
            <View style={styles.logoBubbleOne} />
            <View style={styles.logoBubbleTwo} />
          </View>
          <Text style={styles.wordmark}>Baybble</Text>
        </Pressable>

        {!compact && (
          <View style={styles.nav}>
            {navItems.map((item) => (
              <Pressable key={item} style={styles.navLink}>
                <Text style={styles.navText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.headerActions}>
          {!compact && (
            <Pressable style={styles.demoButton}>
              <Text style={styles.demoText}>Schedule a Demo</Text>
            </Pressable>
          )}
          <Pressable style={styles.loginButton}>
            <Text style={styles.loginText}>Log In</Text>
          </Pressable>
          <Pressable style={styles.startButton}>
            <Text style={styles.startText}>{compact ? 'Get Started' : 'Get Started Free'}</Text>
          </Pressable>
        </View>
      </View>

      {compact && (
        <View style={styles.mobileNav}>
          {navItems.map((item) => (
            <Pressable key={item} style={styles.navLink}>
              <Text style={styles.navText}>{item}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.navLink}>
            <Text style={styles.navText}>Schedule a Demo</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.hero, { paddingHorizontal: compact ? 22 : 36, paddingTop: compact ? 74 : 112 }]}>
        <Text style={[styles.eyebrow, { marginBottom: compact ? 18 : 22 }]}>YOUR AI LANGUAGE COMPANION</Text>
        <Text style={[styles.headline, { fontSize: compact ? 38 : 58, lineHeight: compact ? 46 : 68 }]}>
          Learn a language.{ '\n' }Live the conversation.
        </Text>
        <Text style={[styles.description, { fontSize: compact ? 14 : 16 }]}>
          Build real confidence by speaking with Bay — your AI language companion.
          Practise naturally, explore what interests you, and learn one conversation at a time.
        </Text>
        <View style={[styles.searchBar, { minHeight: compact ? 68 : 82, paddingHorizontal: compact ? 18 : 26 }]}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message Bay..."
            placeholderTextColor="#77718c"
            style={styles.input}
            returnKeyType="send"
            accessibilityLabel="Message Bay"
          />
          <View style={styles.searchHint}>
            <Text style={styles.searchHintText}>↵</Text>
          </View>
        </View>
        <Text style={styles.searchCaption}>Start with a hello. Bay will take it from there.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: '100vh' as any, width: '100%', backgroundColor: '#ffffff', alignItems: 'center', overflow: 'hidden' },
  artwork: { position: 'absolute', top: -210, right: -160, width: 590, height: 590 },
  blueGlow: { position: 'absolute', top: 20, right: 20, width: 430, height: 430, borderRadius: 215, backgroundColor: '#b8c9ff', opacity: 0.46 },
  pinkGlow: { position: 'absolute', top: 115, right: 115, width: 330, height: 330, borderRadius: 165, backgroundColor: '#f4c5e9', opacity: 0.48 },
  header: { width: '100%', minHeight: 92, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 2, paddingVertical: 16 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoMark: { width: 32, height: 32, position: 'relative' },
  logoBubbleOne: { position: 'absolute', width: 23, height: 23, borderRadius: 12, backgroundColor: '#8da8ff', top: 0, left: 0 },
  logoBubbleTwo: { position: 'absolute', width: 18, height: 18, borderRadius: 10, backgroundColor: '#e8a9dc', bottom: 0, right: 0, borderWidth: 2, borderColor: '#ffffff' },
  wordmark: { color: '#111018', fontFamily: 'Manrope', fontWeight: '800', fontSize: 25, letterSpacing: -1.2 },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  navLink: { paddingVertical: 10, paddingHorizontal: 3 },
  navText: { color: '#292633', fontFamily: 'Manrope', fontWeight: '600', fontSize: 13 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 17 },
  demoButton: { paddingVertical: 11, paddingHorizontal: 14 },
  demoText: { color: '#292633', fontFamily: 'Manrope', fontWeight: '700', fontSize: 13 },
  loginButton: { paddingVertical: 11, paddingHorizontal: 4 },
  loginText: { color: '#292633', fontFamily: 'Manrope', fontWeight: '700', fontSize: 13 },
  startButton: { backgroundColor: '#17151f', borderRadius: 999, paddingVertical: 13, paddingHorizontal: 20, shadowColor: '#7c72a8', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  startText: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '700', fontSize: 13 },
  mobileNav: { width: '100%', paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, zIndex: 2 },
  hero: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingBottom: 70, zIndex: 1 },
  eyebrow: { color: '#6d63a3', fontFamily: 'Manrope', fontWeight: '800', fontSize: 11, letterSpacing: 2.1, textAlign: 'center' },
  headline: { color: '#111018', fontFamily: 'Manrope', fontWeight: '800', letterSpacing: -2.4, textAlign: 'center', maxWidth: 820 },
  description: { color: '#393642', fontFamily: 'Manrope', fontWeight: '500', lineHeight: 27, textAlign: 'center', maxWidth: 610, marginTop: 22, marginBottom: 38 },
  searchBar: { width: '100%', maxWidth: 790, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#b8b0e9', borderRadius: 999, backgroundColor: '#ffffff', shadowColor: '#8c80c8', shadowOpacity: 0.17, shadowRadius: 28, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  searchIcon: { color: '#61588d', fontFamily: 'Manrope', fontSize: 31, marginRight: 15 },
  input: { flex: 1, minWidth: 0, color: '#17151f', fontFamily: 'Manrope', fontWeight: '600', fontSize: 16, paddingVertical: 20, outlineStyle: 'none' as any },
  searchHint: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#eeeaff', alignItems: 'center', justifyContent: 'center' },
  searchHintText: { color: '#62599a', fontFamily: 'Manrope', fontSize: 18, fontWeight: '800' },
  searchCaption: { color: '#777281', fontFamily: 'Manrope', fontSize: 12, fontWeight: '500', marginTop: 15 },
});
