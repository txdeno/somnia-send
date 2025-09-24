import React, { useState, useRef } from 'react';
import { Recipient } from '../types';

interface RecipientInputProps {
  recipients: Recipient[];
  onRecipientsChange: (recipients: Recipient[]) => void;
}

export const RecipientInput: React.FC<RecipientInputProps> = ({
  recipients,
  onRecipientsChange,
}) => {
  const [textInput, setTextInput] = useState('');
  const [csvError, setCsvError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseTextInput = (text: string): Recipient[] => {
    const lines = text.trim().split('\n');
    return lines
      .map(line => {
        const parts = line.trim().split(/[,\s]+/);
        if (parts.length >= 2) {
          return {
            address: parts[0],
            amount: parts[1],
          };
        }
        return null;
      })
      .filter((recipient): recipient is Recipient => recipient !== null);
  };

  const handleTextChange = (value: string) => {
    setTextInput(value);
    const parsed = parseTextInput(value);
    onRecipientsChange(parsed);
  };

  const addRecipient = () => {
    onRecipientsChange([...recipients, { address: '', amount: '' }]);
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const updated = recipients.map((recipient, i) =>
      i === index ? { ...recipient, [field]: value } : recipient
    );
    onRecipientsChange(updated);
  };

  const removeRecipient = (index: number) => {
    onRecipientsChange(recipients.filter((_, i) => i !== index));
  };

  const parseCSV = (csvText: string): Recipient[] => {
    const lines = csvText.trim().split('\n');
    const recipients: Recipient[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return; // Skip empty lines

      // Handle different CSV formats (comma, semicolon, tab)
      const parts = trimmedLine.split(/[,;\t]/).map(part => part.trim());

      if (parts.length < 2) {
        errors.push(`Line ${index + 1}: Must have at least 2 columns (address, amount)`);
        return;
      }

      const [address, amount] = parts;

      // Validate Ethereum address format
      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        errors.push(`Line ${index + 1}: Invalid address format "${address}"`);
        return;
      }

      // Validate amount
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        errors.push(`Line ${index + 1}: Invalid amount "${amount}"`);
        return;
      }

      recipients.push({ address, amount });
    });

    if (errors.length > 0) {
      setCsvError(errors.join('\n'));
      return [];
    }

    setCsvError('');
    return recipients;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvError('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      if (csvText) {
        const parsedRecipients = parseCSV(csvText);
        if (parsedRecipients.length > 0) {
          onRecipientsChange(parsedRecipients);
          setTextInput(''); // Clear text input when CSV is loaded
        }
      }
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    onRecipientsChange([]);
    setTextInput('');
    setCsvError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* CSV File Upload Section */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <label className="block text-sm font-medium mb-2">
          📁 Upload CSV File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="w-full p-2 border rounded-lg text-sm bg-white"
        />
        <p className="text-xs text-gray-600 mt-2">
          CSV format: Two columns - wallet address, amount (e.g., 0x123..., 1.5)
        </p>
        <p className="text-xs text-gray-600">
          Supports comma (,), semicolon (;), or tab separated values
        </p>
      </div>

      {/* CSV Error Display */}
      {csvError && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
          <p className="text-sm text-red-800 font-medium mb-1">CSV Import Errors:</p>
          <pre className="text-xs text-red-700 whitespace-pre-wrap">{csvError}</pre>
        </div>
      )}

      {/* Text Input Section */}
      <div>
        <label className="block text-sm font-medium mb-2">
          ✏️ Manual Input (one per line: address, amount)
        </label>
        <textarea
          className="w-full p-3 border rounded-lg h-32 font-mono text-sm"
          placeholder="0x742d35Cc6634C0532925a3b8D934C5B419618612, 1.5&#10;0x742d35Cc6634C0532925a3b8D934C5B419618613, 2.0"
          value={textInput}
          onChange={(e) => handleTextChange(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          Format: address, amount (separated by comma or space)
        </p>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Recipients ({recipients.length})</h3>
          <div className="flex gap-2">
            <button
              onClick={clearAll}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              disabled={recipients.length === 0}
            >
              Clear All
            </button>
            <button
              onClick={addRecipient}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              Add Recipient
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recipients.map((recipient, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Recipient address"
                className="flex-1 p-2 border rounded text-sm"
                value={recipient.address}
                onChange={(e) => updateRecipient(index, 'address', e.target.value)}
              />
              <input
                type="text"
                placeholder="Amount"
                className="w-24 p-2 border rounded text-sm"
                value={recipient.amount}
                onChange={(e) => updateRecipient(index, 'amount', e.target.value)}
              />
              <button
                onClick={() => removeRecipient(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};