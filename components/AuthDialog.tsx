import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';

type Props = { visible: boolean; onClose: () => void; userEmail: string | null; onSignedOut: () => void };

export default function AuthDialog({ visible, onClose, userEmail, onSignedOut }: Props) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true); setError(''); setNotice('');
    try {
      if (mode === 'signup') {
        const { data, error: e } = await supabase.auth.signUp({ email: email.trim(), password });
        if (e) throw e;
        setNotice(data.session ? 'Your Baybble account is ready.' : 'Check your email to confirm your account, then sign in.');
      } else if (mode === 'reset') {
        const { error: e } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined });
        if (e) throw e;
        setNotice('If an account exists for that email, a password-reset link has been sent.');
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (e) throw e;
        setNotice('You are signed in to Baybble.');
        onClose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally { setBusy(false); }
  };

  const signOut = async () => {
    setBusy(true);
    const { error: e } = await supabase.auth.signOut();
    setBusy(false);
    if (e) setError(e.message); else onSignedOut();
  };

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <View style={styles.top}>
          <Text style={styles.brand}>Baybble</Text>
          <Pressable onPress={onClose}><Text style={styles.close}>✕</Text></Pressable>
        </View>
        {userEmail ? <>
          <Text style={styles.title}>Your account</Text>
          <Text style={styles.sub}>{userEmail}</Text>
          <Pressable style={styles.primary} onPress={signOut} disabled={busy}>
            {busy ? <ActivityIndicator color="#080808" /> : <Text style={styles.primaryText}>Sign out</Text>}
          </Pressable>
        </> : <>
          <Text style={styles.title}>{mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back'}</Text>
          <Text style={styles.sub}>Sign in to keep your Baybble conversations synced.</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor="#777" autoCapitalize="none" keyboardType="email-address" style={styles.input} />
          {mode !== 'reset' ? <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#777" secureTextEntry style={styles.input} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <Pressable style={styles.primary} onPress={submit} disabled={busy || !email.trim() || (mode !== 'reset' && password.length < 6)}>
            {busy ? <ActivityIndicator color="#080808" /> : <Text style={styles.primaryText}>{mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Log in'}</Text>}
          </Pressable>
          <View style={styles.links}>
            <Pressable onPress={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setNotice(''); }}><Text style={styles.link}>{mode === 'signup' ? 'Already have an account? Log in' : 'Create an account'}</Text></Pressable>
            {mode !== 'reset' ? <Pressable onPress={() => { setMode('reset'); setError(''); setNotice(''); }}><Text style={styles.link}>Forgot password?</Text></Pressable> : <Pressable onPress={() => setMode('login')}><Text style={styles.link}>Back to log in</Text></Pressable>}
          </View>
        </>}
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  panel: { width: '100%', maxWidth: 420, backgroundColor: '#111111', borderWidth: 1, borderColor: '#303030', borderRadius: 20, padding: 26 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  brand: { color: '#fff', fontSize: 19, fontWeight: '800' },
  close: { color: '#aaa', fontSize: 18, padding: 4 },
  title: { color: '#fff', fontSize: 25, fontWeight: '800', letterSpacing: -0.7 },
  sub: { color: '#aaa', fontSize: 12, lineHeight: 19, marginTop: 9, marginBottom: 22 },
  input: { backgroundColor: '#1b1b1b', borderWidth: 1, borderColor: '#333', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, color: '#fff', marginBottom: 12, outlineStyle: 'none' as any },
  primary: { backgroundColor: '#fff', borderRadius: 999, minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  primaryText: { color: '#080808', fontWeight: '800', fontSize: 13 },
  links: { gap: 13, alignItems: 'center', marginTop: 20 },
  link: { color: '#c5c5c5', fontSize: 11 },
  error: { color: '#ff9b9b', fontSize: 11, marginBottom: 10 },
  notice: { color: '#a8d8ad', fontSize: 11, marginBottom: 10 }
});
