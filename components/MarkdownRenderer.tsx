import React from 'react';
import { MarkdownPreviewProps } from '../types';

const MarkdownRenderer: React.FC<MarkdownPreviewProps> = ({ text }) => {
  
  const parseMarkdown = (input: string) => {
    // 1. Sanitize HTML (basic)
    let html = input.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 2. Images: ![alt](url) 
    // We match this BEFORE links so links don't eat the markdown
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded border border-stone-300 my-2" />');

    // 3. Links: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="#" class="text-blue-600 underline hover:text-blue-800">$1</a>');

    // 4. Inline Code: `text`
    html = html.replace(/`(.*?)`/g, '<code class="bg-stone-200 text-red-600 px-1 py-0.5 rounded font-mono text-xs">$1</code>');

    // 5. Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<b class="text-[#3e2f1c] font-extrabold bg-[#fff5d4] px-1 rounded-sm">$1</b>');
    
    // 6. Italic: *text*
    html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<i class="text-[#5c4033] italic">$2</i>');

    // 7. Blockquote: > text
    html = html.replace(/^&gt; (.*$)/gm, '<blockquote class="border-r-4 border-[#d4a373] pr-3 my-2 text-[#8b7355] italic bg-[#fffdf5] py-1">$1</blockquote>');

    // 8. Unordered List: * text
    html = html.replace(/^\* (.*$)/gm, '<li class="list-disc mr-5 text-[#3e2f1c] marker:text-[#d4a373]">$1</li>');
    
    // 9. Wrap lists
    if (html.includes('<li')) {
        html = html.replace(/(<li.*<\/li>)/gs, '<ul class="my-2 space-y-1">$1</ul>');
    }

    // 10. Line breaks
    html = html.replace(/\n/g, '<br>');

    return { __html: html };
  };

  return (
    <div 
        className="text-[#3e2f1c] text-sm leading-relaxed break-words"
        dangerouslySetInnerHTML={parseMarkdown(text)} 
    />
  );
};

export default MarkdownRenderer;