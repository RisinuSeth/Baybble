import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet,
  Text, TextInput, useWindowDimensions, View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Message = { id: string; role: 'bay' | 'user'; text: string };

const languages = ['English', 'Español', 'Français', 'Deutsch', '日本語', '한국어', 'Português'];

const starters = [
  { icon: 'chatbubble-ellipses-outline' as const, title: 'Just talk', prompt: 'Let’s have a relaxed conversation. Ask me how my day is going.' },
  { icon: 'compass-outline' as const, title: 'Explore something', prompt: 'Let’s talk about travelling and discovering new places.' },
  { icon: 'sparkles-outline' as const, title: 'Try a challenge', prompt: 'Give me a fun, simple conversation challenge for my level.' },
];

function Brand({ small = false }: { small?: boolean }) {
  return (
    <View style={styles.brandLockup}>
      <View style={[styles.brandIcon, small && styles.brandIconSmall]}>
        <View style={styles.brandDot} />
        <View style={styles.brandDot} />
        <View style={styles.brandCurve} />
      </View>
      <Text style={[styles.brandName, small && styles.brandNameSmall]}>baybble</Text>
    </View>
  );
}

function Avatar({ mini = false }: { mini?: boolean }) {
  return (
    <View style={[styles.avatar, mini && styles.avatarMini]}>
      <View style={styles.avatarEyes}><View style={styles.avatarEye} /><View style={styles.avatarEye} /></View>
      <View style={styles.avatarSmile} />
    </View>
  );
}

export default function Home() {
  const { width } = useWindowDimensions();
  const compact = width < 820;
  const [language, setLanguage] = useState('English');
  const [languageOpen, setLanguageOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [activeView, setActiveView] = useState<'chat' | 'progress'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationCount, setConversationCount] = useState(1);

  const greeting = useMemo(() => language === 'Español'
    ? '¡Hola! Soy Bay. ¿De qué te gustaría hablar hoy?'
    : language === 'Français'
      ? 'Salut ! Moi, c’est Bay. De quoi aimerais-tu parler aujourd’hui ?'
      : "Hey, I'm Bay. What’s on your mind today?", [language]);

  function startNew() {
    setMessages([]);
    setDraft('');
    setActiveView('chat');
    setConversationCount(n => n + 1);
  }

  function sendMessage(value = draft) {
    const text = value.trim();
    if (!text) return;
    setMessages(old => [...old, { id: String(Date.now()), role: 'user', text }]);
    setDraft('');
    setActiveView('chat');
    // Local preview response until the AI service is connected.
    setTimeout(() => {
      setMessages(old => [...old, {
        id: String(Date.now() + 1),
        role: 'bay',
        text: 'I’m following you! Keep going — there’s no need to make every sentence perfect. I’ll help you find a more natural way to say things as we chat.'
      }]);
    }, 650);
  }

  return (
    <View style={styles.screen}>
      {!compact && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarTop}>
            <Brand />
            <Pressable onPress={startNew} style={styles.newChatButton}>
              <Ionicons name="add" size={19} color="#fff" />
              <Text style={styles.newChatText}>New conversation</Text>
              <View style={styles.shortcut}><Text style={styles.shortcutText}>⌘ K</Text></View>
            </Pressable>
            <Text style={styles.navCaption}>WORKSPACE</Text>
            <Pressable onPress={() => setActiveView('chat')} style={[styles.navItem, activeView === 'chat' && styles.navItemActive]}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={activeView === 'chat' ? '#273b5b' : '#8c96a6'} />
              <Text style={[styles.navText, activeView === 'chat' && styles.navTextActive]}>Conversations</Text>
              <Text style={styles.navCount}>{conversationCount}</Text>
            </Pressable>
            <Pressable onPress={() => setActiveView('progress')} style={[styles.navItem, activeView === 'progress' && styles.navItemActive]}>
              <Ionicons name="trending-up-outline" size={18} color={activeView === 'progress' ? '#273b5b' : '#8c96a6'} />
              <Text style={[styles.navText, activeView === 'progress' && styles.navTextActive]}>Your progress</Text>
            </Pressable>
          </View>
          <View style={styles.sidebarBottom}>
            <View style={styles.profileAvatar}><Text style={styles.profileInitial}>S</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileTitle}>Your space</Text>
              <Text style={styles.profileSubtitle}>A little better every day</Text>
            </View>
            <Ionicons name="ellipsis-horizontal" size={19} color="#8993a2" />
          </View>
        </View>
      )}

      <View style={styles.main}>
        <View style={styles.topbar}>
          {compact ? <Brand small /> : (
            <View>
              <Text style={styles.topbarTitle}>{activeView === 'chat' ? 'Your conversations' : 'Your progress'}</Text>
              <Text style={styles.topbarSubtitle}>A place to find your words.</Text>
            </View>
          )}
          <View style={styles.topbarRight}>
            <View style={styles.onlinePill}><View style={styles.onlineDot} /><Text style={styles.onlineText}>Bay is here</Text></View>
            <View style={styles.languageWrap}>
              <Pressable style={styles.languageButton} onPress={() => setLanguageOpen(v => !v)}>
                <Ionicons name="globe-outline" size={16} color="#65738a" />
                <Text style={styles.languageLabel}>{language}</Text>
                <Ionicons name="chevron-down" size={14} color="#8792a2" />
              </Pressable>
              {languageOpen && (
                <View style={styles.languageMenu}>
                  {languages.map(item => (
                    <Pressable key={item} onPress={() => { setLanguage(item); setLanguageOpen(false); }} style={styles.languageOption}>
                      <Text style={[styles.languageOptionText, item === language && styles.languageOptionActive]}>{item}</Text>
                      {item === language && <Ionicons name="checkmark" size={16} color="#526d9a" />}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {activeView === 'progress' ? (
          <ScrollView contentContainerStyle={styles.progressPage}>
            <View style={styles.progressIntro}>
              <Text style={styles.kicker}>YOUR JOURNEY</Text>
              <Text style={styles.pageTitle}>Progress, at your pace.</Text>
              <Text style={styles.pageDescription}>Every conversation is a step forward. Your learning overview will grow as you chat with Bay.</Text>
            </View>
            <View style={styles.progressCard}>
              <View style={styles.progressIcon}><Ionicons name="chatbubbles-outline" size={22} color="#526d9a" /></View>
              <Text style={styles.progressNumber}>{conversationCount}</Text>
              <Text style={styles.progressLabel}>Conversations started</Text>
              <Text style={styles.progressNote}>Your practice journey starts here.</Text>
            </View>
            <Pressable onPress={startNew} style={styles.progressCta}><Text style={styles.progressCtaText}>Start a conversation</Text><Ionicons name="arrow-forward" size={17} color="#fff" /></Pressable>
          </ScrollView>
        ) : (
          <>
            <ScrollView contentContainerStyle={[styles.chatScroll, { paddingHorizontal: compact ? 18 : 40 }]}>
              {messages.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.heroAvatar}><Avatar /></View>
                  <Text style={styles.kicker}>YOUR LANGUAGE COMPANION</Text>
                  <Text style={styles.heroTitle}>Language learning,{"\n"}without the awkward bits.</Text>
                  <Text style={styles.heroDescription}>A real conversation is a great place to start. Say hello, share a story, or follow your curiosity.</Text>
                  <View style={styles.starterGrid}>
                    {starters.map((item, index) => (
                      <Pressable key={item.title} onPress={() => sendMessage(item.prompt)} style={[styles.starterCard, compact && styles.starterCardCompact]}>
                        <View style={styles.starterIcon}><Ionicons name={item.icon} size={18} color="#647da5" /></View>
                        <Text style={styles.starterTitle}>{item.title}</Text>
                        <Text style={styles.starterPrompt}>{index === 0 ? 'A relaxed everyday chat' : index === 1 ? 'Follow your curiosity' : 'A playful way to practise'}</Text>
                        <Ionicons name="arrow-up-right" size={16} color="#a0aaba" style={styles.starterArrow} />
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.greetingLine}><Avatar mini /><Text style={styles.greetingText}>{greeting}</Text></View>
                </View>
              ) : (
                <View style={styles.messageList}>
                  <View style={styles.chatDate}><View style={styles.dateLine} /><Text style={styles.dateText}>TODAY</Text><View style={styles.dateLine} /></View>
                  {messages.map(message => (
                    <View key={message.id} style={[styles.messageRow, message.role === 'user' && styles.userMessageRow]}>
                      {message.role === 'bay' && <Avatar mini />}
                      <View style={[styles.messageBubble, message.role === 'user' ? styles.userBubble : styles.bayBubble]}>
                        {message.role === 'bay' && <Text style={styles.messageSender}>BAY</Text>}
                        <Text style={[styles.messageBody, message.role === 'user' && styles.userMessageBody]}>{message.text}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={[styles.composerArea, { paddingHorizontal: compact ? 14 : 40 }]}>
                <View style={styles.composer}>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="Message Bay…"
                    placeholderTextColor="#9ba5b3"
                    style={styles.composerInput}
                    multiline
                    maxLength={2000}
                    onSubmitEditing={() => sendMessage()}
                    returnKeyType="send"
                  />
                  <View style={styles.composerFooter}>
                    <Text style={styles.composerHint}>No pressure. Just be yourself.</Text>
                    <View style={styles.composerControls}>
                      <Pressable onPress={() => setDraft('')} style={styles.composerIconButton} accessibilityLabel="Clear message">
                        <Ionicons name="close-outline" size={19} color="#8290a3" />
                      </Pressable>
                      <Pressable onPress={() => sendMessage()} style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]} accessibilityLabel="Send message">
                        <Ionicons name="arrow-up" size={19} color="#fff" />
                      </Pressable>
                    </View>
                  </View>
                </View>
                <Text style={styles.disclaimer}>Bay is an AI companion and can make mistakes. Take your time — learning is a journey.</Text>
              </View>
            </KeyboardAvoidingView>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, flexDirection: 'row', backgroundColor: '#fff', minHeight: '100%' },
  sidebar: { width: 258, backgroundColor: '#fbfcfe', borderRightWidth: 1, borderRightColor: '#edf0f4', paddingHorizontal: 19, paddingTop: 27, paddingBottom: 18, justifyContent: 'space-between' },
  sidebarTop: { gap: 8 },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30, paddingLeft: 5 },
  brandIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: '#344b70', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4, position: 'relative' },
  brandIconSmall: { width: 29, height: 29, borderRadius: 10 },
  brandDot: { width: 4, height: 4, borderRadius: 3, backgroundColor: '#fff', marginTop: -5 },
  brandCurve: { position: 'absolute', width: 10, height: 5, borderBottomWidth: 1.5, borderColor: '#fff', borderRadius: 8, bottom: 8 },
  brandName: { fontSize: 22, lineHeight: 27, fontWeight: '800', letterSpacing: -1.1, color: '#263a59' },
  brandNameSmall: { fontSize: 19 },
  newChatButton: { height: 45, backgroundColor: '#344b70', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 9, marginBottom: 29 },
  newChatText: { color: '#fff', fontSize: 12, fontWeight: '700', flex: 1 },
  shortcut: { borderWidth: 1, borderColor: '#71819c', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  shortcutText: { color: '#dce4f0', fontSize: 9 },
  navCaption: { color: '#a4adba', fontSize: 9, letterSpacing: 1.5, fontWeight: '800', marginTop: 3, marginBottom: 7, paddingLeft: 9 },
  navItem: { minHeight: 42, borderRadius: 9, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 11 },
  navItemActive: { backgroundColor: '#edf1f7' },
  navText: { color: '#7d899a', fontSize: 12, fontWeight: '600', flex: 1 },
  navTextActive: { color: '#344b70' },
  navCount: { color: '#9aa5b3', fontSize: 10 },
  sidebarBottom: { borderTopWidth: 1, borderTopColor: '#edf0f4', paddingTop: 17, flexDirection: 'row', alignItems: 'center', gap: 10 },
  profileAvatar: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#e9eef6', alignItems: 'center', justifyContent: 'center' },
  profileInitial: { color: '#536989', fontSize: 13, fontWeight: '800' },
  profileTitle: { color: '#42516a', fontSize: 11, fontWeight: '700' },
  profileSubtitle: { color: '#a0a9b6', fontSize: 9, marginTop: 3 },
  main: { flex: 1, minWidth: 0, backgroundColor: '#fff' },
  topbar: { height: 76, paddingHorizontal: 29, borderBottomWidth: 1, borderBottomColor: '#f0f2f5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 5 },
  topbarTitle: { color: '#34445f', fontSize: 13, fontWeight: '800' },
  topbarSubtitle: { color: '#a1aab6', fontSize: 10, marginTop: 4 },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  onlinePill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineDot: { width: 6, height: 6, borderRadius: 5, backgroundColor: '#8ab9a1' },
  onlineText: { color: '#8592a2', fontSize: 10, fontWeight: '600' },
  languageWrap: { position: 'relative', zIndex: 10 },
  languageButton: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#e9edf2', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 },
  languageLabel: { color: '#53627a', fontSize: 11, fontWeight: '700' },
  languageMenu: { position: 'absolute', top: 42, right: 0, width: 158, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e9edf2', borderRadius: 11, padding: 5, shadowColor: '#273b5b', shadowOpacity: 0.12, shadowRadius: 18, elevation: 8, zIndex: 20 },
  languageOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 9, borderRadius: 7 },
  languageOptionText: { color: '#647187', fontSize: 11 },
  languageOptionActive: { color: '#344b70', fontWeight: '800' },
  chatScroll: { flexGrow: 1, paddingTop: 40, paddingBottom: 30, alignItems: 'center' },
  emptyState: { width: '100%', maxWidth: 760, alignItems: 'center', paddingTop: 14 },
  heroAvatar: { width: 76, height: 76, borderRadius: 27, backgroundColor: '#edf3fb', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#e3ebf6' },
  avatar: { width: 43, height: 43, borderRadius: 16, backgroundColor: '#dce8f7', alignItems: 'center', justifyContent: 'center' },
  avatarMini: { width: 27, height: 27, borderRadius: 10 },
  avatarEyes: { flexDirection: 'row', gap: 9, marginTop: 2 },
  avatarEye: { width: 4, height: 6, borderRadius: 3, backgroundColor: '#4b6488' },
  avatarSmile: { width: 9, height: 5, borderBottomWidth: 1.4, borderColor: '#4b6488', borderRadius: 8, marginTop: 3 },
  kicker: { color: '#8c9bb0', fontSize: 9, letterSpacing: 2, fontWeight: '800', textAlign: 'center' },
  heroTitle: { color: '#2b3d5b', fontSize: 35, lineHeight: 43, letterSpacing: -1.4, fontWeight: '800', textAlign: 'center', marginTop: 13 },
  heroDescription: { color: '#8995a6', fontSize: 12, lineHeight: 20, maxWidth: 410, textAlign: 'center', marginTop: 11, paddingHorizontal: 10 },
  starterGrid: { flexDirection: 'row', gap: 11, width: '100%', marginTop: 32 },
  starterCard: { flex: 1, minHeight: 126, borderWidth: 1, borderColor: '#e9edf2', borderRadius: 13, padding: 14, backgroundColor: '#fff', position: 'relative' },
  starterCardCompact: { padding: 10, minHeight: 120 },
  starterIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#f0f4fa', alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  starterTitle: { color: '#455671', fontSize: 11, fontWeight: '800' },
  starterPrompt: { color: '#9aa4b1', fontSize: 9, marginTop: 5, lineHeight: 14, paddingRight: 8 },
  starterArrow: { position: 'absolute', right: 12, top: 14 },
  greetingLine: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 30, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#f8f9fb', borderRadius: 12, maxWidth: '100%' },
  greetingText: { color: '#75849a', fontSize: 11, flexShrink: 1 },
  composerArea: { paddingTop: 8, paddingBottom: 14, backgroundColor: '#fff', alignItems: 'center' },
  composer: { width: '100%', maxWidth: 850, borderWidth: 1, borderColor: '#e2e8ef', borderRadius: 15, paddingHorizontal: 15, paddingTop: 13, paddingBottom: 10, backgroundColor: '#fff', shadowColor: '#263a59', shadowOpacity: 0.045, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  composerInput: { minHeight: 36, maxHeight: 110, color: '#40516b', fontSize: 13, lineHeight: 20, padding: 0, textAlignVertical: 'top', outlineStyle: 'none' as any },
  composerFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  composerHint: { color: '#a1aab6', fontSize: 9, flex: 1 },
  composerControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  composerIconButton: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#f4f6f9', alignItems: 'center', justifyContent: 'center' },
  sendButton: { width: 33, height: 33, borderRadius: 10, backgroundColor: '#344b70', alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.45 },
  disclaimer: { color: '#a5adba', fontSize: 9, textAlign: 'center', marginTop: 10, paddingHorizontal: 10 },
  messageList: { width: '100%', maxWidth: 800, paddingTop: 5 },
  chatDate: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28 },
  dateLine: { height: 1, width: 38, backgroundColor: '#edf0f4' },
  dateText: { color: '#a4adba', fontSize: 8, letterSpacing: 1.4, fontWeight: '800' },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, marginBottom: 17, alignSelf: 'flex-start', maxWidth: '90%' },
  userMessageRow: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  messageBubble: { borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12, maxWidth: '100%' },
  bayBubble: { backgroundColor: '#f4f6f9', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#344b70', borderBottomRightRadius: 4 },
  messageSender: { color: '#8b9ab0', fontSize: 8, fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 },
  messageBody: { color: '#53627a', fontSize: 12, lineHeight: 20 },
  userMessageBody: { color: '#fff' },
  progressPage: { flexGrow: 1, alignItems: 'center', padding: 34, paddingTop: 64 },
  progressIntro: { maxWidth: 490, alignItems: 'center' },
  pageTitle: { color: '#2b3d5b', fontSize: 30, fontWeight: '800', letterSpacing: -1, marginTop: 12, textAlign: 'center' },
  pageDescription: { color: '#8995a6', fontSize: 12, lineHeight: 20, textAlign: 'center', marginTop: 10 },
  progressCard: { width: '100%', maxWidth: 360, alignItems: 'center', borderWidth: 1, borderColor: '#e9edf2', borderRadius: 16, padding: 25, marginTop: 32 },
  progressIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#eff3f9', alignItems: 'center', justifyContent: 'center' },
  progressNumber: { color: '#344b70', fontSize: 34, fontWeight: '800', marginTop: 13 },
  progressLabel: { color: '#53627a', fontSize: 12, fontWeight: '700', marginTop: 3 },
  progressNote: { color: '#a0a9b6', fontSize: 10, marginTop: 8 },
  progressCta: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#344b70', borderRadius: 11, paddingHorizontal: 17, paddingVertical: 12, marginTop: 20 },
  progressCtaText: { color: '#fff', fontSize: 11, fontWeight: '800' }
});
