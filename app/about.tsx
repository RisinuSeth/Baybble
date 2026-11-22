import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

function go(path: string) { if (typeof window !== 'undefined') window.location.href = path; }

export default function About() {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.page}>
      <View style={[s.header, { paddingHorizontal: compact ? 22 : 56 }]}>
        <Pressable onPress={() => go('/')}><Text style={s.brand}>Baybble</Text></Pressable>
        <View style={s.nav}>
          <Pressable onPress={() => go('/about')}><Text style={s.navActive}>About</Text></Pressable>
          <Pressable onPress={() => go('/pricing')}><Text style={s.navText}>Pricing</Text></Pressable>
          <Pressable onPress={() => go('/resources')}><Text style={s.navText}>Resources</Text></Pressable>
        </View>
        <Pressable style={s.navCta} onPress={() => go('/')}><Text style={s.navCtaText}>Open Baybble ↗</Text></Pressable>
      </View>

      <View style={[s.hero, { paddingHorizontal: compact ? 24 : 70, paddingTop: compact ? 88 : 130, paddingBottom: compact ? 92 : 145 }]}>
        <Text style={s.eyebrow}>INTRODUCING BAYBBLE</Text>
        <Text style={[s.heroTitle, compact && s.heroTitleCompact]}>Think clearer.{ '\n' }Solve more.</Text>
        <Text style={[s.heroBody, compact && s.heroBodyCompact]}>An AI problem-solving platform to help you understand challenges, explore possibilities and turn ideas into practical next steps.</Text>
        <Pressable style={s.primaryButton} onPress={() => go('/')}><Text style={s.primaryButtonText}>Try Baybble <Text style={s.arrow}>↗</Text></Text></Pressable>
        <Text style={s.heroNote}>Start with a question. Leave with a clearer way forward.</Text>
      </View>

      <View style={[s.section, { paddingHorizontal: compact ? 24 : 70 }]}>
        <Text style={s.eyebrow}>THE BAYBBLE APPROACH</Text>
        <Text style={[s.sectionTitle, compact && s.sectionTitleCompact]}>More than an answer. A way forward.</Text>
        <Text style={s.sectionBody}>Some challenges need more than a quick response. Baybble is designed to help you work through the details, see the bigger picture and decide what to do next.</Text>
        <View style={[s.cards, compact && s.cardsCompact]}>
          {[
            ['01', 'Understand', 'Break down unfamiliar topics and make complicated ideas easier to work with.'],
            ['02', 'Explore', 'Consider different perspectives, options and possibilities before making a move.'],
            ['03', 'Move forward', 'Turn what you have learned into useful decisions and practical next steps.']
          ].map(([n, title, body]) => <View key={n} style={s.card}><Text style={s.cardNumber}>{n} / THE PROCESS</Text><Text style={s.cardTitle}>{title}</Text><Text style={s.cardBody}>{body}</Text></View>)}
        </View>
      </View>

      <View style={[s.statement, { paddingHorizontal: compact ? 24 : 70 }]}>
        <Text style={s.eyebrow}>BUILT AROUND YOUR THINKING</Text>
        <Text style={[s.statementTitle, compact && s.sectionTitleCompact]}>Start anywhere. Work toward clarity.</Text>
        <Text style={s.sectionBody}>A decision you are weighing up. An idea you want to develop. A topic you want to understand. Bring the challenge as it is, and use Baybble to explore what comes next.</Text>
      </View>

      <View style={[s.cta, { paddingHorizontal: compact ? 24 : 70 }]}>
        <Text style={s.eyebrow}>YOUR NEXT STEP STARTS HERE</Text>
        <Text style={[s.ctaTitle, compact && s.sectionTitleCompact]}>Make room for a clearer perspective.</Text>
        <Pressable style={s.primaryButton} onPress={() => go('/')}><Text style={s.primaryButtonText}>Start with Baybble ↗</Text></Pressable>
      </View>

      <View style={[s.footer, { paddingHorizontal: compact ? 24 : 56 }]}>
        <View style={s.footerTop}><Text style={s.brand}>Baybble</Text><Text style={s.footerTag}>Think clearer. Solve more.</Text></View>
        <View style={s.rule} />
        <View style={s.footerBottom}><Text style={s.copyright}>© 2026 Baybble. All rights reserved.</Text><View style={s.footerLinks}><Pressable onPress={() => go('/about')}><Text style={s.footerLink}>About</Text></Pressable><Pressable onPress={() => go('/pricing')}><Text style={s.footerLink}>Pricing</Text></Pressable><Pressable onPress={() => go('/resources')}><Text style={s.footerLink}>Resources</Text></Pressable><Pressable onPress={() => go('/privacy')}><Text style={s.footerLink}>Privacy</Text></Pressable></View></View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080808' },
  page: { width: '100%', alignItems: 'center' },
  header: { width: '100%', minHeight: 78, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#222222', gap: 16 },
  brand: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 21, letterSpacing: -0.8 },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 28 },
  navText: { color: '#a0a0a0', fontFamily: 'Manrope', fontSize: 12, fontWeight: '600' },
  navActive: { color: '#ffffff', fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  navCta: { borderWidth: 1, borderColor: '#444444', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16 },
  navCtaText: { color: '#ffffff', fontFamily: 'Manrope', fontSize: 11, fontWeight: '700' },
  hero: { width: '100%', alignItems: 'center', backgroundColor: '#0b0b0b' },
  eyebrow: { color: '#a0a0a0', fontFamily: 'Manrope', fontWeight: '800', fontSize: 10, letterSpacing: 2 },
  heroTitle: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 76, lineHeight: 82, letterSpacing: -4, textAlign: 'center', marginTop: 26 },
  heroTitleCompact: { fontSize: 48, lineHeight: 54, letterSpacing: -2.5 },
  heroBody: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 16, lineHeight: 28, maxWidth: 650, textAlign: 'center', marginTop: 25 },
  heroBodyCompact: { fontSize: 14, lineHeight: 24 },
  primaryButton: { backgroundColor: '#ffffff', borderRadius: 999, paddingVertical: 15, paddingHorizontal: 23, marginTop: 34 },
  primaryButtonText: { color: '#080808', fontFamily: 'Manrope', fontWeight: '800', fontSize: 12 },
  arrow: { fontWeight: '800' },
  heroNote: { color: '#777777', fontFamily: 'Manrope', fontSize: 10, marginTop: 17 },
  section: { width: '100%', maxWidth: 1440, paddingTop: 105, paddingBottom: 105 },
  sectionTitle: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 48, lineHeight: 55, letterSpacing: -2.4, maxWidth: 760, marginTop: 22 },
  sectionTitleCompact: { fontSize: 36, lineHeight: 42, letterSpacing: -1.7 },
  sectionBody: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 14, lineHeight: 25, maxWidth: 650, marginTop: 18 },
  cards: { flexDirection: 'row', gap: 14, marginTop: 48 },
  cardsCompact: { flexDirection: 'column' },
  card: { flex: 1, minHeight: 260, backgroundColor: '#141414', borderWidth: 1, borderColor: '#292929', borderRadius: 9, padding: 25 },
  cardNumber: { color: '#858585', fontFamily: 'Manrope', fontWeight: '800', fontSize: 9, letterSpacing: 1.3 },
  cardTitle: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 25, letterSpacing: -1, marginTop: 66 },
  cardBody: { color: '#a8a8a8', fontFamily: 'Manrope', fontSize: 12, lineHeight: 21, marginTop: 13 },
  statement: { width: '100%', paddingTop: 95, paddingBottom: 100, backgroundColor: '#101010' },
  statementTitle: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 46, lineHeight: 52, letterSpacing: -2, marginTop: 22 },
  cta: { width: '100%', paddingTop: 95, paddingBottom: 100, alignItems: 'center', backgroundColor: '#111111' },
  ctaTitle: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 43, lineHeight: 50, letterSpacing: -2, textAlign: 'center', maxWidth: 700, marginTop: 20 },
  footer: { width: '100%', paddingTop: 32, paddingBottom: 28, backgroundColor: '#080808' },
  footerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, paddingBottom: 25 },
  footerTag: { color: '#888888', fontFamily: 'Manrope', fontSize: 11 },
  rule: { height: 1, backgroundColor: '#303030' },
  footerBottom: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, paddingTop: 22 },
  copyright: { color: '#777777', fontFamily: 'Manrope', fontSize: 10 },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  footerLink: { color: '#a0a0a0', fontFamily: 'Manrope', fontSize: 10 }
});
