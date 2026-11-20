import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutAnimation, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const navItems = ['Product', 'Use Cases', 'Pricing', 'Resources'];

export default function Home() {
  const { width } = useWindowDimensions();
  const [draft, setDraft] = useState('');
  const [openFaq, setOpenFaq] = useState(-1);
  const faqAnimations = useRef(Array.from({ length: 5 }, () => new Animated.Value(0))).current;
  const toggleFaq = (index: number) => {
    const next = openFaq === index ? -1 : index;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    faqAnimations.forEach((value, i) => Animated.timing(value, { toValue: i === next ? 1 : 0, duration: 220, useNativeDriver: true }).start());
    setOpenFaq(next);
  };
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
        <Text style={[styles.eyebrow, { marginBottom: compact ? 18 : 22 }]}>YOUR AI COMMUNICATION COMPANION</Text>
        <Text style={[styles.headline, { fontSize: compact ? 38 : 58, lineHeight: compact ? 46 : 68 }]}>
          Find your words.{ '\n' }Make every conversation count.
        </Text>
        <Text style={[styles.description, { fontSize: compact ? 14 : 16 }]}>
          Grow your confidence in how you communicate with Bay — your AI communication companion.
          Practise conversations, explore ideas, express yourself clearly, and grow one interaction at a time.
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
          <Ionicons name="mic-outline" size={21} color="#61588d" style={styles.micIcon} />
        </View>
        <Text style={styles.searchCaption}>Start with a thought. Bay will help you find the words.</Text>
      </View>
      <View style={styles.introBand}>
        <Text style={styles.introTitle}>A little more confidence. A lot more connection.</Text>
        <Text style={styles.introText}>Communication grows with practice. Baybble gives you a friendly place to explore ideas, express yourself, find your words, and keep the conversation going.</Text>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.sectionEyebrow}>MEET BAY</Text>
        <Text style={styles.sectionTitle}>A companion for the way you communicate.</Text>
        <Text style={styles.sectionBody}>More than a place to ask questions. A welcoming conversation space where you can practise, explore ideas, and express yourself with confidence.</Text>
        <View style={styles.cardsRow}>
          <View style={[styles.infoCard, { backgroundColor: '#f1efff' }]}><Text style={styles.cardIcon}>💬</Text><Text style={styles.cardTitle}>Explore anything</Text><Text style={styles.cardBody}>Your day, favourite films, travel, sport, or a completely random thought. Bring your interests and let the conversation flow.</Text></View>
          <View style={[styles.infoCard, { backgroundColor: '#fff0f8' }]}><Text style={styles.cardIcon}>✦</Text><Text style={styles.cardTitle}>Express yourself clearly</Text><Text style={styles.cardBody}>Work through your thoughts, discover clearer ways to say things, and communicate at your own pace.</Text></View>
          <View style={[styles.infoCard, { backgroundColor: '#edf4ff' }]}><Text style={styles.cardIcon}>🧠</Text><Text style={styles.cardTitle}>Grow your confidence</Text><Text style={styles.cardBody}>Practise everyday communication, explore new perspectives, and feel more comfortable expressing what you mean.</Text></View>
        </View>
      </View>

      <View style={styles.chatSection}>
        <View style={styles.chatCopy}>
          <Text style={styles.sectionEyebrow}>COMMUNICATION, WITHOUT THE PRESSURE</Text>
          <Text style={styles.sectionTitle}>Your world starts the conversation.</Text>
          <Text style={styles.sectionBody}>Talk through the things that matter to you. Explore a topic, find a clearer way to phrase something, and keep moving when you get stuck.</Text>
          <Text style={styles.checkLine}>✓  Explore ideas that interest you</Text>
          <Text style={styles.checkLine}>✓  Find clearer ways to express yourself</Text>
          <Text style={styles.checkLine}>✓  Build confidence through conversation</Text>
        </View>
        <View style={styles.chatCard}>
          <View style={styles.chatHeader}><View style={styles.avatar}><View style={styles.logoMark}><View style={styles.logoBubbleOne} /><View style={styles.logoBubbleTwo} /></View></View><View><Text style={styles.chatName}>Bay</Text><Text style={styles.chatStatus}>Your communication companion</Text></View></View>
          <View style={styles.bayBubble}><Text style={styles.bubbleText}>Hey! What's on your mind today?</Text></View>
          <View style={styles.youBubble}><Text style={styles.youBubbleText}>I've been thinking about starting something new, but I'm not sure what to choose.</Text></View>
          <View style={styles.bayBubble}><Text style={styles.bubbleText}>Let's explore a few ideas together. What kind of things do you usually enjoy?</Text></View>
          <View style={styles.chatFakeInput}><Text style={styles.fakePlaceholder}>Keep the conversation going...</Text><Ionicons name="mic-outline" size={18} color="#81799b" /></View>
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.sectionEyebrow}>MADE FOR EVERYDAY COMMUNICATION</Text>
        <Text style={styles.sectionTitle}>Your voice. Your reasons.</Text>
        <Text style={styles.sectionBody}>Make better communication part of the things you already love doing.</Text>
        <View style={styles.cardsRow}>
          <View style={styles.useCard}><Text style={styles.cardIcon}>✈</Text><Text style={styles.cardTitle}>Navigate new places</Text><Text style={styles.cardBody}>Feel more prepared for new experiences, from meeting people to asking for directions.</Text></View>
          <View style={styles.useCard}><Text style={styles.cardIcon}>☕</Text><Text style={styles.cardTitle}>Everyday communication</Text><Text style={styles.cardBody}>Feel more at ease with introductions, small talk, sharing opinions, and everyday situations.</Text></View>
          <View style={styles.useCard}><Text style={styles.cardIcon}>🎧</Text><Text style={styles.cardTitle}>Share your ideas</Text><Text style={styles.cardBody}>Explore music, games, sport, films, books, or whatever keeps you curious — and express what you think.</Text></View>
        </View>
      </View>

      <View style={styles.stepsSection}>
        <Text style={styles.sectionEyebrow}>HOW IT WORKS</Text>
        <Text style={styles.sectionTitle}>A simple way to get into the flow.</Text>
        <Text style={styles.sectionBody}>No complicated setup. No pressure to be perfect. Just bring your curiosity and start where you are.</Text>
        <View style={styles.cardsRow}>
          <View style={styles.stepCard}><Text style={styles.stepNo}>01</Text><Text style={styles.cardTitle}>Pick your language</Text><Text style={styles.cardBody}>Choose what you want to work on, from everyday communication to practising another language.</Text></View>
          <View style={styles.stepCard}><Text style={styles.stepNo}>02</Text><Text style={styles.cardTitle}>Start with anything</Text><Text style={styles.cardBody}>Message Bay about your day, ask a question, or choose a topic you love.</Text></View>
          <View style={styles.stepCard}><Text style={styles.stepNo}>03</Text><Text style={styles.cardTitle}>Keep growing</Text><Text style={styles.cardBody}>Use each conversation to express yourself more clearly and build confidence.</Text></View>
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
        <Text style={styles.sectionEyebrow}>PRICING</Text>
        <Text style={styles.sectionTitle}>Simple, transparent pricing.</Text>
        <Text style={styles.sectionBody}>A straightforward way to make room for better conversations. We’ll share the full plans before Baybble opens.</Text>
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>THE BAYBBLE EXPERIENCE</Text>
          <Text style={styles.priceTitle}>A better way to communicate.</Text>
          <View style={styles.priceComingRow}><Text style={styles.priceComing}>Coming soon</Text><Text style={styles.pricePeriod}>Plans & pricing</Text></View>
          <Text style={styles.priceDescription}>Baybble is being built around natural, everyday communication — not a one-size-fits-all approach.</Text>
          <Text style={styles.priceBullet}>✓  Natural conversations around real-life topics</Text>
          <Text style={styles.priceBullet}>✓  A friendly AI companion to help you find your words</Text>
          <Text style={styles.priceBullet}>✓  A relaxed space to build communication confidence</Text>
          <Text style={styles.priceNote}>No trial or subscription is being advertised until the plans are confirmed.</Text>
        </View>
      </View>

      <View style={styles.topicsSection}>
        <Text style={styles.sectionEyebrow}>EXPLORE REAL-LIFE CONVERSATIONS</Text>
        <Text style={styles.sectionTitle}>Confidence starts with the things you want to say.</Text>
        <Text style={styles.sectionBody}>Start with an everyday situation, follow your curiosity, and let the conversation go somewhere meaningful.</Text>
        <View style={styles.topicsGrid}>
          {[
            'I’m feeling tired', 'Making plans', 'Making reservations',
            'At the restaurant', 'Small talk', 'Asking for directions',
            'Shopping', 'Talking about the weather', 'Introducing yourself',
            'Daily routines', 'Past & future', 'Opinions & preferences'
          ].map((topic, index) => (
            <View key={topic} style={[styles.topicChip, index % 4 === 0 && styles.topicChipAccent]}>
              <Text style={styles.topicChipText}>{topic}</Text>
              <Ionicons name="arrow-up-outline" size={15} color="#77718c" />
            </View>
          ))}
        </View>
        <Text style={styles.topicsFootnote}>A few places to begin. Your conversations can go anywhere.</Text>
      </View>

      <View style={styles.faqSection}>
        <Text style={styles.sectionEyebrow}>GOOD TO KNOW</Text>
        <Text style={styles.sectionTitle}>A few things you might be wondering.</Text>
                  <Pressable key="0" style={styles.faqItem} onPress={() => toggleFaq(0)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>What is Baybble?</Text><Animated.View style={{ transform: [{ rotate: faqAnimations[0].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}><Ionicons name="chevron-down" size={19} color="#766aa8" /></Animated.View></View>
            {openFaq === 0 && <Text style={styles.faqAnswer}>Baybble is an AI communication companion designed around natural conversation. It helps you practise expressing yourself, explore ideas, and communicate with greater confidence in a friendly, low-pressure environment.</Text>}
          </Pressable>
          <Pressable key="1" style={styles.faqItem} onPress={() => toggleFaq(1)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>Who is Baybble for?</Text><Animated.View style={{ transform: [{ rotate: faqAnimations[1].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}><Ionicons name="chevron-down" size={19} color="#766aa8" /></Animated.View></View>
            {openFaq === 1 && <Text style={styles.faqAnswer}>Anyone who wants to communicate with more confidence — whether you're practising a language, exploring ideas, or finding clearer ways to express yourself.</Text>}
          </Pressable>
          <Pressable key="2" style={styles.faqItem} onPress={() => toggleFaq(2)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>Do I need to know what to say?</Text><Animated.View style={{ transform: [{ rotate: faqAnimations[2].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}><Ionicons name="chevron-down" size={19} color="#766aa8" /></Animated.View></View>
            {openFaq === 2 && <Text style={styles.faqAnswer}>Not at all. You can begin with a greeting, ask a question, or choose a topic you enjoy. Getting started can be as simple as saying hello.</Text>}
          </Pressable>
          <Pressable key="3" style={styles.faqItem} onPress={() => toggleFaq(3)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>Is Baybble just for learning languages?</Text><Animated.View style={{ transform: [{ rotate: faqAnimations[3].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}><Ionicons name="chevron-down" size={19} color="#766aa8" /></Animated.View></View>
            {openFaq === 3 && <Text style={styles.faqAnswer}>No. Language practice is one part of Baybble. It's designed as a communication companion for everyday conversations, expressing ideas, and building confidence.</Text>}
          </Pressable>
          <Pressable key="4" style={styles.faqItem} onPress={() => toggleFaq(4)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>Can I practise different languages?</Text><Animated.View style={{ transform: [{ rotate: faqAnimations[4].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}><Ionicons name="chevron-down" size={19} color="#766aa8" /></Animated.View></View>
            {openFaq === 4 && <Text style={styles.faqAnswer}>Yes. Baybble is being shaped to support conversations in multiple languages. The launch language list will be announced as development progresses.</Text>}
          </Pressable>
      </View>

      <View style={styles.finalCta}>
        <Text style={styles.ctaEyebrow}>YOUR NEXT CONVERSATION STARTS HERE</Text>
        <Text style={styles.ctaTitle}>Every conversation opens up a new possibility.</Text>
        <Text style={styles.ctaBody}>Bring your curiosity. Baybble will help you find the words.</Text>
        <Pressable style={styles.ctaButton}><Text style={styles.ctaButtonText}>Meet Bay  →</Text></Pressable>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerBrand}><View style={styles.logoMark}><View style={styles.logoBubbleOne}/><View style={styles.logoBubbleTwo}/></View><Text style={styles.footerWordmark}>Baybble</Text></View>
        <Text style={styles.footerTagline}>Your words. Your companion.</Text>
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
  micIcon: { marginLeft: 12, marginRight: 2 },
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
  chatFakeInput: { borderWidth: 1, borderColor: '#ece9f2', borderRadius: 999, paddingVertical: 13, paddingHorizontal: 15, marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
  pricingSection: { width: '100%', paddingHorizontal: 24, paddingVertical: 90, alignItems: 'center', backgroundColor: '#fbfaff' },
  priceCard: { width: '100%', maxWidth: 440, borderWidth: 1, borderColor: '#e9e5f1', borderRadius: 28, padding: 30, backgroundColor: '#ffffff', shadowColor: '#776a9f', shadowOpacity: 0.08, shadowRadius: 25, shadowOffset: { width: 0, height: 10 }, elevation: 3 },
  priceLabel: { color: '#7669a8', fontFamily: 'Manrope', fontWeight: '800', fontSize: 10, letterSpacing: 1.8 },
  priceTitle: { color: '#211d2a', fontFamily: 'Manrope', fontWeight: '800', fontSize: 25, marginTop: 20 },
  priceComingRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 16, marginBottom: 8 },
  priceComing: { color: '#211d2a', fontFamily: 'Manrope', fontWeight: '800', fontSize: 29, letterSpacing: -1 },
  pricePeriod: { color: '#888293', fontFamily: 'Manrope', fontSize: 12, fontWeight: '600' },
  priceDescription: { color: '#686373', fontFamily: 'Manrope', fontSize: 13, lineHeight: 23, marginTop: 12, marginBottom: 22 },
  priceBullet: { color: '#413d4c', fontFamily: 'Manrope', fontSize: 12, fontWeight: '600', marginBottom: 13 },
  priceNote: { color: '#96919f', fontFamily: 'Manrope', fontSize: 10, textAlign: 'center', lineHeight: 17, marginTop: 12 },
  topicsSection: { width: '100%', paddingHorizontal: 28, paddingVertical: 90, alignItems: 'center' },
  topicsGrid: { width: '100%', maxWidth: 1000, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  topicChip: { minHeight: 58, minWidth: 190, flexGrow: 1, maxWidth: 235, borderWidth: 1, borderColor: '#e9e6f0', borderRadius: 16, paddingHorizontal: 17, paddingVertical: 14, backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  topicChipAccent: { backgroundColor: '#f3f0ff', borderColor: '#e8e2ff' },
  topicChipText: { color: '#262231', fontFamily: 'Manrope', fontWeight: '700', fontSize: 12, flexShrink: 1 },
  topicsFootnote: { color: '#888293', fontFamily: 'Manrope', fontSize: 11, textAlign: 'center', marginTop: 25 },
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
