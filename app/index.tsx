import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

const navItems = ['Product', 'Use Cases', 'Pricing', 'Resources'];

export default function Home() {
  const { width } = useWindowDimensions();
  const [draft, setDraft] = useState('');
  const [openFaq, setOpenFaq] = useState(-1);
  const marqueeProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(marqueeProgress, { toValue: 1, duration: 26000, useNativeDriver: true })
    );
    animation.start();
    return () => animation.stop();
  }, [marqueeProgress]);

  const marqueeShift = marqueeProgress.interpolate({ inputRange: [0, 1], outputRange: [-width, 0] });
  const compact = width < 760;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator>
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
          <Text style={styles.micIcon}>💬</Text>
        </View>
        <Text style={styles.searchCaption}>Start with a hello. Bay will take it from there.</Text>
      </View>
      <View style={styles.introBand}>
        <Text style={styles.introTitle}>A little less studying. A lot more speaking.</Text>
        <Text style={styles.introText}>Language grows through use. Baybble gives you a friendly place to try, make mistakes, find your words, and keep the conversation going.</Text>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.sectionEyebrow}>MEET BAY</Text>
        <Text style={styles.sectionTitle}>A language companion that gets you talking.</Text>
        <Text style={styles.sectionBody}>Not another pile of lessons to get through. A welcoming conversation space where you can practise expressing yourself, one message at a time.</Text>
        <View style={styles.cardsRow}>
          <View style={[styles.infoCard, { backgroundColor: '#f1efff' }]}><Text style={styles.cardIcon}>💬</Text><Text style={styles.cardTitle}>Talk about anything</Text><Text style={styles.cardBody}>Your day, favourite films, travel, sport, or a completely random thought. Your interests make the conversation yours.</Text></View>
          <View style={[styles.infoCard, { backgroundColor: '#fff0f8' }]}><Text style={styles.cardIcon}>✦</Text><Text style={styles.cardTitle}>Learn without pressure</Text><Text style={styles.cardBody}>Try new words and sentence patterns in a relaxed space. Mistakes are part of learning, not a reason to stop talking.</Text></View>
          <View style={[styles.infoCard, { backgroundColor: '#edf4ff' }]}><Text style={styles.cardIcon}>🧠</Text><Text style={styles.cardTitle}>Build confidence</Text><Text style={styles.cardBody}>Keep practising at a pace that feels right. Each conversation is another chance to become more comfortable.</Text></View>
        </View>
      </View>

      <View style={styles.chatSection}>
        <View style={styles.chatCopy}>
          <Text style={styles.sectionEyebrow}>A CONVERSATION, NOT A CLASS</Text>
          <Text style={styles.sectionTitle}>Your world is the lesson.</Text>
          <Text style={styles.sectionBody}>Practise the language you actually want to use. Explore a topic, find a better way to phrase something, and keep moving when you get stuck.</Text>
          <Text style={styles.checkLine}>✓  Choose a topic you enjoy</Text>
          <Text style={styles.checkLine}>✓  Ask questions and explore ideas</Text>
          <Text style={styles.checkLine}>✓  Practise expressing yourself naturally</Text>
        </View>
        <View style={styles.chatCard}>
          <View style={styles.chatHeader}><View style={styles.avatar}><View style={styles.logoMark}><View style={styles.logoBubbleOne} /><View style={styles.logoBubbleTwo} /></View></View><View><Text style={styles.chatName}>Bay</Text><Text style={styles.chatStatus}>Your language companion</Text></View></View>
          <View style={styles.bayBubble}><Text style={styles.bubbleText}>Hey! What have you been into lately?</Text></View>
          <View style={styles.youBubble}><Text style={styles.youBubbleText}>I started watching a new series. It's really interesting.</Text></View>
          <View style={styles.bayBubble}><Text style={styles.bubbleText}>Nice! You could also say, “I've started watching a new series.” What is it about?</Text></View>
          <View style={styles.chatFakeInput}><Text style={styles.fakePlaceholder}>Keep the conversation going...</Text></View>
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.sectionEyebrow}>MADE FOR REAL LIFE</Text>
        <Text style={styles.sectionTitle}>Your language. Your reasons.</Text>
        <Text style={styles.sectionBody}>Make practice part of the things you already love doing.</Text>
        <View style={styles.cardsRow}>
          <View style={styles.useCard}><Text style={styles.cardIcon}>✈</Text><Text style={styles.cardTitle}>Travel with confidence</Text><Text style={styles.cardBody}>Practise useful conversations for new places, from meeting people to asking for directions.</Text></View>
          <View style={styles.useCard}><Text style={styles.cardIcon}>☕</Text><Text style={styles.cardTitle}>Everyday conversations</Text><Text style={styles.cardBody}>Get more comfortable with introductions, small talk, opinions, and daily life.</Text></View>
          <View style={styles.useCard}><Text style={styles.cardIcon}>🎧</Text><Text style={styles.cardTitle}>Explore your interests</Text><Text style={styles.cardBody}>Talk about music, games, sport, films, books, or whatever keeps you curious.</Text></View>
        </View>
      </View>

      <View style={styles.stepsSection}>
        <Text style={styles.sectionEyebrow}>HOW IT WORKS</Text>
        <Text style={styles.sectionTitle}>A simple way to get into the flow.</Text>
        <Text style={styles.sectionBody}>No complicated setup. No pressure to be perfect. Just bring your curiosity and start where you are.</Text>
        <View style={styles.cardsRow}>
          <View style={styles.stepCard}><Text style={styles.stepNo}>01</Text><Text style={styles.cardTitle}>Pick your language</Text><Text style={styles.cardBody}>Choose the language you want to practise and get comfortable.</Text></View>
          <View style={styles.stepCard}><Text style={styles.stepNo}>02</Text><Text style={styles.cardTitle}>Start with anything</Text><Text style={styles.cardBody}>Message Bay about your day, ask a question, or choose a topic you love.</Text></View>
          <View style={styles.stepCard}><Text style={styles.stepNo}>03</Text><Text style={styles.cardTitle}>Keep growing</Text><Text style={styles.cardBody}>Use each conversation to discover expressions and build confidence.</Text></View>
        </View>
      </View>

      <View style={styles.languageMarquee}>
        <View style={styles.marqueeViewport}>
          <Animated.View style={[styles.marqueeTrack, { width: width * 2, transform: [{ translateX: marqueeShift }] }]}>
            {[0, 1].map((copy) => (
              <View key={copy} style={[styles.marqueeGroup, { width }]}>
                {['English', 'Español', 'Français', 'Deutsch', 'Português', 'Italiano', '日本語'].map((language) => (
                  <View key={language} style={styles.marqueeItem}>
                    <Text style={styles.marqueeLanguage}>{language}</Text>
                  </View>
                ))}
              </View>
            ))}
          </Animated.View>
        </View>
      </View>

      <View style={styles.pricingSection}>
        <Text style={styles.sectionEyebrow}>SIMPLE BY DESIGN</Text>
        <Text style={styles.sectionTitle}>Make room for better conversations.</Text>
        <Text style={styles.sectionBody}>Baybble is being developed with a simple, accessible experience in mind. Plan details will be announced as the product develops.</Text>
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>THE BAYBBLE EXPERIENCE</Text>
          <Text style={styles.priceTitle}>Start with Bay</Text>
          <Text style={styles.priceDescription}>Explore a more natural way to practise a language and discover what conversation-first learning can feel like.</Text>
          <Text style={styles.priceBullet}>✓  A friendly place to practise</Text>
          <Text style={styles.priceBullet}>✓  Conversations around your interests</Text>
          <Text style={styles.priceBullet}>✓  A relaxed way to build confidence</Text>
          <Text style={styles.priceNote}>Availability and pricing will be confirmed at launch.</Text>
        </View>
      </View>

      <View style={styles.faqSection}>
        <Text style={styles.sectionEyebrow}>GOOD TO KNOW</Text>
        <Text style={styles.sectionTitle}>A few things you might be wondering.</Text>
                  <Pressable key="0" style={styles.faqItem} onPress={() => setOpenFaq(openFaq === 0 ? -1 : 0)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>What is Baybble?</Text><Text style={styles.faqPlus}>{openFaq === 0 ? '−' : '+'}</Text></View>
            {openFaq === 0 && <Text style={styles.faqAnswer}>Baybble is an AI language-learning companion designed around natural conversation. The goal is to help you practise expressing yourself in a friendly, low-pressure environment.</Text>}
          </Pressable>
          <Pressable key="1" style={styles.faqItem} onPress={() => setOpenFaq(openFaq === 1 ? -1 : 1)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>Who is Baybble for?</Text><Text style={styles.faqPlus}>{openFaq === 1 ? '−' : '+'}</Text></View>
            {openFaq === 1 && <Text style={styles.faqAnswer}>Anyone who wants to become more comfortable using another language, whether you're just beginning or already know the basics.</Text>}
          </Pressable>
          <Pressable key="2" style={styles.faqItem} onPress={() => setOpenFaq(openFaq === 2 ? -1 : 2)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>Do I need to know what to say?</Text><Text style={styles.faqPlus}>{openFaq === 2 ? '−' : '+'}</Text></View>
            {openFaq === 2 && <Text style={styles.faqAnswer}>Not at all. You can begin with a greeting, ask a question, or choose a topic you enjoy. Getting started can be as simple as saying hello.</Text>}
          </Pressable>
          <Pressable key="3" style={styles.faqItem} onPress={() => setOpenFaq(openFaq === 3 ? -1 : 3)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>Is Baybble a traditional language course?</Text><Text style={styles.faqPlus}>{openFaq === 3 ? '−' : '+'}</Text></View>
            {openFaq === 3 && <Text style={styles.faqAnswer}>Baybble is conversation-first. Instead of making lessons and quizzes the centre of everything, it focuses on practising through relevant topics and conversations.</Text>}
          </Pressable>
          <Pressable key="4" style={styles.faqItem} onPress={() => setOpenFaq(openFaq === 4 ? -1 : 4)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>Which languages will be available?</Text><Text style={styles.faqPlus}>{openFaq === 4 ? '−' : '+'}</Text></View>
            {openFaq === 4 && <Text style={styles.faqAnswer}>Baybble is being shaped to support learners of multiple languages. The launch language list will be announced as development progresses.</Text>}
          </Pressable>
      </View>

      <View style={styles.finalCta}>
        <Text style={styles.ctaEyebrow}>YOUR NEXT CONVERSATION STARTS HERE</Text>
        <Text style={styles.ctaTitle}>A new language opens up a new world.</Text>
        <Text style={styles.ctaBody}>Bring your curiosity. Baybble will help you find the words.</Text>
        <Pressable style={styles.ctaButton}><Text style={styles.ctaButtonText}>Meet Bay  →</Text></Pressable>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerBrand}><View style={styles.logoMark}><View style={styles.logoBubbleOne}/><View style={styles.logoBubbleTwo}/></View><Text style={styles.footerWordmark}>Baybble</Text></View>
        <Text style={styles.footerTagline}>Your language. Your companion.</Text>
        <Text style={styles.copyright}>© 2026 Baybble. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: '100vh' as any, width: '100%', backgroundColor: '#ffffff' },
  pageContent: { width: '100%', alignItems: 'center', paddingBottom: 0 },
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
  loginButton: { paddingVertical: 11, paddingHorizontal: 4 },
  loginText: { color: '#292633', fontFamily: 'Manrope', fontWeight: '700', fontSize: 13 },
  startButton: { backgroundColor: '#17151f', borderRadius: 999, paddingVertical: 13, paddingHorizontal: 20, shadowColor: '#7c72a8', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  startText: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '700', fontSize: 13 },
  mobileNav: { width: '100%', paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, zIndex: 2 },
  hero: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingBottom: 70, zIndex: 1 },
  eyebrow: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 13, letterSpacing: 2.1, textAlign: 'center' },
  headline: { color: '#111018', fontFamily: 'Manrope', fontWeight: '800', letterSpacing: -2.4, textAlign: 'center', maxWidth: 820 },
  description: { color: '#393642', fontFamily: 'Manrope', fontWeight: '500', lineHeight: 27, textAlign: 'center', maxWidth: 610, marginTop: 22, marginBottom: 38 },
  searchBar: { width: '100%', maxWidth: 790, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#b8b0e9', borderRadius: 999, backgroundColor: '#ffffff', shadowColor: '#8c80c8', shadowOpacity: 0.17, shadowRadius: 28, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  searchIcon: { color: '#61588d', fontFamily: 'Manrope', fontSize: 31, marginRight: 15 },
  micIcon: { color: '#61588d', fontSize: 21, marginLeft: 12, marginRight: 2 },
  input: { flex: 1, minWidth: 0, color: '#17151f', fontFamily: 'Manrope', fontWeight: '600', fontSize: 16, paddingVertical: 20, outlineStyle: 'none' as any },
  searchCaption: { color: '#777281', fontFamily: 'Manrope', fontSize: 12, fontWeight: '500', marginTop: 15 },
  introBand: { width: '100%', paddingVertical: 58, paddingHorizontal: 26, alignItems: 'center', backgroundColor: '#f8f7fc' },
  introTitle: { color: '#17151f', fontFamily: 'Manrope', fontWeight: '800', fontSize: 32, letterSpacing: -1.2, textAlign: 'center' },
  introText: { color: '#5d5968', fontFamily: 'Manrope', fontSize: 15, lineHeight: 26, textAlign: 'center', maxWidth: 690, marginTop: 14 },
  contentSection: { width: '100%', paddingHorizontal: 28, paddingVertical: 88, alignItems: 'center' },
  sectionEyebrow: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 13, letterSpacing: 2.1, textAlign: 'center', marginBottom: 15 },
  sectionTitle: { color: '#17151f', fontFamily: 'Manrope', fontWeight: '800', fontSize: 42, lineHeight: 50, letterSpacing: -1.8, textAlign: 'center', maxWidth: 760 },
  sectionBody: { color: '#625e6c', fontFamily: 'Manrope', fontSize: 15, fontWeight: '500', lineHeight: 27, textAlign: 'center', maxWidth: 650, marginTop: 16, marginBottom: 40 },
  cardsRow: { width: '100%', maxWidth: 1120, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  infoCard: { flex: 1, minWidth: 220, minHeight: 235, borderRadius: 25, padding: 25 },
  cardIcon: { color: '#7669a8', fontSize: 24, marginBottom: 20 },
  cardTitle: { color: '#1c1925', fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', marginBottom: 10 },
  cardBody: { color: '#625e6c', fontFamily: 'Manrope', fontSize: 13, fontWeight: '500', lineHeight: 23 },
  chatSection: { width: '100%', backgroundColor: '#f8f7fc', paddingHorizontal: 28, paddingVertical: 86, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 45 },
  chatCopy: { flex: 1, minWidth: 260, maxWidth: 470 },
  checkLine: { color: '#393444', fontFamily: 'Manrope', fontSize: 13, fontWeight: '700', marginTop: 16 },
  chatCard: { width: '100%', maxWidth: 450, backgroundColor: '#ffffff', borderRadius: 26, padding: 22, shadowColor: '#6b5d9d', shadowOpacity: 0.1, shadowRadius: 25, shadowOffset: { width: 0, height: 12 }, elevation: 4 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f0eef4', marginBottom: 20 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#e9e7ff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#665b9d', fontSize: 22, fontWeight: '800' },
  chatName: { color: '#211e2a', fontFamily: 'Manrope', fontWeight: '800', fontSize: 14 },
  chatStatus: { color: '#8b8795', fontFamily: 'Manrope', fontSize: 10, marginTop: 2 },
  bayBubble: { alignSelf: 'flex-start', maxWidth: '88%', backgroundColor: '#f2f0fb', borderRadius: 17, borderBottomLeftRadius: 5, padding: 14, marginBottom: 13 },
  bubbleText: { color: '#373243', fontFamily: 'Manrope', fontSize: 12, lineHeight: 20 },
  youBubble: { alignSelf: 'flex-end', maxWidth: '88%', backgroundColor: '#252132', borderRadius: 17, borderBottomRightRadius: 5, padding: 14, marginBottom: 13 },
  youBubbleText: { color: '#ffffff', fontFamily: 'Manrope', fontSize: 12, lineHeight: 20 },
  chatFakeInput: { borderWidth: 1, borderColor: '#ece9f2', borderRadius: 999, padding: 15, marginTop: 8 },
  fakePlaceholder: { color: '#a09baa', fontFamily: 'Manrope', fontSize: 11 },
  chatFootnote: { color: '#a09baa', fontFamily: 'Manrope', fontSize: 9, textAlign: 'center', marginTop: 13 },
  useCard: { flex: 1, minWidth: 220, borderWidth: 1, borderColor: '#eeebf4', borderRadius: 22, padding: 23, backgroundColor: '#ffffff' },
  stepsSection: { width: '100%', backgroundColor: '#fbfaff', paddingHorizontal: 28, paddingVertical: 88, alignItems: 'center' },
  stepCard: { flex: 1, minWidth: 220, borderWidth: 1, borderColor: '#ece8f4', borderRadius: 22, padding: 24, backgroundColor: '#ffffff' },
  stepNo: { color: '#9387c7', fontFamily: 'Manrope', fontWeight: '800', fontSize: 12, letterSpacing: 1, marginBottom: 25 },
  languageMarquee: { width: '100%', backgroundColor: 'transparent', paddingTop: 27, paddingBottom: 30, overflow: 'hidden' },
  marqueeEyebrow: { color: '#b9afd9', fontFamily: 'Manrope', fontWeight: '800', fontSize: 9, letterSpacing: 2.5, textAlign: 'center', marginBottom: 22 },
  marqueeViewport: { width: '100%', overflow: 'hidden' },
  marqueeTrack: { flexDirection: 'row' },
  marqueeGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  marqueeItem: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  marqueeLanguage: { color: '#111111', fontFamily: 'Manrope', fontWeight: '800', fontSize: 16, letterSpacing: -0.3 },
  pricingSection: { width: '100%', paddingHorizontal: 24, paddingVertical: 90, alignItems: 'center' },
  priceCard: { width: '100%', maxWidth: 440, borderWidth: 1, borderColor: '#e9e5f1', borderRadius: 28, padding: 30, backgroundColor: '#ffffff', shadowColor: '#776a9f', shadowOpacity: 0.08, shadowRadius: 25, shadowOffset: { width: 0, height: 10 }, elevation: 3 },
  priceLabel: { color: '#7669a8', fontFamily: 'Manrope', fontWeight: '800', fontSize: 10, letterSpacing: 1.8 },
  priceTitle: { color: '#211d2a', fontFamily: 'Manrope', fontWeight: '800', fontSize: 25, marginTop: 20 },
  priceDescription: { color: '#686373', fontFamily: 'Manrope', fontSize: 13, lineHeight: 23, marginTop: 12, marginBottom: 22 },
  priceBullet: { color: '#413d4c', fontFamily: 'Manrope', fontSize: 12, fontWeight: '600', marginBottom: 13 },
  priceNote: { color: '#96919f', fontFamily: 'Manrope', fontSize: 10, textAlign: 'center', lineHeight: 17, marginTop: 12 },
  faqSection: { width: '100%', maxWidth: 850, paddingHorizontal: 28, paddingVertical: 80, alignSelf: 'center' },
  faqItem: { borderBottomWidth: 1, borderBottomColor: '#eeebf3', paddingVertical: 21 },
  faqQuestionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18 },
  faqQuestion: { color: '#252131', fontFamily: 'Manrope', fontWeight: '800', fontSize: 14, flex: 1 },
  faqPlus: { color: '#766aa8', fontFamily: 'Manrope', fontSize: 24 },
  faqAnswer: { color: '#686373', fontFamily: 'Manrope', fontSize: 13, lineHeight: 23, marginTop: 14, paddingRight: 25 },
  finalCta: { width: '100%', backgroundColor: '#f2efff', paddingHorizontal: 26, paddingVertical: 85, alignItems: 'center' },
  ctaEyebrow: { color: '#786ba9', fontFamily: 'Manrope', fontWeight: '800', fontSize: 10, letterSpacing: 2, textAlign: 'center', marginBottom: 18 },
  ctaTitle: { color: '#201d2b', fontFamily: 'Manrope', fontWeight: '800', fontSize: 44, letterSpacing: -1.8, textAlign: 'center', maxWidth: 720 },
  ctaBody: { color: '#625d6e', fontFamily: 'Manrope', fontSize: 14, textAlign: 'center', marginTop: 16 },
  ctaButton: { backgroundColor: '#211e2d', borderRadius: 999, paddingVertical: 15, paddingHorizontal: 25, marginTop: 28 },
  ctaButtonText: { color: '#ffffff', fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  footer: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 18, paddingHorizontal: 35, paddingVertical: 30, borderTopWidth: 1, borderTopColor: '#efedf3', backgroundColor: '#ffffff' },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  footerWordmark: { color: '#211e2d', fontFamily: 'Manrope', fontSize: 20, fontWeight: '800' },
  footerTagline: { color: '#777281', fontFamily: 'Manrope', fontSize: 11 },
  copyright: { color: '#9b96a2', fontFamily: 'Manrope', fontSize: 10 },

});
