const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

// ✅ Send QR text to backend
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

  const data = await res.json();
  console.log("✅ /api/scan response:", data);
  return data;
}

// ✅ Process URL through your custom URL service
export async function sendUrlToBackend(urlText: string) {
  const res = await fetch(`${API_BASE}/api/url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url_text: urlText }),
  });

  if (!res.ok) {
    throw new Error("Backend /api/url failed");
  }

  const data = await res.json();
  console.log("✅ /api/url response:", data);
  return data;
}

// ✅ Submit URL to VirusTotal (for QR scanning)
export async function getVtScan(url: string) {
  const res = await fetch(`${API_BASE}/api/vt_scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url_text: url }),
  });

  if (!res.ok) {
    throw new Error("VirusTotal scan submission failed");
  }

  const data = await res.json();
  console.log("✅ VirusTotal scan response:", data);
  return data;
}

// ✅ Get VirusTotal results by scan ID (for dynamic page)
export async function getVtResults(scanId: string) {
  const res = await fetch(`${API_BASE}/api/vt-results/${scanId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch VirusTotal results");
  }

  return await res.json();
}

// ✅ Alias for getVtScan (if needed elsewhere)
export async function submitToVirusTotal(url: string) {
  return getVtScan(url);
}

// ✅ Alias for getVtResults (if needed elsewhere)
export async function getVirusTotalResults(scanId: string) {
  return getVtResults(scanId);
}