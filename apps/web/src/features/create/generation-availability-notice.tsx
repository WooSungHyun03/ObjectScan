import { Button } from "@/components/ui/button";

export function GenerationAvailabilityNotice({
  message,
  onRetry,
  pending,
}: {
  message: string;
  onRetry?: () => void;
  pending?: boolean;
}) {
  return (
    <div className="generation-availability">
      <p role="status">
        {message} 사진을 준비하는 동안 크레딧은 차감되지 않습니다.
      </p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          aria-disabled={pending}
          onClick={() => {
            if (!pending) onRetry();
          }}
        >
          제작 지원 다시 확인
        </Button>
      )}
    </div>
  );
}
