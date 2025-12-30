// app/layout.tsx
import React from "react";

export const metadata = {
    title: "QR Phishing Detector",
    description: "Scan and detect phishing QR codes",
};

// Add type for children
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
