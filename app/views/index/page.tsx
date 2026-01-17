"use client";

import "../../global.css";
import React, { useState } from "react";
import Link from "next/link";
import qrcodeParser from "qrcode-parser";
import styles from "../../styles/index.module.css";
import { sendQRToBackend, getVtScan, getVtResults } from "../../services/api";

export default function QRHomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [qrResult, setQrResult] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [scanReady, setScanReady] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleScan = async () => {
    if (!selectedFile) return alert("Please upload a QR image first.");

    try {
      setIsScanning(true);

      // Decode QR
      const decodedText = await qrcodeParser(selectedFile);
      console.log("DEBUG: Decoded QR text:", decodedText);
      console.log("DEBUG: Decoded text type:", typeof decodedText);
      console.log("DEBUG: Decoded text length:", decodedText.length);
      console.log("DEBUG: First 100 chars:", decodedText.substring(0, 100));

      setQrResult(decodedText);

      // Submit to backend VT scan
      console.log("DEBUG: Calling getVtScan with URL:", decodedText);
      const vtResponse = await getVtScan(decodedText); // returns scan_id
      console.log("DEBUG: VT Scan Result:", vtResponse);

      if (vtResponse.success && vtResponse.scan_id) {
        console.log("DEBUG: Got scan ID:", vtResponse.scan_id);
        setScanId(vtResponse.scan_id);
        setScanReady(false);

        // Poll for completion
        const interval = setInterval(async () => {
          console.log("DEBUG: Polling for scan status...");
          const statusRes = await getVtResults(vtResponse.scan_id);
          console.log("DEBUG: Poll response:", statusRes);
          const vtStatus = statusRes.data?.data?.attributes?.status;
          console.log("DEBUG: VT Status:", vtStatus);

          if (vtStatus === "completed") {
            console.log("DEBUG: Scan completed!");
            setScanReady(true);
            clearInterval(interval);
          }
        }, 3000);
      } else {
        console.error("DEBUG: Failed to get scan ID:", vtResponse);
        alert(`Failed to scan: ${vtResponse.message || vtResponse.error?.message || "Unknown error"}`);
      }

      setIsScanning(false);
    } catch (err) {
      console.error("DEBUG: Error in handleScan:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert("QR scan failed: " + errorMessage);
      setIsScanning(false);
    }
  };

  const handleSendUrl = async () => {
    if (!urlInput) return alert("Enter a URL");

    try {
      const { scan_id } = await sendQRToBackend(urlInput);
      window.location.href = `/scan/${scanId}`;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.divContainer}>
      <h1 className={styles.title}>QR Phishing Detector</h1>

      {/* File Input */}
      <input
        id="qr-upload"
        className={styles.fileInput}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      <label htmlFor="qr-upload" className={styles.dropContainer}>
        <span className={styles.dropTitle}>
          Drop QR Image Here
          <br />
          or Click to Upload
        </span>
      </label>

      {previewUrl && (
        <div style={{ marginTop: "1rem" }}>
          <p>Image Preview:</p>
          <img
            src={previewUrl}
            alt="QR Preview"
            style={{
              maxWidth: "300px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>
      )}

      {/* Scan QR Buttons */}
      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={handleScan}
          disabled={isScanning || scanReady}
          style={{ padding: "0.5rem 1rem" }}
        >
          {isScanning
            ? "Scanning..."
            : scanReady
              ? "Scan Complete!"
              : "Scan QR Code"}
        </button>

        {/* Button to dynamic scan page */}
        {scanId && scanReady && (
          <button
            onClick={() => window.location.href = `/scan/${scanId}`}
            style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}
          >
            View VirusTotal Scan Result
          </button>
        )}
      </div>

      {qrResult && (
        <p>
          <strong>Decoded QR:</strong> {qrResult}
        </p>
      )}

      {/* URL Input */}
      <div style={{ marginTop: "2rem" }}>
        <input
          type="text"
          placeholder="Enter URL to test"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          style={{ padding: "0.5rem", width: "300px", marginRight: "1rem" }}
        />
        <button onClick={handleSendUrl} style={{ padding: "0.5rem 1rem" }}>
          Send URL to Backend
        </button>
      </div>
    </div>
  );
}
