import { expect, test } from "vitest";
import { ApiResponseError } from "../apps/web/src/lib/client-api";
import { deletionFailure } from "../apps/web/src/features/deletion/deletion-failure";

test("OS-11 describes existing purchase protection and only offers retries for ambiguous failures", () => {
  expect(
    deletionFailure(new ApiResponseError(409, "ASSET_HAS_PURCHASES")),
  ).toEqual({
    message: expect.stringContaining("구매자의 이용 권리"),
    retry: false,
  });
  expect(
    deletionFailure(new ApiResponseError(409, "LISTING_ENVIRONMENT_MISMATCH")),
  ).toEqual({
    message: expect.stringContaining("다른 판매 환경"),
    retry: false,
  });
  expect(deletionFailure(new ApiResponseError(404, "ASSET_NOT_FOUND"))).toEqual(
    { message: expect.stringContaining("접근 권한"), retry: false },
  );
  expect(deletionFailure(new ApiResponseError(503))).toEqual({
    message: expect.stringContaining("다시 시도"),
    retry: true,
  });
});
