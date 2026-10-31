import React from 'react';
import { MarkdownPreviewProps } from '../types';

const MarkdownRenderer: React.FC<MarkdownPreviewProps> = ({ text }) => {
  const parseMarkdown = (input: string) => {
    if (!input || input.trim() === '') {
      return '';
    }

    let html = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // NodeBB quote attribution line: @username כתב: or @username אמר ב...:
    html = html.replace(
      /@([\u0590-\u05FFa-zA-Z0-9_.-]+)\s+(כתב(?:\s+ב[^:]+)?):/g,
      '<a href="#profile" class="text-[#0d6efd] font-semibold hover:underline">@$1</a> <span class="text-[#0d6efd] hover:underline">$2</span>:'
    );

    // Generic @mentions
    html = html.replace(
      /(^|\s)@([\u0590-\u05FFa-zA-Z0-9_.-]+)(?!\s*<\/a>)/g,
      '$1<a href="#profile" class="text-[#0d6efd] font-semibold hover:underline">@$2</a>'
    );

    // Group consecutive blockquote lines (> ...) into a single <blockquote>
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let inQuote = false;
    let quoteBuffer: string[] = [];

    for (const line of lines) {
      if (line.startsWith('&gt;')) {
        inQuote = true;
        quoteBuffer.push(line.replace(/^&gt;\s?/, ''));
      } else {
        if (inQuote) {
          processedLines.push(`<blockquote>${quoteBuffer.join('<br />')}</blockquote>`);
          quoteBuffer = [];
          inQuote = false;
        }
        processedLines.push(line);
      }
    }
    if (inQuote) {
      processedLines.push(`<blockquote>${quoteBuffer.join('<br />')}</blockquote>`);
    }

    html = processedLines.join('\n');

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code class="bg-[#f8f9fa] border border-[#dee2e6] text-[#d63384] px-1.5 py-0.5 rounded text-[13px] font-mono">$1</code>');

    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#212529]">$1</strong>');
    
    // Italic: *text*
    html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em class="italic">$2</em>');

    // Strikethrough: ~~text~~
    html = html.replace(/~~(.*?)~~/g, '<del class="line-through text-[#6c757d]">$1</del>');

    // Headers
    html = html.replace(/^### (.*$)/gm, '<h4 class="text-base font-bold text-[#212529] mt-2 mb-1">$1</h4>');
    html = html.replace(/^## (.*$)/gm, '<h3 class="text-lg font-bold text-[#212529] mt-2 mb-1">$1</h3>');
    html = html.replace(/^# (.*$)/gm, '<h2 class="text-xl font-bold text-[#212529] mt-2 mb-1">$1</h2>');

    // Unordered lists: - item
    html = html.replace(/^\s*-\s+(.*$)/gm, '<li class="mr-4 list-disc text-[#212529]">$1</li>');

    // Links: [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#0d6efd] underline hover:text-[#0a58ca]" target="_blank" rel="noopener noreferrer">$1</a>');

    // Line breaks
    html = html.replace(/\n/g, '<br />');
    html = html.replace(/<\/blockquote><br \/>/g, '</blockquote>');

    return html;
  };

  return (
    <div 
      className="text-[#212529] text-[15px] leading-relaxed break-words text-right forum-preview"
      dir="rtl"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }} 
    />
  );
};

export default MarkdownRenderer;