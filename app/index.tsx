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
        <Text style={[styles.eyebrow, { marginBottom: compact ? 18 : 22 }]}>AI-POWERED PROBLEM SOLVING</Text>
        <Text style={[styles.headline, { fontSize: compact ? 38 : 58, lineHeight: compact ? 46 : 68 }]}>
          Bring any problem.{ '\n' }Find a way forward.
        </Text>
        <Text style={[styles.description, { fontSize: compact ? 14 : 16 }]}>
          Describe a problem, question or idea. Baybble helps you understand it, explore possible solutions and decide what to do next.
        </Text>
        <View style={[styles.searchBar, { minHeight: compact ? 68 : 82, paddingHorizontal: compact ? 18 : 26 }]}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="What's on your mind?"
            placeholderTextColor="#77718c"
            style={styles.input}
            returnKeyType="send"
            accessibilityLabel="Message Bay"
          />
          <Ionicons name="mic-outline" size={21} color="#61588d" style={styles.micIcon} />
        </View>
        <Text style={styles.searchCaption}>Start with the challenge. Baybble helps you find a practical way forward.</Text>
      </View>
      <View style={styles.introBand}>
        <Text style={styles.introTitle}>Less uncertainty. More ways forward.</Text>
        <Text style={styles.introText}>Life brings questions, decisions and challenges. Baybble gives you a place to think them through, understand your options and decide what to do next.</Text>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.sectionEyebrow}>WHAT BAYBBLE DOES</Text>
        <Text style={styles.sectionTitle}>A clearer way to work through life's challenges.</Text>
        <Text style={styles.sectionBody}>Baybble goes beyond quick answers: it helps break down complex problems, compare possible approaches and create practical next steps.</Text>
        <View style={styles.cardsRow}>
          <View style={[styles.infoCard, { backgroundColor: '#f1efff' }]}><Text style={styles.cardIcon}>💬</Text><Text style={styles.cardTitle}>Make sense of a problem</Text><Text style={styles.cardBody}>Explain what's happening in your own words. Bay helps identify the real challenge and the details that matter.</Text></View>
          <View style={[styles.infoCard, { backgroundColor: '#fff0f8' }]}><Text style={styles.cardIcon}>✦</Text><Text style={styles.cardTitle}>Explore your options</Text><Text style={styles.cardBody}>Compare different approaches, consider trade-offs and discover possibilities you may not have considered.</Text></View>
          <View style={[styles.infoCard, { backgroundColor: '#edf4ff' }]}><Text style={styles.cardIcon}>🧠</Text><Text style={styles.cardTitle}>Turn ideas into action</Text><Text style={styles.cardBody}>Break a big challenge into manageable steps, build a plan and work out what to do next.</Text></View>
        </View>
      </View>

      <View style={styles.chatSection}>
        <View style={styles.chatCopy}>
          <Text style={styles.sectionEyebrow}>PROBLEM-SOLVING, WITHOUT THE OVERWHELM</Text>
          <Text style={styles.sectionTitle}>Every problem starts somewhere.</Text>
          <Text style={styles.sectionBody}>Bring a decision, a difficult task or an idea you don't know how to execute. Bay asks useful questions, thinks through the situation with you and helps find a practical way forward.</Text>
          <Text style={styles.checkLine}>✓  Understand what's really getting in the way</Text>
          <Text style={styles.checkLine}>✓  Explore options and possible solutions</Text>
          <Text style={styles.checkLine}>✓  Turn the next step into an action plan</Text>
        </View>
        <View style={styles.chatCard}>
          <View style={styles.chatHeader}><View style={styles.avatar}><View style={styles.logoMark}><View style={styles.logoBubbleOne} /><View style={styles.logoBubbleTwo} /></View></View><View><Text style={styles.chatName}>Bay</Text><Text style={styles.chatStatus}>AI problem-solving platform</Text></View></View>
          <View style={styles.bayBubble}><Text style={styles.bubbleText}>What are you trying to solve? Share the situation and I'll help break it down.</Text></View>
          <View style={styles.youBubble}><Text style={styles.youBubbleText}>I want to start a business, but I have too many ideas and don't know where to begin.</Text></View>
          <View style={styles.bayBubble}><Text style={styles.bubbleText}>Let's compare your ideas. What are you considering, and what matters most when choosing one?</Text></View>
          <View style={styles.chatFakeInput}><Text style={styles.fakePlaceholder}>Tell Bay a little more...</Text><Ionicons name="mic-outline" size={18} color="#81799b" /></View>
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.sectionEyebrow}>MADE FOR REAL-LIFE CHALLENGES</Text>
        <Text style={styles.sectionTitle}>Whatever you're working through.</Text>
        <Text style={styles.sectionBody}>From everyday decisions to ambitious ideas, bring the things you want to figure out.</Text>
        <View style={styles.cardsRow}>
          <View style={styles.useCard}><Ionicons name="airplane-outline" size={24} color="#000000" style={styles.cardIcon} /><Text style={styles.cardTitle}>Make a difficult decision</Text><Text style={styles.cardBody}>Lay out what matters, compare your options and think through the consequences before choosing.</Text></View>
          <View style={styles.useCard}><Text style={styles.cardIcon}>☕</Text><Text style={styles.cardTitle}>Organise your next steps</Text><Text style={styles.cardBody}>Turn a busy week, a complicated task or a big goal into a manageable plan.</Text></View>
          <View style={styles.useCard}><Text style={styles.cardIcon}>🎧</Text><Text style={styles.cardTitle}>Bring an idea to life</Text><Text style={styles.cardBody}>Shape an early idea, identify what it needs and map out a realistic way to get started.</Text></View>
        </View>
      </View>

      <View style={styles.stepsSection}>
        <Text style={styles.sectionEyebrow}>HOW IT WORKS</Text>
        <Text style={styles.sectionTitle}>A simple way to find a way forward.</Text>
        <Text style={styles.sectionBody}>No complicated setup. No need to have everything figured out. Just explain what's happening and start from there.</Text>
        <View style={styles.cardsRow}>
          <View style={styles.stepCard}><Text style={styles.stepNo}>01</Text><Text style={styles.cardTitle}>Explain the situation</Text><Text style={styles.cardBody}>Tell Bay what's happening, what you're trying to achieve and what's making it difficult.</Text></View>
          <View style={styles.stepCard}><Text style={styles.stepNo}>02</Text><Text style={styles.cardTitle}>Think it through together</Text><Text style={styles.cardBody}>Bay asks relevant questions, helps clarify the problem and explores possible approaches with you.</Text></View>
          <View style={styles.stepCard}><Text style={styles.stepNo}>03</Text><Text style={styles.cardTitle}>Choose your next step</Text><Text style={styles.cardBody}>Leave with a clearer understanding, practical options and a next step you can act on.</Text></View>
        </View>
      </View>

      <View style={styles.languageMarquee}>
        <View style={styles.marqueeViewport}>
          <Animated.View style={[styles.marqueeTrack, { width: width * 2, transform: [{ translateX: marqueeShift }] }]}>
            {[0, 1].map((copy) => (
              <View key={copy} style={[styles.marqueeGroup, { width }]}>
                {['Think clearly', 'Explore options', 'Solve problems', 'Make a plan', 'Take action', 'Learn faster', 'Move forward'].map((language) => (
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
        <Text style={styles.sectionTitle}>Plans built around how you use Baybble.</Text>
        <Text style={styles.sectionBody}>Pricing and plan details will be announced before launch.</Text>
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>THE BAYBBLE EXPERIENCE</Text>
          <Text style={styles.priceTitle}>A clearer way to solve problems.</Text>
          <View style={styles.priceComingRow}><Text style={styles.priceComing}>Coming soon</Text><Text style={styles.pricePeriod}>Plans & pricing</Text></View>
          <Text style={styles.priceDescription}>Baybble is being built to help people think through real challenges and move from uncertainty to action.</Text>
          <Text style={styles.priceBullet}>✓  Natural voice and text conversations</Text>
          <Text style={styles.priceBullet}>✓  Help understanding problems and exploring solutions</Text>
          <Text style={styles.priceBullet}>✓  Practical plans and clear next steps</Text>
          <Text style={styles.priceNote}>No trial or subscription is being advertised until the plans are confirmed.</Text>
        </View>
      </View>

      <View style={styles.topicsSection}>
        <Text style={styles.sectionEyebrow}>START WITH WHAT YOU NEED TO SOLVE</Text>
        <Text style={styles.sectionTitle}>Every challenge has a place to start.</Text>
        <Text style={styles.sectionBody}>Choose a starting point or describe your own challenge. Bay will help you work through it.</Text>
        <View style={styles.topicsGrid}>
          {[
            'I have a business idea', 'Help me make a decision', 'Plan my week',
            'Understand this topic', 'Fix my website', 'Organise a project',
            'Prepare for a meeting', 'Solve a work problem', 'Set a goal',
            'Compare my options', 'Learn something new', 'Where do I start?'
          ].map((topic, index) => (
            <View key={topic} style={[styles.topicChip, index % 4 === 0 && styles.topicChipAccent]}>
              <Text style={styles.topicChipText}>{topic}</Text>
              <Ionicons name="arrow-up-outline" size={15} color="#77718c" />
            </View>
          ))}
        </View>
        <Text style={styles.topicsFootnote}>A few places to begin. Or bring a challenge of your own.</Text>
      </View>

      <View style={styles.faqSection}>
        <Text style={styles.sectionEyebrow}>GET TO KNOW BAYBBLE</Text>
        <Text style={styles.sectionTitle}>Frequently asked questions</Text>
                  <Pressable key="0" style={styles.faqItem} onPress={() => toggleFaq(0)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>What is Baybble?</Text><Animated.View style={{ transform: [{ rotate: faqAnimations[0].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}><Ionicons name="chevron-down" size={19} color="#766aa8" /></Animated.View></View>
            {openFaq === 0 && <Text style={styles.faqAnswer}>Baybble is an AI-powered problem-solving platform. Describe a challenge, question or idea, and it helps you understand the situation, evaluate options and identify practical next steps.</Text>}
          </Pressable>
          <Pressable key="1" style={styles.faqItem} onPress={() => toggleFaq(1)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>Who is Baybble for?</Text><Animated.View style={{ transform: [{ rotate: faqAnimations[1].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}><Ionicons name="chevron-down" size={19} color="#766aa8" /></Animated.View></View>
            {openFaq === 1 && <Text style={styles.faqAnswer}>Anyone who wants help thinking through everyday challenges, making decisions, learning something difficult, organising plans or developing an idea.</Text>}
          </Pressable>
          <Pressable key="2" style={styles.faqItem} onPress={() => toggleFaq(2)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>Do I need to know exactly what the problem is?</Text><Animated.View style={{ transform: [{ rotate: faqAnimations[2].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}><Ionicons name="chevron-down" size={19} color="#766aa8" /></Animated.View></View>
            {openFaq === 2 && <Text style={styles.faqAnswer}>Not at all. Start with whatever you know, even if it's messy or incomplete. Bay can ask questions to help clarify what's going on.</Text>}
          </Pressable>
          <Pressable key="3" style={styles.faqItem} onPress={() => toggleFaq(3)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>Can Baybble help with different kinds of problems?</Text><Animated.View style={{ transform: [{ rotate: faqAnimations[3].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}><Ionicons name="chevron-down" size={19} color="#766aa8" /></Animated.View></View>
            {openFaq === 3 && <Text style={styles.faqAnswer}>Yes. You can bring decisions, projects, learning questions, work challenges, business ideas and many other everyday problems. Bay will help you think them through.</Text>}
          </Pressable>
          <Pressable key="4" style={styles.faqItem} onPress={() => toggleFaq(4)}>
            <View style={styles.faqQuestionRow}><Text style={styles.faqQuestion}>Can I speak or type to Bay?</Text><Animated.View style={{ transform: [{ rotate: faqAnimations[4].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}><Ionicons name="chevron-down" size={19} color="#766aa8" /></Animated.View></View>
            {openFaq === 4 && <Text style={styles.faqAnswer}>The vision includes both voice and text, so you can choose the way that feels most natural. Available features will be announced as development progresses.</Text>}
          </Pressable>
      </View>

      <View style={styles.finalCta}>
        <Text style={styles.ctaEyebrow}>YOUR NEXT STEP STARTS HERE</Text>
        <Text style={styles.ctaTitle}>Turn your next challenge into a clear next step.</Text>
        <Text style={styles.ctaBody}>Bring a challenge. Find a practical way forward.</Text>
        <Pressable style={styles.ctaButton}><Text style={styles.ctaButtonText}>Start with Bay  →</Text></Pressable>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerBrand}><View style={styles.logoMark}><View style={styles.logoBubbleOne}/><View style={styles.logoBubbleTwo}/></View><Text style={styles.footerWordmark}>Baybble</Text></View>
        <Text style={styles.footerTagline}>Your problems. A clearer way forward.</Text>
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
  wordmark: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 25, letterSpacing: -1.2 },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  navLink: { paddingVertical: 10, paddingHorizontal: 3 },
  navText: { color: '#000000', fontFamily: 'Manrope', fontWeight: '600', fontSize: 13 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 17 },
  loginButton: { paddingVertical: 11, paddingHorizontal: 4 },
  loginText: { color: '#000000', fontFamily: 'Manrope', fontWeight: '700', fontSize: 13 },
  startButton: { backgroundColor: '#17151f', borderRadius: 999, paddingVertical: 13, paddingHorizontal: 20, shadowColor: '#7c72a8', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  startText: { color: '#000000', fontFamily: 'Manrope', fontWeight: '700', fontSize: 13 },
  mobileNav: { width: '100%', paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, zIndex: 2 },
  hero: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingBottom: 70, zIndex: 1 },
  eyebrow: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 13, letterSpacing: 2.1, textAlign: 'center' },
  headline: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', letterSpacing: -2.4, textAlign: 'center', maxWidth: 820 },
  description: { color: '#000000', fontFamily: 'Manrope', fontWeight: '500', lineHeight: 27, textAlign: 'center', maxWidth: 610, marginTop: 22, marginBottom: 38 },
  searchBar: { width: '100%', maxWidth: 790, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#b8b0e9', borderRadius: 999, backgroundColor: '#ffffff', shadowColor: '#8c80c8', shadowOpacity: 0.17, shadowRadius: 28, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  searchIcon: { color: '#000000', fontFamily: 'Manrope', fontSize: 31, marginRight: 15 },
  micIcon: { marginLeft: 12, marginRight: 2 },
  input: { flex: 1, minWidth: 0, color: '#000000', fontFamily: 'Manrope', fontWeight: '600', fontSize: 16, paddingVertical: 20, outlineStyle: 'none' as any },
  searchCaption: { color: '#000000', fontFamily: 'Manrope', fontSize: 12, fontWeight: '500', marginTop: 15 },
  introBand: { width: '100%', paddingVertical: 58, paddingHorizontal: 26, alignItems: 'center', backgroundColor: '#f8f7fc' },
  introTitle: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 32, letterSpacing: -1.2, textAlign: 'center' },
  introText: { color: '#000000', fontFamily: 'Manrope', fontSize: 15, lineHeight: 26, textAlign: 'center', maxWidth: 690, marginTop: 14 },
  contentSection: { width: '100%', paddingHorizontal: 28, paddingVertical: 88, alignItems: 'center' },
  sectionEyebrow: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 13, letterSpacing: 2.1, textAlign: 'center', marginBottom: 15 },
  sectionTitle: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 42, lineHeight: 50, letterSpacing: -1.8, textAlign: 'center', maxWidth: 760 },
  sectionBody: { color: '#000000', fontFamily: 'Manrope', fontSize: 15, fontWeight: '500', lineHeight: 27, textAlign: 'center', maxWidth: 650, marginTop: 16, marginBottom: 40 },
  cardsRow: { width: '100%', maxWidth: 1120, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  infoCard: { flex: 1, minWidth: 220, minHeight: 235, borderRadius: 25, padding: 25 },
  cardIcon: { color: '#000000', fontSize: 24, marginBottom: 20 },
  cardTitle: { color: '#000000', fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', marginBottom: 10 },
  cardBody: { color: '#000000', fontFamily: 'Manrope', fontSize: 13, fontWeight: '500', lineHeight: 23 },
  chatSection: { width: '100%', backgroundColor: '#f8f7fc', paddingHorizontal: 28, paddingVertical: 86, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 45 },
  chatCopy: { flex: 1, minWidth: 260, maxWidth: 470 },
  checkLine: { color: '#000000', fontFamily: 'Manrope', fontSize: 13, fontWeight: '700', marginTop: 16 },
  chatCard: { width: '100%', maxWidth: 450, backgroundColor: '#ffffff', borderRadius: 26, padding: 22, shadowColor: '#6b5d9d', shadowOpacity: 0.1, shadowRadius: 25, shadowOffset: { width: 0, height: 12 }, elevation: 4 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f0eef4', marginBottom: 20 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#e9e7ff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#000000', fontSize: 22, fontWeight: '800' },
  chatName: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 14 },
  chatStatus: { color: '#000000', fontFamily: 'Manrope', fontSize: 10, marginTop: 2 },
  bayBubble: { alignSelf: 'flex-start', maxWidth: '88%', backgroundColor: '#f2f0fb', borderRadius: 17, borderBottomLeftRadius: 5, padding: 14, marginBottom: 13 },
  bubbleText: { color: '#000000', fontFamily: 'Manrope', fontSize: 12, lineHeight: 20 },
  youBubble: { alignSelf: 'flex-end', maxWidth: '88%', backgroundColor: '#252132', borderRadius: 17, borderBottomRightRadius: 5, padding: 14, marginBottom: 13 },
  youBubbleText: { color: '#000000', fontFamily: 'Manrope', fontSize: 12, lineHeight: 20 },
  chatFakeInput: { borderWidth: 1, borderColor: '#ece9f2', borderRadius: 999, paddingVertical: 13, paddingHorizontal: 15, marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fakePlaceholder: { color: '#000000', fontFamily: 'Manrope', fontSize: 11 },
  chatFootnote: { color: '#000000', fontFamily: 'Manrope', fontSize: 9, textAlign: 'center', marginTop: 13 },
  useCard: { flex: 1, minWidth: 220, borderWidth: 1, borderColor: '#eeebf4', borderRadius: 22, padding: 23, backgroundColor: '#ffffff' },
  stepsSection: { width: '100%', backgroundColor: '#fbfaff', paddingHorizontal: 28, paddingVertical: 88, alignItems: 'center' },
  stepCard: { flex: 1, minWidth: 220, borderWidth: 1, borderColor: '#ece8f4', borderRadius: 22, padding: 24, backgroundColor: '#ffffff' },
  stepNo: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 12, letterSpacing: 1, marginBottom: 25 },
  languageMarquee: { width: '100%', backgroundColor: 'transparent', paddingTop: 27, paddingBottom: 30, overflow: 'hidden' },
  marqueeEyebrow: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 9, letterSpacing: 2.5, textAlign: 'center', marginBottom: 22 },
  marqueeViewport: { width: '100%', overflow: 'hidden' },
  marqueeTrack: { flexDirection: 'row' },
  marqueeGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  marqueeItem: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  marqueeLanguage: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 16, letterSpacing: -0.3 },
  pricingSection: { width: '100%', paddingHorizontal: 24, paddingVertical: 90, alignItems: 'center', backgroundColor: '#fbfaff' },
  priceCard: { width: '100%', maxWidth: 440, borderWidth: 1, borderColor: '#e9e5f1', borderRadius: 28, padding: 30, backgroundColor: '#ffffff', shadowColor: '#776a9f', shadowOpacity: 0.08, shadowRadius: 25, shadowOffset: { width: 0, height: 10 }, elevation: 3 },
  priceLabel: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 10, letterSpacing: 1.8 },
  priceTitle: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 25, marginTop: 20 },
  priceComingRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 16, marginBottom: 8 },
  priceComing: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 29, letterSpacing: -1 },
  pricePeriod: { color: '#000000', fontFamily: 'Manrope', fontSize: 12, fontWeight: '600' },
  priceDescription: { color: '#000000', fontFamily: 'Manrope', fontSize: 13, lineHeight: 23, marginTop: 12, marginBottom: 22 },
  priceBullet: { color: '#000000', fontFamily: 'Manrope', fontSize: 12, fontWeight: '600', marginBottom: 13 },
  priceNote: { color: '#000000', fontFamily: 'Manrope', fontSize: 10, textAlign: 'center', lineHeight: 17, marginTop: 12 },
  topicsSection: { width: '100%', paddingHorizontal: 28, paddingVertical: 90, alignItems: 'center' },
  topicsGrid: { width: '100%', maxWidth: 1000, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  topicChip: { minHeight: 58, minWidth: 190, flexGrow: 1, maxWidth: 235, borderWidth: 1, borderColor: '#e9e6f0', borderRadius: 16, paddingHorizontal: 17, paddingVertical: 14, backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  topicChipAccent: { backgroundColor: '#f3f0ff', borderColor: '#e8e2ff' },
  topicChipText: { color: '#000000', fontFamily: 'Manrope', fontWeight: '700', fontSize: 12, flexShrink: 1 },
  topicsFootnote: { color: '#000000', fontFamily: 'Manrope', fontSize: 11, textAlign: 'center', marginTop: 25 },
  faqSection: { width: '100%', maxWidth: 850, paddingHorizontal: 28, paddingVertical: 80, alignSelf: 'center' },
  faqItem: { borderBottomWidth: 1, borderBottomColor: '#eeebf3', paddingVertical: 21 },
  faqQuestionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18 },
  faqQuestion: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 14, flex: 1 },
  faqPlus: { color: '#000000', fontFamily: 'Manrope', fontSize: 24 },
  faqAnswer: { color: '#000000', fontFamily: 'Manrope', fontSize: 13, lineHeight: 23, marginTop: 14, paddingRight: 25 },
  finalCta: { width: '100%', backgroundColor: '#f2efff', paddingHorizontal: 26, paddingVertical: 85, alignItems: 'center' },
  ctaEyebrow: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 10, letterSpacing: 2, textAlign: 'center', marginBottom: 18 },
  ctaTitle: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 44, letterSpacing: -1.8, textAlign: 'center', maxWidth: 720 },
  ctaBody: { color: '#000000', fontFamily: 'Manrope', fontSize: 14, textAlign: 'center', marginTop: 16 },
  ctaButton: { backgroundColor: '#211e2d', borderRadius: 999, paddingVertical: 15, paddingHorizontal: 25, marginTop: 28 },
  ctaButtonText: { color: '#000000', fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  footer: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 18, paddingHorizontal: 35, paddingVertical: 30, borderTopWidth: 1, borderTopColor: '#efedf3', backgroundColor: '#ffffff' },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  footerWordmark: { color: '#000000', fontFamily: 'Manrope', fontSize: 20, fontWeight: '800' },
  footerTagline: { color: '#000000', fontFamily: 'Manrope', fontSize: 11 },
  copyright: { color: '#000000', fontFamily: 'Manrope', fontSize: 10 },

});
