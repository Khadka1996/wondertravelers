"use client"
import { useEffect } from 'react'

interface Props {
  canonicalUrl: string;
}

export default function CopyAttributionClient({ canonicalUrl }: Props) {
  useEffect(() => {
    function onCopy(e: ClipboardEvent) {
      try {
        const sel = typeof window !== 'undefined' ? window.getSelection?.() : null;
        if (!sel) return;
        const text = sel.toString();
        if (!text || !text.trim()) return;

        const attributionText = `\n\nSource: ${canonicalUrl}`;
        const plain = text + attributionText;
        const html = `${escapeHtml(text)}<br/><br/><a href="${canonicalUrl}">Source: ${canonicalUrl}</a>`;

        if (e.clipboardData) {
          e.preventDefault();
          e.clipboardData.setData('text/plain', plain);
          e.clipboardData.setData('text/html', html);
        } else if ((window as any).clipboardData) {
          // IE fallback
          (window as any).clipboardData.setData('Text', plain);
        }
      } catch (err) {
        // silent fail - do not break copy in unknown environments
      }
    }

    document.addEventListener('copy', onCopy);
    return () => document.removeEventListener('copy', onCopy);
  }, [canonicalUrl]);

  return null;
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
