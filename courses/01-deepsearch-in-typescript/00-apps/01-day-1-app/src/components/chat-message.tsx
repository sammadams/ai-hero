import ReactMarkdown, { type Components } from "react-markdown";
import type { Message } from "ai";

export type MessagePart = NonNullable<Message["parts"]>[number];

interface ChatMessageProps {
  parts: MessagePart[];
  role: string;
  userName: string;
}

const components: Components = {
  // Override default elements with custom styling
  p: ({ children }) => <p className="mb-4 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-4 list-disc pl-4">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 list-decimal pl-4">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  code: ({ className, children, ...props }) => (
    <code className={`${className ?? ""}`} {...props}>
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-700 p-4">
      {children}
    </pre>
  ),
  a: ({ children, ...props }) => (
    <a
      className="text-blue-400 underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
};

const Markdown = ({ children }: { children: string }) => {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
};

function renderPart(part: MessagePart, idx: number) {
  switch (part.type) {
    case "text":
      return <Markdown key={idx}>{part.text}</Markdown>;
    case "tool-invocation":
      return (
        <div key={idx} className="my-2 rounded bg-gray-700 p-2 text-xs">
          <span className="font-bold">[Tool Call]</span> <span title="MessagePart: tool-invocation">{part.toolInvocation.toolName}</span>
          <pre className="mt-1 whitespace-pre-wrap break-all">{JSON.stringify(part.toolInvocation, null, 2)}</pre>
        </div>
      );
    case "reasoning":
      return (
        <div key={idx} className="my-2 rounded bg-gray-700 p-2 text-xs">
          <span className="font-bold">[Reasoning]</span> <span title="MessagePart: reasoning">{part.reasoning}</span>
        </div>
      );
    default:
      return (
        <div key={idx} className="my-2 rounded bg-gray-700 p-2 text-xs opacity-60">
          <span className="font-bold">[Unknown Part]</span> <span title={`MessagePart: ${part.type}`}>{part.type}</span>
        </div>
      );
  }
}

export const ChatMessage = ({ parts, role, userName }: ChatMessageProps) => {
  const isAI = role === "assistant";

  return (
    <div className="mb-6">
      <div
        className={`rounded-lg p-4 ${
          isAI ? "bg-gray-800 text-gray-300" : "bg-gray-900 text-gray-300"
        }`}
      >
        <p className="mb-2 text-sm font-semibold text-gray-400">
          {isAI ? "AI" : userName}
        </p>
        <div className="prose prose-invert max-w-none">
          {parts?.map((part, idx) => renderPart(part, idx))}
        </div>
      </div>
    </div>
  );
};
