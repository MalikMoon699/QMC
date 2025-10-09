import React from "react";
import { Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "react-toastify";

const handleCopy = (text) => {
  navigator.clipboard.writeText(text);
  toast.success("Code Copied!");
};

export const FormatResponse=({ text })=> {
  return (
    <div
      style={{
        padding: "0px 10px",
        borderRadius: "10px",
        lineHeight: "1.6",
      }}
    >
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <>
                <div className="code-header">
                  <strong>Code</strong>
                  <span onClick={() => handleCopy(String(children))}>
                    <Copy size={15} />
                    Copy
                  </span>
                </div>
                <SyntaxHighlighter
                  style={materialDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </>
            ) : (
              <code {...props}>{children}</code>
            );
          },
          h1: ({ children }) => (
            <h1 style={{ fontSize: "1.8em", margin: "10px 0" }}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ fontSize: "1.5em", margin: "10px 0" }}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ fontSize: "1.3em", margin: "8px 0" }}>{children}</h3>
          ),
          li: ({ children }) => (
            <li style={{ marginBottom: "6px" }}>{children}</li>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
