"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { useMessageStore } from "@/store/useMessageStore";
import { cn } from "@/lib/utils";

interface FloatingChatProps {
  currentDepth: number;
  onSend?: (message: string, depth: number) => Promise<void>;
}

/**
 * 浮遊チャットUIコンポーネント
 * ガラスモフィズムデザインで右下に配置
 */
export function FloatingChat({ currentDepth, onSend }: FloatingChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const addMessage = useMessageStore((state) => state.addMessage);
  const updateMessageStatus = useMessageStore((state) => state.updateMessageStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isSending) {
      return;
    }

    setIsSending(true);
    const message = addMessage(trimmedValue, currentDepth);
    
    // 送信開始
    updateMessageStatus(message.id, "sending");

    try {
      // 後続のAI解析処理へ繋げる
      if (onSend) {
        await onSend(trimmedValue, currentDepth);
      } else {
        // デフォルトの処理（後でAI解析処理に置き換え）
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      // 送信成功
      updateMessageStatus(message.id, "sent");
    } catch (error) {
      console.error("Failed to send message:", error);
      updateMessageStatus(message.id, "error");
    } finally {
      setIsSending(false);
      setInputValue("");
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enterキーで送信（Shift+Enterで改行）
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 z-10 w-auto sm:w-full sm:max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            "relative rounded-xl sm:rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-2xl transition-all duration-300",
            isFocused && "border-white/30 bg-white/10 shadow-3xl"
          )}
        >
          {/* 内側の光る効果 */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          
          {/* 入力フィールド */}
          <div className="relative p-3 sm:p-4">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力..."
              className="w-full bg-transparent text-white placeholder:text-white/40 resize-none outline-none font-mono text-sm sm:text-base leading-relaxed min-h-[50px] sm:min-h-[60px] max-h-[150px] sm:max-h-[200px]"
              style={{
                textShadow: "0 0 10px rgba(255, 255, 255, 0.2)",
              }}
              disabled={isSending}
              rows={3}
            />
            
            {/* 送信ボタン */}
            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/10">
              <AnimatePresence mode="wait">
                {isSending ? (
                  <motion.div
                    key="sending"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 text-white/60 text-sm font-mono"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>送信中...</span>
                  </motion.div>
                ) : (
                  <motion.button
                    key="send"
                    type="submit"
                    disabled={!inputValue.trim() || isSending}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-200",
                      "hover:bg-white/20 hover:border-white/30 hover:shadow-lg",
                      "disabled:opacity-30 disabled:cursor-not-allowed",
                      "focus:outline-none focus:ring-2 focus:ring-white/30"
                    )}
                  >
                    <Send className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-mono">送信</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* 下部のアクセントライン */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </form>
    </motion.div>
  );
}

