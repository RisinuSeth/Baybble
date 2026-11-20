import React, { useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, useWindowDimensions, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Message = { id: number; from: 'bay' | 'you'; text: string };

export default function Home() {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: 'bay', text: "Hey! I'm Bay. 🌊 I'm here to help you get comfortable using a new language, one real conversation at a time." },
    { id: 2, from: 'bay', text: "What would you like to talk about today? We can chat about music, films, travel, sport — anything you're into." }
  ]);
  const { width } = useWindowDimensions();
  const compact = width < 760;

  function send() {
    const value = draft.trim();
    if (!value) return;
    setMessages(old => [...old, { id: Date.now(), from: 'you', text: value }]);
    setDraft('');
    setTimeout(() => setMessages(old => [...old, {
      id: Date.now() + 1, from: 'bay',
      text: "Nice! Let's keep the conversation going. I'll help you express that more naturally as we chat."
    }]), 450);
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.app}>
        {!compact && <View style={s.sidebar}>
          <View style={s.brandRow}>
            <View style={s.brandMark}><Text style={s.brandMarkText}>b</Text></View>
            <Text style={s.brand}>baybble</Text>
          </View>
          <Pressable style={s.newChat}><Ionicons name="add" size={18} color="#fff" /><Text style={s.newChatText}>New conversation</Text></Pressable>
          <Text style={s.sideLabel}>YOUR SPACE</Text>
          <Pressable style={s.sideItem}><Ionicons name="chatbubble-ellipses-outline" size={17} color="#697386" /><Text style={s.sideText}>Conversations</Text></Pressable>
          <Pressable style={s.sideItem}><Ionicons name="book-outline" size={17} color="#697386" /><Text style={s.sideText}>Your progress</Text></Pressable>
          <Pressable style={s.sideItem}><Ionicons name="settings-outline" size={17} color="#697386" /><Text style={s.sideText}>Settings</Text></Pressable>
          <View style={s.sidebarBottom}>
            <View style={s.avatar}><Text style={s.avatarText}>S</Text></View>
            <View><Text style={s.profileName}>Your account</Text><Text style={s.profileSub}>Learner profile</Text></View>
            <Ionicons name="ellipsis-horizontal" size={19} color="#8992a1" style={{ marginLeft: 'auto' }} />
          </View>
        </View>}

        <View style={s.main}>
          <View style={s.topbar}>
            {compact ? <View style={s.brandRow}><View style={s.brandMark}><Text style={s.brandMarkText}>b</Text></View><Text style={s.brand}>baybble</Text></View> : <View><Text style={s.topTitle}>Your conversation</Text><Text style={s.topSub}>A little practice goes a long way.</Text></View>}
            <View style={s.languagePicker}><Ionicons name="globe-outline" size={16} color="#536174" /><Text style={s.languageText}>English</Text><Ionicons name="chevron-down" size={14} color="#7b8492" /></View>
          </View>

          <ScrollView contentContainerStyle={[s.chatContent, { paddingHorizontal: compact ? 18 : 48 }]}>
            <View style={s.welcome}>
              <View style={s.bayOrb}><View style={s.orbEyeRow}><View style={s.orbEye} /><View style={s.orbEye} /></View><View style={s.orbSmile} /></View>
              <Text style={s.eyebrow}>YOUR LANGUAGE COMPANION</Text>
              <Text style={s.welcomeTitle}>A conversation with Bay.</Text>
              <Text style={s.welcomeCopy}>No pressure. No perfect sentences needed. Just start talking.</Text>
            </View>
            {messages.map(m => <View key={m.id} style={[s.messageRow, m.from === 'you' && s.youRow]}>
              {m.from === 'bay' && <View style={s.miniBay}><View style={s.miniEyeRow}><View style={s.miniEye}/><View style={s.miniEye}/></View></View>}
              <View style={[s.bubble, m.from === 'you' ? s.youBubble : s.bayBubble]}>
                {m.from === 'bay' && <Text style={s.sender}>BAY</Text>}
                <Text style={[s.messageText, m.from === 'you' && s.youMessage]}>{m.text}</Text>
              </View>
            </View>)}
            <View style={{ height: 18 }} />
          </ScrollView>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[s.composerWrap, { paddingHorizontal: compact ? 14 : 42 }]}>
              <View style={s.composer}>
                <TextInput value={draft} onChangeText={setDraft}
                  placeholder="Write a message to Bay..." placeholderTextColor="#9aa2af"
                  style={s.input} multiline onSubmitEditing={send} returnKeyType="send" />
                <View style={s.composerActions}>
                  <Text style={s.hint}>Bay can make mistakes. Learning is a journey.</Text>
                  <View style={s.actionButtons}>
                    <Pressable style={s.iconButton} accessibilityLabel="Voice input"><Ionicons name="mic-outline" size={19} color="#657084" /></Pressable>
                    <Pressable onPress={send} style={[s.sendButton, !draft.trim() && s.sendDisabled]}><Ionicons name="arrow-up" size={20} color="#fff" /></Pressable>
                  </View>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f8fb' },
  app: { flex: 1, flexDirection: 'row', backgroundColor: '#fff' },
  sidebar: { width: 248, backgroundColor: '#fbfcfe', borderRightWidth: 1, borderRightColor: '#edf0f4', padding: 22, paddingTop: 27 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#202c45', alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: '#fff', fontSize: 21, fontWeight: '800', marginTop: -2 },
  brand: { color: '#202c45', fontSize: 21, fontWeight: '800', letterSpacing: -1 },
  newChat: { marginTop: 34, backgroundColor: '#263652', borderRadius: 11, paddingVertical: 12, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  newChatText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  sideLabel: { marginTop: 32, marginBottom: 13, fontSize: 10, color: '#a0a8b5', fontWeight: '800', letterSpacing: 1.3 },
  sideItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 7 },
  sideText: { color: '#606b7d', fontSize: 13, fontWeight: '500' },
  sidebarBottom: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#edf0f4', paddingTop: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#e9edf5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#34445f', fontWeight: '700' },
  profileName: { color: '#344056', fontWeight: '700', fontSize: 12 },
  profileSub: { color: '#98a0ad', fontSize: 10, marginTop: 3 },
  main: { flex: 1, backgroundColor: '#fff' },
  topbar: { height: 76, borderBottomWidth: 1, borderBottomColor: '#f0f2f5', paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { fontSize: 14, color: '#29364d', fontWeight: '700' },
  topSub: { color: '#9aa2af', fontSize: 11, marginTop: 4 },
  languagePicker: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e9edf2', borderRadius: 9 },
  languageText: { color: '#536174', fontSize: 12, fontWeight: '600' },
  chatContent: { flexGrow: 1, paddingTop: 32, paddingBottom: 22, maxWidth: 1040, width: '100%', alignSelf: 'center' },
  welcome: { alignItems: 'center', marginBottom: 32 },
  bayOrb: { width: 58, height: 58, borderRadius: 22, backgroundColor: '#eaf2ff', borderWidth: 1, borderColor: '#dce8fb', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  orbEyeRow: { flexDirection: 'row', gap: 12, marginTop: 2 },
  orbEye: { width: 5, height: 7, borderRadius: 4, backgroundColor: '#506a91' },
  orbSmile: { width: 12, height: 6, borderBottomWidth: 1.5, borderColor: '#506a91', borderRadius: 10, marginTop: 4 },
  eyebrow: { color: '#8190a6', fontSize: 9, letterSpacing: 1.7, fontWeight: '800' },
  welcomeTitle: { color: '#26344d', fontSize: 23, fontWeight: '700', letterSpacing: -0.7, marginTop: 8, textAlign: 'center' },
  welcomeCopy: { color: '#929baa', fontSize: 12, marginTop: 8, textAlign: 'center' },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 17, maxWidth: 720, alignSelf: 'flex-start' },
  youRow: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  miniBay: { width: 26, height: 26, borderRadius: 10, backgroundColor: '#eaf2ff', alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  miniEyeRow: { flexDirection: 'row', gap: 5 },
  miniEye: { width: 3, height: 4, borderRadius: 3, backgroundColor: '#506a91' },
  bubble: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 13, maxWidth: '88%' },
  bayBubble: { backgroundColor: '#f5f7fa', borderBottomLeftRadius: 5 },
  youBubble: { backgroundColor: '#263652', borderBottomRightRadius: 5 },
  sender: { color: '#8998ad', fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginBottom: 6 },
  messageText: { color: '#48566c', fontSize: 13, lineHeight: 21 },
  youMessage: { color: '#fff' },
  composerWrap: { paddingTop: 10, paddingBottom: 20, backgroundColor: '#fff' },
  composer: { maxWidth: 900, width: '100%', alignSelf: 'center', borderWidth: 1, borderColor: '#e5eaf0', borderRadius: 15, paddingHorizontal: 15, paddingTop: 13, paddingBottom: 10, backgroundColor: '#fff', shadowColor: '#263652', shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  input: { minHeight: 34, maxHeight: 100, color: '#344056', fontSize: 13, padding: 0, textAlignVertical: 'top' },
  composerActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  hint: { color: '#a0a8b5', fontSize: 9, flex: 1 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#f4f6f9', alignItems: 'center', justifyContent: 'center' },
  sendButton: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#263652', alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.45 }
});