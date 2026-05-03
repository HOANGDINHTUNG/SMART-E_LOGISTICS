import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner({ onScanSuccess, onScanFailure }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false,
    );

    scanner.render((text) => {
      // Debounce or ensure single callback trigger
      if (scanner) scanner.clear();
      onScanSuccess(text);
    }, onScanFailure);

    return () => {
      try {
        scanner.clear();
      } catch (_error) {
        // Ignore unmounted clear errors
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div
      id="qr-reader"
      className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-border"
    />
  );
}
