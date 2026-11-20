import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

const BAYBBLE_LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><mask id="transparent-gap"><rect width="64" height="64" fill="white"/><circle cx="43" cy="43" r="17" fill="none" stroke="black" stroke-width="4"/></mask></defs><g mask="url(#transparent-gap)"><circle cx="24" cy="23" r="23" fill="#ffffff"/><circle cx="43" cy="43" r="17" fill="#ffffff"/></g></svg>';

function BaybbleLogo() {
  return (
    <View style={styles.logoMark} accessibilityLabel="Baybble logo">
      <View style={styles.logoBubbleOne} />
      <View style={styles.logoBubbleTwo} />
    </View>
  );
}

function SectionHeading({ eyebrow, title, body, compact }: { eyebrow: string; title: string; body?: string; compact: boolean }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>{title}</Text>
      {body ? <Text style={styles.sectionBody}>{body}</Text> : null}
    </View>
  );
}

export default function Home() {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const [draft, setDraft] = useState('');
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const abortController = useRef<AbortController | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transition = useRef(new Animated.Value(0)).current;
  const openChat = () => {
    if (chatMode || isTransitioning) return;
    setIsTransitioning(true);
    Animated.timing(transition, { toValue: 1, duration: 360, useNativeDriver: true }).start(() => {
      setChatMode(true);
      transition.setValue(0);
      Animated.timing(transition, { toValue: 1, duration: 520, useNativeDriver: true }).start(() => setIsTransitioning(false));
    });
  };
  const stopGeneration = () => {
    abortController.current?.abort();
    abortController.current = null;
    setIsSending(false);
    setMessages((current) => current.filter((item, index) =>
      !(index === current.length - 1 && item.role === 'assistant' && !item.content)
    ));
  };

  const sendMessage = async () => {
    const message = draft.trim();
    if (!message || isSending) return;
    const history = [...messages, { role: 'user' as const, content: message }].slice(-20);
    setMessages([...history, { role: 'assistant', content: '' }]);
    setDraft('');
    setChatError('');
    setIsSending(true);

    const controller = new AbortController();
    abortController.current = controller;
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal
      });
      if (!response.ok) {
        let reason = 'Baybble could not respond. Please try again.';
        try {
          const data = await response.json();
          if (typeof data.error === 'string') reason = data.error;
        } catch {}
        throw new Error(reason);
      }
      if (!response.body) throw new Error('The response stream was unavailable.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const chunk = JSON.parse(payload);
            const token = typeof chunk.response === 'string'
              ? chunk.response
              : typeof chunk.choices?.[0]?.delta?.content === 'string'
                ? chunk.choices[0].delta.content
                : '';
            if (token) {
              setMessages((current) => current.map((item, index) =>
                index === current.length - 1 && item.role === 'assistant'
                  ? { ...item, content: item.content + token }
                  : item
              ));
            }
          } catch {}
        }
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        setChatError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
        setMessages((current) => current.filter((item, index) =>
          !(index === current.length - 1 && item.role === 'assistant' && !item.content)
        ));
      }
    } finally {
      if (abortController.current === controller) abortController.current = null;
      setIsSending(false);
    }
  };
  const gradientRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(Animated.timing(gradientRotation, { toValue: 1, duration: 6500, useNativeDriver: false }));
    animation.start();
    return () => animation.stop();
  }, [gradientRotation]);

  const gradientAngle = gradientRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.page} showsVerticalScrollIndicator>
      <View style={[styles.header, chatMode && styles.chatHeader, { paddingHorizontal: compact ? 20 : 52 }]}>
        <Pressable accessibilityRole="link" accessibilityLabel="Baybble home" style={styles.brand}>
          <BaybbleLogo />
          <Text style={styles.wordmark}>Baybble</Text>
        </Pressable>

        {!compact && !chatMode && (
          <View style={[styles.nav, styles.navCentered]}>
            {['Product', 'Use Cases', 'Pricing', 'Resources'].map((item) => (
              <Pressable key={item} style={styles.navLink}>
                <Text style={styles.navText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.headerActions}>
          {chatMode ? (
            <Pressable style={styles.newChatButton} onPress={() => { stopGeneration(); setMessages([]); setDraft(''); setChatError(''); }}>
              <Text style={styles.newChatText}>New chat</Text>
            </Pressable>
          ) : (
            <>
              <Pressable style={styles.loginButton}>
                <Text style={styles.loginText}>Log In</Text>
              </Pressable>
              <Pressable style={styles.startButton}>
                <Text style={styles.startText}>{compact ? 'Get Started' : 'Get Started Free'}</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      {compact && !chatMode && (
        <View style={styles.mobileNav}>
          {['Product', 'Use Cases', 'Pricing', 'Resources'].map((item) => (
            <Pressable key={item} style={styles.navLink}>
              <Text style={styles.navText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {!chatMode ? (
        <Animated.View style={[styles.hero, { opacity: transition.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [0, -28] }), scale: transition.interpolate({ inputRange: [0, 1], outputRange: [1, 0.975] }) }] }, { paddingHorizontal: compact ? 22 : 56, paddingTop: 0, minHeight: compact ? 'calc(100vh - 140px)' as any : 'calc(100vh - 92px)' as any }]}>
          <Pressable style={[styles.searchFrame, { minHeight: compact ? 72 : 86 }]} onPress={openChat}>
            <Animated.View pointerEvents="none" style={[styles.searchGradient, { transform: [{ rotate: gradientAngle }] }]} />
            <View style={[styles.searchBar, { minHeight: compact ? 68 : 82, paddingHorizontal: compact ? 18 : 26 }]}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onFocus={openChat}
                placeholder="What's on your mind?"
                placeholderTextColor="#929292"
                style={styles.input}
                returnKeyType="send"
                accessibilityLabel="Start a conversation with Baybble"
              />
            </View>
          </Pressable>
          <Text style={styles.searchCaption}>Start with the challenge. Baybble helps you find a practical way forward.</Text>
          <Text style={styles.heroFootnote}>A clearer way to think through challenges and possibilities.</Text>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.chatWorkspace, { opacity: transition, transform: [{ translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }] }]}>
          <ScrollView style={styles.conversationScroll} contentContainerStyle={styles.conversationContent} showsVerticalScrollIndicator={false}>
            {messages.length === 0 ? (
              <View style={styles.emptyConversation}>
                <Text style={styles.chatGreeting}>Where should we start?</Text>
                <Text style={styles.chatSubheading}>Tell Baybble what's on your mind. We'll work through it step by step.</Text>
                <Text style={styles.chatNotice}>Your Baybble conversation starts here.</Text>
              </View>
            ) : (
              <View style={styles.messageList}>
                {messages.map((message, index) => (
                  message.role === 'user' ? (
                    <View key={index} style={styles.userMessage}>
                      <Text style={styles.userMessageText}>{message.content}</Text>
                    </View>
                  ) : (
                    <View key={index} style={styles.assistantMessage}>
                      {message.content ? (
                        <Text style={styles.assistantMessageText}>{message.content}</Text>
                      ) : isSending ? (
                        <Text style={styles.thinkingText}>Baybble is thinking...</Text>
                      ) : null}
                    </View>
                  )
                ))}
                {chatError ? <Text style={styles.chatError}>{chatError}</Text> : null}
              </View>
            )}
          </ScrollView>
          <View style={styles.composerArea}>
            <View style={styles.composerFrame}>
              <Animated.View pointerEvents="none" style={[styles.searchGradient, { transform: [{ rotate: gradientAngle }] }]} />
              <View style={styles.composerInner}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Message Baybble"
                  placeholderTextColor="#929292"
                  style={styles.composerInput}
                  multiline
                  autoFocus
                  accessibilityLabel="Message Baybble"
                  onSubmitEditing={sendMessage}
                />
              </View>
            </View>
            <Text style={styles.composerDisclaimer}>Baybble can make mistakes once AI responses are enabled. Check important information.</Text>
          </View>
        </Animated.View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: '100vh' as any, width: '100%', backgroundColor: '#080808' },
  page: { width: '100%', alignItems: 'center', paddingBottom: 0 },
  header: { width: '100%', minHeight: 92, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 2, paddingVertical: 16 },
  chatHeader: { borderBottomWidth: 1, borderBottomColor: '#242424' },
  newChatButton: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#343434', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 15 },
  newChatText: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '700', fontSize: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoMark: { width: 32, height: 32, position: 'relative' },
  logoBubbleOne: { position: 'absolute', width: 23, height: 23, borderRadius: 12, backgroundColor: '#ffffff', top: 0, left: 0 },
  logoBubbleTwo: { position: 'absolute', width: 17, height: 17, borderRadius: 9, backgroundColor: '#ffffff', bottom: 2, right: 2, borderWidth: 2, borderColor: '#080808' },
  wordmark: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '800', fontSize: 25, letterSpacing: -1.2 },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  navCentered: { position: 'absolute', left: 0, right: 0, justifyContent: 'center' },
  navLink: { paddingVertical: 10, paddingHorizontal: 3 },
  navText: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '600', fontSize: 13 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 17 },
  loginButton: { paddingVertical: 11, paddingHorizontal: 4 },
  loginText: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '700', fontSize: 13 },
  startButton: { backgroundColor: '#ffffff', borderRadius: 999, paddingVertical: 13, paddingHorizontal: 20, shadowColor: '#7c72a8', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  startText: { color: '#080808', fontFamily: 'Manrope', fontWeight: '700', fontSize: 13 },
  mobileNav: { width: '100%', paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, zIndex: 2 },
  hero: { width: '100%', minHeight: 'calc(100vh - 92px)' as any, alignItems: 'center', justifyContent: 'center', paddingBottom: 0, backgroundColor: '#080808' },
  heroEyebrow: { color: '#a0a0a0', fontFamily: 'Manrope', fontWeight: '800', fontSize: 10, letterSpacing: 2.1, marginBottom: 25 },
  heroTitle: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 66, lineHeight: 73, letterSpacing: -3.4, textAlign: 'center', maxWidth: 900 },
  heroTitleCompact: { fontSize: 42, lineHeight: 47, letterSpacing: -2 },
  heroDescription: { color: '#c8c8c8', fontFamily: 'Manrope', fontWeight: '500', fontSize: 16, lineHeight: 27, textAlign: 'center', maxWidth: 650, marginTop: 23, marginBottom: 36 },
  heroDescriptionCompact: { fontSize: 14, lineHeight: 24 },
  searchFrame: { width: '100%', maxWidth: 790, borderRadius: 999, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 2, backgroundColor: '#080808' },
  searchGradient: { position: 'absolute', top: '50%', left: '50%', marginTop: -450, marginLeft: -450, width: 900, height: 900, backgroundImage: 'conic-gradient(from 0deg, #4285F4, #34A853, #FBBC05, #EA4335, #4285F4)' } as any,
  searchBar: { width: '100%', flexDirection: 'row', alignItems: 'center', borderRadius: 999, backgroundColor: '#080808', paddingHorizontal: 26, zIndex: 1 },
  searchIcon: { color: '#ffffff', fontFamily: 'Manrope', fontSize: 31, marginRight: 15 },
  micIcon: { marginLeft: 12, marginRight: 2 },
  input: { flex: 1, minWidth: 0, color: '#ffffff', fontFamily: 'Manrope', fontWeight: '600', fontSize: 16, paddingVertical: 20, outlineStyle: 'none' as any },
  searchCaption: { color: '#ffffff', fontFamily: 'Manrope', fontSize: 12, fontWeight: '500', marginTop: 15 },
  heroFootnote: { color: '#858585', fontFamily: 'Manrope', fontSize: 10, marginTop: 15, textAlign: 'center' },
  chatWorkspace: { width: '100%', minHeight: 'calc(100vh - 92px)' as any, flex: 1, backgroundColor: '#080808', alignItems: 'center' },
  conversationScroll: { width: '100%', flex: 1 },
  conversationContent: { flexGrow: 1, width: '100%', maxWidth: 850, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 42, paddingBottom: 30 },
  emptyConversation: { flex: 1, minHeight: 420, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  chatGreeting: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 34, letterSpacing: -1.5, textAlign: 'center' },
  chatSubheading: { color: '#a0a0a0', fontFamily: 'Manrope', fontSize: 14, lineHeight: 23, textAlign: 'center', maxWidth: 470, marginTop: 14 },
  chatNotice: { color: '#777777', fontFamily: 'Manrope', fontSize: 10, lineHeight: 17, textAlign: 'center', marginTop: 22, maxWidth: 520, alignSelf: 'center' },
  messageList: { width: '100%', gap: 18, paddingBottom: 30 },
  userMessage: { alignSelf: 'flex-end', maxWidth: '82%', backgroundColor: '#242424', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 13 },
  userMessageText: { color: '#f5f5f5', fontFamily: 'Manrope', fontSize: 14, lineHeight: 22 },
  assistantMessage: { width: '100%', alignSelf: 'stretch', paddingVertical: 3 },
  assistantMessageText: { color: '#e8e8e8', fontFamily: 'Manrope', fontSize: 14, lineHeight: 25 },
  thinkingText: { color: '#929292', fontFamily: 'Manrope', fontSize: 13, fontStyle: 'italic' },
  chatError: { color: '#ff9b9b', fontFamily: 'Manrope', fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  composerArea: { width: '100%', maxWidth: 850, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 24, alignSelf: 'center' },
  composerFrame: { width: '100%', minHeight: 72, borderRadius: 28, overflow: 'hidden', position: 'relative', padding: 2, justifyContent: 'center', backgroundColor: '#080808' },
  composerInner: { width: '100%', minHeight: 68, flexDirection: 'row', alignItems: 'center', borderRadius: 26, backgroundColor: '#151515', paddingLeft: 20, paddingRight: 10, zIndex: 1 },
  composerInput: { flex: 1, minWidth: 0, maxHeight: 150, color: '#ffffff', fontFamily: 'Manrope', fontSize: 15, paddingVertical: 17, outlineStyle: 'none' as any },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  composerDisclaimer: { color: '#777777', fontFamily: 'Manrope', fontSize: 9, textAlign: 'center', marginTop: 11 },
  divider: { width: '100%', height: 1, backgroundColor: '#292929' },
  featureIntro: { width: '100%', paddingTop: 100, paddingBottom: 42, alignItems: 'flex-start' },
  featureIntroLabel: { color: '#a0a0a0', fontFamily: 'Manrope', fontWeight: '800', fontSize: 10, letterSpacing: 2, marginBottom: 18 },
  featureIntroTitle: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 49, lineHeight: 54, letterSpacing: -2.5 },
  featureIntroTitleCompact: { fontSize: 38, lineHeight: 43 },
  featureIntroBody: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 15, lineHeight: 26, maxWidth: 570, marginTop: 19 },
  featureGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingBottom: 105 },
  featureCard: { flex: 1, minWidth: 235, minHeight: 310, borderRadius: 8, padding: 27, justifyContent: 'flex-start' },
  featureCardCompact: { minWidth: '100%' as any, minHeight: 250 },
  featureCardDark: { backgroundColor: '#101010' },
  featureCardSoft: { backgroundColor: '#191919' },
  cardIndex: { color: '#a0a0a0', fontFamily: 'Manrope', fontWeight: '800', fontSize: 9, letterSpacing: 1.7, marginBottom: 48 },
  cardIndexLight: { color: '#909090', fontFamily: 'Manrope', fontWeight: '800', fontSize: 9, letterSpacing: 1.7, marginBottom: 48 },
  featureCardTitle: { color: '#f0f0f0', fontFamily: 'Manrope', fontWeight: '800', fontSize: 25, lineHeight: 30, letterSpacing: -1, maxWidth: 290 },
  featureCardTitleLight: { color: '#080808', fontFamily: 'Manrope', fontWeight: '800', fontSize: 25, lineHeight: 30, letterSpacing: -1, maxWidth: 290 },
  featureCardBody: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 13, lineHeight: 22, marginTop: 15, maxWidth: 300 },
  featureCardBodyLight: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 13, lineHeight: 22, marginTop: 15, maxWidth: 300 },
  cardArrow: { color: '#f0f0f0', fontSize: 21, marginTop: 'auto' as any, paddingTop: 25 },
  cardArrowLight: { color: '#080808', fontSize: 21, marginTop: 'auto' as any, paddingTop: 25 },
  splitSection: { width: '100%', paddingTop: 82, paddingBottom: 100, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 55, backgroundColor: '#111111' },
  splitCopy: { flex: 1, minWidth: 250, maxWidth: 430 },
  eyebrow: { color: '#a0a0a0', fontFamily: 'Manrope', fontWeight: '800', fontSize: 10, letterSpacing: 1.9, marginBottom: 18 },
  splitTitle: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 43, lineHeight: 49, letterSpacing: -2 },
  splitTitleCompact: { fontSize: 36, lineHeight: 42 },
  splitBody: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 14, lineHeight: 25, marginTop: 20, maxWidth: 420 },
  useCases: { flex: 1, minWidth: 280, maxWidth: 590 },
  useCaseRow: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingVertical: 22, borderBottomWidth: 1, borderBottomColor: '#333333' },
  useCaseNumber: { color: '#858585', fontFamily: 'Manrope', fontSize: 10, fontWeight: '700', width: 22 },
  useCaseText: { flex: 1 },
  useCaseTitle: { color: '#f0f0f0', fontFamily: 'Manrope', fontWeight: '800', fontSize: 15 },
  useCaseBody: { color: '#a0a0a0', fontFamily: 'Manrope', fontSize: 12, marginTop: 5, lineHeight: 19 },
  useCaseArrow: { color: '#f0f0f0', fontSize: 18 },
  modelsSection: { width: '100%', backgroundColor: '#080808', paddingVertical: 100 },
  modelsInner: { width: '100%' },
  modelsTitle: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 48, lineHeight: 54, letterSpacing: -2.4 },
  modelsBody: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 14, lineHeight: 25, maxWidth: 620, marginTop: 18, marginBottom: 35 },
  modelGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 13 },
  modelGridCompact: { flexDirection: 'column' },
  modelCard: { flex: 1, minWidth: 220, minHeight: 220, padding: 23, borderWidth: 1, borderColor: '#333333', borderRadius: 7, backgroundColor: '#080808' },
  modelCardActive: { backgroundColor: '#202020', borderColor: '#202020' },
  modelVersion: { color: '#a0a0a0', fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  modelName: { color: '#f0f0f0', fontFamily: 'Manrope', fontSize: 24, fontWeight: '800', letterSpacing: -1, marginTop: 29 },
  modelStatus: { color: '#858585', fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 1, marginTop: 17 },
  modelDescription: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 12, lineHeight: 20, marginTop: 13 },
  modelDisclaimer: { color: '#858585', fontFamily: 'Manrope', fontSize: 10, marginTop: 16 },
  processSection: { width: '100%', paddingTop: 90, paddingBottom: 100, backgroundColor: '#111111' },
  sectionHeading: { width: '100%', alignItems: 'flex-start', marginBottom: 38 },
  sectionTitle: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 45, lineHeight: 51, letterSpacing: -2 },
  sectionTitleCompact: { fontSize: 35, lineHeight: 41 },
  sectionBody: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 14, lineHeight: 24, maxWidth: 610, marginTop: 17 },
  processRows: { width: '100%' },
  processRow: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 18, paddingVertical: 24, borderTopWidth: 1, borderTopColor: '#333333' },
  processNumber: { color: '#858585', fontFamily: 'Manrope', fontSize: 11, fontWeight: '700', width: 30 },
  processTitle: { color: '#f0f0f0', fontFamily: 'Manrope', fontWeight: '800', fontSize: 15, flex: 1, minWidth: 210 },
  processBody: { color: '#a0a0a0', fontFamily: 'Manrope', fontSize: 12, flex: 1, minWidth: 200, lineHeight: 20 },
  closing: { width: '100%', backgroundColor: '#101010', paddingTop: 95, paddingBottom: 100, alignItems: 'center' },
  closingEyebrow: { color: '#bcbcbc', fontFamily: 'Manrope', fontWeight: '800', fontSize: 9, letterSpacing: 2, textAlign: 'center', marginBottom: 23 },
  closingTitle: { color: '#080808', fontFamily: 'Manrope', fontWeight: '800', fontSize: 62, lineHeight: 67, letterSpacing: -3, textAlign: 'center' },
  closingTitleCompact: { fontSize: 43, lineHeight: 48 },
  closingBody: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 14, lineHeight: 24, maxWidth: 530, textAlign: 'center', marginTop: 20 },
  closingButton: { backgroundColor: '#ffffff', borderRadius: 999, paddingVertical: 14, paddingHorizontal: 21, marginTop: 29 },
  closingButtonText: { color: '#080808', fontFamily: 'Manrope', fontWeight: '800', fontSize: 12 },
  footer: { width: '100%', paddingTop: 35, paddingBottom: 28, backgroundColor: '#080808' },
  footerTop: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, paddingBottom: 28 },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  footerWordmark: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 21 },
  footerStatement: { color: '#a0a0a0', fontFamily: 'Manrope', fontSize: 12 },
  footerDivider: { width: '100%', height: 1, backgroundColor: '#333333' },
  footerBottom: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 18, paddingTop: 23 },
  copyright: { color: '#858585', fontFamily: 'Manrope', fontSize: 10 },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 22 },
  footerLink: { color: '#a0a0a0', fontFamily: 'Manrope', fontSize: 10, fontWeight: '600' }
});
