import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Link, 
  Image, 
  Code, 
  Quote,
  List,
  ListOrdered,
  Heading1,
  Heading2
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertHeader = (level: number) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        const headerElement = document.createElement(`h${level}`);
        headerElement.textContent = selectedText;
        headerElement.className = level === 1 ? "text-2xl font-bold mb-4" : "text-xl font-semibold mb-3";
        
        range.deleteContents();
        range.insertNode(headerElement);
        
        // Move cursor after the header
        range.setStartAfter(headerElement);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        handleInput();
      }
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      execCommand("insertImage", url);
    }
  };

  const tools = [
    { icon: Bold, command: "bold", title: "Bold" },
    { icon: Italic, command: "italic", title: "Italic" },
    { icon: Link, action: insertLink, title: "Insert Link" },
    { icon: Image, action: insertImage, title: "Insert Image" },
    { icon: Code, command: "formatBlock", value: "pre", title: "Code Block" },
    { icon: Quote, command: "formatBlock", value: "blockquote", title: "Quote" },
    { icon: List, command: "insertUnorderedList", title: "Bullet List" },
    { icon: ListOrdered, command: "insertOrderedList", title: "Numbered List" },
    { icon: Heading1, action: () => insertHeader(1), title: "Heading 1" },
    { icon: Heading2, action: () => insertHeader(2), title: "Heading 2" },
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center space-x-2 p-3 border-b border-border bg-light-gray">
        {tools.map((tool, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title={tool.title}
            onClick={() => {
              if (tool.action) {
                tool.action();
              } else if (tool.command) {
                execCommand(tool.command, tool.value);
              }
            }}
          >
            <tool.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={`min-h-[300px] p-4 outline-none prose max-w-none ${
          isFocused ? "ring-2 ring-accent ring-opacity-50" : ""
        }`}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          lineHeight: "1.6",
          fontFamily: "Georgia, serif",
        }}
      />
      
      {/* Placeholder */}
      {!content && !isFocused && (
        <div className="absolute top-[60px] left-4 text-secondary pointer-events-none">
          Tell your story...
        </div>
      )}
    </div>
  );
}
