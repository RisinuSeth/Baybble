import React from 'react';
import Markdown from 'react-native-markdown-display';
import { Linking, Pressable, Text, View } from 'react-native';

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
    gap: 7,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginTop: 2,
    marginBottom: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#383838',
    backgroundColor: '#171717',
  },
  label: {
    color: '#999999',
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '700' as const,
    marginRight: 2,
  },
  circle: {
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: '#454545',
    backgroundColor: '#242424',
  },
  number: {
    color: '#dedede',
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '700' as const,
  },
};

function splitSources(content: string) {
  const section = content.match(/(?:^|\n)\s*(?:#{1,3}\s*)?Sources\s*:?\s*([\s\S]*)$/i);
  if (!section || section.index === undefined) return { answer: content, sources: [] as Array<{ url: string; title: string }> };

  const sourceText = section[1];
  const answer = content.slice(0, section.index).trim();
  const sources: Array<{ url: string; title: string }> = [];
  const seen = new Set<string>();

  for (const line of sourceText.split('\n')) {
    const urls = line.match(/https?:\/\/[^\s)\]]+/g) || [];
    for (const rawUrl of urls) {
      const url = rawUrl.replace(/[.,;]+$/, '');
      if (seen.has(url)) continue;
      seen.add(url);
      const markdownLabel = line.match(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/);
      const bracketLabel = line.match(/\[\d+\]\s*\[([^\]]+)\]/);
      sources.push({
        url,
        title: markdownLabel?.[1] || bracketLabel?.[1] || \`Source \${sources.length + 1}\`,
      });
    }
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
              style={sourceStyles.circle}
              onPress={() => { void Linking.openURL(source.url); }}
              accessibilityRole="link"
              accessibilityLabel={source.title}
            >
              <Text style={sourceStyles.number}>{index + 1}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
