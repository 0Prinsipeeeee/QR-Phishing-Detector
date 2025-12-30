"use client"; // ⚠ Must be at the very top

import React, { useState } from "react";
import Link from "next/link";
import qrcodeParser from "qrcode-parser";
import styles from '../../styles/index.module.css';

export default function QRHomePage() {
  const [qrResult, setQrResult] = useState(""); // store decoded QR data

  const handleScan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // prevent form submission from reloading the page

    const target = event.target as typeof event.target & {
      qrImage: { files: FileList };
    };

    const file = target.qrImage.files[0]; // get uploaded file
    if (!file) return alert("Please select a QR code image.");

    try {
      const result = await qrcodeParser(file); // wait for Promise to resolve
      setQrResult(result); // store result in state
      console.log("Decoded QR data:", result);
    } catch (error) {
      console.error("Failed to parse QR code:", error);
      alert("Failed to parse QR code.");
    }
  };

  return (
    <div className={styles.divContainer}>
      <h1 className={styles.title}>QR Phishing Detector</h1>
      <p>Welcome to the QR scanning app!</p>

      <form onSubmit={handleScan} encType="multipart/form-data">
        <input type="file" name="qrImage" accept="image/*" />
        <button type="submit">Scan QR Code</button>
      </form>

      {qrResult && (
        <p>
          <strong>Decoded QR Data:</strong> {qrResult}
        </p>
      )}

      <Link href="/views/testRoute">
        <button>Go to Test Route</button>
      </Link>
    </div>
  );
}
