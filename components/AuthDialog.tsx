import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';

type Props = { visible: boolean; onClose: () => void; userEmail: string | null; onSignedOut: () => void };

type Profile = {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  avatarPath: string;
};

const avatarColours = ['#315B83', '#7652A3', '#A05252', '#34796F', '#8A6737', '#536A9B'];

function initials(name: string, email: string) {
  const source = name.trim() || email.split('@')[0] || 'B';
  const parts = source.replace(/[._-]+/g, ' ').split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)).toUpperCase();
}

function colourFor(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return avatarColours[Math.abs(hash) % avatarColours.length];
}

export default function AuthDialog({ visible, onClose, userEmail, onSignedOut }: Props) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset' | 'update'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [usernameDraft, setUsernameDraft] = useState('');

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update'); setNotice('Choose a new password for your Baybble account.'); setError('');
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!visible || !userEmail) return;
    let active = true;
    supabase.auth.getUser().then(async ({ data, error: loadError }) => {
      if (!active || loadError || !data.user) return;
      const metadata = data.user.user_metadata ?? {};
      const next = {
        id: data.user.id,
        email: data.user.email ?? userEmail,
        fullName: typeof metadata.full_name === 'string' ? metadata.full_name : '',
        username: typeof metadata.username === 'string' ? metadata.username : (data.user.email ?? userEmail).split('@')[0],
        avatarUrl: '',
        avatarPath: typeof metadata.avatar_path === 'string' ? metadata.avatar_path : ''
      };
      if (next.avatarPath) {
        const { data: signed } = await supabase.storage.from('baybble-avatars').createSignedUrl(next.avatarPath, 3600);
        next.avatarUrl = signed?.signedUrl ?? '';
      }
      setProfile(next);
      setNameDraft(next.fullName);
      setUsernameDraft(next.username);
      setError('');
      setNotice('');
    });
    return () => { active = false; };
  }, [visible, userEmail]);

  const submit = async () => {
    setBusy(true); setError(''); setNotice('');
    try {
      if (mode === 'signup') {
        const { data, error: e } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined } });
        if (e) throw e;
        setNotice(data.session ? 'Your Baybble account is ready.' : 'Check your email to confirm your account, then sign in.');
      } else if (mode === 'update') {
        const { error: e } = await supabase.auth.updateUser({ password });
        if (e) throw e;
        setNotice('Your password has been updated.');
        setMode('login'); setPassword('');
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

  const saveProfile = async () => {
    const fullName = nameDraft.trim();
    const username = usernameDraft.trim().replace(/^@/, '');
    if (!username || !/^[a-zA-Z0-9._]{3,24}$/.test(username)) {
      setError('Username must be 3–24 characters and use letters, numbers, dots or underscores.');
      return;
    }
    setBusy(true); setError(''); setNotice('');
    const { data, error: updateError } = await supabase.auth.updateUser({ data: { full_name: fullName, username } });
    setBusy(false);
    if (updateError) { setError(updateError.message); return; }
    if (data.user && profile) setProfile({ ...profile, fullName, username });
    setNotice('Your account details have been saved.');
  };

  const chooseAvatar = () => {
    if (typeof document === 'undefined' || !profile) return;
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = 'image/png,image/jpeg,image/webp,image/gif';
    picker.onchange = async () => {
      const file = picker.files?.[0];
      if (!file) return;
      if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
        setError('Choose a PNG, JPG, WEBP or GIF image.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Your profile picture must be 2 MB or smaller.');
        return;
      }
      setBusy(true); setError(''); setNotice('');
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
      const path = profile.id + '/avatar-' + Date.now() + '.' + extension;
      const { error: uploadError } = await supabase.storage.from('baybble-avatars').upload(path, file, {
        cacheControl: '3600', contentType: file.type, upsert: false
      });
      if (uploadError) {
        setBusy(false); setError(uploadError.message); return;
      }
      const { data: signed, error: signedError } = await supabase.storage.from('baybble-avatars').createSignedUrl(path, 3600);
      if (signedError || !signed?.signedUrl) {
        await supabase.storage.from('baybble-avatars').remove([path]);
        setBusy(false); setError(signedError?.message || 'Could not prepare your profile picture.'); return;
      }
      const { error: metadataError } = await supabase.auth.updateUser({ data: { avatar_path: path, avatar_url: null } });
      setBusy(false);
      if (metadataError) { await supabase.storage.from('baybble-avatars').remove([path]); setError(metadataError.message); return; }
      if (profile.avatarPath) await supabase.storage.from('baybble-avatars').remove([profile.avatarPath]);
      setProfile({ ...profile, avatarUrl: signed.signedUrl, avatarPath: path });
      setNotice('Your profile picture has been updated.');
    };
    picker.click();
  };

  const removeAvatar = async () => {
    if (!profile?.avatarPath) return;
    setBusy(true); setError(''); setNotice('');
    const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: null, avatar_path: null } });
    if (updateError) { setBusy(false); setError(updateError.message); return; }
    if (profile.avatarPath) {
      const { error: removeError } = await supabase.storage.from('baybble-avatars').remove([profile.avatarPath]);
      if (removeError) { setBusy(false); setError('Your picture was unlinked, but its stored file could not be removed.'); return; }
    }
    setBusy(false);
    setProfile({ ...profile, avatarUrl: '', avatarPath: '' });
    setNotice('Your initials avatar is back.');
  };

  const deleteAccount = async () => {
    if (typeof window === 'undefined' || !profile) return;
    if (!window.confirm('Permanently delete your Baybble account and saved conversations? This cannot be undone.')) return;
    const confirmation = window.prompt('Type DELETE to permanently delete your account.');
    if (confirmation !== 'DELETE') { setNotice('Account deletion cancelled.'); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) throw new Error('Your session has expired. Please sign in again.');
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + sessionData.session.access_token },
        body: JSON.stringify({ confirmation: 'DELETE' })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'Account deletion failed. Please try again.');
      await supabase.auth.signOut();
      setProfile(null);
      onSignedOut();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Account deletion failed. Please try again.');
    } finally { setBusy(false); }
  };

  const signOut = async () => {
    setBusy(true);
    const { error: e } = await supabase.auth.signOut();
    setBusy(false);
    if (e) setError(e.message); else { setProfile(null); onSignedOut(); }
  };

  const avatar = profile ? (
    profile.avatarUrl
      ? <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
      : <View style={[styles.avatarInitials, { backgroundColor: colourFor(profile.email) }]}><Text style={styles.avatarInitialsText}>{initials(profile.fullName, profile.email)}</Text></View>
  ) : null;

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={[styles.panel, userEmail && mode !== 'update' && styles.accountPanel]}>
        <View style={styles.top}>
          <Text style={styles.brand}>Baybble</Text>
          <Pressable onPress={onClose}><Text style={styles.close}>✕</Text></Pressable>
        </View>
        {userEmail && mode !== 'update' ? (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.accountScroll} contentContainerStyle={styles.accountContent}>
            <Text style={styles.title}>Account</Text>
            <Text style={styles.sub}>Review and manage your account details.</Text>
            <View style={styles.avatarSection}>
              <View style={styles.avatarFrame}>{avatar}</View>
              <View style={styles.avatarActions}>
                <Text style={styles.avatarName}>{profile?.fullName || profile?.email || userEmail}</Text>
                <Text style={styles.avatarHint}>Your Baybble profile picture</Text>
                <View style={styles.inlineActions}>
                  <Pressable onPress={chooseAvatar} disabled={busy} style={styles.secondary}><Text style={styles.secondaryText}>Upload photo</Text></Pressable>
                  {profile?.avatarUrl ? <Pressable onPress={removeAvatar} disabled={busy} style={styles.textAction}><Text style={styles.textActionText}>Remove</Text></Pressable> : null}
                </View>
              </View>
            </View>
            <Text style={styles.sectionLabel}>DETAILS</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput value={nameDraft} onChangeText={setNameDraft} placeholder="Your name" placeholderTextColor="#777" style={styles.input} />
              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput value={usernameDraft} onChangeText={setUsernameDraft} autoCapitalize="none" placeholder="your.username" placeholderTextColor="#777" style={styles.input} />
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.readOnlyValue}>{profile?.email || userEmail}</Text>
              <Text style={styles.fieldLabel}>Plan</Text>
              <Text style={styles.readOnlyValue}>Free</Text>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            <Pressable style={styles.primary} onPress={saveProfile} disabled={busy || !profile}>
              {busy ? <ActivityIndicator color="#080808" /> : <Text style={styles.primaryText}>Save changes</Text>}
            </Pressable>
            <View style={styles.accountFooter}>
              <Text style={styles.footerHint}>Your conversations stay saved to this account.</Text>
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <Pressable style={styles.signOut} onPress={signOut} disabled={busy}>
                  <Text style={styles.signOutText}>Sign out</Text>
                </Pressable>
                <Pressable style={styles.signOut} onPress={deleteAccount} disabled={busy}>
                  <Text style={[styles.signOutText, { color: '#e58c8c' }]}>Delete account</Text>
                </Pressable>
              </View>
            </View>
            <Pressable onPress={() => { if (typeof window !== 'undefined') window.location.assign('/privacy'); }} style={{ paddingVertical: 12, alignSelf: 'flex-start' }}>
              <Text style={styles.link}>Privacy policy</Text>
            </Pressable>
          </ScrollView>
        ) : (
          <>
            <Text style={styles.title}>{mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : mode === 'update' ? 'Choose a new password' : 'Welcome back'}</Text>
            <Text style={styles.sub}>Sign in to keep your Baybble conversations synced.</Text>
            {mode !== 'update' ? <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor="#777" autoCapitalize="none" keyboardType="email-address" style={styles.input} /> : null}
            {mode !== 'reset' ? <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#777" secureTextEntry style={styles.input} /> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            <Pressable style={styles.primary} onPress={submit} disabled={busy || (mode !== 'update' && !email.trim()) || (mode !== 'reset' && password.length < 6)}>
              {busy ? <ActivityIndicator color="#080808" /> : <Text style={styles.primaryText}>{mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : mode === 'update' ? 'Update password' : 'Log in'}</Text>}
            </Pressable>
            <View style={styles.links}>
              <Pressable onPress={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setNotice(''); }}><Text style={styles.link}>{mode === 'signup' ? 'Already have an account? Log in' : 'Create an account'}</Text></Pressable>
              {mode !== 'reset' && mode !== 'update' ? <Pressable onPress={() => { setMode('reset'); setError(''); setNotice(''); }}><Text style={styles.link}>Forgot password?</Text></Pressable> : mode === 'reset' ? <Pressable onPress={() => setMode('login')}><Text style={styles.link}>Back to log in</Text></Pressable> : null}
            </View>
          </>
        )}
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  panel: { width: '100%', maxWidth: 420, backgroundColor: '#111111', borderWidth: 1, borderColor: '#303030', borderRadius: 20, padding: 26 },
  accountPanel: { maxWidth: 520, maxHeight: '90vh' as any, paddingBottom: 18 },
  accountScroll: { flexGrow: 0, maxHeight: 'calc(90vh - 100px)' as any },
  accountContent: { paddingBottom: 8 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brand: { color: '#fff', fontSize: 19, fontWeight: '800' },
  close: { color: '#aaa', fontSize: 18, padding: 4 },
  title: { color: '#fff', fontSize: 25, fontWeight: '800', letterSpacing: -0.7 },
  sub: { color: '#aaa', fontSize: 12, lineHeight: 19, marginTop: 9, marginBottom: 22 },
  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 17, paddingVertical: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#292929', marginBottom: 25 },
  avatarFrame: { width: 76, height: 76, borderRadius: 38, overflow: 'hidden', flexShrink: 0 },
  avatarInitials: { width: '100%', height: '100%', borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  avatarInitialsText: { color: '#ffffff', fontSize: 25, fontWeight: '800', letterSpacing: -0.5 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 38 },
  avatarActions: { flex: 1, minWidth: 0 },
  avatarName: { color: '#eeeeee', fontSize: 14, fontWeight: '700' },
  avatarHint: { color: '#858585', fontSize: 10, marginTop: 5 },
  inlineActions: { flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 12 },
  secondary: { borderWidth: 1, borderColor: '#444444', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 13 },
  secondaryText: { color: '#eeeeee', fontSize: 10, fontWeight: '700' },
  textAction: { paddingVertical: 8, paddingHorizontal: 3 },
  textActionText: { color: '#b4b4b4', fontSize: 10, fontWeight: '600' },
  sectionLabel: { color: '#929292', fontSize: 9, fontWeight: '800', letterSpacing: 1.7, marginBottom: 15 },
  fieldGroup: { gap: 8 },
  fieldLabel: { color: '#c7c7c7', fontSize: 11, fontWeight: '700', marginTop: 8 },
  readOnlyValue: { color: '#858585', fontSize: 12, paddingVertical: 8 },
  input: { backgroundColor: '#1b1b1b', borderWidth: 1, borderColor: '#333', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, color: '#fff', marginBottom: 7, outlineStyle: 'none' as any },
  primary: { backgroundColor: '#fff', borderRadius: 999, minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  primaryText: { color: '#080808', fontWeight: '800', fontSize: 13 },
  links: { gap: 13, alignItems: 'center', marginTop: 20 },
  link: { color: '#c5c5c5', fontSize: 11 },
  error: { color: '#ff9b9b', fontSize: 11, marginTop: 8 },
  notice: { color: '#a8d8ad', fontSize: 11, marginTop: 8 },
  accountFooter: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderTopWidth: 1, borderColor: '#292929', marginTop: 22, paddingTop: 17 },
  footerHint: { color: '#777777', fontSize: 9, flex: 1, minWidth: 150, lineHeight: 15 },
  signOut: { paddingVertical: 8, paddingHorizontal: 12 },
  signOutText: { color: '#d1d1d1', fontSize: 11, fontWeight: '700' }
});
