import React from 'react';
import Markdown from 'react-native-markdown-display';

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

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return <Markdown style={markdownStyles}>{content}</Markdown>;
}
