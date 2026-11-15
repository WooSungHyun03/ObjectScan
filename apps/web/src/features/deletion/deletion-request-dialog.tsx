"use client";
import { useEffect, useRef, useState, type ReactElement } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { deletionFailure } from "./deletion-failure";

export function DeletionRequestDialog({
  trigger,
  title,
  description,
  confirmLabel,
  request,
  onSuccess,
  focusAfterSuccess,
}: {
  trigger: ReactElement;
  title: string;
  description: string;
  confirmLabel: string;
  request: () => Promise<void>;
  onSuccess: () => void;
  focusAfterSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<ReturnType<typeof deletionFailure>>();
  const inFlight = useRef(false);
  const succeeded = useRef(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (failure && !failure.retry) closeButton.current?.focus();
  }, [failure]);

  async function submit() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setFailure(undefined);
    try {
      await request();
      succeeded.current = true;
      setOpen(false);
      onSuccess();
    } catch (error) {
      setFailure(deletionFailure(error));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (inFlight.current) return;
        if (value) succeeded.current = false;
        setFailure(undefined);
        setOpen(value);
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay objectscan-confirm-overlay" />
        <Dialog.Content
          className="objectscan-confirm-dialog"
          role="alertdialog"
          onCloseAutoFocus={(event) => {
            if (succeeded.current && focusAfterSuccess) {
              event.preventDefault();
              focusAfterSuccess();
            }
          }}
        >
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
          {busy && (
            <p className="deletion-feedback" role="status">
              삭제 요청을 확인하고 있습니다.
            </p>
          )}
          {failure && (
            <p className="deletion-feedback" role="alert">
              {failure.message}
            </p>
          )}
          <div className="objectscan-confirm-actions">
            <Dialog.Close asChild>
              <Button
                ref={closeButton}
                type="button"
                variant="outline"
                disabled={busy}
              >
                {failure && !failure.retry ? "닫기" : "취소"}
              </Button>
            </Dialog.Close>
            {(!failure || failure.retry) && (
              <Button
                type="button"
                variant="danger"
                disabled={busy}
                onClick={() => void submit()}
              >
                {busy ? "처리 중…" : failure ? "다시 시도" : confirmLabel}
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
