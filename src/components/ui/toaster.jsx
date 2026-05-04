// @ts-nocheck
import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        // Auto-detect alert variant based on title or severity keywords
        let detectedVariant = variant;
        if (!detectedVariant) {
          const titleLower = (title || "").toLowerCase();
          const descLower = (description || "").toLowerCase();
          const content = titleLower + " " + descLower;
          
          if (content.includes("cảnh báo") || content.includes("alert") || content.includes("khẩn cấp")) {
            detectedVariant = "alert";
          } else if (content.includes("thành công") || content.includes("success") || content.includes("đã")) {
            detectedVariant = "success";
          } else if (content.includes("cảnh") || content.includes("warning")) {
            detectedVariant = "warning";
          }
        }

        return (
          <Toast key={id} {...props} variant={detectedVariant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
} 