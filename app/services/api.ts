const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export async function sendQRToBackend(qrText: string) {
  const res = await fetch(`${API_BASE}/api/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ qr_text: qrText }),
  });

  if (!res.ok) {
    throw new Error("Backend scan failed");
  }

  return res.json();
}
