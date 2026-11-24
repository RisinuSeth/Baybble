import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-native';
import { supabase } from '../lib/supabase';
import AuthDialog from '../components/AuthDialog';
import MarkdownMessage from '../components/MarkdownMessage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Animated } from 'react-native';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

const BAYBBLE_LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><mask id="transparent-gap"><rect width="64" height="64" fill="white"/><circle cx="43" cy="43" r="17" fill="none" stroke="black" stroke-width="4"/></mask></defs><g mask="url(#transparent-gap)"><circle cx="24" cy="23" r="23" fill="#F1F1F1"/><circle cx="43" cy="43" r="17" fill="#F1F1F1"/></g></svg>';
const BAYBBLE_WORDMARK_IMAGE = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="112" height="34" viewBox="0 0 112 34"><text x="1" y="25" fill="#EEEEEE" font-family="Manrope, Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="-1.05" text-rendering="optimizeLegibility">Baybble</text></svg>');

type ChatFileBadge = { id: string; name: string; mimeType: string; size: number };
type PendingAttachment = ChatFileBadge & { file: any; extractedText: string; pageCount?: number | null };
type BaybbleMessage = { id?: string; role: 'user' | 'assistant'; content: string; attachments?: ChatFileBadge[] };
type ChatSession = { id: string; title: string; messages: BaybbleMessage[]; updatedAt: number; pinned?: boolean };

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

function shouldSearchWebInClient(query: string): boolean {
  const text = query.toLowerCase();
  return /\b(latest|currently|current|today|tonight|this week|this month|recent|newest|breaking|news|as of now|right now|202[5-9]|2030)\b/.test(text)
    || /\b(search the web|search online|look up|find sources|find references|provide citations|cite sources|research online|on the internet|web search|latest developments|current events|scientific evidence|academic research|peer reviewed|studies show|research suggests)\b/.test(text)
    || /\b(price|pricing|exchange rate|weather|opening hours|available now|release date|version)\b/.test(text)
    || /\b(human origins|origin of (?:humans|humanity|life)|human evolution|evolution of (?:humans|humanity)|formation of (?:humans|humanity)|fossil record|genetic evidence)\b/.test(text);
}

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
      <View style={styles.logoBubbleOne} />
      <View style={styles.logoBubbleTwo} />
    </View>
  );
}

function SidebarToggleIcon() {
  return (
    <View style={styles.sidebarToggleFrame} accessibilityElementsHidden>
      <View style={styles.sidebarToggleDivider} />
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
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isPreparingFiles, setIsPreparingFiles] = useState(false);
  const [conversationAttachments, setConversationAttachments] = useState<Array<{ name: string; text: string }>>([]);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState<BaybbleMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [historyReady, setHistoryReady] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [forceWebSearch, setForceWebSearch] = useState(false);
  const [composerMenuOpen, setComposerMenuOpen] = useState(false);
  const [hoveredComposerAction, setHoveredComposerAction] = useState<string | null>(null);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<any>(null);
  const [chatError, setChatError] = useState('');
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null);
  const [hoveredMessageAction, setHoveredMessageAction] = useState<string | null>(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editingMessageDraft, setEditingMessageDraft] = useState('');
  const [messageFeedback, setMessageFeedback] = useState<Record<number, 'up' | 'down'>>({});
  const [authOpen, setAuthOpen] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [loginHovered, setLoginHovered] = useState(false);
  const [hoveredMegaLink, setHoveredMegaLink] = useState<string | null>(null);
  const megaMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaMenuAnimation = useRef(new Animated.Value(0)).current;
  const navItemLayouts = useRef<Record<string, { x: number; width: number }>>({});
  const navCapsuleX = useRef(new Animated.Value(0)).current;
  const navCapsuleWidth = useRef(new Animated.Value(0)).current;
  const navCapsuleOpacity = useRef(new Animated.Value(0)).current;
  const [authUser, setAuthUser] = useState<{ id: string; email?: string; fullName?: string; avatarUrl?: string } | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const conversationScrollRef = useRef<ScrollView | null>(null);
  const isNearConversationBottomRef = useRef(true);
  const conversationScrollIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isNearConversationBottom, setIsNearConversationBottom] = useState(true);
  const [isConversationScrolling, setIsConversationScrolling] = useState(false);
  const [isScrollControlHovered, setIsScrollControlHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!chatMode || draft || messages.length > 0) {
      setAnimatedPlaceholder('');
      return;
    }

    const examples = [
      'Help me organise my week...',
      'Help me think through a difficult decision...',
      'Turn this idea into a practical plan...',
      'Explain a complex topic in simple terms...',
      'Explore different ways to solve this problem...'
    ];
    let phraseIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const animate = () => {
      const phrase = examples[phraseIndex];
      if (!deleting) {
        characterIndex += 1;
        setAnimatedPlaceholder(phrase.slice(0, characterIndex));
        if (characterIndex >= phrase.length) {
          deleting = true;
          timeout = setTimeout(animate, 1500);
          return;
        }
        timeout = setTimeout(animate, 58);
        return;
      }

      characterIndex -= 1;
      setAnimatedPlaceholder(phrase.slice(0, characterIndex));
      if (characterIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % examples.length;
        timeout = setTimeout(animate, 320);
        return;
      }
      timeout = setTimeout(animate, 28);
    };

    timeout = setTimeout(animate, 500);
    return () => clearTimeout(timeout);
  }, [chatMode, draft, messages.length]);

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
        .select('id,title,created_at')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error || cancelled) return;
      if (!conversations?.length && sessions.length) {
        const migrated: ChatSession[] = [];
        for (const old of sessions.slice(0, 50)) {
          const { data: created, error: createError } = await supabase
            .from('baybble_conversations')
            .insert({ user_id: authUser.id, title: old.title })
            .select('id,created_at')
            .single();
          if (createError || !created) continue;
          if (old.messages.length) {
            const rows = old.messages.map((message) => ({
              conversation_id: created.id, user_id: authUser.id, role: message.role, content: message.content
            }));
            await supabase.from('baybble_messages').insert(rows);
          }
          migrated.push({ ...old, id: created.id, updatedAt: new Date(created.created_at).getTime() });
          if (activeSessionId === old.id) setActiveSessionId(created.id);
        }
        if (!cancelled && migrated.length) setSessions(migrated);
        return;
      }
      const cloud: ChatSession[] = [];
      for (const conversation of conversations ?? []) {
        const [{ data: rows }, { data: fileRows }] = await Promise.all([
          supabase.from('baybble_messages')
            .select('id,role,content')
            .eq('conversation_id', conversation.id)
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: true }),
          supabase.from('baybble_attachments')
            .select('id,message_id,filename,mime_type,file_size')
            .eq('conversation_id', conversation.id)
            .eq('user_id', authUser.id)
        ]);
        const filesByMessage = new Map<string, ChatFileBadge[]>();
        for (const file of fileRows || []) {
          const current = filesByMessage.get(file.message_id) || [];
          current.push({ id: file.id, name: file.filename, mimeType: file.mime_type, size: file.file_size });
          filesByMessage.set(file.message_id, current);
        }
        cloud.push({
          id: conversation.id,
          title: conversation.title,
          messages: (rows ?? []).map((row: any) => ({
            id: row.id,
            role: row.role,
            content: row.content,
            ...(filesByMessage.has(row.id) ? { attachments: filesByMessage.get(row.id) } : {})
          })),
          updatedAt: new Date(conversation.created_at).getTime(),
          pinned: Boolean(sessions.find((saved) => saved.id === conversation.id)?.pinned)
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
        ? { ...session, messages }
        : session
    ));
  }, [messages, activeSessionId, historyReady]);

  const handleFileSelection = async (event: any) => {
    const selected = Array.from(event?.target?.files || []) as any[];
    if (event?.target) event.target.value = '';
    if (!selected.length) return;
    const remaining = Math.max(0, 5 - pendingAttachments.length);
    if (selected.length > remaining) setChatError('You can attach up to five files to a message.');
    setIsPreparingFiles(true);
    try {
      for (const file of selected.slice(0, remaining)) {
        const extension = String(file.name || '').split('.').pop()?.toLowerCase();
        if (!['pdf', 'docx', 'txt', 'csv'].includes(extension)) {
          setChatError('Supported files are PDF, DOCX, TXT and CSV.');
          continue;
        }
        if (!file.size || file.size > 10 * 1024 * 1024) {
          setChatError('Each file must be 10 MB or smaller.');
          continue;
        }
        try {
          const form = new FormData();
          form.append('file', file);
          const response = await fetch('/api/extract', { method: 'POST', body: form });
          const result = await response.json();
          if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'Could not read this file.');
          if (typeof result.text !== 'string' || !result.text.trim()) throw new Error('No readable text was found in this file.');
          const attachment: PendingAttachment = {
            id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            file,
            name: result.name || file.name,
            mimeType: result.mimeType || file.type || 'application/octet-stream',
            size: file.size,
            extractedText: result.text,
            pageCount: result.pageCount
          };
          setPendingAttachments((current) => [...current, attachment].slice(0, 5));
          setChatError('');
        } catch (error) {
          setChatError(error instanceof Error ? error.message : 'Baybble could not read this file.');
        }
      }
    } finally {
      setIsPreparingFiles(false);
    }
  };
  const pickFiles = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.docx,.txt,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv';
    input.multiple = true;
    input.onchange = (event) => { void handleFileSelection(event); };
    input.click();
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      speechRecognitionRef.current?.stop?.();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setChatError('Voice input is not supported in this browser. Try a recent version of Chrome.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      speechRecognitionRef.current = recognition;
      recognition.lang = navigator.language || 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          if (event.results[index].isFinal) transcript += event.results[index][0]?.transcript || '';
        }
        if (transcript.trim()) {
          setDraft((current) => `${current}${current && !/\\s$/.test(current) ? ' ' : ''}${transcript.trim()}`);
          setChatError('');
        }
      };
      recognition.onerror = (event: any) => {
        if (event?.error !== 'no-speech' && event?.error !== 'aborted') {
          setChatError('Voice input could not start. Check your microphone permission and try again.');
        }
      };
      recognition.onend = () => {
        setIsListening(false);
        speechRecognitionRef.current = null;
      };
      recognition.start();
      setIsListening(true);
      setChatError('');
    } catch {
      setIsListening(false);
      setChatError('Voice input could not start. Check your microphone permission and try again.');
    }
  };

  const createNewChat = () => {
    abortController.current?.abort();
    abortController.current = null;
    setIsSending(false);
    setMessages([]);
    setDraft('');
    setPendingAttachments([]);
    setConversationAttachments([]);
    setChatError('');
    setActiveSessionId(null);
    setChatMode(true);
    setHistoryOpen(false);
    setRenamingSessionId(null);
    transition.setValue(1);
  };

  const openSavedChat = async (session: ChatSession) => {
    abortController.current?.abort();
    abortController.current = null;
    setIsSending(false);
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setDraft('');
    setPendingAttachments([]);
    setConversationAttachments([]);
    if (authUser?.id && !session.id.startsWith('chat-')) {
      const { data: files } = await supabase.from('baybble_attachments')
        .select('filename,extracted_text')
        .eq('conversation_id', session.id)
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: true });
      setConversationAttachments((files || []).map((file: any) => ({ name: file.filename, text: file.extracted_text })));
    }
    setChatError('');
    setChatMode(true);
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
    if (authUser?.id && !sessionId.startsWith('chat-')) {
      const { data: files } = await supabase.from('baybble_attachments')
        .select('storage_path')
        .eq('conversation_id', sessionId)
        .eq('user_id', authUser.id);
      const paths = (files || []).map((file: any) => file.storage_path).filter(Boolean);
      if (paths.length) await supabase.storage.from('baybble-conversation-files').remove(paths);
      await supabase.from('baybble_conversations').delete().eq('id', sessionId).eq('user_id', authUser.id);
    }
    if (activeSessionId === sessionId) createNewChat();
  };

  const shareChat = async () => {
    setChatMenuOpen(false);
    const activeSession = sessions.find((session) => session.id === activeSessionId);
    const title = activeSession?.title || 'Baybble conversation';
    const transcript = messages.map((message) => `${message.role === 'user' ? 'You' : 'Baybble'}:\n${message.content}`).join('\n\n');
    const shareText = `${title}\n\n${transcript}`;
    try {
      const shareApi = (navigator as any).share;
      if (shareApi) {
        await shareApi.call(navigator, { title, text: shareText });
      } else if ((navigator as any).clipboard?.writeText) {
        await (navigator as any).clipboard.writeText(shareText);
        window.alert('Conversation copied to clipboard.');
      } else {
        window.prompt('Copy your conversation:', shareText);
      }
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') window.alert('Could not share this conversation. Please try again.');
    }
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

  const copyMessage = async (content: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
        return true;
      }
      if (typeof document !== 'undefined') {
        const temporaryInput = document.createElement('textarea');
        temporaryInput.value = content;
        temporaryInput.setAttribute('readonly', '');
        temporaryInput.style.position = 'fixed';
        temporaryInput.style.opacity = '0';
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(temporaryInput);
        if (copied) return true;
      }
      setChatError('Copy is not available in this browser.');
      return false;
    } catch {
      setChatError('Could not copy this message.');
      return false;
    }
  };

  const sendMessage = async () => {
    const message = (editingMessageIndex !== null ? editingMessageDraft : draft).trim() || (pendingAttachments.length ? 'Please analyse the attached file(s).' : '');
    if (isPreparingFiles) { setChatError('Please wait while Baybble reads your files.'); return; }
    if ((!message && pendingAttachments.length === 0) || isSending) return;
    const filesToSend = [...pendingAttachments];
    const fileBadges: ChatFileBadge[] = filesToSend.map(({ id, name, mimeType, size }) => ({ id, name, mimeType, size }));
    const isEditingMessage = editingMessageIndex !== null;
    const editedMessage = isEditingMessage ? messages[editingMessageIndex!] : undefined;
    const baseMessages = isEditingMessage ? messages.slice(0, editingMessageIndex!) : messages;
    const history = [...baseMessages, { ...(editedMessage?.id ? { id: editedMessage.id } : {}), role: 'user' as const, content: message, ...(fileBadges.length ? { attachments: fileBadges } : editedMessage?.attachments?.length ? { attachments: editedMessage.attachments } : {}) }].slice(-20);
    if (editingMessageIndex !== null) { setEditingMessageIndex(null); setEditingMessageDraft(''); }
    let conversationId = activeSessionId;
    const isNewConversation = !conversationId;
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

    let messageId: string | null = null;
    const uploadedPaths: string[] = [];
    if (authUser?.id && conversationId) {
      if (isEditingMessage && editedMessage?.id) {
        const { error: updateError } = await supabase.from('baybble_messages')
          .update({ content: message }).eq('id', editedMessage.id).eq('user_id', authUser.id);
        if (updateError) { setChatError('Your edited message could not be saved. Please try again.'); return; }
        const laterIds = messages.slice(editingMessageIndex! + 1).map((item) => item.id).filter(Boolean) as string[];
        if (laterIds.length) {
          const { error: deleteError } = await supabase.from('baybble_messages').delete().in('id', laterIds).eq('user_id', authUser.id);
          if (deleteError) { setChatError('The edited message was saved, but later replies could not be reset. Please refresh and try again.'); return; }
        }
        messageId = editedMessage.id;
      } else {
        const { data: savedMessage, error } = await supabase.from('baybble_messages')
          .insert({ conversation_id: conversationId, user_id: authUser.id, role: 'user', content: message })
          .select('id')
          .single();
        if (error || !savedMessage) { setChatError('Your message could not be saved. Please try again.'); return; }
        messageId = savedMessage.id;
        history[history.length - 1] = { ...history[history.length - 1], id: messageId };
      }

      try {
        for (const attachment of filesToSend) {
          const safeName = attachment.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-100) || 'document';
          const fileId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
          const storagePath = `${authUser.id}/${conversationId}/${fileId}-${safeName}`;
          const { error: uploadError } = await supabase.storage.from('baybble-conversation-files')
            .upload(storagePath, attachment.file, { contentType: attachment.mimeType, upsert: false });
          if (uploadError) throw new Error(uploadError.message || 'A file could not be uploaded.');
          uploadedPaths.push(storagePath);
          const { error: metadataError } = await supabase.from('baybble_attachments').insert({
            message_id: messageId,
            conversation_id: conversationId,
            user_id: authUser.id,
            filename: attachment.name,
            mime_type: attachment.mimeType,
            file_size: attachment.size,
            storage_path: storagePath,
            extracted_text: attachment.extractedText,
            page_count: attachment.pageCount ?? null
          });
          if (metadataError) throw new Error(metadataError.message || 'File details could not be saved.');
        }
      } catch (error) {
        if (uploadedPaths.length) await supabase.storage.from('baybble-conversation-files').remove(uploadedPaths);
        await supabase.from('baybble_messages').delete().eq('id', messageId).eq('user_id', authUser.id);
        if (isNewConversation) {
          await supabase.from('baybble_conversations').delete().eq('id', conversationId).eq('user_id', authUser.id);
          setSessions((current) => current.filter((session) => session.id !== conversationId));
          setActiveSessionId(null);
        }
        setChatError(error instanceof Error ? error.message : 'The files could not be attached. Please try again.');
        return;
      }
      await supabase.from('baybble_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId).eq('user_id', authUser.id);
    }

    const attachmentContexts = [...conversationAttachments, ...filesToSend.map((file) => ({ name: file.name, text: file.extractedText }))].slice(-5);
    setConversationAttachments(attachmentContexts);
    setPendingAttachments([]);
    setMessages([...history, { role: 'assistant', content: '' }]);
    setDraft('');
    setChatError('');
    setIsSending(true);
    setIsSearchingWeb(forceWebSearch || shouldSearchWebInClient(message));

    const controller = new AbortController();
    abortController.current = controller;
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, attachments: attachmentContexts, forceSearchWeb: forceWebSearch }),
        signal: controller.signal
      });
      setIsSearchingWeb(false);
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
        const { data: savedReply, error: saveError } = await supabase.from('baybble_messages').insert({
          conversation_id: conversationId, user_id: authUser.id, role: 'assistant', content: assistantReply
        }).select('id').single();
        if (saveError) setChatError('Reply received, but it could not be saved to your account.');
        else if (savedReply?.id) setMessages((current) => current.map((item, index) => index === current.length - 1 && item.role === 'assistant' ? { ...item, id: savedReply.id } : item));
        await supabase.from('baybble_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId).eq('user_id', authUser.id);
      }

      if (isNewConversation && assistantReply && conversationId) {
        try {
          const titleResponse = await fetch('/api/title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [...history, { role: 'assistant', content: assistantReply }] })
          });
          if (titleResponse.ok && titleResponse.body) {
            const titleReader = titleResponse.body.getReader();
            const titleDecoder = new TextDecoder();
            let generatedTitle = '';
            let titleBuffer = '';
            const processTitleEvents = (chunkText: string) => {
              for (const line of chunkText.split(/\r?\n/)) {
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
                  generatedTitle += token;
                } catch {}
              }
            };
            while (true) {
              const { value, done } = await titleReader.read();
              if (done) break;
              titleBuffer += titleDecoder.decode(value, { stream: true });
              const lastNewline = titleBuffer.lastIndexOf('\n');
              if (lastNewline >= 0) {
                processTitleEvents(titleBuffer.slice(0, lastNewline));
                titleBuffer = titleBuffer.slice(lastNewline + 1);
              }
            }
            titleBuffer += titleDecoder.decode();
            if (titleBuffer.trim()) processTitleEvents(titleBuffer);
            const cleanTitle = generatedTitle
              .trim()
              .replace(/^title:\s*/i, '')
              .replace(/^["']|["']$/g, '')
              .replace(/[.!?]+$/g, '')
              .slice(0, 55)
              .trim();
            if (cleanTitle) {
              setSessions((current) => current.map((session) =>
                session.id === conversationId ? { ...session, title: cleanTitle } : session
              ));
              if (authUser?.id && !conversationId.startsWith('chat-')) {
                await supabase.from('baybble_conversations')
                  .update({ title: cleanTitle })
                  .eq('id', conversationId)
                  .eq('user_id', authUser.id);
              }
            }
          }
        } catch (titleError) {
          console.warn('Baybble could not generate a conversation title:', titleError);
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
      setIsSearchingWeb(false);
      setIsSending(false);
    }
  };
  const gradientRotation = useRef(new Animated.Value(0)).current;
  const sidebarWidth = useRef(new Animated.Value(270)).current;
  const collapsedBrandHover = useRef(new Animated.Value(0)).current;
  const collapsedBrandHoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Animated.timing(sidebarWidth, {
      toValue: sidebarCollapsed ? 70 : 270,
      duration: 220,
      useNativeDriver: false
    }).start();
  }, [sidebarCollapsed, sidebarWidth]);

  useEffect(() => {
    if (collapsedBrandHoverTimer.current) {
      clearTimeout(collapsedBrandHoverTimer.current);
      collapsedBrandHoverTimer.current = null;
    }
    collapsedBrandHover.stopAnimation();
    collapsedBrandHover.setValue(0);
  }, [sidebarCollapsed, collapsedBrandHover]);

  const visibleSessions = sessions
    .filter((session) => session.title.toLowerCase().includes(sidebarSearch.trim().toLowerCase()))
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.updatedAt - a.updatedAt);

  const togglePinActiveChat = () => {
    if (!activeSessionId) return;
    setSessions((current) => current.map((session) =>
      session.id === activeSessionId ? { ...session, pinned: !session.pinned } : session
    ));
    setChatMenuOpen(false);
  };

  useEffect(() => {
    const animation = Animated.loop(Animated.timing(gradientRotation, { toValue: 1, duration: 6500, useNativeDriver: false }));
    animation.start();
    return () => animation.stop();
  }, [gradientRotation]);

  const gradientAngle = gradientRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const thinkingDotAnimations = useRef([
    new Animated.Value(0.35),
    new Animated.Value(0.35),
    new Animated.Value(0.35)
  ]).current;

  const handleConversationScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    const nearBottom = distanceFromBottom <= 90;
    isNearConversationBottomRef.current = nearBottom;
    setIsNearConversationBottom(nearBottom);
    setIsConversationScrolling(true);
    if (conversationScrollIdleTimer.current) clearTimeout(conversationScrollIdleTimer.current);
    conversationScrollIdleTimer.current = setTimeout(() => setIsConversationScrolling(false), 450);
  };

  const handleConversationContentSizeChange = () => {
    if (isNearConversationBottomRef.current) {
      conversationScrollRef.current?.scrollToEnd({ animated: false });
    }
  };

  const scrollToLatestMessage = () => {
    conversationScrollRef.current?.scrollToEnd({ animated: true });
    isNearConversationBottomRef.current = true;
    setIsNearConversationBottom(true);
    setIsConversationScrolling(false);
  };

  useEffect(() => {
    if (!isSending || isNearConversationBottom || isConversationScrolling) return;
    const animations = thinkingDotAnimations.map((value, index) =>
      Animated.loop(Animated.sequence([
        Animated.delay(index * 150),
        Animated.timing(value, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(value, { toValue: 0.35, duration: 260, useNativeDriver: true }),
        Animated.delay((2 - index) * 150)
      ]))
    );
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [isSending, isNearConversationBottom, isConversationScrolling, thinkingDotAnimations]);

  useEffect(() => {
    return () => {
      if (conversationScrollIdleTimer.current) clearTimeout(conversationScrollIdleTimer.current);
    };
  }, []);

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
    }, 220);
  };

  return (
    <>
    <View pointerEvents="none" style={styles.videoBackground}>
      {React.createElement('video', {
        src: 'https://videos.pexels.com/video-files/29848604/12817768_3840_2160_30fps.mp4',
        autoPlay: true,
        muted: true,
        loop: true,
        playsInline: true,
        preload: 'metadata',
        style: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' },
        'aria-hidden': true
      } as any)}
    </View>
      {!chatMode && (
        <View style={[styles.header, { paddingHorizontal: compact ? 20 : 52, backgroundColor: '#050505' }]}>          <Pressable accessibilityRole="link" accessibilityLabel="Baybble home" onHoverIn={scheduleCloseMegaMenu} style={styles.brand}>
            <Image source={{ uri: BAYBBLE_WORDMARK_IMAGE }} accessibilityLabel="Baybble" resizeMode="contain" style={{ width: 112, height: 34 }} />
          </Pressable>

          {!compact && (
            <View style={[styles.nav, styles.navCentered]} onHoverOut={scheduleCloseMegaMenu}>
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
                  onHoverOut={scheduleCloseMegaMenu}
                  onPress={() => activeMegaMenu === item ? scheduleCloseMegaMenu() : openMegaMenu(item)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: activeMegaMenu === item }}
                >
                  <Text style={[styles.navText, activeMegaMenu ? (activeMegaMenu === item ? styles.navTextHovered : styles.navTextDimmed) : null]}>{item}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.headerActions}>
            <Pressable
              style={({ hovered, pressed }: any) => authUser ? styles.profileButton : [styles.loginButton, { flexDirection: 'row', alignItems: 'center', gap: 7 }, hovered && styles.headerTextHovered, pressed && styles.headerTextPressed]}
              onHoverIn={() => { scheduleCloseMegaMenu(); setLoginHovered(true); }}
              onHoverOut={() => setLoginHovered(false)}
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
                  <Ionicons name="person-circle-outline" size={19} color={loginHovered ? '#c9cdd2' : '#eeeeee'} />
                  <Text style={[styles.loginText, loginHovered && styles.loginTextHovered]}>Log In</Text>
                </>
              )}
            </Pressable>
            {!authUser && (
              <Pressable style={({ hovered, pressed }: any) => [styles.startButton, hovered && styles.startButtonHovered, pressed && styles.startButtonPressed]} onHoverIn={scheduleCloseMegaMenu} onPress={() => setAuthOpen(true)}>
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
            {...({
              onMouseEnter: () => { if (megaMenuTimer.current) clearTimeout(megaMenuTimer.current); },
              onMouseLeave: scheduleCloseMegaMenu
            } as any)}
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
    <ScrollView style={styles.screen} contentContainerStyle={[styles.page, !chatMode && { paddingTop: 58 }]} showsVerticalScrollIndicator>


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
          <Text style={[styles.heroTagline, compact && styles.heroTaglineCompact]}>Think beyond the obvious.</Text>
          <Pressable style={[styles.searchFrame, { minHeight: compact ? 56 : 62, zIndex: 1 }]} onPress={openChat}>
            <View style={[styles.searchBar, { minHeight: compact ? 56 : 62, paddingHorizontal: compact ? 16 : 21 }]}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onFocus={openChat}
                placeholder="What's on your mind?"
                placeholderTextColor="#777777"
                style={styles.input}
                returnKeyType="send"
                onSubmitEditing={sendMessage}
                accessibilityLabel="Start a conversation with Baybble"
              />
              <View style={styles.heroSearchArrowCircle} pointerEvents="none">
                <Ionicons name="arrow-forward" size={18} color="#f2f2f2" />
              </View>
            </View>
          </Pressable>
          <Text style={styles.heroFootnote}>A clearer way to think through challenges and possibilities.</Text>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.chatWorkspace, { opacity: transition, transform: [{ translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }] }]}>
          <View style={styles.chatBody}>
            {compact && !historyOpen ? (
              <Pressable
                style={styles.mobileSidebarTrigger}
                onPress={() => setHistoryOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Open workspace sidebar"
              >
                <Ionicons name="menu-outline" size={22} color="#eeeeee" />
              </Pressable>
            ) : null}
            {compact && historyOpen ? (
              <Pressable
                style={styles.sidebarBackdrop}
                onPress={() => setHistoryOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close workspace sidebar"
              />
            ) : null}
            {!compact || historyOpen ? (
              <Animated.View
                style={[
                  styles.workspaceSidebar,
                  compact && styles.workspaceSidebarOverlay,
                  !compact && { width: sidebarWidth }
                ]}
              >
                <View style={styles.sidebarBrandRow}>
                  {!sidebarCollapsed || compact ? (
                    <>
                      <View style={styles.sidebarBrand}>
                        <Text style={styles.sidebarWordmark}>Baybble</Text>
                      </View>
                      <Pressable
                        style={styles.sidebarIconButton}
                        onPress={() => compact ? setHistoryOpen(false) : setSidebarCollapsed((value) => !value)}
                        accessibilityRole="button"
                        accessibilityLabel={compact ? "Close sidebar" : "Collapse sidebar"}
                      >
                        {compact ? (
                          <Ionicons name="close" size={18} color="#a8a8a8" />
                        ) : (
                          <SidebarToggleIcon />
                        )}
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      style={styles.sidebarCollapsedBrandToggle}
                      onPress={() => {
                        if (collapsedBrandHoverTimer.current) {
                          clearTimeout(collapsedBrandHoverTimer.current);
                          collapsedBrandHoverTimer.current = null;
                        }
                        collapsedBrandHover.stopAnimation();
                        collapsedBrandHover.setValue(0);
                        setSidebarCollapsed(false);
                      }}
                      onHoverIn={() => {
                        if (collapsedBrandHoverTimer.current) clearTimeout(collapsedBrandHoverTimer.current);
                        collapsedBrandHoverTimer.current = setTimeout(() => {
                          Animated.timing(collapsedBrandHover, { toValue: 1, duration: 170, useNativeDriver: true }).start();
                          collapsedBrandHoverTimer.current = null;
                        }, 180);
                      }}
                      onHoverOut={() => {
                        if (collapsedBrandHoverTimer.current) {
                          clearTimeout(collapsedBrandHoverTimer.current);
                          collapsedBrandHoverTimer.current = null;
                        }
                        Animated.timing(collapsedBrandHover, { toValue: 0, duration: 170, useNativeDriver: true }).start();
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Expand sidebar"
                    >
                      <Animated.View
                        style={[
                          styles.sidebarCollapsedBrandLogo,
                          {
                            opacity: collapsedBrandHover.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                            transform: [{ scale: collapsedBrandHover.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] }) }]
                          }
                        ]}
                      >
                        <View style={{ transform: [{ scale: 0.72 }] }}>
                          <BaybbleLogo />
                        </View>
                      </Animated.View>
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          styles.sidebarCollapsedBrandGlyph,
                          { opacity: collapsedBrandHover }
                        ]}
                      >
                        <SidebarToggleIcon />
                      </Animated.View>
                    </Pressable>
                  )}
                </View>

                <Pressable
                  style={[styles.sidebarNewButton, sidebarCollapsed && !compact && styles.sidebarNewButtonCollapsed]}
                  onPress={createNewChat}
                  accessibilityRole="button"
                  accessibilityLabel="Start a new conversation"
                >
                  <Ionicons name="add" size={19} color="#080808" />
                  {!sidebarCollapsed || compact ? <Text style={styles.sidebarNewText}>New conversation</Text> : null}
                </Pressable>

                {!sidebarCollapsed || compact ? (
                  <>
                    <View style={styles.sidebarSearch}>
                      <Ionicons name="search-outline" size={17} color="#858585" />
                      <TextInput
                        value={sidebarSearch}
                        onChangeText={setSidebarSearch}
                        placeholder="Search conversations"
                        placeholderTextColor="#777777"
                        style={styles.sidebarSearchInput}
                        accessibilityLabel="Search conversations"
                        returnKeyType="search"
                      />
                      {sidebarSearch ? (
                        <Pressable onPress={() => setSidebarSearch('')} accessibilityLabel="Clear conversation search">
                          <Ionicons name="close-circle" size={15} color="#777777" />
                        </Pressable>
                      ) : null}
                    </View>

                    <View style={styles.sidebarQuickLinks}>
                      <View style={styles.sidebarQuickLink}>
                        <Ionicons name="folder-outline" size={17} color="#777777" />
                        <Text style={styles.sidebarQuickLinkText}>Projects</Text>
                        <Text style={styles.sidebarComingSoon}>SOON</Text>
                      </View>
                      <View style={styles.sidebarQuickLink}>
                        <Ionicons name="library-outline" size={17} color="#777777" />
                        <Text style={styles.sidebarQuickLinkText}>Library</Text>
                        <Text style={styles.sidebarComingSoon}>SOON</Text>
                      </View>
                    </View>

                    <View style={styles.sidebarSectionHeading}>
                      <Text style={styles.sidebarSectionLabel}>{sidebarSearch ? 'SEARCH RESULTS' : 'RECENT'}</Text>
                    </View>
                    <ScrollView style={styles.sidebarConversationList} showsVerticalScrollIndicator={false}>
                      {visibleSessions.length === 0 ? (
                        <Text style={styles.sidebarEmpty}>
                          {sidebarSearch ? 'No conversations match your search.' : 'Your recent conversations will appear here.'}
                        </Text>
                      ) : visibleSessions.map((session) => (
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
                                <Ionicons name="checkmark" size={17} color="#ffffff" />
                              </Pressable>
                            </View>
                          ) : (
                            <>
                              <Pressable style={styles.historyTitleButton} onPress={() => openSavedChat(session)}>
                                <Text numberOfLines={1} style={styles.historyTitle}>{session.title}</Text>
                              </Pressable>
                              <Pressable onPress={() => beginRename(session)} accessibilityLabel={`Rename ${session.title}`} style={styles.historyAction}>
                                <Ionicons name="create-outline" size={14} color="#888888" />
                              </Pressable>
                              <Pressable onPress={() => deleteChat(session.id)} accessibilityLabel={`Delete ${session.title}`} style={styles.historyAction}>
                                <Ionicons name="trash-outline" size={13} color="#888888" />
                              </Pressable>
                            </>
                          )}
                        </View>
                      ))}
                    </ScrollView>
                  </>
                ) : (
                  <View style={styles.sidebarCollapsedActions}>
                    <Pressable style={styles.sidebarCollapsedAction} onPress={() => setSidebarCollapsed(false)} accessibilityLabel="Search conversations">
                      <Ionicons name="search-outline" size={19} color="#bdbdbd" />
                    </Pressable>
                    <View style={styles.sidebarCollapsedAction}>
                      <Ionicons name="folder-outline" size={19} color="#666666" />
                    </View>
                    <View style={styles.sidebarCollapsedAction}>
                      <Ionicons name="library-outline" size={19} color="#666666" />
                    </View>
                  </View>
                )}

                <View style={styles.sidebarBottom}>
                  {!sidebarCollapsed || compact ? (
                    <Pressable style={styles.sidebarBottomLink} onPress={() => setAuthOpen(true)} accessibilityRole="button">
                      <Ionicons name="settings-outline" size={17} color="#a0a0a0" />
                      <Text style={styles.sidebarBottomText}>Settings</Text>
                    </Pressable>
                  ) : null}
                  <Pressable style={styles.sidebarAccount} onPress={() => setAuthOpen(true)} accessibilityRole="button" accessibilityLabel="Account and settings">
                    {authUser?.avatarUrl ? (
                      <Image source={{ uri: authUser.avatarUrl }} style={styles.sidebarAvatar} resizeMode="cover" />
                    ) : (
                      <View style={[styles.sidebarAvatar, { backgroundColor: authUser ? profileAvatarColour(authUser.email) : '#303030' }]}>
                        {authUser ? <Text style={styles.sidebarAvatarText}>{profileInitials(authUser.fullName, authUser.email)}</Text> : <Ionicons name="person" size={14} color="#eeeeee" />}
                      </View>
                    )}
                    {!sidebarCollapsed || compact ? (
                      <View style={styles.sidebarAccountCopy}>
                        <Text numberOfLines={1} style={styles.sidebarAccountName}>{authUser?.fullName || authUser?.email || 'Your account'}</Text>
                        <Text style={styles.sidebarAccountPlan}>{authUser ? 'Baybble account' : 'Sign in to sync chats'}</Text>
                      </View>
                    ) : null}
                  </Pressable>
                </View>
              </Animated.View>
            ) : null}
            <View style={styles.chatMain}>
              <View style={[styles.workspaceTopbar, compact && styles.workspaceTopbarCompact]}>
                <Text numberOfLines={1} style={styles.workspaceTopbarTitle}>
                  {activeSessionId ? (sessions.find((session) => session.id === activeSessionId)?.title || 'Conversation') : 'New conversation'}
                </Text>
                {messages.length > 0 ? (
                  <>
                  <View style={styles.chatTopbarActions}>
                    <Pressable
                      style={styles.chatShareButton}
                      onPress={shareChat}
                      disabled={messages.length === 0}
                      accessibilityRole="button"
                      accessibilityLabel="Share conversation"
                    >
                      <Ionicons name="share-outline" size={16} color={messages.length ? "#e5e5e5" : "#666666"} />
                      <Text style={[styles.chatShareText, messages.length === 0 && styles.chatOptionsDisabled]}>Share</Text>
                    </Pressable>
                    <Pressable
                    style={styles.chatMenuTrigger}
                    onPress={() => setChatMenuOpen((open) => !open)}
                    accessibilityRole="button"
                    accessibilityLabel="Conversation options"
                  >
                    <Ionicons name="ellipsis-horizontal" size={21} color="#d0d0d0" />
                  </Pressable>
                  </View>
                  {chatMenuOpen ? (
                    <>
                      <Pressable
                        style={styles.chatOptionsBackdrop}
                        onPress={() => setChatMenuOpen(false)}
                        accessibilityRole="button"
                        accessibilityLabel="Close conversation options"
                      />
                      <View style={styles.chatOptionsMenu}>
                      <Pressable style={[styles.chatOptionsItem, !activeSessionId && styles.chatOptionsItemDisabled]} disabled={!activeSessionId} onPress={togglePinActiveChat}>
                        <Ionicons name={sessions.find((item) => item.id === activeSessionId)?.pinned ? "pin" : "pin-outline"} size={16} color={activeSessionId ? "#e5e5e5" : "#666666"} />
                        <Text style={[styles.chatOptionsText, !activeSessionId && styles.chatOptionsDisabled]}>{sessions.find((item) => item.id === activeSessionId)?.pinned ? 'Unpin chat' : 'Pin chat'}</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.chatOptionsItem, !activeSessionId && styles.chatOptionsItemDisabled]}
                        disabled={!activeSessionId}
                        onPress={() => {
                          setChatMenuOpen(false);
                          window.alert('Projects are coming soon. You will be able to organise conversations into projects here.');
                        }}
                      >
                        <Ionicons name="folder-outline" size={16} color={activeSessionId ? "#e5e5e5" : "#666666"} />
                        <Text style={[styles.chatOptionsText, !activeSessionId && styles.chatOptionsDisabled]}>Add to project</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.chatOptionsItem, !activeSessionId && styles.chatOptionsItemDisabled]}
                        disabled={!activeSessionId}
                        onPress={() => {
                          const session = sessions.find((item) => item.id === activeSessionId);
                          setChatMenuOpen(false);
                          if (session) beginRename(session);
                          setSidebarCollapsed(false);
                        }}
                      >
                        <Ionicons name="pencil-outline" size={16} color={activeSessionId ? "#e5e5e5" : "#666666"} />
                        <Text style={[styles.chatOptionsText, !activeSessionId && styles.chatOptionsDisabled]}>Rename</Text>
                      </Pressable>
                      <View style={styles.chatOptionsDivider} />
                      <Pressable
                        style={[styles.chatOptionsItem, !activeSessionId && styles.chatOptionsItemDisabled]}
                        disabled={!activeSessionId}
                        onPress={() => {
                          setChatMenuOpen(false);
                          if (activeSessionId) void deleteChat(activeSessionId);
                        }}
                      >
                        <Ionicons name="trash-outline" size={16} color={activeSessionId ? "#f08b8b" : "#666666"} />
                        <Text style={[styles.chatOptionsDanger, !activeSessionId && styles.chatOptionsDisabled]}>Delete chat</Text>
                      </Pressable>
                      </View>
                    </>
                  ) : null}
                  </>
                ) : null}
              </View>
              <ScrollView
                ref={conversationScrollRef}
                style={styles.conversationScroll}
                contentContainerStyle={styles.conversationContent}
                showsVerticalScrollIndicator={false}
                onScroll={handleConversationScroll}
                onContentSizeChange={handleConversationContentSizeChange}
                scrollEventThrottle={16}
              >
                {messages.length === 0 ? (
                  <View style={styles.emptyConversation}>
                    <Text style={styles.chatGreeting}>Where should we start?</Text>
                    <Text style={styles.chatSubheading}>Tell Baybble what's on your mind. We'll work through it step by step.</Text>
                    <Text style={styles.chatNotice}>Your Baybble conversation starts here.</Text>
                  </View>
                ) : (
                  <View style={styles.messageList}>
                    {messages.map((message, index) => (
                      <View
                        key={index}
                        style={message.role === 'user' ? styles.userMessageGroup : styles.assistantMessageGroup}
                        {...({ onMouseEnter: () => setHoveredMessageIndex(index), onMouseLeave: () => setHoveredMessageIndex((current) => current === index ? null : current) } as any)}
                      >
                        {message.role === 'user' ? (
                          editingMessageIndex === index ? (
                            <View style={styles.inlineEditCard}>
                              <TextInput
                                value={editingMessageDraft}
                                onChangeText={setEditingMessageDraft}
                                style={styles.inlineEditInput}
                                multiline
                                autoFocus
                                accessibilityLabel="Edit your message"
                                onKeyPress={(event: any) => {
                                  const key = event?.nativeEvent?.key ?? event?.key;
                                  const shift = event?.shiftKey ?? event?.nativeEvent?.shiftKey;
                                  if (key === 'Enter' && !shift && editingMessageDraft.trim() && !isSending) { event?.preventDefault?.(); sendMessage(); }
                                  if (key === 'Escape') { setEditingMessageIndex(null); setEditingMessageDraft(''); }
                                }}
                              />
                              <View style={styles.inlineEditActions}>
                                <Pressable style={styles.inlineEditCancel} onPress={() => { setEditingMessageIndex(null); setEditingMessageDraft(''); }} accessibilityRole="button">
                                  <Text style={styles.inlineEditCancelText}>Cancel</Text>
                                </Pressable>
                                <Pressable style={[styles.inlineEditSave, (!editingMessageDraft.trim() || isSending) && styles.sendButtonDisabled]} onPress={sendMessage} disabled={!editingMessageDraft.trim() || isSending} accessibilityRole="button">
                                  <Ionicons name="arrow-up" size={15} color="#080808" />
                                  <Text style={styles.inlineEditSaveText}>Save</Text>
                                </Pressable>
                              </View>
                            </View>
                          ) : (
                          <View style={styles.userMessage}>
                            {message.attachments?.length ? (
                              <View style={styles.messageFileList}>
                                {message.attachments.map((file) => (
                                  <View key={file.id} style={styles.messageFileChip}>
                                    <Ionicons name="document-text-outline" size={14} color="#dddddd" />
                                    <Text numberOfLines={1} style={styles.messageFileName}>{file.name}</Text>
                                  </View>
                                ))}
                              </View>
                            ) : null}
                            <Text style={styles.userMessageText}>{message.content}</Text>
                          </View>
                          )
                        ) : (
                          <View style={styles.assistantMessage}>
                            {message.content ? <MarkdownMessage content={message.content} /> : isSending ? <Text style={styles.thinkingText}>{isSearchingWeb ? 'Searching the web…' : 'Baybble is thinking...'}</Text> : null}
                          </View>
                        )}
                        <View
                          pointerEvents={editingMessageIndex !== index && (message.role === 'assistant' || hoveredMessageIndex === index) && message.content ? 'auto' : 'none'}
                          style={[
                            styles.messageActions,
                            message.role === 'user' && styles.messageActionsUser,
                            { opacity: editingMessageIndex !== index && (message.role === 'assistant' || hoveredMessageIndex === index) && message.content ? 1 : 0 }
                          ]}
                        >
                          <View style={styles.messageActionWrap}>
                            <Pressable style={styles.messageActionButton} onHoverIn={() => setHoveredMessageAction(`${index}-copy`)} onHoverOut={() => setHoveredMessageAction(null)} onPress={async () => { const copied = await copyMessage(message.content); if (copied) { setCopiedMessageIndex(index); setTimeout(() => setCopiedMessageIndex((current) => current === index ? null : current), 1800); } }} accessibilityRole="button" accessibilityLabel={copiedMessageIndex === index ? "Message copied" : "Copy message"}>
                              <Ionicons name={copiedMessageIndex === index ? "checkmark" : "copy-outline"} size={14} color={copiedMessageIndex === index ? "#8bd5a5" : "#a0a0a0"} />
                            </Pressable>
                            {hoveredMessageAction === `${index}-copy` ? <Text style={styles.messageActionTooltip}>Copy</Text> : null}
                          </View>
                          {message.role === 'user' ? (
                            <View style={styles.messageActionWrap}>
                              <Pressable style={styles.messageActionButton} onHoverIn={() => setHoveredMessageAction(`${index}-edit`)} onHoverOut={() => setHoveredMessageAction(null)} onPress={() => { setEditingMessageDraft(message.content); setEditingMessageIndex(index); setHoveredMessageIndex(null); setHoveredMessageAction(null); }} accessibilityRole="button" accessibilityLabel="Edit message">
                                <Ionicons name="create-outline" size={14} color="#a0a0a0" />
                              </Pressable>
                              {hoveredMessageAction === `${index}-edit` ? <Text style={styles.messageActionTooltip}>Edit</Text> : null}
                            </View>
                          ) : (
                            <>
                              <View style={styles.messageActionWrap}>
                                <Pressable style={styles.messageActionButton} onHoverIn={() => setHoveredMessageAction(`${index}-up`)} onHoverOut={() => setHoveredMessageAction(null)} onPress={() => setMessageFeedback((current) => ({ ...current, [index]: current[index] === 'up' ? undefined as any : 'up' }))} accessibilityRole="button" accessibilityLabel="Good response">
                                  <Ionicons name={messageFeedback[index] === 'up' ? 'thumbs-up' : 'thumbs-up-outline'} size={14} color={messageFeedback[index] === 'up' ? '#eeeeee' : '#a0a0a0'} />
                                </Pressable>
                                {hoveredMessageAction === `${index}-up` ? <Text style={styles.messageActionTooltip}>Good response</Text> : null}
                              </View>
                              <View style={styles.messageActionWrap}>
                                <Pressable style={styles.messageActionButton} onHoverIn={() => setHoveredMessageAction(`${index}-down`)} onHoverOut={() => setHoveredMessageAction(null)} onPress={() => setMessageFeedback((current) => ({ ...current, [index]: current[index] === 'down' ? undefined as any : 'down' }))} accessibilityRole="button" accessibilityLabel="Bad response">
                                  <Ionicons name={messageFeedback[index] === 'down' ? 'thumbs-down' : 'thumbs-down-outline'} size={14} color={messageFeedback[index] === 'down' ? '#eeeeee' : '#a0a0a0'} />
                                </Pressable>
                                {hoveredMessageAction === `${index}-down` ? <Text style={styles.messageActionTooltip}>Bad response</Text> : null}
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                    ))}
                    {chatError ? <Text style={styles.chatError}>{chatError}</Text> : null}
                  </View>
                )}
              </ScrollView>
              {(isSending || !isNearConversationBottom) ? (
                <Pressable
                  style={styles.scrollFollowControl}
                  onPress={scrollToLatestMessage}
                  onHoverIn={() => setIsScrollControlHovered(true)}
                  onHoverOut={() => setIsScrollControlHovered(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Scroll to latest message"
                >
                  {!isSending || isScrollControlHovered ? (
                    <Ionicons name="arrow-down" size={14} color="#f2f2f2" />
                  ) : (
                    <View style={styles.thinkingDots}>
                      {thinkingDotAnimations.map((opacity, index) => (
                        <Animated.View key={index} style={[styles.thinkingDot, { opacity }]} />
                      ))}
                    </View>
                  )}
                </Pressable>
              ) : null}
              <View style={styles.composerArea}>
                {pendingAttachments.length ? (
                  <View style={styles.pendingFiles}>
                    {pendingAttachments.map((file) => (
                      <View key={file.id} style={styles.pendingFileChip}>
                        <Ionicons name="document-text-outline" size={14} color="#d8d8d8" />
                        <Text numberOfLines={1} style={styles.pendingFileName}>{file.name}</Text>
                        <Pressable onPress={() => setPendingAttachments((current) => current.filter((item) => item.id !== file.id))} accessibilityRole="button" accessibilityLabel={`Remove ${file.name}`}>
                          <Ionicons name="close" size={15} color="#999999" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                ) : null}
                {composerMenuOpen ? (
                  <View style={styles.composerActionMenu}>
                    <Pressable
                      style={[styles.composerActionItem, hoveredComposerAction === 'files' && styles.composerActionItemHovered]}
                      onHoverIn={() => setHoveredComposerAction('files')}
                      onHoverOut={() => setHoveredComposerAction(null)}
                      onPress={() => { setComposerMenuOpen(false); setHoveredComposerAction(null); pickFiles(); }}
                      disabled={isSending || isPreparingFiles}
                      accessibilityRole="button"
                    >
                      <Ionicons name="attach-outline" size={17} color="#c9c9c9" />
                      <Text style={styles.composerActionText}>Add files</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.composerActionItem, hoveredComposerAction === 'web' && styles.composerActionItemHovered]}
                      onHoverIn={() => setHoveredComposerAction('web')}
                      onHoverOut={() => setHoveredComposerAction(null)}
                      onPress={() => setForceWebSearch((enabled) => !enabled)}
                      disabled={isSending}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: forceWebSearch }}
                    >
                      <Ionicons name="globe-outline" size={17} color={forceWebSearch ? "#4f9cff" : "#bdbdbd"} />
                      <Text style={[styles.composerActionText, forceWebSearch && styles.composerActionTextActive]}>Search the web</Text>
                    </Pressable>
                  </View>
                ) : null}
                <View style={styles.composerFrame}>
                  <Animated.View pointerEvents="none" style={[styles.searchGradient, { transform: [{ rotate: gradientAngle }] }]} />
                  <View style={styles.composerInner}>
                    <TextInput
                      value={draft}
                      onChangeText={setDraft}
                      placeholder={messages.length > 0 ? 'Message Baybble' : animatedPlaceholder}
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
                    <Pressable style={styles.attachButton} onPress={() => setComposerMenuOpen((open) => !open)} disabled={isSending || isPreparingFiles} accessibilityRole="button" accessibilityLabel="Open composer tools" accessibilityState={{ expanded: composerMenuOpen }}>
                      <Ionicons name="add" size={25} color={isSending || isPreparingFiles ? "#666666" : "#bcbcbc"} />
                    </Pressable>
                    <Pressable style={[styles.micButton, isListening && styles.micButtonActive]} onPress={toggleVoiceInput} disabled={isSending || isPreparingFiles} accessibilityRole="button" accessibilityLabel={isListening ? "Stop voice input" : "Start voice input"}>
                      <Ionicons name={isListening ? "stop" : "mic-outline"} size={19} color={isListening ? "#ffffff" : (isSending || isPreparingFiles ? "#666666" : "#bcbcbc")} />
                    </Pressable>
                    <Pressable style={[styles.sendButton, (isSending || (!draft.trim() && pendingAttachments.length === 0)) && styles.sendButtonDisabled]} onPress={sendMessage} disabled={isSending || (!draft.trim() && pendingAttachments.length === 0)} accessibilityRole="button" accessibilityLabel="Send message">
                      <Ionicons name="arrow-up" size={22} color="#080808" />
                    </Pressable>
                  </View>
                </View>
                {isPreparingFiles ? <Text style={styles.filePreparingText}>Reading your files…</Text> : null}
                <Text style={styles.composerDisclaimer}>Baybble can make mistakes once AI responses are enabled. Check important information.</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {!chatMode ? (
        <>
          <View style={styles.quoteSection}>
            <View style={[styles.quoteContent, { paddingHorizontal: compact ? 26 : 90 }]}>
              <Text style={[styles.quoteHeading, compact && styles.quoteHeadingCompact]}>Where Possibilities Begin.</Text>
              <Text style={[styles.quoteBody, compact && styles.quoteBodyCompact]}>
                There is more to every question than its first answer, more to every challenge than its apparent limits, and more to every idea than what we initially imagine. The moment we look beyond what is obvious, we begin to discover possibilities we never knew existed.
              </Text>
              <Text style={styles.quoteSignature}>— The Baybble Team</Text>
            </View>
          </View>

          <View style={styles.longformPage}>
            <View style={styles.productOverview}>
              <Text style={[styles.sectionHeading, compact && styles.sectionHeadingCompact]}>One place to ask, explore, and understand</Text>
              <View style={[styles.productGrid, compact && styles.productGridCompact]}>
                <View style={styles.productColumn}>
                  <Text style={styles.productName}>Answers</Text>
                  <Text style={styles.productDescription}>Get clear answers to your questions, with sources when web research is needed.</Text>
                </View>
                <View style={styles.productColumn}>
                  <Text style={styles.productName}>Research</Text>
                  <Text style={styles.productDescription}>Explore topics, discover useful information, and bring relevant sources together.</Text>
                </View>
                <View style={styles.productColumn}>
                  <Text style={styles.productName}>Analysis</Text>
                  <Text style={styles.productDescription}>Work through complex ideas, compare possibilities, and understand the details.</Text>
                </View>
                <View style={styles.productColumn}>
                  <Text style={styles.productName}>Workspace</Text>
                  <Text style={styles.productDescription}>Keep conversations and files together as you develop an idea from first thought to next step.</Text>
                </View>
              </View>
            </View>

            <View style={styles.workflowSection}>
              <Text style={[styles.sectionHeading, compact && styles.sectionHeadingCompact]}>From a question to a clearer perspective</Text>
              <Text style={styles.sectionSubheading}>Explore a subject, examine the details, and bring your thinking together.</Text>
              <View style={styles.workflowTabs}>
                {['Explore', 'Research', 'Understand', 'Create'].map((tab, index) => (
                  <View key={tab} style={[styles.workflowTab, index === 0 && styles.workflowTabActive]}>
                    <Text style={[styles.workflowTabText, index === 0 && styles.workflowTabTextActive]}>{tab}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.researchShowcase, compact && styles.researchShowcaseCompact]}>
                <View style={styles.researchCopy}>
                  <Text style={styles.showcaseEyebrow}>A QUESTION WORTH EXPLORING</Text>
                  <Text style={styles.showcaseTitle}>Go beyond the first answer.</Text>
                  <Text style={styles.showcaseDescription}>Start with a question, explore different perspectives, and use reliable sources to build a deeper understanding.</Text>
                  <View style={styles.sourcePills}>
                    <Text style={styles.sourcePill}>Questions</Text>
                    <Text style={styles.sourcePill}>Sources</Text>
                    <Text style={styles.sourcePill}>Insights</Text>
                  </View>
                </View>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/29457406/pexels-photo-29457406.jpeg?auto=compress&cs=tinysrgb&w=1600' }}
                  style={styles.researchImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            <View style={styles.marketSection}>
              <View style={[styles.marketIntro, compact && styles.marketIntroCompact]}>
                <View style={styles.marketIntroCopy}>
                  <Text style={styles.showcaseEyebrow}>EXPLORE A TOPIC</Text>
                  <Text style={styles.sectionHeading}>A WORLD OF QUESTIONS</Text>
                  <Text style={styles.sectionSubheading}>Follow an idea and discover the connections around it.</Text>
                  <View style={styles.budgetLegend}>
                    <Text style={styles.budgetItem}>Discover</Text>
                    <Text style={styles.budgetItem}>Compare</Text>
                    <Text style={styles.budgetItem}>Understand</Text>
                  </View>
                </View>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/4050393/pexels-photo-4050393.jpeg?auto=compress&cs=tinysrgb&w=1400' }}
                  style={styles.marketImage}
                  resizeMode="cover"
                />
              </View>
              <View style={[styles.shopGrid, compact && styles.shopGridCompact]}>
                {[
                  ['1', 'The big picture', 'Understand the topic and its context', 'Overview', 'Start here', '01'],
                  ['2', 'Key questions', 'Identify what matters most', 'Explore', 'Go deeper', '02'],
                  ['3', 'Different views', 'Consider more than one perspective', 'Compare', 'Look closer', '03'],
                  ['4', 'Useful evidence', 'Find information worth examining', 'Sources', 'Check facts', '04'],
                  ['5', 'What comes next', 'Turn what you learn into next steps', 'Action', 'Move forward', '05']
                ].map((shop) => (
                  <View key={shop[0]} style={styles.shopRow}>
                    <Text style={styles.shopNumber}>{shop[0]}</Text>
                    <View style={styles.shopDetails}>
                      <Text style={styles.shopName}>{shop[1]}</Text>
                      <Text style={styles.shopMeta}>{shop[2]}</Text>
                    </View>
                    <Text style={styles.shopTier}>{shop[3]}</Text>
                    <Text style={styles.shopYear}>{shop[4]}</Text>
                    <Text style={styles.shopMetric}>{shop[5]}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.analyticsSection}>
              <Text style={styles.showcaseEyebrow}>MAKE SENSE OF THE DETAILS</Text>
              <Text style={[styles.sectionHeading, compact && styles.sectionHeadingCompact]}>Bring the important pieces together</Text>
              <View style={styles.analyticsSummary}>
                <Text style={styles.analyticsAmount}>One idea</Text>
                <Text style={styles.analyticsCaption}>Many ways to explore it</Text>
              </View>
              <View style={styles.analyticsTable}>
                <View style={styles.analyticsTableHeader}>
                  {['Perspective', 'What to explore', 'Why it matters', 'Next step'].map((label) => <Text key={label} style={styles.analyticsHeaderCell}>{label}</Text>)}
                </View>
                {[
                  ['Context', 'The background', 'See the bigger picture', 'Learn'],
                  ['Evidence', 'Facts and sources', 'Check what is known', 'Verify'],
                  ['Alternatives', 'Other viewpoints', 'Consider possibilities', 'Compare'],
                  ['Questions', 'What is still unclear', 'Find what is missing', 'Explore'],
                  ['Takeaways', 'Key ideas', 'Make it useful', 'Apply']
                ].map((row) => (
                  <View key={row[0]} style={styles.analyticsTableRow}>
                    {row.map((cell, index) => <Text key={index} style={[styles.analyticsCell, index === 0 && styles.analyticsPlatform]}>{cell}</Text>)}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.audienceSection}>
              <Text style={[styles.sectionHeading, compact && styles.sectionHeadingCompact]}>Made for curious minds and ambitious ideas</Text>
              <View style={[styles.audienceGrid, compact && styles.audienceGridCompact]}>
                <View style={styles.audienceColumn}>
                  <Text style={styles.audienceLabel}>For curious minds</Text>
                  <Text style={styles.audienceDescription}>Explore questions, learn something new, and look beyond the obvious.</Text>
                  <Text style={styles.audienceLink}>Start exploring ↗</Text>
                </View>
                <View style={styles.audienceColumn}>
                  <Text style={styles.audienceLabel}>For students and learners</Text>
                  <Text style={styles.audienceDescription}>Understand difficult topics and bring useful information together.</Text>
                  <Text style={styles.audienceLink}>Learn with Baybble ↗</Text>
                </View>
                <View style={styles.audienceColumn}>
                  <Text style={styles.audienceLabel}>For creators and thinkers</Text>
                  <Text style={styles.audienceDescription}>Develop ideas, consider new perspectives, and plan what comes next.</Text>
                  <Text style={styles.audienceLink}>Explore ideas ↗</Text>
                </View>
              </View>
            </View>

            <View style={styles.faqSection}>
              <Text style={[styles.sectionHeading, compact && styles.sectionHeadingCompact]}>Frequently asked questions</Text>
              {[
                'What is Baybble?',
                'What can I use Baybble for?',
                'Can Baybble search the web and provide sources?',
                'Can I upload files to a conversation?',
                'Can I return to my previous conversations?',
                'Is Baybble free to use?',
                'How do I get started?'
              ].map((question) => (
                <View key={question} style={styles.faqRow}>
                  <Text style={styles.faqQuestion}>{question}</Text>
                  <Ionicons name="add" size={20} color="#333333" />
                </View>
              ))}
            </View>

            <View style={styles.footerSection}>
              <View style={[styles.footerColumns, compact && styles.footerColumnsCompact]}>
                <View style={styles.footerColumn}>
                  <Text style={styles.footerHeading}>Workspace</Text>
                  {['Ask a question', 'Web research', 'File analysis', 'Conversations'].map((item) => <Text key={item} style={styles.footerLink}>{item}</Text>)}
                </View>
                <View style={styles.footerColumn}>
                  <Text style={styles.footerHeading}>Explore</Text>
                  {['Learning', 'Research', 'Understanding', 'Ideas', 'Planning'].map((item) => <Text key={item} style={styles.footerLink}>{item}</Text>)}
                </View>
                <View style={styles.footerColumn}>
                  <Text style={styles.footerHeading}>Access</Text>
                  {['Get started', 'Your workspace', 'Plans & access'].map((item) => <Text key={item} style={styles.footerLink}>{item}</Text>)}
                </View>
                <View style={styles.footerColumn}>
                  <Text style={styles.footerHeading}>Resources</Text>
                  {['Getting started', 'Help & support', 'Updates', 'Privacy'].map((item) => <Text key={item} style={styles.footerLink}>{item}</Text>)}
                </View>
                <View style={styles.footerColumn}>
                  <Text style={styles.footerHeading}>Baybble</Text>
                  {['About', 'Contact', 'Privacy policy', 'Terms & conditions'].map((item) => <Text key={item} style={styles.footerLink}>{item}</Text>)}
                </View>
              </View>
              <View style={styles.footerBottom}>
                <Text style={styles.footerBrand}>Baybble</Text>
                <Text style={styles.footerCopyright}>©2026</Text>
              </View>
            </View>
          </View>        </>
      ) : null}

    </ScrollView>
    <AuthDialog visible={authOpen} onClose={() => setAuthOpen(false)} userEmail={authUser?.email ?? null} onSignedOut={() => { setAuthUser(null); setSessions([]); setMessages([]); setPendingAttachments([]); setConversationAttachments([]); setActiveSessionId(null); setAuthOpen(false); }} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: '100vh' as any, width: '100%', backgroundColor: 'transparent', position: 'relative' as any, zIndex: 1 },
  videoBackground: { position: 'fixed' as any, top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, backgroundColor: '#000000', overflow: 'hidden' },
  page: { width: '100%', alignItems: 'center', paddingBottom: 0 },
  header: { position: 'fixed' as any, top: 0, left: 0, right: 15, minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 8, paddingVertical: 4, backgroundColor: '#050505', borderBottomWidth: 0, shadowColor: '#000000', shadowOpacity: 0.24, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  megaMenuBackdrop: { position: 'fixed' as any, top: 0, right: 0, bottom: 0, left: 0, zIndex: 5, backgroundColor: 'rgba(8,8,8,0.28)', backdropFilter: 'blur(9px)' as any, WebkitBackdropFilter: 'blur(9px)' as any } as any,
  megaMenuPanel: { position: 'absolute' as any, top: 58, left: 0, right: 0, zIndex: 7, borderRadius: 0, backgroundColor: '#ffffff', paddingLeft: 52, paddingRight: 24, paddingTop: 28, paddingBottom: 30, alignItems: 'flex-start', shadowColor: '#000000', shadowOpacity: 0.14, shadowRadius: 35, shadowOffset: { width: 0, height: 18 }, elevation: 18 } as any,
  megaMenuItems: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 18 },
  megaMenuItem: { minWidth: 0, minHeight: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 12, paddingVertical: 2 },
  megaMenuItemTitle: { color: '#111111', fontFamily: 'Manrope', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  megaMenuItemTitleHovered: { textDecorationLine: 'underline' },
  megaMenuStatus: { color: '#888888', fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 1.1, flexShrink: 0 },
  chatHeader: { borderBottomWidth: 1, borderBottomColor: '#242424' },
  newChatButton: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#343434', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 15 },
  newChatText: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '700', fontSize: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 36, gap: 9, userSelect: 'all' as any },
  logoMark: { width: 32, height: 32, position: 'relative' },
  logoBubbleOne: { position: 'absolute', width: 23, height: 23, borderRadius: 12, backgroundColor: '#F1F1F1', top: 0, left: 0 },
  logoBubbleTwo: { position: 'absolute', width: 17, height: 17, borderRadius: 9, backgroundColor: '#F1F1F1', bottom: 2, right: 2, borderWidth: 2, borderColor: '#080808' },
  wordmark: { color: '#EEEEEE', fontFamily: 'Manrope', fontWeight: '700', fontSize: 24, lineHeight: 32, letterSpacing: -1.05, includeFontPadding: false, textAlignVertical: 'center', textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', userSelect: 'all' } as any,
  nav: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  navCentered: { flex: 1, marginLeft: 24, justifyContent: 'flex-start', overflow: 'visible' },
  navLink: { paddingVertical: 10, paddingHorizontal: 12, zIndex: 1, cursor: 'pointer' as any },
  navText: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '600', fontSize: 13 },
  navTextHovered: { color: '#ffffff' },
  navTextDimmed: { color: '#555555' },
  headerTextHovered: { opacity: 1 },
  headerTextPressed: { opacity: 0.7 },
  loginTextHovered: { color: '#c9cdd2' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 17 },
  loginButton: { paddingVertical: 11, paddingHorizontal: 4 },
  profileButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, overflow: 'hidden' },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#292929', borderWidth: 1, borderColor: '#505050' },
  headerAvatarImage: { width: '100%', height: '100%' },
  headerAvatarInitial: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '800', fontSize: 14 },
  loginText: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '700', fontSize: 13 },
  startButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#8a8a8a', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 15, cursor: 'pointer' as any },
  startButtonHovered: { backgroundColor: 'rgba(255,255,255,0.025)', borderColor: '#a0a0a0' },
  startButtonPressed: { backgroundColor: 'rgba(255,255,255,0.16)', transform: [{ scale: 0.98 }] },
  startText: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '700', fontSize: 13 },
  mobileNav: { width: '100%', paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, zIndex: 2 },
  hero: { width: '100%', minHeight: 'calc(100vh - 92px)' as any, alignItems: 'center', justifyContent: 'center', paddingBottom: 0, backgroundColor: 'transparent', overflow: 'hidden' },
  heroTagline: { color: '#f0ede7', fontFamily: 'Georgia', fontWeight: '400', fontSize: 38, lineHeight: 46, letterSpacing: -0.8, textAlign: 'center', maxWidth: 900, marginBottom: 25 },
  heroTaglineCompact: { fontSize: 28, lineHeight: 35, marginBottom: 20, paddingHorizontal: 8 },
  heroEyebrow: { color: '#a0a0a0', fontFamily: 'Manrope', fontWeight: '800', fontSize: 10, letterSpacing: 2.1, marginBottom: 25 },
  heroTitle: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 66, lineHeight: 73, letterSpacing: -3.4, textAlign: 'center', maxWidth: 900 },
  heroTitleCompact: { fontSize: 42, lineHeight: 47, letterSpacing: -2 },
  heroDescription: { color: '#c8c8c8', fontFamily: 'Manrope', fontWeight: '500', fontSize: 16, lineHeight: 27, textAlign: 'center', maxWidth: 650, marginTop: 23, marginBottom: 36 },
  heroDescriptionCompact: { fontSize: 14, lineHeight: 24 },
  searchFrame: { width: '100%', maxWidth: 650, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },

  searchBar: { width: '100%', flexDirection: 'row', alignItems: 'center', borderRadius: 14, backgroundColor: '#d5d5d5', paddingHorizontal: 21, zIndex: 1 },
  heroSearchArrowCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#292929', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  searchIcon: { color: '#ffffff', fontFamily: 'Manrope', fontSize: 31, marginRight: 15 },
  micIcon: { marginLeft: 12, marginRight: 2 },
  input: { flex: 1, minWidth: 0, color: '#292929', fontFamily: 'Manrope', fontWeight: '500', fontSize: 15, paddingVertical: 14, outlineStyle: 'none' as any },
  searchCaption: { color: '#ffffff', fontFamily: 'Manrope', fontSize: 12, fontWeight: '500', marginTop: 15 },
  heroFootnote: { color: '#858585', fontFamily: 'Manrope', fontSize: 10, marginTop: 15, textAlign: 'center' },
  quoteSection: { width: '100%', marginTop: 105, backgroundColor: '#ffffff', zIndex: 2 },
  quoteContent: { width: '100%', alignItems: 'center', paddingTop: 82, paddingBottom: 94, backgroundColor: '#ffffff' },
  quoteHeading: { color: '#111111', fontFamily: 'Georgia', fontWeight: '400', fontSize: 39, lineHeight: 47, letterSpacing: -0.9, textAlign: 'center', marginBottom: 24 },
  quoteHeadingCompact: { fontSize: 31, lineHeight: 38, marginBottom: 20 },
  quoteBody: { color: '#303030', fontFamily: 'Georgia', fontWeight: '400', fontSize: 19, lineHeight: 32, letterSpacing: -0.12, textAlign: 'center', maxWidth: 900 },
  quoteBodyCompact: { fontSize: 16, lineHeight: 27 },
  quoteSignature: { color: '#666666', fontFamily: 'Manrope', fontSize: 12, fontWeight: '600', letterSpacing: 0.15, marginTop: 26 },
  longformPage: { width: '100%', backgroundColor: '#ffffff', alignItems: 'center' },
  productOverview: { width: '100%', paddingHorizontal: 64, paddingTop: 66, paddingBottom: 104, backgroundColor: '#ffffff' },
  sectionHeading: { color: '#101010', fontFamily: 'Manrope', fontWeight: '600', fontSize: 36, lineHeight: 44, letterSpacing: -1.3, maxWidth: 850 },
  sectionHeadingCompact: { fontSize: 28, lineHeight: 35, letterSpacing: -0.8 },
  sectionSubheading: { color: '#555555', fontFamily: 'Manrope', fontSize: 15, lineHeight: 24, marginTop: 12 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 36, marginTop: 55 },
  productGridCompact: { flexDirection: 'column', gap: 28, marginTop: 36 },
  productColumn: { flex: 1, minWidth: 190, maxWidth: 280, gap: 12 },
  productName: { color: '#111111', fontFamily: 'Manrope', fontWeight: '700', fontSize: 18, letterSpacing: -0.3 },
  productDescription: { color: '#555555', fontFamily: 'Manrope', fontSize: 14, lineHeight: 23 },
  workflowSection: { width: '100%', paddingHorizontal: 64, paddingTop: 70, paddingBottom: 95, backgroundColor: '#f7f7f7' },
  workflowTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 28, marginTop: 34, marginBottom: 26 },
  workflowTab: { paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  workflowTabActive: { borderBottomColor: '#111111' },
  workflowTabText: { color: '#777777', fontFamily: 'Manrope', fontSize: 13, fontWeight: '600' },
  workflowTabTextActive: { color: '#111111' },
  researchShowcase: { width: '100%', flexDirection: 'row', alignItems: 'stretch', backgroundColor: '#ffffff', minHeight: 320 },
  researchShowcaseCompact: { flexDirection: 'column' },
  researchCopy: { flex: 1, justifyContent: 'center', padding: 34, gap: 14 },
  showcaseEyebrow: { color: '#777777', fontFamily: 'Manrope', fontWeight: '700', fontSize: 9, letterSpacing: 1.5 },
  showcaseTitle: { color: '#111111', fontFamily: 'Manrope', fontWeight: '600', fontSize: 24, lineHeight: 32, letterSpacing: -0.7 },
  showcaseDescription: { color: '#555555', fontFamily: 'Manrope', fontSize: 13, lineHeight: 22 },
  sourcePills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  sourcePill: { color: '#444444', fontFamily: 'Manrope', fontSize: 10, paddingVertical: 7, paddingHorizontal: 10, backgroundColor: '#f2f2f2', borderRadius: 999 },
  researchImage: { flex: 1, minWidth: 0, height: 320, backgroundColor: '#eeeeee' },
  marketSection: { width: '100%', paddingHorizontal: 64, paddingTop: 95, paddingBottom: 95, backgroundColor: '#ffffff' },
  marketIntro: { flexDirection: 'row', alignItems: 'center', gap: 40, marginBottom: 38 },
  marketIntroCompact: { flexDirection: 'column', alignItems: 'stretch' },
  marketIntroCopy: { flex: 1, gap: 12 },
  budgetLegend: { flexDirection: 'row', gap: 18, marginTop: 12 },
  budgetItem: { color: '#555555', fontFamily: 'Manrope', fontSize: 11 },
  marketImage: { flex: 1, minWidth: 0, height: 260, backgroundColor: '#eeeeee' },
  shopGrid: { width: '100%', borderTopWidth: 1, borderTopColor: '#e5e5e5' },
  shopGridCompact: { width: '100%' },
  shopRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 15, borderBottomWidth: 1, borderBottomColor: '#e5e5e5', paddingVertical: 12 },
  shopNumber: { color: '#999999', fontFamily: 'Manrope', fontSize: 11, width: 20 },
  shopDetails: { flex: 1, gap: 4 },
  shopName: { color: '#151515', fontFamily: 'Manrope', fontSize: 13, fontWeight: '700' },
  shopMeta: { color: '#777777', fontFamily: 'Manrope', fontSize: 10 },
  shopTier: { color: '#333333', fontFamily: 'Manrope', fontSize: 10, width: 85 },
  shopYear: { color: '#777777', fontFamily: 'Manrope', fontSize: 10, width: 75 },
  shopMetric: { color: '#222222', fontFamily: 'Manrope', fontSize: 11, width: 28, textAlign: 'right' },
  analyticsSection: { width: '100%', paddingHorizontal: 64, paddingTop: 82, paddingBottom: 105, backgroundColor: '#f7f7f7' },
  analyticsSummary: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginTop: 35, marginBottom: 25 },
  analyticsAmount: { color: '#111111', fontFamily: 'Manrope', fontWeight: '700', fontSize: 34, letterSpacing: -1.2 },
  analyticsCaption: { color: '#777777', fontFamily: 'Manrope', fontSize: 12 },
  analyticsTable: { width: '100%' },
  analyticsTableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cccccc', paddingVertical: 13 },
  analyticsTableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e2e2', paddingVertical: 15 },
  analyticsHeaderCell: { flex: 1, minWidth: 0, color: '#777777', fontFamily: 'Manrope', fontSize: 9, fontWeight: '700' },
  analyticsCell: { flex: 1, minWidth: 0, color: '#555555', fontFamily: 'Manrope', fontSize: 10 },
  analyticsPlatform: { color: '#111111', fontWeight: '700' },
  audienceSection: { width: '100%', paddingHorizontal: 64, paddingTop: 95, paddingBottom: 105, backgroundColor: '#ffffff' },
  audienceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 42, marginTop: 52 },
  audienceGridCompact: { flexDirection: 'column', gap: 30 },
  audienceColumn: { flex: 1, minWidth: 180, gap: 12 },
  audienceLabel: { color: '#111111', fontFamily: 'Manrope', fontWeight: '700', fontSize: 16 },
  audienceDescription: { color: '#555555', fontFamily: 'Manrope', fontSize: 13, lineHeight: 22 },
  audienceLink: { color: '#111111', fontFamily: 'Manrope', fontWeight: '700', fontSize: 12, marginTop: 6 },
  faqSection: { width: '100%', paddingHorizontal: 64, paddingTop: 90, paddingBottom: 100, backgroundColor: '#f7f7f7' },
  faqRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#dedede', gap: 20 },
  faqQuestion: { color: '#191919', fontFamily: 'Manrope', fontWeight: '600', fontSize: 14 },
  footerSection: { width: '100%', paddingHorizontal: 64, paddingTop: 72, paddingBottom: 25, backgroundColor: '#ffffff' },
  footerColumns: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 35, paddingBottom: 60 },
  footerColumnsCompact: { flexDirection: 'column', gap: 30 },
  footerColumn: { minWidth: 110, gap: 12 },
  footerHeading: { color: '#111111', fontFamily: 'Manrope', fontWeight: '700', fontSize: 12, marginBottom: 6 },
  footerLink: { color: '#666666', fontFamily: 'Manrope', fontSize: 11, lineHeight: 17 },
  footerBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e5e5e5', paddingTop: 20 },
  footerBrand: { color: '#111111', fontFamily: 'Manrope', fontWeight: '700', fontSize: 17 },
  footerCopyright: { color: '#777777', fontFamily: 'Manrope', fontSize: 10 },
  chatWorkspace: { position: 'fixed' as any, top: 0, right: 0, bottom: 0, left: 0, zIndex: 10, width: '100%', height: '100vh' as any, minHeight: '100vh' as any, flex: 1, backgroundColor: '#080808' },
  chatBody: { width: '100%', height: '100%' as any, flex: 1, minHeight: '100vh' as any, flexDirection: 'row', position: 'relative' },
  mobileSidebarTrigger: { position: 'absolute', zIndex: 6, top: 15, left: 16, width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#171717', borderWidth: 1, borderColor: '#303030' },
  sidebarBackdrop: { position: 'absolute' as any, top: 0, right: 0, bottom: 0, left: 0, zIndex: 7, backgroundColor: 'rgba(0,0,0,0.58)' } as any,
  workspaceSidebar: { width: 270, flexShrink: 0, minHeight: '100%' as any, alignSelf: 'stretch', backgroundColor: '#101010', borderRightWidth: 1, borderRightColor: '#292929', paddingHorizontal: 14, paddingTop: 15, paddingBottom: 12, zIndex: 8 } as any,
  workspaceSidebarOverlay: { position: 'absolute' as any, top: 0, bottom: 0, left: 0, width: 286, zIndex: 9, shadowColor: '#000000', shadowOpacity: 0.5, shadowRadius: 20, elevation: 18 } as any,
  sidebarBrandRow: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, paddingHorizontal: 3 },
  sidebarBrand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  sidebarCollapsedBrandToggle: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8, position: 'relative' as any, overflow: 'hidden' },
  sidebarCollapsedBrandLogo: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  sidebarCollapsedBrandGlyph: { position: 'absolute' as any, top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  sidebarToggleFrame: { width: 19, height: 16, borderWidth: 1.5, borderColor: '#a8a8a8', borderRadius: 4, flexDirection: 'row', padding: 2 },
  sidebarToggleDivider: { width: 1.5, height: '100%', borderRadius: 1, backgroundColor: '#a8a8a8' },
  sidebarWordmark: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 19, letterSpacing: -0.7 },
  sidebarIconButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  sidebarNewButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 10, backgroundColor: '#f2f2f2', paddingHorizontal: 12, marginBottom: 13 },
  sidebarNewButtonCollapsed: { width: 42, height: 42, alignSelf: 'center', paddingHorizontal: 0 },
  sidebarNewText: { color: '#090909', fontFamily: 'Manrope', fontWeight: '800', fontSize: 12 },
  sidebarSearch: { minHeight: 39, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 10, borderRadius: 9, backgroundColor: '#191919', borderWidth: 1, borderColor: '#292929', marginBottom: 14 },
  sidebarSearchInput: { flex: 1, minWidth: 0, color: '#eeeeee', fontFamily: 'Manrope', fontSize: 11, paddingVertical: 8, outlineStyle: 'none' as any },
  sidebarQuickLinks: { gap: 3, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#292929' },
  sidebarQuickLink: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, borderRadius: 8 },
  sidebarQuickLinkText: { flex: 1, color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 11, fontWeight: '600' },
  sidebarComingSoon: { color: '#666666', fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', letterSpacing: 0.8 },
  sidebarSectionHeading: { paddingHorizontal: 8, paddingTop: 17, paddingBottom: 8 },
  sidebarSectionLabel: { color: '#777777', fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  sidebarConversationList: { flex: 1, minHeight: 0 },
  sidebarEmpty: { color: '#777777', fontFamily: 'Manrope', fontSize: 10, lineHeight: 17, paddingHorizontal: 8, paddingTop: 10 },
  sidebarFootnote: { color: '#626262', fontFamily: 'Manrope', fontSize: 9, paddingTop: 9, paddingHorizontal: 7 },
  sidebarBottom: { borderTopWidth: 1, borderTopColor: '#292929', paddingTop: 10, gap: 9 },
  sidebarBottomLink: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8 },
  sidebarBottomText: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 11, fontWeight: '600' },
  sidebarAccount: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 7, borderRadius: 9, backgroundColor: '#171717' },
  sidebarAvatar: { width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  sidebarAvatarText: { color: '#ffffff', fontFamily: 'Manrope', fontWeight: '800', fontSize: 10 },
  sidebarAccountCopy: { flex: 1, minWidth: 0, gap: 2 },
  sidebarAccountName: { color: '#eeeeee', fontFamily: 'Manrope', fontWeight: '700', fontSize: 10 },
  sidebarAccountPlan: { color: '#777777', fontFamily: 'Manrope', fontSize: 9 },
  sidebarCollapsedActions: { alignItems: 'center', gap: 8, paddingTop: 7 },
  sidebarCollapsedAction: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  workspaceTopbar: { width: '100%', minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25, borderBottomWidth: 1, borderBottomColor: '#202020', position: 'relative' as any, zIndex: 12 },
  chatTopbarActions: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  chatShareButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 11, borderRadius: 9 },
  chatShareText: { color: '#e5e5e5', fontFamily: 'Manrope', fontSize: 11, fontWeight: '700' },
  chatMenuTrigger: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  chatOptionsBackdrop: { position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 },
  chatOptionsMenu: { position: 'fixed' as any, top: 58, right: 18, width: 220, paddingVertical: 8, borderRadius: 12, backgroundColor: '#1b1b1b', borderWidth: 1, borderColor: '#353535', zIndex: 9999, shadowColor: '#000000', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 24 },
  chatOptionsItemDisabled: { opacity: 0.55 },
  chatOptionsItem: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 13 },
  chatOptionsText: { color: '#e5e5e5', fontFamily: 'Manrope', fontSize: 12, fontWeight: '600' },
  chatOptionsDisabled: { color: '#666666' },
  chatOptionsDanger: { color: '#f08b8b', fontFamily: 'Manrope', fontSize: 12, fontWeight: '600' },
  chatOptionsDivider: { height: 1, backgroundColor: '#333333', marginVertical: 5 },
  workspaceTopbarCompact: { paddingLeft: 64 },
  workspaceTopbarTitle: { flex: 1, color: '#eeeeee', fontFamily: 'Manrope', fontSize: 12, fontWeight: '700' },
  workspaceTopbarCaption: { color: '#656565', fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 1.1, marginLeft: 12 },

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
  scrollFollowControl: { position: 'absolute' as any, left: '50%' as any, bottom: 148, transform: [{ translateX: -16 }], zIndex: 30, width: 32, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#242424', borderWidth: 1, borderColor: '#414141', shadowColor: '#000000', shadowOpacity: 0.2, shadowRadius: 7, shadowOffset: { width: 0, height: 2 }, elevation: 6, cursor: 'pointer' as any },
  thinkingDots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  thinkingDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#f2f2f2' },
  conversationContent: { flexGrow: 1, width: '100%', maxWidth: 850, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 42, paddingBottom: 30 },
  emptyConversation: { flex: 1, minHeight: 420, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  chatGreeting: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 34, letterSpacing: -1.5, textAlign: 'center' },
  chatSubheading: { color: '#a0a0a0', fontFamily: 'Manrope', fontSize: 14, lineHeight: 23, textAlign: 'center', maxWidth: 470, marginTop: 14 },
  chatNotice: { color: '#777777', fontFamily: 'Manrope', fontSize: 10, lineHeight: 17, textAlign: 'center', marginTop: 22, maxWidth: 520, alignSelf: 'center' },
  messageList: { width: '100%', gap: 9, paddingBottom: 30 },
  userMessageGroup: { width: '100%', alignSelf: 'stretch', alignItems: 'flex-end', position: 'relative', paddingBottom: 34 },
  assistantMessageGroup: { width: '100%', alignSelf: 'stretch', alignItems: 'flex-start', position: 'relative', paddingBottom: 27 },
  messageActions: { position: 'absolute', left: 0, bottom: 0, height: 27, flexDirection: 'row', alignItems: 'center', gap: 6 },
  messageActionsUser: { left: 'auto' as any, right: 0, justifyContent: 'flex-end' },
  messageActionWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  messageActionButton: { width: 27, height: 27, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  messageActionTooltip: { position: 'absolute', bottom: 34, left: '50%' as any, transform: [{ translateX: -42 }], minWidth: 84, textAlign: 'center', color: '#f0f0f0', backgroundColor: '#292929', borderWidth: 1, borderColor: '#414141', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 6, fontFamily: 'Manrope', fontSize: 10, fontWeight: '600', zIndex: 20, overflow: 'hidden' },
  userMessage: { alignSelf: 'flex-end', maxWidth: '82%', backgroundColor: '#242424', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 13 },
  userMessageText: { color: '#f5f5f5', fontFamily: 'Manrope', fontSize: 14, lineHeight: 22 },
  inlineEditCard: { width: '100%', maxWidth: 620, alignSelf: 'flex-end', backgroundColor: '#202020', borderWidth: 1, borderColor: '#454545', borderRadius: 18, padding: 13, gap: 12 },
  inlineEditInput: { width: '100%', minHeight: 74, maxHeight: 220, color: '#f5f5f5', fontFamily: 'Manrope', fontSize: 14, lineHeight: 22, padding: 4, outlineStyle: 'none' as any },
  inlineEditActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 9 },
  inlineEditCancel: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 9 },
  inlineEditCancelText: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 11, fontWeight: '700' },
  inlineEditSave: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 13, borderRadius: 9, backgroundColor: '#ffffff' },
  inlineEditSaveText: { color: '#080808', fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
  assistantMessage: { width: '100%', alignSelf: 'stretch', paddingVertical: 0 },
  assistantMessageText: { color: '#e8e8e8', fontFamily: 'Manrope', fontSize: 14, lineHeight: 25 },
  thinkingText: { color: '#929292', fontFamily: 'Manrope', fontSize: 13, fontStyle: 'italic' },
  chatError: { color: '#ff9b9b', fontFamily: 'Manrope', fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  composerArea: { width: '100%', maxWidth: 850, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 24, alignSelf: 'center', position: 'relative' },
  composerFrame: { width: '100%', minHeight: 72, borderRadius: 28, overflow: 'hidden', position: 'relative', padding: 2, justifyContent: 'center', backgroundColor: '#080808' },
  composerInner: { width: '100%', minHeight: 68, flexDirection: 'row', alignItems: 'center', borderRadius: 26, backgroundColor: '#151515', paddingLeft: 12, paddingRight: 10, zIndex: 1 },
  composerActionMenu: { position: 'absolute' as any, right: 132, bottom: 92, zIndex: 40, minWidth: 174, padding: 5, borderRadius: 14, backgroundColor: '#1b1b1b', borderWidth: 1, borderColor: '#383838', shadowColor: '#000000', shadowOpacity: 0.28, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 12 },
  composerActionItem: { minHeight: 39, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, borderRadius: 9 },
  composerActionItemHovered: { backgroundColor: '#292929' },
  composerActionText: { flex: 1, color: '#c4c4c4', fontFamily: 'Manrope', fontSize: 11, fontWeight: '600' },
  composerActionTextActive: { color: '#4f9cff' },
  attachButton: { width: 34, height: 38, alignItems: 'center', justifyContent: 'center', marginRight: 2 },
  micButton: { width: 34, height: 38, alignItems: 'center', justifyContent: 'center', marginLeft: 2 },
  micButtonActive: { backgroundColor: '#8b3434', borderRadius: 19 },
  pendingFiles: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 9 },
  pendingFileChip: { maxWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#242424', borderWidth: 1, borderColor: '#383838' },
  pendingFileName: { color: '#dddddd', fontFamily: 'Manrope', fontSize: 11, maxWidth: 150 },
  messageFileList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  messageFileChip: { maxWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 9, backgroundColor: '#353535' },
  messageFileName: { color: '#dddddd', fontFamily: 'Manrope', fontSize: 11, maxWidth: 150 },
  composerInput: { flex: 1, minWidth: 0, maxHeight: 150, color: '#ffffff', fontFamily: 'Manrope', fontSize: 15, paddingVertical: 17, outlineStyle: 'none' as any },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginLeft: 7 },
  sendButtonDisabled: { opacity: 0.55 },
  webSearchToggleRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 5, marginTop: 9 },
  webSearchToggle: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#383838', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, opacity: 1 },
  webSearchToggleActive: { backgroundColor: '#292929', borderColor: '#5a5a5a' },
  webSearchToggleText: { color: '#a0a0a0', fontFamily: 'Manrope', fontSize: 10, fontWeight: '700' },
  webSearchToggleTextActive: { color: '#f2f2f2' },
  webSearchToggleIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#666666' },
  webSearchToggleIndicatorActive: { backgroundColor: '#f2f2f2' },
  webSearchAutoNote: { color: '#707070', fontFamily: 'Manrope', fontSize: 9 },
  composerDisclaimer: { color: '#777777', fontFamily: 'Manrope', fontSize: 9, textAlign: 'center', marginTop: 11 },
  filePreparingText: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 11, textAlign: 'center', marginTop: 8 },
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
  splitSection: { width: '100%', paddingTop: 82, paddingBottom: 100, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 55, backgroundColor: 'rgba(8,8,8,0.18)' },
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
  modelsSection: { width: '100%', backgroundColor: 'rgba(8,8,8,0.18)', paddingVertical: 100 },
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
  processSection: { width: '100%', paddingTop: 90, paddingBottom: 100, backgroundColor: 'rgba(8,8,8,0.18)' },
  sectionHeading: { width: '100%', alignItems: 'flex-start', marginBottom: 38 },
  sectionTitle: { color: '#f5f5f5', fontFamily: 'Manrope', fontWeight: '800', fontSize: 45, lineHeight: 51, letterSpacing: -2 },
  sectionTitleCompact: { fontSize: 35, lineHeight: 41 },
  sectionBody: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 14, lineHeight: 24, maxWidth: 610, marginTop: 17 },
  processRows: { width: '100%' },
  processRow: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 18, paddingVertical: 24, borderTopWidth: 1, borderTopColor: '#333333' },
  processNumber: { color: '#858585', fontFamily: 'Manrope', fontSize: 11, fontWeight: '700', width: 30 },
  processTitle: { color: '#f0f0f0', fontFamily: 'Manrope', fontWeight: '800', fontSize: 15, flex: 1, minWidth: 210 },
  processBody: { color: '#a0a0a0', fontFamily: 'Manrope', fontSize: 12, flex: 1, minWidth: 200, lineHeight: 20 },
  closing: { width: '100%', backgroundColor: 'rgba(8,8,8,0.24)', paddingTop: 95, paddingBottom: 100, alignItems: 'center' },
  closingEyebrow: { color: '#bcbcbc', fontFamily: 'Manrope', fontWeight: '800', fontSize: 9, letterSpacing: 2, textAlign: 'center', marginBottom: 23 },
  closingTitle: { color: '#080808', fontFamily: 'Manrope', fontWeight: '800', fontSize: 62, lineHeight: 67, letterSpacing: -3, textAlign: 'center' },
  closingTitleCompact: { fontSize: 43, lineHeight: 48 },
  closingBody: { color: '#bdbdbd', fontFamily: 'Manrope', fontSize: 14, lineHeight: 24, maxWidth: 530, textAlign: 'center', marginTop: 20 },
  closingButton: { backgroundColor: '#ffffff', borderRadius: 999, paddingVertical: 14, paddingHorizontal: 21, marginTop: 29 },
  closingButtonText: { color: '#080808', fontFamily: 'Manrope', fontWeight: '800', fontSize: 12 },
  footer: { width: '100%', paddingTop: 35, paddingBottom: 28, backgroundColor: 'rgba(8,8,8,0.20)' },
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