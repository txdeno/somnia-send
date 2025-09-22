import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { RecipientInput } from './components/RecipientInput';
import { TransactionPanel } from './components/TransactionPanel';
import { Recipient } from './types';
import './App.css';

function App() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Somnia Multisender
          </h1>
          <p className="text-gray-600 mb-6">
            Send SOMI or ERC20 tokens to multiple recipients in a single transaction
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </header>

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
              href="https://mainnet.somnia.w3us.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              View on Somnia Explorer
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;