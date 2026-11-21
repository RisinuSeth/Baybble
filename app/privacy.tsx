import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PrivacyPolicy() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => { if (typeof window !== 'undefined') window.history.back(); }} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.brand}>Baybble</Text>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.updated}>Last updated: 21 November 2026</Text>
      <Text style={styles.intro}>This page explains what information Baybble processes when you use the service and the choices available to you.</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>Information we process</Text>
        <Text style={styles.body}>When you create an account, Baybble processes your email address and account information such as your name, username and profile picture if you choose to provide them. If you use chat, the messages you send and the responses generated for you are processed. Basic technical information may also be processed to operate, protect and troubleshoot the service.</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>How information is used</Text>
        <Text style={styles.body}>Baybble uses this information to provide conversations, maintain your account, save and restore your chat history, respond to support requests, and protect the service from misuse.</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Service providers</Text>
        <Text style={styles.body}>Baybble uses Cloudflare Workers AI to process prompts and generate responses, and Supabase to provide authentication, database and profile-image storage. These providers process information as needed to deliver their services and under their applicable terms and privacy documentation. Baybble does not operate or own the underlying Llama model.</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Conversations and storage</Text>
        <Text style={styles.body}>Signed-in conversations are stored in your Baybble account until you delete them or delete your account. Guest conversations may be stored in your browser's local storage. Profile pictures are stored in Baybble's profile-image storage and are intended to be accessible only through authenticated access or time-limited links. Do not upload information or images you do not want processed by the service.</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Your choices</Text>
        <Text style={styles.body}>You can edit your account details, remove your profile picture, delete individual conversations, sign out, or request permanent account deletion from Account settings. Account deletion removes your authentication account and associated Baybble conversations and messages. Some limited records may remain temporarily in provider backups or where retention is required for security or legal reasons.</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Security</Text>
        <Text style={styles.body}>Baybble uses account authentication, database access policies and restricted profile-image access to help protect user information. No internet service can guarantee absolute security. Keep your sign-in credentials private and avoid sending highly sensitive information in chats.</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Changes and contact</Text>
        <Text style={styles.body}>This policy may be updated as Baybble changes. The latest version will be published on this page. For privacy questions or requests, use the support contact provided by Baybble when available.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#090909' },
  content: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: 26, paddingTop: 34, paddingBottom: 90 },
  back: { alignSelf: 'flex-start', paddingVertical: 10, marginBottom: 28 },
  backText: { color: '#bcbcbc', fontSize: 13 },
  brand: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginBottom: 22 },
  title: { color: '#ffffff', fontSize: 36, fontWeight: '800', letterSpacing: -1.1 },
  updated: { color: '#888888', fontSize: 11, marginTop: 10 },
  intro: { color: '#c7c7c7', fontSize: 15, lineHeight: 25, marginTop: 24, marginBottom: 18 },
  section: { paddingVertical: 19, borderTopWidth: 1, borderColor: '#252525' },
  heading: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 9 },
  body: { color: '#b0b0b0', fontSize: 13, lineHeight: 23 }
});
