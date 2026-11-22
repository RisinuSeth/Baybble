import React from 'react';
import Markdown from 'react-native-markdown-display';
import { Image, Linking, Pressable, Text, View } from 'react-native';

type MarkdownMessageProps = {
  content: string;
};

const markdownStyles = {
  body: {
    color: '#e8e8e8',
    fontFamily: 'Manrope',
    fontSize: 14,
    lineHeight: 25,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 12,
  },
  heading1: {
    color: '#ffffff',
    fontFamily: 'Manrope',
    fontSize: 23,
    fontWeight: '800' as const,
    lineHeight: 30,
    marginTop: 18,
    marginBottom: 10,
  },
  heading2: {
    color: '#ffffff',
    fontFamily: 'Manrope',
    fontSize: 19,
    fontWeight: '800' as const,
    lineHeight: 27,
    marginTop: 16,
    marginBottom: 8,
  },
  heading3: {
    color: '#ffffff',
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 24,
    marginTop: 13,
    marginBottom: 6,
  },
  strong: {
    color: '#ffffff',
    fontWeight: '800' as const,
  },
  em: {
    fontStyle: 'italic' as const,
  },
  bullet_list: {
    marginTop: 4,
    marginBottom: 12,
  },
  ordered_list: {
    marginTop: 4,
    marginBottom: 12,
  },
  list_item: {
    marginTop: 3,
    marginBottom: 3,
  },
  bullet_list_icon: {
    color: '#bdbdbd',
    marginRight: 8,
  },
  ordered_list_icon: {
    color: '#bdbdbd',
    marginRight: 8,
  },
  code_inline: {
    color: '#f0d9a6',
    backgroundColor: '#242424',
    fontFamily: 'monospace',
    fontSize: 13,
    borderRadius: 4,
  },
  code_block: {
    color: '#eeeeee',
    backgroundColor: '#171717',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 19,
  },
  fence: {
    color: '#eeeeee',
    backgroundColor: '#171717',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 19,
  },
  blockquote: {
    backgroundColor: '#171717',
    borderLeftColor: '#777777',
    borderLeftWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginVertical: 8,
  },
  link: {
    color: '#9cc8ff',
    textDecorationLine: 'underline' as const,
  },
  hr: {
    backgroundColor: '#444444',
    height: 1,
    marginVertical: 12,
  },
};

const sourceStyles = {
  group: {
    alignSelf: 'flex-start' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 2,
    marginBottom: 12,
  },
  label: {
    color: '#999999',
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '700' as const,
    marginRight: 7,
  },
  sourceIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#454545',
  },
  sourceIconOverlap: { marginLeft: -5 },
};

function faviconUrl(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(hostname) + '&sz=64';
  } catch {
    return '';
  }
}

function splitSources(content: string) {
  // Accept both plain and Markdown-formatted Sources headings, including headings
  // that begin after a newline.
  const section = content.match(/(?:^|\n)\s*(?:#{1,3}\s*)?(?:\*\*|__)?(?:Sources|References)(?:\*\*|__)?\s*:?\s*([\s\S]*)$/i);
  if (!section || section.index === undefined) {
    return { answer: content, sources: [] as Array<{ url: string; title: string }> };
  }

  const answer = content.slice(0, section.index).trim();
  const sourceText = section[1];
  const sources: Array<{ url: string; title: string }> = [];
  const seen = new Set<string>();

  const addSource = (rawUrl: string, title?: string) => {
    const cleanedUrl = rawUrl
      .replace(/&amp;/g, '&')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/[.,;]+$/, '');
    try {
      const parsed = new URL(cleanedUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return;
      const normalizedUrl = parsed.toString();
      if (seen.has(normalizedUrl)) return;
      seen.add(normalizedUrl);
      sources.push({
        url: normalizedUrl,
        title: title?.trim() || parsed.hostname.replace(/^www\./, ''),
      });
    } catch {
      // Ignore malformed or non-web source references.
    }
  };

  // First parse Markdown links, including the common format:
  // [1] [https://example.com](https://example.com)
  const markdownLinkPattern = /\[(?:\d+)\]\s*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = markdownLinkPattern.exec(sourceText)) !== null) {
    addSource(match[2] || match[4], match[1] || match[3]);
  }

  // Also accept bare URLs and numbered URL references on the same or separate lines.
  const bareUrlPattern = /https?:\/\/[^\s<>"']+/g;
  while ((match = bareUrlPattern.exec(sourceText)) !== null) {
    const preceding = sourceText.slice(0, match.index);
    const isMarkdownDestination = /\]\($/.test(preceding);
    if (!isMarkdownDestination) addSource(match[0]);
  }

  // Keep a plain-text reference list visible if it contains no usable URLs.
  // The source-icon row is rendered only when real, clickable web URLs were found.
  if (sources.length === 0) {
    return { answer: content, sources };
  }

  return { answer, sources };
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  const { answer, sources } = splitSources(content);
  return (
    <View>
      {answer ? <Markdown style={markdownStyles}>{answer}</Markdown> : null}
      {sources.length ? (
        <View style={sourceStyles.group} accessibilityLabel={`${sources.length} web sources`}>
          <Text style={sourceStyles.label}>Sources</Text>
          {sources.map((source, index) => (
            <Pressable
              key={source.url}
              style={[sourceStyles.sourceIcon, index > 0 && sourceStyles.sourceIconOverlap]}
              onPress={() => { void Linking.openURL(source.url); }}
              accessibilityRole="link"
              accessibilityLabel={source.title}
            >
              <Image source={{ uri: faviconUrl(source.url) }} style={{ width: 16, height: 16 }} resizeMode="contain" />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
