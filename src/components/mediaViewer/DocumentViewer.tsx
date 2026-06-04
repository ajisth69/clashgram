import type React from '../../lib/teact/teact';
import { memo, useState } from '../../lib/teact/teact';
import { Capacitor } from '@capacitor/core';
import type { ApiDocument } from '../../api/types';
import FileStorageService from '../../util/capacitor/FileStorageService';
import Button from '../ui/Button';
import './DocumentViewer.scss';

type Props = {
  media: ApiDocument;
  blobUrl: string;
};

const DocumentViewer = ({ media, blobUrl }: Props) => {
  const { fileName, size } = media;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [mobileMessage, setMobileMessage] = useState<string>('');

  const sizeMb = (size / (1024 * 1024)).toFixed(2);

  const handleOpenNatively = async () => {
    // 1. Handle Capacitor Mobile Platform
    if (Capacitor.isNativePlatform()) {
      setLoading(true);
      try {
        const response = await fetch(blobUrl);
        const blob = await response.blob();

        // Convert blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          try {
            await FileStorageService.saveBase64ToPublicStorage({
              fileName,
              base64Data,
              target: 'documents',
              folder: 'Clashgram'
            });
            setMobileMessage(`Saved to Documents/Clashgram/${fileName}`);
          } catch (writeErr: any) {
            setError('Failed to save file to local storage');
          }
          setLoading(false);
        };
      } catch (err: any) {
        setError('Error downloading file data');
        setLoading(false);
      }
      return;
    }

    // 2. Open blob URL directly in a new tab (same origin — blob URLs work)
    const opened = window.open(blobUrl, '_blank', 'noopener,noreferrer');
    if (!opened) {
      // Fallback: programmatic <a> click to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get specialized details based on extension
  const getDocDetails = () => {
    switch (ext) {
      case 'pdf':
        return {
          badge: 'PDF',
          color: '#ef4444', // Red
          typeLabel: 'PDF Document',
        };
      case 'txt':
        return {
          badge: 'TXT',
          color: '#3b82f6', // Blue
          typeLabel: 'Text Document',
        };
      case 'csv':
        return {
          badge: 'CSV',
          color: '#10b981', // Emerald
          typeLabel: 'CSV Spreadsheet',
        };
      case 'xls':
      case 'xlsx':
        return {
          badge: ext.toUpperCase(),
          color: '#10b981', // Emerald
          typeLabel: 'Excel Spreadsheet',
        };
      case 'doc':
      case 'docx':
        return {
          badge: ext.toUpperCase(),
          color: '#6366f1', // Indigo
          typeLabel: 'Word Document',
        };
      default:
        return {
          badge: ext.toUpperCase() || 'DOC',
          color: '#8b5cf6', // Violet
          typeLabel: 'Document',
        };
    }
  };

  const details = getDocDetails();

  return (
    <div className="DocumentViewer DocumentViewer-card fade-in">
      <div className="glass-info-card text-center">
        <div 
          className="info-card-badge" 
          style={`background-color: ${details.color} !important; box-shadow: 0 0 15px ${details.color}4D;`}
        >
          {details.badge}
        </div>
        <h2 className="info-card-title text-white mt-3">{fileName}</h2>
        <p className="info-card-meta mt-1">Size: {sizeMb} MB | Type: {details.typeLabel}</p>
        <p className="info-card-desc mt-3 text-secondary">
          This document is decrypted and ready.
        </p>

        {mobileMessage && (
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; font-size: 0.8125rem; padding: 0.5rem; border-radius: 0.25rem; margin-top: 0.75rem;">
            {mobileMessage}
          </div>
        )}

        {error && (
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; font-size: 0.8125rem; padding: 0.5rem; border-radius: 0.25rem; margin-top: 0.75rem;">
            {error}
          </div>
        )}

        {loading && (
          <div style="margin-top: 0.75rem; color: var(--color-text-secondary); font-size: 0.8125rem;">
            Processing...
          </div>
        )}

        <div className="mt-4" style="display: flex; flex-direction: column; gap: 0.5rem;">
          <Button color="primary" size="default" onClick={handleOpenNatively}>
            Open in New Tab
          </Button>
          <Button color="secondary" size="default" onClick={handleDownload}>
            Download File
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(DocumentViewer);
