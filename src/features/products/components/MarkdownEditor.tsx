"use client";

import { useRef } from "react";
import { Button, Space, theme } from "antd";
import { mdToHtml } from "@/lib/markdown";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

/** Minimal Markdown editor: format toolbar + textarea + live preview. */
export function MarkdownEditor({ value = "", onChange }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const { token } = theme.useToken();

  const wrap = (before: string, after = before) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = value.slice(start, end) || "text";
    onChange?.(value.slice(0, start) + before + sel + after + value.slice(end));
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + sel.length;
    });
  };

  const addListItem = () =>
    onChange?.(`${value}${value && !value.endsWith("\n") ? "\n" : ""}- `);

  return (
    <div>
      <Space style={{ marginBottom: 8 }} wrap>
        <Button size="small" onClick={() => wrap("**")}>
          <b>B</b>
        </Button>
        <Button size="small" onClick={() => wrap("*")}>
          <i>I</i>
        </Button>
        <Button size="small" onClick={() => wrap("`")}>
          {"</>"}
        </Button>
        <Button size="small" onClick={() => wrap("[", "](https://)")}>
          Link
        </Button>
        <Button size="small" onClick={addListItem}>
          • List
        </Button>
      </Space>
      <textarea
        ref={ref}
        rows={4}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Description — **bold**, *italic*, [link](https://…), - list"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "8px 12px",
          borderRadius: token.borderRadius,
          border: `1px solid ${token.colorBorder}`,
          background: token.colorBgContainer,
          color: token.colorText,
          fontFamily: "inherit",
          fontSize: 14,
          resize: "vertical",
        }}
      />
      {value.trim() && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 12px",
            borderRadius: token.borderRadius,
            background: token.colorFillQuaternary,
            fontSize: 13,
            color: token.colorTextSecondary,
          }}
          dangerouslySetInnerHTML={{ __html: mdToHtml(value) }}
        />
      )}
    </div>
  );
}
