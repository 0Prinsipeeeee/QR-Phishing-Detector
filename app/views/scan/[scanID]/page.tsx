"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getVtResults } from '../../../services/api';
import styles from '../../../styles/scan.module.css';

export default function ScanResultPage() {
    const params = useParams();
    // Use params.scanID since the folder is named [scanID]
    const scanId = params.scanID as string;

    const [scanData, setScanData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (scanId) {
            fetchScanResults();
        }
    }, [scanId]);

    const fetchScanResults = async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log("Fetching results for scan ID:", scanId);
            const result = await getVtResults(scanId);

            if (result.success) {
                console.log("Successfully fetched scan data:", result.data);
                setScanData(result.data);
            } else {
                console.error("Failed to fetch scan results:", result.error);
                setError(result.error || 'Failed to fetch scan results');
            }
        } catch (err) {
            console.error("Error fetching scan results:", err);
            setError('An error occurred while fetching results');
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading VirusTotal scan results...</p>
                    <p className={styles.scanId}>Scan ID: {scanId}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !scanData) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>⚠️ Error</h2>
                    <p>{error || 'No scan data available'}</p>
                    <a href="/" className={styles.backButton}>
                        ← Back to Scanner
                    </a>
                </div>
            </div>
        );
    }

    // Check if we have the expected data structure
    if (!scanData.data || !scanData.data.attributes) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>⚠️ Invalid Data</h2>
                    <p>Received unexpected data format from VirusTotal</p>
                    <p className={styles.scanId}>Scan ID: {scanId}</p>
                    <button
                        onClick={fetchScanResults}
                        className={styles.refreshButton}
                    >
                        ↻ Try Again
                    </button>
                    <a href="/" className={styles.backButton} style={{ marginTop: '1rem' }}>
                        ← Back to Scanner
                    </a>
                </div>
            </div>
        );
    }

    // Extract the data we need
    const { attributes } = scanData.data;
    const { stats, results } = attributes;
    const scanUrl = attributes.url || 'Unknown URL';

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <a href="/" className={styles.backButton}>
                    ← Back to Scanner
                </a>
                <h1>VirusTotal Scan Results</h1>
                <p className={styles.scanInfo}>
                    Scan ID: <code>{scanId}</code>
                </p>
                <p className={styles.scanInfo}>
                    URL: <code>{scanUrl}</code>
                </p>
                <p className={styles.scanInfo}>
                    Status: <span className={styles.statusBadge}>{attributes.status}</span>
                </p>
            </div>

            {/* Stats Overview */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.malicious}`}>
                    <h3>Malicious</h3>
                    <p className={styles.statNumber}>{stats.malicious || 0}</p>
                    <p className={styles.statSubtitle}>Detections</p>
                </div>
                <div className={`${styles.statCard} ${styles.suspicious}`}>
                    <h3>Suspicious</h3>
                    <p className={styles.statNumber}>{stats.suspicious || 0}</p>
                    <p className={styles.statSubtitle}>Detections</p>
                </div>
                <div className={`${styles.statCard} ${styles.harmless}`}>
                    <h3>Harmless</h3>
                    <p className={styles.statNumber}>{stats.harmless || 0}</p>
                    <p className={styles.statSubtitle}>Detections</p>
                </div>
                <div className={`${styles.statCard} ${styles.undetected}`}>
                    <h3>Undetected</h3>
                    <p className={styles.statNumber}>{stats.undetected || 0}</p>
                    <p className={styles.statSubtitle}>Detections</p>
                </div>
            </div>

            {/* Scan Summary */}
            <div className={styles.summary}>
                <h3>Scan Summary</h3>
                <p>
                    This URL was scanned by VirusTotal on{' '}
                    {attributes.date ? new Date(attributes.date * 1000).toLocaleDateString() : 'Unknown date'} at{' '}
                    {attributes.date ? new Date(attributes.date * 1000).toLocaleTimeString() : 'Unknown time'}.
                </p>
                <p>
                    <strong>Overall verdict:</strong>{' '}
                    {stats.malicious > 0 ? (
                        <span className={styles.verdictBadge} style={{ background: '#fee2e2', color: '#991b1b' }}>
                            ⚠️ Potentially malicious ({stats.malicious} engines detected)
                        </span>
                    ) : stats.suspicious > 0 ? (
                        <span className={styles.verdictBadge} style={{ background: '#fef3c7', color: '#92400e' }}>
                            🤔 Suspicious ({stats.suspicious} engines flagged)
                        </span>
                    ) : (
                        <span className={styles.verdictBadge} style={{ background: '#dcfce7', color: '#166534' }}>
                            ✅ Likely safe
                        </span>
                    )}
                </p>
            </div>

            {/* Scan Results Table */}
            <div className={styles.resultsSection}>
                <h2>Detailed Scan Results</h2>
                <p className={styles.sectionSubtitle}>
                    {Object.keys(results || {}).length} antivirus engines scanned this URL
                </p>

                {results && Object.keys(results).length > 0 ? (
                    <div className={styles.resultsTable}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Antivirus Engine</th>
                                    <th>Result</th>
                                    <th>Category</th>
                                    <th>Method</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(results).map(([engine, result]: [string, any]) => (
                                    <tr key={engine}>
                                        <td className={styles.engineName}>{engine}</td>
                                        <td className={styles.resultCell}>
                                            <span className={`${styles.resultBadge} ${result.category === 'malicious' ? styles.maliciousBadge :
                                                    result.category === 'suspicious' ? styles.suspiciousBadge :
                                                        styles.cleanBadge
                                                }`}>
                                                {result.result || 'Clean'}
                                            </span>
                                        </td>
                                        <td>{result.category || 'N/A'}</td>
                                        <td>{result.method || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.noResults}>
                        <p>No detailed scan results available yet. The scan might still be in progress.</p>
                    </div>
                )}
            </div>

            {/* Additional Info */}
            {scanData.data?.meta && (
                <div className={styles.metaInfo}>
                    <h3>Additional Information</h3>
                    <div className={styles.metaGrid}>
                        {scanData.data.meta.url_info && (
                            <>
                                <div className={styles.metaItem}>
                                    <strong>URL ID:</strong> {scanData.data.meta.url_info.id || 'N/A'}
                                </div>
                                <div className={styles.metaItem}>
                                    <strong>Analysis ID:</strong> {scanData.data.id || 'N/A'}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
                <button
                    onClick={fetchScanResults}
                    className={styles.refreshButton}
                >
                    ↻ Refresh Results
                </button>
            </div>

            {/* Raw Data Toggle (Optional) */}
            <details className={styles.rawData}>
                <summary>View Raw JSON Data</summary>
                <pre className={styles.jsonCode}>
                    {JSON.stringify(scanData, null, 2)}
                </pre>
            </details>
        </div>
    );
}