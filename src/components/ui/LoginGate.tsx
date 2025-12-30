"use client";

import { motion } from "framer-motion";
import { Sparkles } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginGateProps {
  initialError?: string | null;
}

/**
 * 幻想的なログイン画面コンポーネント
 */
export function LoginGate({ initialError }: LoginGateProps) {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 初期エラーを設定
  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const result = await signUpWithEmail(email, password);
        // メール確認が必要な場合
        if (result && !result.session) {
          setSuccessMessage("登録が完了しました。メールを確認してアカウントを有効化してください。");
          setEmail("");
          setPassword("");
        } else if (result && result.session) {
          // メール確認が不要な場合、自動的にログインされる
          setSuccessMessage("登録が完了しました。");
        }
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "認証に失敗しました");
      console.error("認証エラー:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center">
      {/* 背景の3Dシーン */}
      <div className="absolute inset-0 w-full h-full">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <Sparkles
            count={100}
            scale={[20, 20, 20]}
            size={3}
            speed={0.3}
            opacity={0.8}
            color="#ffffff"
          />
        </Canvas>
      </div>

      {/* ログインフォーム */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-8"
      >
        <div className="relative rounded-3xl border border-white/20 bg-white/5 backdrop-blur-2xl shadow-2xl p-8">
          {/* 内側の光る効果 */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

          {/* タイトル */}
          <div className="relative mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2 font-mono">
              GEN-SO
            </h1>
            <p className="text-white/60 text-sm font-mono">
              言層へようこそ
            </p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm font-mono"
            >
              {error}
            </motion.div>
          )}

          {/* 成功メッセージ */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-200 text-sm font-mono"
            >
              {successMessage}
            </motion.div>
          )}

          {/* メール認証フォーム */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレス"
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/40 font-mono outline-none focus:border-white/40 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
                required
                minLength={6}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/40 font-mono outline-none focus:border-white/40 focus:bg-white/10 transition-all"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm font-mono text-white transition-all",
                "hover:bg-white/20 hover:border-white/30 hover:shadow-lg",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>処理中...</span>
                </>
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>新規登録</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>ログイン</span>
                </>
              )}
            </motion.button>
          </form>

          {/* 切り替えボタン */}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccessMessage(null);
            }}
            className="w-full mb-4 text-white/60 text-sm font-mono hover:text-white transition-colors"
          >
            {isSignUp ? "既にアカウントをお持ちですか？" : "アカウントを作成"}
          </button>

          {/* 下部のアクセントライン */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}

