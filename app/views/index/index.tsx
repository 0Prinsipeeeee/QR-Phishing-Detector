"use client";

import React, { useState } from "react";
import Link from "next/link";
import qrcodeParser from "qrcode-parser";
import styles from "../../styles/index.module.css";
import { sendQRToBackend } from "../../services/api";

export default function QRHomePage() {
  const [qrResult, setQrResult] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);

  const handleScan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const target = event.target as typeof event.target & {
      qrImage: { files: FileList };
    };

    const file = target.qrImage.files[0];
    if (!file) return alert("Please select a QR code image.");

    try {
      // 1️⃣ Decode QR on frontend
      const decodedText = await qrcodeParser(file);
      setQrResult(decodedText);

      // 2️⃣ Send decoded text to Flask backend
      const backendResult = await sendQRToBackend(decodedText);
      setAnalysis(backendResult);

      console.log("Backend analysis:", backendResult);
    } catch (error) {
      console.error(error);
      alert("QR scan failed.");
    }
  };

  return (
    <div className={styles.divContainer}>
      <h1 className={styles.title}>QR Phishing Detector</h1>

      <form onSubmit={handleScan}>
        <input type="file" name="qrImage" accept="image/*" />
        <button type="submit">Scan QR Code</button>
      </form>

      {qrResult && (
        <p>
          <strong>Decoded QR:</strong> {qrResult}
        </p>
      )}

      {analysis && (
        <div>
          <p><strong>Phishing:</strong> {analysis.phishing ? "YES" : "NO"}</p>
          <p><strong>Risk Level:</strong> {analysis.risk_level}</p>
        </div>
      )}

      <Link href="/views/testRoute">
        <button>Go to Test Route</button>
      </Link>
    </div>
  );
}
