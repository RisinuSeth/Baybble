import React, { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Message = { id: number; role: 'user' | 'assistant'; text: string };

export default function Home() {
  const { width } = useWindowDimensions();
  const compact = width < 820;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<TextInput | null>(null);
  const listRef = useRef<ScrollView>(null);
  const started = messages.length > 0;

  const startNewChat = () => {
    if (messages.length > 0) {
      const first = messages.find((message) => message.role === 'user')?.text;
      if (first) setHistory((items) => [first, ...items.filter((item) => item !== first)].slice(0, 12));
    }
    setMessages([]);
    setDraft('');
    setSidebarOpen(false);
  };

  const sendMessage = () => {
    const value = draft.trim();
    if (!value) return;
    const userMessage: Message = { id: Date.now(), role: 'user', text: value };
    const notice: Message = {
      id: Date.now() + 1,
      role: 'assistant',
      text: "Bay's AI engine isn't connected yet. This is the new chat interface; the next step is connecting the AI so Bay can respond to your messages."
    };
    setMessages((items) => [...items, userMessage, notice]);
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const choosePrompt = (prompt: string) => {
    setDraft(prompt);
    inputRef.current?.focus();
  };

  const recentItems = useMemo(() => {
    const current = messages.find((message) => message.role === 'user')?.text;
    return current ? [current, ...history.filter((item) => item !== current)] : history;
  }, [history, messages]);

  return (
    <View style={styles.root}>
      {(!compact || sidebarOpen) && (
        <>
          {compact && <Pressable style={styles.scrim} onPress={() => setSidebarOpen(false)} />}
          <View style={[styles.sidebar, compact && styles.mobileSidebar]}>
            <View style={styles.sidebarTop}>
              <Pressable style={styles.brand} onPress={startNewChat} accessibilityRole="button" accessibilityLabel="Baybble home">
                <View style={styles.logoMark}><View style={styles.logoBubbleOne} /><View style={styles.logoBubbleTwo} /></View>
                <Text style={styles.wordmark}>Baybble</Text>
              </Pressable>
              {!compact && <Pressable style={styles.iconButton} onPress={() => setSidebarOpen(false)}><Ionicons name="sidebar-outline" size={21} color="#222222" /></Pressable>}
            </View>

            <Pressable style={styles.newChatButton} onPress={startNewChat}>
              <Ionicons name="add" size={19} color="#111111" />
              <Text style={styles.newChatText}>New chat</Text>
            </Pressable>

            <Text style={styles.historyLabel}>RECENT</Text>
            <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
              {recentItems.length === 0 ? (
                <Text style={styles.emptyHistory}>Your conversations will appear here.</Text>
              ) : recentItems.map((item, index) => (
                <Pressable key={index} style={styles.historyItem} onPress={() => { setMessages([{ id: Date.now(), role: 'user', text: item }, { id: Date.now() + 1, role: 'assistant', text: "This conversation preview is local only. Chat history and AI responses will be available once Baybble's backend is connected." }]); setSidebarOpen(false); }}>
                  <Ionicons name="chatbubble-outline" size={16} color="#666666" />
                  <Text numberOfLines={1} style={styles.historyText}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.sidebarBottom}>
              <View style={styles.profileMark}><Ionicons name="person-outline" size={17} color="#444444" /></View>
              <Text style={styles.profileText}>Guest</Text>
            </View>
          </View>
        </>
      )}

      <KeyboardAvoidingView style={styles.main} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          {compact ? (
            <Pressable style={styles.iconButton} onPress={() => setSidebarOpen(true)}><Ionicons name="menu-outline" size={23} color="#222222" /></Pressable>
          ) : <View style={{ width: 36 }} />}
          <Text style={styles.topTitle}>New chat</Text>
          <Pressable style={styles.iconButton} onPress={startNewChat}><Ionicons name="create-outline" size={21} color="#222222" /></Pressable>
        </View>

        {!started ? (
          <View style={styles.welcomeArea}>
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeLogo}><View style={styles.logoMarkLarge}><View style={styles.logoBubbleOneLarge} /><View style={styles.logoBubbleTwoLarge} /></View></View>
              <Text style={styles.welcomeTitle}>What would you like to solve?</Text>
              <Text style={styles.welcomeSubtitle}>Start with a question, a decision or an idea.</Text>
              <View style={styles.suggestions}>
                {['I have a business idea', 'Help me make a decision', 'Plan a project', 'Understand a topic'].map((prompt) => (
                  <Pressable key={prompt} style={styles.suggestion} onPress={() => choosePrompt(prompt)}>
                    <Text style={styles.suggestionText}>{prompt}</Text>
                    <Ionicons name="arrow-up-outline" size={15} color="#555555" />
                  </Pressable>
                ))}
              </View>
            </View>
            <Composer draft={draft} setDraft={setDraft} sendMessage={sendMessage} inputRef={inputRef} />
          </View>
        ) : (
          <View style={styles.conversationArea}>
            <ScrollView ref={listRef} style={styles.messagesScroll} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
              {messages.map((message) => (
                <View key={message.id} style={[styles.messageRow, message.role === 'user' ? styles.userMessageRow : styles.assistantMessageRow]}>
                  {message.role === 'assistant' && <View style={styles.assistantAvatar}><View style={styles.logoMarkSmall}><View style={styles.logoBubbleOneSmall} /><View style={styles.logoBubbleTwoSmall} /></View></View>}
                  <View style={message.role === 'user' ? styles.userMessage : styles.assistantMessage}>
                    <Text style={message.role === 'user' ? styles.userMessageText : styles.assistantMessageText}>{message.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <Composer draft={draft} setDraft={setDraft} sendMessage={sendMessage} inputRef={inputRef} />
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

function Composer({ draft, setDraft, sendMessage, inputRef }: {
  draft: string;
  setDraft: (value: string) => void;
  sendMessage: () => void;
  inputRef: React.RefObject<TextInput | null>;
}) {
  const canSend = draft.trim().length > 0;
  return (
    <View style={styles.composerWrap}>
      <View style={styles.composer}>
        <TextInput
          ref={inputRef}
          value={draft}
          onChangeText={setDraft}
          placeholder="Message Baybble"
          placeholderTextColor="#858585"
          style={styles.composerInput}
          multiline
          maxLength={6000}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          accessibilityLabel="Message Baybble"
        />
        <View style={styles.composerActions}>
          <Pressable style={styles.composerIcon} accessibilityRole="button" accessibilityLabel="Add attachment"><Ionicons name="attach-outline" size={21} color="#555555" /></Pressable>
          <View style={styles.composerRight}>
            <Pressable style={styles.composerIcon} accessibilityRole="button" accessibilityLabel="Voice input"><Ionicons name="mic-outline" size={20} color="#555555" /></Pressable>
            <Pressable style={[styles.sendButton, !canSend && styles.sendButtonDisabled]} onPress={sendMessage} disabled={!canSend} accessibilityRole="button" accessibilityLabel="Send message">
              <Ionicons name="arrow-up" size={19} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </View>
      <Text style={styles.disclaimer}>Baybble can make mistakes. Check important information.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: '100vh' as any, width: '100%', flexDirection: 'row', backgroundColor: '#ffffff' },
  sidebar: { width: 260, flexShrink: 0, backgroundColor: '#f7f7f7', paddingHorizontal: 14, paddingTop: 18, paddingBottom: 14, borderRightWidth: 1, borderRightColor: '#eeeeee' },
  mobileSidebar: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 285, zIndex: 20, elevation: 20 },
  scrim: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.22)', zIndex: 19 },
  sidebarTop: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingLeft: 5 },
  logoMark: { width: 27, height: 27, position: 'relative' },
  logoBubbleOne: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: '#000000', top: 0, left: 0 },
  logoBubbleTwo: { position: 'absolute', width: 15, height: 15, borderRadius: 8, backgroundColor: '#000000', bottom: 0, right: 0, borderWidth: 2, borderColor: '#f7f7f7' },
  wordmark: { color: '#000000', fontFamily: 'Manrope', fontWeight: '800', fontSize: 22, letterSpacing: -1 },
  iconButton: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  newChatButton: { minHeight: 43, borderWidth: 1, borderColor: '#e2e2e2', borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#ffffff' },
  newChatText: { color: '#222222', fontFamily: 'Manrope', fontSize: 13, fontWeight: '700' },
  historyLabel: { color: '#777777', fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginTop: 28, marginBottom: 11, paddingLeft: 7 },
  historyList: { flex: 1 },
  emptyHistory: { color: '#858585', fontFamily: 'Manrope', fontSize: 11, lineHeight: 18, paddingHorizontal: 7 },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 37, paddingHorizontal: 8, borderRadius: 8 },
  historyText: { color: '#444444', fontFamily: 'Manrope', fontSize: 12, flex: 1 },
  sidebarBottom: { borderTopWidth: 1, borderTopColor: '#e5e5e5', paddingTop: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  profileMark: { width: 29, height: 29, borderRadius: 15, backgroundColor: '#e9e9e9', alignItems: 'center', justifyContent: 'center' },
  profileText: { color: '#333333', fontFamily: 'Manrope', fontSize: 12, fontWeight: '600' },
  main: { flex: 1, minWidth: 0, backgroundColor: '#ffffff' },
  topBar: { height: 58, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { color: '#222222', fontFamily: 'Manrope', fontSize: 13, fontWeight: '700' },
  welcomeArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 22 },
  welcomeContent: { width: '100%', maxWidth: 690, alignItems: 'center', marginTop: -42, marginBottom: 28 },
  welcomeLogo: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', marginBottom: 23 },
  logoMarkLarge: { width: 30, height: 30, position: 'relative' },
  logoBubbleOneLarge: { position: 'absolute', width: 23, height: 23, borderRadius: 12, backgroundColor: '#000000', top: 0, left: 0 },
  logoBubbleTwoLarge: { position: 'absolute', width: 17, height: 17, borderRadius: 9, backgroundColor: '#000000', bottom: 0, right: 0, borderWidth: 2, borderColor: '#f5f5f5' },
  welcomeTitle: { color: '#171717', fontFamily: 'Manrope', fontSize: 27, fontWeight: '800', letterSpacing: -1, textAlign: 'center' },
  welcomeSubtitle: { color: '#666666', fontFamily: 'Manrope', fontSize: 13, marginTop: 9, marginBottom: 25, textAlign: 'center' },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 9, maxWidth: 600 },
  suggestion: { borderWidth: 1, borderColor: '#e7e7e7', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#ffffff' },
  suggestionText: { color: '#444444', fontFamily: 'Manrope', fontSize: 11, fontWeight: '600' },
  composerWrap: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16 },
  composer: { width: '100%', minHeight: 112, borderWidth: 1, borderColor: '#dddddd', borderRadius: 20, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, backgroundColor: '#ffffff', shadowColor: '#000000', shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  composerInput: { color: '#171717', fontFamily: 'Manrope', fontSize: 14, minHeight: 44, maxHeight: 150, padding: 0, outlineStyle: 'none' as any },
  composerActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  composerIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17 },
  composerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sendButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111111' },
  sendButtonDisabled: { backgroundColor: '#bcbcbc' },
  disclaimer: { color: '#888888', fontFamily: 'Manrope', fontSize: 10, textAlign: 'center', marginTop: 10, marginBottom: 4 },
  conversationArea: { flex: 1, alignItems: 'stretch', paddingBottom: 14 },
  messagesScroll: { flex: 1, width: '100%' },
  messagesContent: { width: '100%', maxWidth: 800, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 35, paddingBottom: 28, gap: 24 },
  messageRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  userMessageRow: { justifyContent: 'flex-end' },
  assistantMessageRow: { justifyContent: 'flex-start' },
  assistantAvatar: { width: 29, height: 29, borderRadius: 15, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  logoMarkSmall: { width: 18, height: 18, position: 'relative' },
  logoBubbleOneSmall: { position: 'absolute', width: 13, height: 13, borderRadius: 7, backgroundColor: '#000000', top: 0, left: 0 },
  logoBubbleTwoSmall: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#000000', bottom: 0, right: 0, borderWidth: 1.5, borderColor: '#f0f0f0' },
  userMessage: { maxWidth: '82%', backgroundColor: '#f2f2f2', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12 },
  assistantMessage: { flex: 1, paddingTop: 5 },
  userMessageText: { color: '#222222', fontFamily: 'Manrope', fontSize: 13, lineHeight: 21 },
  assistantMessageText: { color: '#333333', fontFamily: 'Manrope', fontSize: 13, lineHeight: 22 },
});
