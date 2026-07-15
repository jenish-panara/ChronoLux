'use client';

import { useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Upload, CheckCircle2, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminCSVImportPage() {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [logsOpen, setLogsOpen] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError('');
    setResults(null);
  };

  const parseCSV = (text) => {
    const lines = [];
    let row = [''];
    let insideQuote = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          row[row.length - 1] += '"';
          i++; // Skip escaped quote
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push('');
      } else if ((char === '\r' || char === '\n') && !insideQuote) {
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip \n
        }
        lines.push(row);
        row = [''];
      } else {
        row[row.length - 1] += char;
      }
    }
    
    if (row.length > 1 || row[0] !== '') {
      lines.push(row);
    }
    
    if (lines.length < 2) return [];
    
    const headers = lines[0].map(h => h.trim());
    const data = [];
    
    for (let j = 1; j < lines.length; j++) {
      const line = lines[j];
      if (line.length !== lines[0].length) continue;
      const obj = {};
      let hasData = false;
      
      for (let k = 0; k < headers.length; k++) {
        const val = line[k]?.trim();
        if (val) hasData = true;
        obj[headers[k]] = val;
      }
      if (hasData) {
        data.push(obj);
      }
    }
    
    return data;
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a CSV file first.');
      return;
    }

    setParsing(true);
    setError('');
    setResults(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const parsedProducts = parseCSV(text);
        
        if (parsedProducts.length === 0) {
          setError('The CSV file appears to be empty or contains only headers.');
          setParsing(false);
          return;
        }

        setParsing(false);
        setImporting(true);

        // Call backend CSV Import API
        const response = await adminAPI.importCSV({ products: parsedProducts });
        if (response.data.success) {
          setResults({
            total: parsedProducts.length,
            success: response.data.successCount,
            failed: response.data.failedCount,
            errors: response.data.errors || [],
          });
        }
      } catch (err) {
        console.error('Error importing CSV:', err);
        setError(err.response?.data?.message || 'An error occurred during CSV parsing/import.');
      } finally {
        setParsing(false);
        setImporting(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file.');
      setParsing(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--clx-gold)]">Operations</span>
        <h1 className="font-serif text-3xl font-semibold text-[var(--clx-text-primary)] mt-1">Import CSV</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-6">
        <h2 className="font-serif text-lg font-semibold mb-4 text-[var(--clx-text-primary)]">Upload Timepiece CSV</h2>
        
        <div className="border-2 border-dashed border-[var(--clx-border)] rounded-2xl p-8 flex flex-col items-center justify-center bg-[var(--clx-surface)]/30 hover:bg-[var(--clx-surface)]/50 transition-colors">
          <Upload className="w-10 h-10 text-[var(--clx-gold)] mb-4" />
          <p className="text-sm font-semibold text-[var(--clx-text-primary)]">Select a CSV spreadsheet file to import</p>
          <p className="text-xs text-[var(--clx-text-muted)] mt-1.5 mb-5">Supported columns: name, description, price, discountPrice, brand, category, stock, image, images, featured</p>
          
          <label className="luxury-btn cursor-pointer py-2.5 px-6 text-sm">
            Browse File
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </label>
          {file && (
            <div className="mt-4 flex items-center gap-2.5 px-3 py-1.5 bg-white border border-[var(--clx-border)] rounded-lg text-xs font-medium text-[var(--clx-text-primary)]">
              <FileText className="w-4 h-4 text-[var(--clx-gold)]" />
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleImport}
            disabled={!file || parsing || importing}
            className="luxury-btn-gold py-3 px-8 text-sm"
          >
            {parsing ? 'Parsing File...' : importing ? 'Importing Timepieces...' : 'Start Import'}
          </button>
        </div>
      </div>

      {/* Results View */}
      {results && (
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-sm)] border border-[var(--clx-border-light)] p-6 space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
            <div>
              <h2 className="font-serif text-lg font-semibold text-[var(--clx-text-primary)]">Import Completed</h2>
              <p className="text-xs text-[var(--clx-text-secondary)] mt-0.5">Finished processing the uploaded timepiece spreadsheet</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-[var(--clx-surface)] border border-[var(--clx-border-light)] rounded-xl text-center">
              <span className="text-xs text-[var(--clx-text-secondary)] font-medium">Rows Processed</span>
              <p className="text-2xl font-bold mt-1 text-[var(--clx-text-primary)]">{results.total}</p>
            </div>
            <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl text-center">
              <span className="text-xs text-green-700 font-medium">Successfully Inserted</span>
              <p className="text-2xl font-bold mt-1 text-green-700">{results.success}</p>
            </div>
            <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl text-center">
              <span className="text-xs text-red-600 font-medium">Skipped (Invalid/Dupes)</span>
              <p className="text-2xl font-bold mt-1 text-red-600">{results.failed}</p>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div className="border border-[var(--clx-border-light)] rounded-xl overflow-hidden">
              <button
                onClick={() => setLogsOpen(!logsOpen)}
                className="w-full flex items-center justify-between px-5 py-4 bg-[var(--clx-surface)] text-left hover:bg-[var(--clx-surface)]/70 transition-colors"
              >
                <span className="text-xs font-semibold text-[var(--clx-text-primary)] uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  View Detailed Logs ({results.errors.length})
                </span>
                {logsOpen ? <ChevronUp className="w-4 h-4 text-[var(--clx-text-secondary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--clx-text-secondary)]" />}
              </button>
              
              {logsOpen && (
                <div className="p-4 bg-white border-t border-[var(--clx-border-light)] max-h-60 overflow-y-auto space-y-1.5 font-mono text-[11px] text-[var(--clx-text-secondary)]">
                  {results.errors.map((err, idx) => (
                    <div key={idx} className="flex gap-2 text-red-600">
                      <span className="font-semibold flex-shrink-0">•</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
