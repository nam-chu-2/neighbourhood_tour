import type { CameraErrorKind } from "../domain/types";

// Camera capture via a transient <input type="file" capture="environment">
// (research R4): native camera UI, no persistent permission prompt, and a
// clean cancel/denied signal for the FR-005 fallback path.

export interface CameraError {
  kind: CameraErrorKind;
  message: string;
}

export function isCameraError(value: unknown): value is CameraError {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    !(value instanceof File)
  );
}

/**
 * Opens the device camera (or photo picker). Resolves with the chosen File,
 * or a CameraError when the visitor cancels or the camera cannot be used —
 * it never rejects, so callers always reach the fallback flow.
 */
export function openCamera(): Promise<File | CameraError> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.style.display = "none";
    input.setAttribute("aria-hidden", "true");
    input.tabIndex = -1;

    let settled = false;
    const settle = (result: File | CameraError) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(result);
    };

    input.addEventListener("change", () => {
      const file = input.files?.[0] ?? null;
      settle(
        file ?? { kind: "cancelled", message: "No photo was taken." },
      );
    });
    // Modern browsers fire `cancel` when the camera/picker is dismissed.
    input.addEventListener("cancel", () =>
      settle({ kind: "cancelled", message: "No photo was taken." }),
    );

    document.body.appendChild(input);
    try {
      input.click();
    } catch (error) {
      settle({
        kind: "failed",
        message: error instanceof Error ? error.message : "The camera could not open.",
      });
    }
  });
}
