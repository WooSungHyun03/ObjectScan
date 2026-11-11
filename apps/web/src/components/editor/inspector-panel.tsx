"use client";
import { useSyncExternalStore } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
const subscribe = (callback: () => void) => {
  const media = window.matchMedia("(max-width:767px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
export function InspectorPanel({ children }: { children: React.ReactNode }) {
  const mobile = useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(max-width:767px)").matches,
    () => false,
  );
  if (!mobile) return children;
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button className="editor-open-options" variant="outline">
          <SlidersHorizontal size={17} />
          편집 옵션 열기
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay" />
        <Dialog.Content className="editor-options-dialog">
          <Dialog.Title>모델 편집 옵션</Dialog.Title>
          <Dialog.Description>
            부품을 선택하고 위치와 크기를 조정하거나 저장한 버전을 열 수
            있습니다.
          </Dialog.Description>
          <Dialog.Close
            className="editor-options-close"
            aria-label="편집 옵션 닫기"
          >
            <X size={20} />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
