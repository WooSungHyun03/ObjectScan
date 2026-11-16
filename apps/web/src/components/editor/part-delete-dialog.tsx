import * as Dialog from "@radix-ui/react-dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PartDeleteDialog({
  name,
  disabled,
  onConfirm,
}: {
  name: string;
  disabled: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button size="sm" variant="danger" disabled={disabled}>
          <Trash2 aria-hidden="true" size={14} /> 삭제
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay objectscan-confirm-overlay" />
        <Dialog.Content
          className="objectscan-confirm-dialog"
          role="alertdialog"
        >
          <Dialog.Title>부품 삭제 확인</Dialog.Title>
          <Dialog.Description>
            ‘{name}’ 삭제를 진행합니다. 편집 이력에서 삭제 전 상태로 돌아갈 수
            있습니다.
          </Dialog.Description>
          <div className="objectscan-confirm-actions">
            <Dialog.Close asChild>
              <Button variant="outline">취소</Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button variant="danger" onClick={onConfirm}>
                부품 삭제
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
