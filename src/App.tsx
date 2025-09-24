import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { RecipientInput } from './components/RecipientInput';
import { TransactionPanel } from './components/TransactionPanel';
import { Recipient } from './types';

function App() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <div className="container px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-gray-600 text-lg">
            Send SOMI or ERC20 tokens to multiple recipients in a single transaction
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8" style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Recipients</h2>
              <RecipientInput
                recipients={recipients}
                onRecipientsChange={setRecipients}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <TransactionPanel
              recipients={recipients}
            />
          </div>
        </div>

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>
            Built for Somnia Network • Network ID: 5031 • Symbol: SOMI
          </p>
          <p className="mt-1">
            <a
              href="https://explorer.somnia.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              View on Somnia Explorer
            </a>
          </p>
          <p className="mt-2">
            Built with heart, by{' '}
            <a
              href="https://x.com/hlee4real"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              x.com/hlee4real
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;