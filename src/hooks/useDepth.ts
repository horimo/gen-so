"use client";

import { useState, useEffect, useRef } from "react";

/**
 * 深度（depth）を管理するカスタムフック
 * スクロールやマウスホイールで深度を制御
 * 入力フィールドにフォーカスがある時は深度の更新をスキップ
 */
export function useDepth() {
  const [depth, setDepth] = useState(0);
  const isInputFocusedRef = useRef(false);

  // 入力フィールドのフォーカス状態を外部から制御できるようにする
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "TEXTAREA" ||
        target.tagName === "INPUT" ||
        target.isContentEditable
      ) {
        isInputFocusedRef.current = true;
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "TEXTAREA" ||
        target.tagName === "INPUT" ||
        target.isContentEditable
      ) {
        // 少し遅延させて、次の入力フィールドへのフォーカス移動を考慮
               setTimeout(() => {
                 const activeElement = document.activeElement as HTMLElement | null;
                 if (
                   !activeElement ||
                   (activeElement.tagName !== "TEXTAREA" &&
                     activeElement.tagName !== "INPUT" &&
                     !activeElement.isContentEditable)
                 ) {
                   isInputFocusedRef.current = false;
                 }
               }, 100);
      }
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  useEffect(() => {
    let accumulatedDepth = 0;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    let touchStartY = 0;
    let touchStartDepth = 0;
    let isTouching = false;

    const handleWheel = (e: WheelEvent) => {
      // 入力フィールドにフォーカスがある時は深度の更新をスキップ
      if (isInputFocusedRef.current) {
        return;
      }

      e.preventDefault();
      
      // スクロール方向に応じて深度を更新（マイナスy方向が深い）
      const delta = e.deltaY * 0.1;
      accumulatedDepth += delta;
      
      // 深度は0以上（マイナス方向に移動）
      accumulatedDepth = Math.max(0, accumulatedDepth);
      
      setDepth(accumulatedDepth);
      
      // スクロール中フラグを設定
      isScrolling = true;
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    };

    // タッチイベント（スマホ対応）
    const handleTouchStart = (e: TouchEvent) => {
      // 入力フィールドにフォーカスがある時は深度の更新をスキップ
      if (isInputFocusedRef.current) {
        return;
      }

      // タッチ可能な要素（ボタン、リンクなど）をタップした場合はスキップ
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("form")
      ) {
        return;
      }

      isTouching = true;
      touchStartY = e.touches[0].clientY;
      touchStartDepth = accumulatedDepth;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching || isInputFocusedRef.current) {
        return;
      }

      e.preventDefault();
      
      const touchCurrentY = e.touches[0].clientY;
      const deltaY = touchStartY - touchCurrentY; // 上にスワイプ = 正の値 = 深く潜る
      
      // スクロール感度を調整（スマホでは少し強めに）
      const delta = deltaY * 0.15;
      accumulatedDepth = touchStartDepth + delta;
      
      // 深度は0以上（マイナス方向に移動）
      accumulatedDepth = Math.max(0, accumulatedDepth);
      
      setDepth(accumulatedDepth);
    };

    const handleTouchEnd = () => {
      isTouching = false;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return depth;
}

