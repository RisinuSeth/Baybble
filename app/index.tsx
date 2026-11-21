import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-native';
import { supabase } from '../lib/supabase';
import AuthDialog from '../components/AuthDialog';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Animated } from 'react-native';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

const BAYBBLE_LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><mask id="transparent-gap"><rect width="64" height="64" fill="white"/><circle cx="43" cy="43" r="17" fill="none" stroke="black" stroke-width="4"/></mask></defs><g mask="url(#transparent-gap)"><circle cx="24" cy="23" r="23" fill="#ffffff"/><circle cx="43" cy="43" r="17" fill="#ffffff"/></g></svg>';

type BaybbleMessage = { role: 'user' | 'assistant'; content: string };
type ChatSession = { id: string; title: string; messages: BaybbleMessage[]; updatedAt: number };

const avatarColours = ['#315B83', '#7652A3', '#A05252', '#34796F', '#8A6737', '#536A9B'];

const megaMenuContent: Record<string, { eyebrow: string; title: string; description: string; items: { title: string; description: string; status?: string; href?: string }[] }> = {
  Product: {
    eyebrow: 'EXPLORE BAYBBLE',
    title: 'One platform. More possibilities ahead.',
    description: 'Discover the Baybble experience and what is coming next.',
    items: [
      { title: 'Baybble Workspace', description: 'Think through challenges, explore ideas and find practical next steps.', status: 'AVAILABLE NOW' },
      { title: 'More products', description: 'New tools and experiences are in development.', status: 'COMING SOON' },
      { title: 'New capabilities', description: 'More ways to work through problems are on the way.', status: 'COMING SOON' }
    ]
  },
  'Use Cases': {
    eyebrow: 'USE BAYBBLE TO',
    title: 'A clearer way forward, whatever you are working on.',
    description: 'Start with a question, an idea or a challenge. Use Baybble to make sense of it and decide what to do next.',
    items: [
      { title: 'Understand', description: 'Make complex topics and unfamiliar ideas easier to understand.' },
      { title: 'Explore', description: 'Look at different perspectives, options and possibilities.' },
      { title: 'Make decisions', description: 'Weigh up choices and think through the consequences.' },
      { title: 'Plan next steps', description: 'Turn a broad goal into a clear, practical plan.' }
    ]
  },
  Pricing: {
    eyebrow: 'PLANS & ACCESS',
    title: 'Straightforward access to Baybble.',
    description: 'We are shaping the plans and features for the platform.',
    items: [
      { title: 'Plans & pricing', description: 'Plan details will be published here.', status: 'COMING SOON' },
      { title: 'Feature comparison', description: 'A clear breakdown of plan features is on the way.', status: 'COMING SOON' }
    ]
  },
  Resources: {
    eyebrow: 'RESOURCES',
    title: 'Everything you need to get started.',
    description: 'Useful information and updates to help you get more from Baybble.',
    items: [
      { title: 'Getting Started', description: 'A guide to using the Baybble workspace.', status: 'COMING SOON' },
      { title: 'Latest News', description: 'Product announcements and platform updates.', status: 'COMING SOON' },
      { title: 'Release Notes', description: 'See what is new and what has changed.', status: 'COMING SOON' },
      { title: 'Help & Support', description: 'Find help with your Baybble account and experience.', status: 'COMING SOON' },
      { title: 'Security & Privacy', description: 'Read how Baybble handles your information.', href: '/privacy' }
    ]
  }
};

function profileInitials(name?: string, email?: string) {
  const source = name?.trim() || email?.split('@')[0] || 'B';
  const parts = source.replace(/[._-]+/g, ' ').split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)).toUpperCase();
}

function profileAvatarColour(email?: string) {
  const value = email || 'baybble';
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return avatarColours[Math.abs(hash) % avatarColours.length];
}

function BaybbleLogo({ dark = false }: { dark?: boolean }) {
  return (
    <View style={styles.logoMark} accessibilityLabel="Baybble logo">
      <View style={[styles.logoBubbleOne, dark && { backgroundColor: '#080808' }]} />
      <View style={[styles.logoBubbleTwo, dark && { backgroundColor: '#080808', borderColor: '#ffffff' }]} />
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
  const [messages, setMessages] = useState<BaybbleMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [historyReady, setHistoryReady] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [hoveredMegaLink, setHoveredMegaLink] = useState<string | null>(null);
  const megaMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaMenuAnimation = useRef(new Animated.Value(0)).current;
  const navItemLayouts = useRef<Record<string, { x: number; width: number }>>({});
  const navCapsuleX = useRef(new Animated.Value(0)).current;
  const navCapsuleWidth = useRef(new Animated.Value(0)).current;
  const navCapsuleOpacity = useRef(new Animated.Value(0)).current;
  const [authUser, setAuthUser] = useState<{ id: string; email?: string; fullName?: string; avatarUrl?: string } | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    const applySession = async (session: any) => {
      if (!session?.user) { if (alive) setAuthUser(null); return; }
      const user = session.user;
      let avatarUrl = '';
      const avatarPath = user.user_metadata?.avatar_path;
      if (typeof avatarPath === 'string' && avatarPath) {
        const { data } = await supabase.storage.from('baybble-avatars').createSignedUrl(avatarPath, 3600);
        avatarUrl = data?.signedUrl ?? '';
      }
      if (alive) setAuthUser({ id: user.id, email: user.email, fullName: user.user_metadata?.full_name, avatarUrl });
    };
    supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('baybble-chat-history-v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSessions(parsed);
      }
    } catch {
      // Keep Baybble usable if browser storage is unavailable.
    } finally {
      setHistoryReady(true);
    }
  }, []);

  useEffect(() => {
    if (!historyReady || !authUser?.id) return;
    let cancelled = false;
    const loadCloudHistory = async () => {
      const { data: conversations, error } = await supabase
        .from('baybble_conversations')
        .select('id,title,updated_at')
        .eq('user_id', authUser.id)
        .order('updated_at', { ascending: false })
        .limit(50);
      if (error || cancelled) return;
      if (!conversations?.length && sessions.length) {
        const migrated: ChatSession[] = [];
        for (const old of sessions.slice(0, 50)) {
          const { data: created, error: createError } = await supabase
            .from('baybble_conversations')
            .insert({ user_id: authUser.id, title: old.title })
            .select('id,updated_at')
            .single();
          if (createError || !created) continue;
          if (old.messages.length) {
            const rows = old.messages.map((message) => ({
              conversation_id: created.id, user_id: authUser.id, role: message.role, content: message.content
            }));
            await supabase.from('baybble_messages').insert(rows);
          }
          migrated.push({ ...old, id: created.id, updatedAt: new Date(created.updated_at).getTime() });
          if (activeSessionId === old.id) setActiveSessionId(created.id);
        }
        if (!cancelled && migrated.length) setSessions(migrated);
        return;
      }
      const cloud: ChatSession[] = [];
      for (const conversation of conversations ?? []) {
        const { data: rows } = await supabase
          .from('baybble_messages')
          .select('role,content')
          .eq('conversation_id', conversation.id)
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: true });
        cloud.push({
          id: conversation.id,
          title: conversation.title,
          messages: (rows ?? []).map((row: any) => ({ role: row.role, content: row.content })),
          updatedAt: new Date(conversation.updated_at).getTime()
        });
      }
      if (!cancelled) setSessions(cloud);
    };
    loadCloudHistory();
    return () => { cancelled = true; };
  }, [historyReady, authUser?.id]);

  useEffect(() => {
    if (!historyReady) return;
    try {
      window.localStorage.setItem('baybble-chat-history-v1', JSON.stringify(sessions));
    } catch {
      // Storage may be full or disabled; current chat remains usable.
    }
  }, [sessions, historyReady]);

  useEffect(() => {
    if (!historyReady || !activeSessionId || messages.length === 0) return;
    setSessions((current) => current.map((session) =>
      session.id === activeSessionId
        ? { ...session, messages, updatedAt: Date.now() }
        : session
    ));
  }, [messages, activeSessionId, historyReady]);

  const createNewChat = () => {
    abortController.current?.abort();
    abortController.current = null;
    setIsSending(false);
    setMessages([]);
    setDraft('');
    setChatError('');
    setActiveSessionId(null);
    setChatMode(true);
    setHistoryOpen(false);
    setRenamingSessionId(null);
    transition.setValue(1);
  };

  const openSavedChat = (session: ChatSession) => {
    abortController.current?.abort();
    abortController.current = null;
    setIsSending(false);
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setDraft('');
    setChatError('');    setChatMode(true);
    setHistoryOpen(false);
    setRenamingSessionId(null);
    transition.setValue(1);
  };

  const beginRename = (session: ChatSession) => {
    setRenamingSessionId(session.id);
    setRenameDraft(session.title);
  };

  const saveRename = async () => {
    const title = renameDraft.trim();
    if (renamingSessionId && title) {
      setSessions((current) => current.map((session) =>
        session.id === renamingSessionId ? { ...session, title } : session
      ));
      if (authUser?.id && !renamingSessionId.startsWith('chat-')) {
        await supabase.from('baybble_conversations').update({ title }).eq('id', renamingSessionId).eq('user_id', authUser.id);
      }
    }
    setRenamingSessionId(null);
    setRenameDraft('');
  };

  const deleteChat = async (sessionId: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this conversation? This cannot be undone.')) return;
    setSessions((current) => current.filter((session) => session.id !== sessionId));
    if (authUser?.id && !sessionId.startsWith('chat-')) await supabase.from('baybble_conversations').delete().eq('id', sessionId).eq('user_id', authUser.id);
    if (activeSessionId === sessionId) createNewChat();
  };
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
    let conversationId = activeSessionId;
    const title = message.length > 42 ? `${message.slice(0, 42).trim()}…` : message;
    if (!conversationId) {
      if (authUser?.id) {
        const { data: created, error } = await supabase
          .from('baybble_conversations')
          .insert({ user_id: authUser.id, title })
          .select('id')
          .single();
        if (error || !created) { setChatError('Could not create a saved conversation. Please try again.'); return; }
        conversationId = created.id;
      } else {
        conversationId = `chat-${Date.now()}`;
      }
      setActiveSessionId(conversationId);
      setSessions((current) => [{
        id: conversationId as string, title, messages: history, updatedAt: Date.now()
      }, ...current].slice(0, 50));
    }
    if (authUser?.id && conversationId) {
      const { error } = await supabase.from('baybble_messages').insert({
        conversation_id: conversationId, user_id: authUser.id, role: 'user', content: message
      });
      if (error) { setChatError('Your message could not be saved. Please try again.'); return; }
      await supabase.from('baybble_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId).eq('user_id', authUser.id);
    }
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
      let assistantReply = '';
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
              assistantReply += token;
              setMessages((current) => current.map((item, index) =>
                index === current.length - 1 && item.role === 'assistant'
                  ? { ...item, content: item.content + token }
                  : item
              ));
            }
          } catch {}
        }
      }
      if (authUser?.id && conversationId && assistantReply) {
        const { error: saveError } = await supabase.from('baybble_messages').insert({
          conversation_id: conversationId, user_id: authUser.id, role: 'assistant', content: assistantReply
        });
        if (saveError) setChatError('Reply received, but it could not be saved to your account.');
        await supabase.from('baybble_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId).eq('user_id', authUser.id);
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

  useEffect(() => {
    Animated.timing(megaMenuAnimation, {
      toValue: activeMegaMenu ? 1 : 0,
      duration: activeMegaMenu ? 260 : 180,
      useNativeDriver: true
    }).start();
    return () => {
      if (megaMenuTimer.current) clearTimeout(megaMenuTimer.current);
    };
  }, [activeMegaMenu, megaMenuAnimation]);

  const moveNavCapsule = (item: string) => {
    const layout = navItemLayouts.current[item];
    if (!layout) return;
    Animated.parallel([
      Animated.spring(navCapsuleX, { toValue: layout.x, speed: 24, bounciness: 5, useNativeDriver: false }),
      Animated.spring(navCapsuleWidth, { toValue: layout.width, speed: 24, bounciness: 5, useNativeDriver: false }),
      Animated.timing(navCapsuleOpacity, { toValue: 1, duration: 110, useNativeDriver: false })
    ]).start();
  };
  const openMegaMenu = (item: string) => {
    if (megaMenuTimer.current) clearTimeout(megaMenuTimer.current);
    moveNavCapsule(item);
    setActiveMegaMenu(item);
  };
  const scheduleCloseMegaMenu = () => {
    if (megaMenuTimer.current) clearTimeout(megaMenuTimer.current);
    megaMenuTimer.current = setTimeout(() => {
      setActiveMegaMenu(null);
      Animated.parallel([
        Animated.timing(navCapsuleOpacity, { toValue: 0, duration: 120, useNativeDriver: false }),
        Animated.timing(navCapsuleWidth, { toValue: 0, duration: 160, useNativeDriver: false })
      ]).start();
    }, 650);
  };

  return (
    <>
    <ScrollView style={styles.screen} contentContainerStyle={styles.page} showsVerticalScrollIndicator>
      {!chatMode && (
        <View style={[styles.header, { paddingHorizontal: compact ? 20 : 52 }]}>          <Pressable accessibilityRole="link" accessibilityLabel="Baybble home" style={styles.brand}>
            <BaybbleLogo />
            <Text style={styles.wordmark}>Baybble</Text>
          </Pressable>

          {!compact && (
            <View style={[styles.nav, styles.navCentered]}>
              <Animated.View pointerEvents="none" style={[styles.navActiveCapsule, { opacity: navCapsuleOpacity, width: navCapsuleWidth, transform: [{ translateX: navCapsuleX }] }]} />
              {['Product', 'Use Cases', 'Pricing', 'Resources'].map((item) => (
                <Pressable
                  key={item}
                  style={styles.navLink}
                  onLayout={(event) => {
                    const { x, width: itemWidth } = event.nativeEvent.layout;
                    navItemLayouts.current[item] = { x, width: itemWidth };
                    if (activeMegaMenu === item) moveNavCapsule(item);
                  }}
                  onHoverIn={() => openMegaMenu(item)}
                  onPress={() => activeMegaMenu === item ? scheduleCloseMegaMenu() : openMegaMenu(item)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: activeMegaMenu === item }}
                >
                  <Text style={[styles.navText, activeMegaMenu === item && styles.navTextMenuOpen]}>{item}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.headerActions}>
            <Pressable
              style={authUser ? styles.profileButton : [styles.loginButton, { flexDirection: 'row', alignItems: 'center', gap: 7 }]}
              onPress={() => setAuthOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={authUser ? 'Open your account' : 'Log in'}
            >
              {authUser ? (
                <View style={[styles.headerAvatar, !authUser.avatarUrl && { backgroundColor: profileAvatarColour(authUser.email), borderWidth: 0 }]}>
                  {authUser.avatarUrl ? (
                    <Image source={{ uri: authUser.avatarUrl }} style={styles.headerAvatarImage} resizeMode="cover" />
                  ) : (
                    <Text style={styles.headerAvatarInitial}>{profileInitials(authUser.fullName, authUser.email)}</Text>
                  )}
                </View>
              ) : (
                <>
                  <Ionicons name="person-circle-outline" size={19} color="#eeeeee" />
                  <Text style={styles.loginText}>Log In</Text>
                </>
              )}
            </Pressable>
            {!authUser && (
              <Pressable style={styles.startButton} onPress={() => setAuthOpen(true)}>
                <Text style={styles.startText}>{compact ? 'Get Started' : 'Get Started Free'}</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {activeMegaMenu && !compact && !chatMode ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close navigation menu"
            onPress={() => setActiveMegaMenu(null)}
            style={styles.megaMenuBackdrop}
          />
          <Animated.View
            onHoverIn={() => { if (megaMenuTimer.current) clearTimeout(megaMenuTimer.current); }}
            onHoverOut={scheduleCloseMegaMenu}
            style={[
              styles.megaMenuPanel,
              {
                opacity: megaMenuAnimation,
                transform: [{ translateY: megaMenuAnimation.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }]
              }
            ]}
          >
            <View style={styles.megaMenuItems}>
              {(megaMenuContent[activeMegaMenu]?.items ?? []).map((entry) => (
                <Pressable
                  key={entry.title}
                  style={styles.megaMenuItem}
                  onHoverIn={() => {
                    if (megaMenuTimer.current) clearTimeout(megaMenuTimer.current);
                    setHoveredMegaLink(entry.title);
                  }}
                  onHoverOut={() => setHoveredMegaLink(null)}
                  disabled={!entry.href}
                  onPress={() => {
                    if (entry.href) {
                      setActiveMegaMenu(null);
                      setHoveredMegaLink(null);
                      window.location.href = entry.href;
                    }
                  }}
                  accessibilityRole={entry.href ? 'link' : 'text'}
                >
                  <Text style={[styles.megaMenuItemTitle, hoveredMegaLink === entry.title && styles.megaMenuItemTitleHovered]}>
                    {entry.title}
                  </Text>
                  {entry.status ? <Text style={styles.megaMenuStatus}>{entry.status}</Text> : null}
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </>
      ) : null}

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
                onSubmitEditing={sendMessage}
                accessibilityLabel="Start a conversation with Baybble"
              />
            </View>
          </Pressable>
          <Text style={styles.searchCaption}>Start with the challenge. Baybble helps you find a practical way forward.</Text>
          <Text style={styles.heroFootnote}>A clearer way to think through challenges and possibilities.</Text>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.chatWorkspace, { opacity: transition, transform: [{ translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }] }]}>
          <View style={styles.chatBody}>
            <View style={styles.chatUtilityRail}>
              <Pressable style={styles.railAction} onPress={() => setAuthOpen(true)} accessibilityRole="button" accessibilityLabel="Account and sign in">
                <View style={styles.railIconSlot}>
                  {authUser?.avatarUrl ? (
                    <Image source={{ uri: authUser.avatarUrl }} style={styles.railAvatarImage} resizeMode="cover" />
                  ) : authUser ? (
                    <View style={[styles.railAvatarFallback, { backgroundColor: profileAvatarColour(authUser.email) }]}>
                      <Text style={styles.railAvatarInitial}>{profileInitials(authUser.fullName, authUser.email)}</Text>
                    </View>
                  ) : (
                    <Ionicons name="person-circle-outline" size={21} color="#eeeeee" />
                  )}
                </View>
                <Text style={styles.railActionText}>{authUser ? 'Account' : 'Sign in'}</Text>
              </Pressable>
              <Pressable style={styles.railAction} onPress={createNewChat} accessibilityRole="button" accessibilityLabel="Start a new chat">
                <View style={styles.railIconSlot}>
                  <Image source={{ uri: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 5v14M5 12h14' fill='none' stroke='%23eeeeee' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E" }} style={{ width: 20, height: 20 }} resizeMode="contain" />
                </View>
                <Text style={styles.railActionText}>New chat</Text>
              </Pressable>
              <Pressable style={styles.railAction} onPress={() => setHistoryOpen((open) => !open)} accessibilityRole="button" accessibilityLabel="Toggle conversation history">
                <View style={styles.railIconSlot}>
                  <Image source={{ uri: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='9' fill='none' stroke='%23eeeeee' stroke-width='1.8'/%3E%3Cpath d='M12 7v5l3 2' fill='none' stroke='%23eeeeee' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E" }} style={{ width: 20, height: 20 }} resizeMode="contain" />
                </View>
                <Text style={styles.railActionText}>History</Text>
              </Pressable>
            </View>
            {historyOpen ? (
              <View style={[styles.historySidebar, compact && styles.historySidebarCompact]}>
                <View style={styles.historyHeadingRow}>
                  <Text style={styles.historyHeading}>Your conversations</Text>
                  <Pressable onPress={() => setHistoryOpen(false)} accessibilityLabel="Close history">
                    <Ionicons name="close" size={19} color="#aaaaaa" />
                  </Pressable>
                </View>
                <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                  {sessions.length === 0 ? (
                    <Text style={styles.historyEmpty}>Your saved conversations will appear here.</Text>
                  ) : sessions.map((session) => (
                    <View key={session.id} style={[styles.historyItem, activeSessionId === session.id && styles.historyItemActive]}>
                      {renamingSessionId === session.id ? (
                        <View style={styles.renameRow}>
                          <TextInput
                            value={renameDraft}
                            onChangeText={setRenameDraft}
                            onSubmitEditing={saveRename}
                            autoFocus
                            style={styles.renameInput}
                            accessibilityLabel="Conversation name"
                          />
                          <Pressable onPress={saveRename} accessibilityLabel="Save conversation name">
                            <Ionicons name="checkmark" size={18} color="#ffffff" />
                          </Pressable>
                        </View>
                      ) : (
                        <>
                          <Pressable style={styles.historyTitleButton} onPress={() => openSavedChat(session)}>
                            <Text numberOfLines={1} style={styles.historyTitle}>{session.title}</Text>
                          </Pressable>
                          <Pressable onPress={() => beginRename(session)} accessibilityLabel={`Rename ${session.title}`} style={styles.historyAction}>
                            <Ionicons name="create-outline" size={14} color="#999999" />
                          </Pressable>
                          <Pressable onPress={() => deleteChat(session.id)} accessibilityLabel={`Delete ${session.title}`} style={styles.historyAction}>
                            <Ionicons name="trash-outline" size={14} color="#999999" />
                          </Pressable>
                        </>
                      )}
                    </View>
                  ))}
                </ScrollView>
                <Text style={styles.historyFootnote}>{authUser ? 'Synced to your Baybble account' : 'Saved in this browser'}</Text>
              </View>
            ) : null}
            <View style={styles.chatMain}>
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
                      onKeyPress={(event: any) => {
                        const key = event?.nativeEvent?.key ?? event?.key;
                        const shift = event?.shiftKey ?? event?.nativeEvent?.shiftKey;
                        if (key === 'Enter' && !shift) {                          event?.preventDefault?.();
                          sendMessage();
                        }
                      }}
                      onSubmitEditing={sendMessage}
                    />
                  </View>
                </View>
                <Text style={styles.composerDisclaimer}>Baybble can make mistakes once AI responses are enabled. Check important information.</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

    </ScrollView>
    <AuthDialog visible={authOpen} onClose={() => setAuthOpen(false)} userEmail={authUser?.email ?? null} onSignedOut={() => { setAuthUser(null); setSessions([]); setMessages([]); setActiveSessionId(null); setAuthOpen(false); }} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: '100vh' as any, width: '100%', backgroundColor: '#080808' },
  page: { width: '100%', alignItems: 'center', paddingBottom: 0 },
  header: { width: '100%', minHeight: 92, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 8, paddingVertical: 16, backgroundColor: '#080808' },
  navTextMenuOpen: { color: '#080808' },
  navActiveCapsule: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 999, backgroundColor: '#ffffff', zIndex: 0 },
  megaMenuBackdrop: { position: 'fixed' as any, top: 0, right: 0, bottom: 0, left: 0, zIndex: 5, backgroundColor: 'rgba(8,8,8,0.28)', backdropFilter: 'blur(9px)' as any, WebkitBackdropFilter: 'blur(9px)' as any } as any,
  megaMenuPanel: { position: 'absolute' as any, top: 92, left: 0, right: 0, zIndex: 7, borderRadius: 0, backgroundColor: '#ffffff', paddingLeft: 52, paddingRight: 24, paddingTop: 28, paddingBottom: 30, alignItems: 'flex-start', shadowColor: '#000000', shadowOpacity: 0.14, shadowRadius: 35, shadowOffset: { width: 0, height: 18 }, elevation: 18 } as any,
  megaMenuItems: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 18 },
  megaMenuItem: { minWidth: 0, minHeight: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 12, paddingVertical: 2 },
  megaMenuItemTitle: { color: '#111111', fontFamily: 'Manrope', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  megaMenuItemTitleHovered: { textDecorationLine: 'underline' },
  megaMenuStatus: { color: '#888888', fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 1.1, flexShrink: 0 },
  chatHeader: { borderBottomWidth: 1, borderBottomColor: '#242424' },
  newChatButton: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#343434', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 15 },
  newChatText: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '700', fontSize: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoMark: { width: 32, height: 32, position: 'relative' },
  logoBubbleOne: { position: 'absolute', width: 23, height: 23, borderRadius: 12, backgroundColor: '#ffffff', top: 0, left: 0 },
  logoBubbleTwo: { position: 'absolute', width: 17, height: 17, borderRadius: 9, backgroundColor: '#ffffff', bottom: 2, right: 2, borderWidth: 2, borderColor: '#080808' },
  wordmark: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '800', fontSize: 25, letterSpacing: -1.2 },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  navCentered: { position: 'absolute', left: 0, right: 0, justifyContent: 'center', overflow: 'visible' },
  navLink: { paddingVertical: 10, paddingHorizontal: 12, zIndex: 1 },
  navText: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '600', fontSize: 13 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 17 },
  loginButton: { paddingVertical: 11, paddingHorizontal: 4 },
  profileButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, overflow: 'hidden' },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#292929', borderWidth: 1, borderColor: '#505050' },
  headerAvatarImage: { width: '100%', height: '100%' },
  headerAvatarInitial: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '800', fontSize: 14 },
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
  chatWorkspace: { position: 'fixed' as any, top: 0, right: 0, bottom: 0, left: 0, zIndex: 10, width: '100%', height: '100vh' as any, minHeight: '100vh' as any, flex: 1, backgroundColor: '#080808' },
  chatBody: { width: '100%', height: '100%' as any, flex: 1, minHeight: '100vh' as any, flexDirection: 'row', position: 'relative' },
  chatUtilityRail: { width: 76, minHeight: '100%' as any, alignSelf: 'stretch', flexShrink: 0, alignItems: 'center', gap: 12, paddingTop: 18, paddingHorizontal: 7, borderRightWidth: 1, borderRightColor: '#202020', backgroundColor: '#0b0b0b' },
  railAction: { width: '100%', minHeight: 58, alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, paddingVertical: 8 },
  railIconSlot: { width: 28, height: 24, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  railAvatarImage: { width: 24, height: 24, borderRadius: 12 },
  railAvatarFallback: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#536A9B' },
  railAvatarInitial: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '800', fontSize: 10 },
  railActionText: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 9, fontWeight: '700', textAlign: 'center' },

  historySidebar: { width: 258, flexShrink: 0, backgroundColor: '#101010', borderRightWidth: 1, borderRightColor: '#292929', paddingHorizontal: 13, paddingTop: 13, paddingBottom: 12 },
  historySidebarCompact: { position: 'absolute', zIndex: 5, top: 0, bottom: 0, left: 76, width: 270, shadowColor: '#000000', shadowOpacity: 0.45, shadowRadius: 16, elevation: 12 },
  historyHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 5, paddingBottom: 14 },
  historyHeading: { color: '#eeeeee', fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  historyNewButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#383838', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 12, marginBottom: 12 },
  historyNewText: { color: '#ffffff', fontFamily: 'Manrope', fontSize: 12, fontWeight: '700' },
  historyList: { flex: 1 },
  historyEmpty: { color: '#858585', fontFamily: 'Manrope', fontSize: 11, lineHeight: 18, paddingHorizontal: 6, paddingTop: 12 },
  historyItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 5, marginBottom: 3 },
  historyItemActive: { backgroundColor: '#242424' },
  historyTitleButton: { flex: 1, minWidth: 0, paddingVertical: 7 },
  historyTitle: { color: '#dddddd', fontFamily: 'Manrope', fontSize: 11 },
  historyAction: { padding: 6 },
  renameRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 },
  renameInput: { flex: 1, minWidth: 0, color: '#ffffff', fontFamily: 'Manrope', fontSize: 11, borderBottomWidth: 1, borderBottomColor: '#777777', paddingVertical: 5, outlineStyle: 'none' as any },
  historyFootnote: { color: '#666666', fontFamily: 'Manrope', fontSize: 9, paddingTop: 10, paddingHorizontal: 5 },
  chatMain: { flex: 1, minWidth: 0, minHeight: 0, alignItems: 'center' },
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