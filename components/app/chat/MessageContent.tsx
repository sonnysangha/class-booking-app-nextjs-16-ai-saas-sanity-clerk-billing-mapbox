"use client";

import Link from "next/link";
import Markdown from "react-markdown";

interface MessageContentProps {
  content: string;
  closeChat: () => void;
  isUser: boolean;
}

export function MessageContent({
  content,
  closeChat,
  isUser,
}: MessageContentProps) {
  const handleCloseChat = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      closeChat();
    }
  };

  return (
    <Markdown
      components={{
        a: ({ href, children }) => {
          if (!href) return <span>{children}</span>;
          const isInternalLink = href.startsWith("/");
          if (isInternalLink) {
            return (
              <Link
                href={href}
                onClick={handleCloseChat}
                className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              >
                {children}
              </Link>
            );
          }
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          );
        },
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        h1: ({ children }) => (
          <h1 className="text-lg font-bold mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mb-1">{children}</h3>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-outside ml-4 mb-2 space-y-1">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside ml-4 mb-2 space-y-1">
            {children}
          </ol>
        ),
        li: ({ children }) => {
          if (!children || (typeof children === "string" && !children.trim())) {
            return null;
          }
          return <li className="pl-1">{children}</li>;
        },
        hr: () => <hr className="my-4 border-border" />,
        code: ({ children, className }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code
                className={`px-1 py-0.5 rounded text-xs font-mono ${
                  isUser
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {children}
              </code>
            );
          }
          return <code className={className}>{children}</code>;
        },
        pre: ({ children }) => (
          <pre className="p-3 rounded-lg bg-muted overflow-x-auto mb-2 text-xs">
            {children}
          </pre>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
      }}
    >
      {content}
    </Markdown>
  );
}

