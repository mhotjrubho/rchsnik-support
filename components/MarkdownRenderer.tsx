import React from 'react';
import { MarkdownPreviewProps } from '../types';

const MarkdownRenderer: React.FC<MarkdownPreviewProps> = ({ text }) => {
  const parseMarkdown = (input: string) => {
    if (!input || input.trim() === '') {
      return '<span class="text-gray-400 italic text-sm">התצוגה המקדימה תופיע כאן בזמן אמת...</span>';
    }

    let html = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks `code`
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-rose-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-gray-900">$1</strong>');
    
    // Italic: *text*
    html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em class="italic text-gray-800">$2</em>');

    // Strikethrough: ~~text~~
    html = html.replace(/~~(.*?)~~/g, '<del class="line-through text-gray-500">$1</del>');

    // Blockquotes: > quote
    html = html.replace(/^&gt;\s?(.*$)/gm, '<blockquote class="border-r-4 border-[#337ab7] pr-3 py-1 my-2 text-gray-600 bg-blue-50/50 rounded-l text-sm italic">$1</blockquote>');

    // Headers: ### Title
    html = html.replace(/^### (.*$)/gm, '<h4 class="text-base font-bold text-gray-900 mt-2 mb-1">$1</h4>');
    html = html.replace(/^## (.*$)/gm, '<h3 class="text-lg font-bold text-gray-900 mt-2 mb-1">$1</h3>');
    html = html.replace(/^# (.*$)/gm, '<h2 class="text-xl font-black text-gray-900 mt-2 mb-1">$1</h2>');

    // Unordered lists: - item
    html = html.replace(/^\s*-\s+(.*$)/gm, '<li class="mr-4 list-disc text-gray-800">$1</li>');

    // Links: [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#337ab7] underline font-medium hover:text-[#286090]" target="_blank" rel="noopener noreferrer">$1</a>');

    // Line breaks (convert newlines to <br>, except where block elements were created)
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  return (
    <div 
      className="text-gray-800 text-[15px] leading-relaxed break-words text-right forum-preview font-heebo"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }} 
    />
  );
};

export default MarkdownRenderer;