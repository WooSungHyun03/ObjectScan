"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
export function NavigationSheet({
  children,
  trigger,
}: {
  children: React.ReactNode;
  trigger: React.ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay" />
        <Dialog.Content className="sheet-content">
          <Dialog.Title className="sr-only">워크스페이스 메뉴</Dialog.Title>
          <Dialog.Description className="sr-only">
            프로젝트, 에셋, 마켓과 결제 화면으로 이동합니다.
          </Dialog.Description>
          <Dialog.Close className="sheet-close" aria-label="메뉴 닫기">
            <X size={20} />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
