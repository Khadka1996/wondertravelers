'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import type ReactQuillType from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }) as typeof ReactQuillType;

const FORMATS = ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'blockquote', 'code-block', 'link', 'image', 'align'];
const DATA_IMAGE = /data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+/gi;

async function uploadImage(file: Blob): Promise<string> {
  const body = new FormData();
  body.append('image', file, 'image');
  const response = await fetch('/api/blogs/images', { method: 'POST', body, credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) throw new Error(data.error || 'Image upload failed');
  return data.url as string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Article editor. Pictures are uploaded as files the moment they are added
 * (toolbar, paste or drag-and-drop) and the article keeps only their URL, so
 * even long, photo-heavy posts stay small enough to save.
 */
export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState('');
  const inFlight = useRef(new Set<string>());
  const latest = useRef(value);
  latest.current = value;

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          ['link', 'image'],
          [{ align: [] }],
          ['clean'],
        ],
        handlers: {
          image(this: { quill: { getSelection: (focus?: boolean) => { index: number } | null; getLength: () => number; insertEmbed: (i: number, t: string, v: string) => void } }) {
            const quill = this.quill;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              setError('');
              setUploading((n) => n + 1);
              try {
                const url = await uploadImage(file);
                const index = quill.getSelection(true)?.index ?? quill.getLength();
                quill.insertEmbed(index, 'image', url);
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Image upload failed');
              } finally {
                setUploading((n) => n - 1);
              }
            };
            input.click();
          },
        },
      },
    }),
    [],
  );

  // Pasted or dropped pictures arrive as base64: swap each for an uploaded file.
  useEffect(() => {
    const found = [...new Set(value.match(DATA_IMAGE) || [])].filter((d) => !inFlight.current.has(d));
    for (const dataUrl of found) {
      inFlight.current.add(dataUrl);
      setUploading((n) => n + 1);
      fetch(dataUrl)
        .then((r) => r.blob())
        .then(uploadImage)
        .then((url) => onChange(latest.current.split(dataUrl).join(url)))
        .catch((e) => setError(e instanceof Error ? e.message : 'Image upload failed'))
        .finally(() => {
          inFlight.current.delete(dataUrl);
          setUploading((n) => n - 1);
        });
    }
  }, [value, onChange]);

  return (
    <>
      <ReactQuill value={value} onChange={onChange} modules={modules} formats={FORMATS} placeholder={placeholder} theme="snow" />
      {(uploading > 0 || error) && (
        <p style={{ fontSize: '0.8rem', padding: '6px 12px', color: error ? '#d32f2f' : '#1976d2' }}>
          {error || `Uploading ${uploading} image${uploading > 1 ? 's' : ''}...`}
        </p>
      )}
    </>
  );
}
