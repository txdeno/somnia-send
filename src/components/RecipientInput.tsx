import React, { useState } from 'react';
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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Bulk Input (one per line: address, amount)
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
          <button
            onClick={addRecipient}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Add Recipient
          </button>
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