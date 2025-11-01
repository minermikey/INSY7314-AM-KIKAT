import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/*
  Frontend-only employee portal for reviewing international payments.
  - Reads transactions from localStorage 'transactions' (this simulates DB records written by PaymentPage)
  - Uses an in-file mock bankDirectory to validate account info & SWIFT codes (replace with API calls later)
  - Allows marking a transaction Verified and submitting to SWIFT (simulated)
*/

const mockBankDirectory = {
  // provider name (or SWIFT name) => bank metadata & account samples
  'CBA-SWIFT': {
    name: 'CommonBank Australia',
    swift: 'CBAXAU2S',
    accounts: ['AU12-3456-7890', 'AU98-7654-3210']
  },
  'INTL-BANK': {
    name: 'International Bank',
    swift: 'INTLGB22',
    accounts: ['GB12-1234-5678', 'GB98-8765-4321']
  },
  // add entries as needed for testing
};

function formatStatus({ accountValid, swiftValid, verified }) {
  if (verified) return { text: 'Verified', color: 'green' };
  if (accountValid === null || swiftValid === null) return { text: 'Unchecked', color: '#555' };
  if (accountValid && swiftValid) return { text: 'Checks OK', color: 'green' };
  return { text: 'Mismatch', color: 'red' };
}

export default function EmployeePayments() {
  const nav = useNavigate();
  const [txns, setTxns] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]); // ids currently being "submitted"
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load transactions from localStorage (safe parse). If parse fails or no array found we seed demo data.
    let stored = null;
    try {
      const raw = localStorage.getItem('transactions');
      if (raw) stored = JSON.parse(raw);
    } catch (err) {
      console.warn('Could not parse transactions from localStorage, seeding demo data', err);
      stored = null;
    }
    if (Array.isArray(stored) && stored.length) {
      setTxns(stored);
      return;
    }
    // seed sample transactions if none exist
    const sample = [
    {
        id: 't1',
        senderEmail: 'alice@example.com',
          receiverEmail: 'bob@intbank.com',
          amount: '1250.00',
          currency: 'USD',
          provider: 'INTL-BANK',
          accountInfo: 'GB12-1234-5678',
          swiftCode: 'INTLGB22',
          verified: false,
          accountValid: null,
          swiftValid: null,
          submitted: false
        },
        {
          id: 't2',
          senderEmail: 'carol@example.com',
          receiverEmail: 'dave@cba.com.au',
          amount: '500.00',
          currency: 'AUD',
          provider: 'CBA-SWIFT',
          accountInfo: 'AU12-3456-7890',
          swiftCode: 'CBAXAU2S',
          verified: false,
          accountValid: null,
          swiftValid: null,
          submitted: false
        }
      ];
      setTxns(sample);
      localStorage.setItem('transactions', JSON.stringify(sample));
  }, []);

  useEffect(() => {
    // persist changes locally (simulate DB updates)
    localStorage.setItem('transactions', JSON.stringify(txns));
  }, [txns]);

  const updateTxn = (id, patch) => {
    setTxns(txs => txs.map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const checkRecord = (txn) => {
    // Simulate reading bank directory from DB, then check
    const dir = mockBankDirectory[txn.provider];
    const accountValid = !!dir && dir.accounts.includes(txn.accountInfo);
    const swiftValid = !!dir && dir.swift === txn.swiftCode;
    updateTxn(txn.id, { accountValid, swiftValid });
    setMessage(`Checked ${txn.id}: account ${accountValid ? 'OK' : 'NOT FOUND'}, SWIFT ${swiftValid ? 'OK' : 'MISMATCH'}`);
  };

  const toggleVerify = (txn) => {
    // Only allow verifying after checks pass
    if (txn.accountValid !== true || txn.swiftValid !== true) {
      setMessage('Cannot verify: account or SWIFT failed checks. Run checks first.');
      return;
    }
    updateTxn(txn.id, { verified: !txn.verified });
    setMessage(txn.verified ? `Un-verified ${txn.id}` : `Verified ${txn.id}`);
  };

  const submitToSwift = async (txn) => {
    if (!txn.verified) {
      setMessage('Only verified transactions can be submitted to SWIFT.');
      return;
    }
    setLoadingIds(ids => [...ids, txn.id]);
    // Simulate network call delay
    await new Promise(r => setTimeout(r, 800));
    // In real app: POST /api/employee/submit-swift { id } -> backend talks to SWIFT or queue
    updateTxn(txn.id, { submitted: true });
    setLoadingIds(ids => ids.filter(i => i !== txn.id));
    setMessage(`Submitted ${txn.id} to SWIFT (simulated).`);
  };

  const toggleSelect = (id) => {
    setSelectedIds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const bulkSubmit = async () => {
    const toSubmit = txns.filter(t => selectedIds.includes(t.id) && t.verified && !t.submitted);
    if (!toSubmit.length) {
      setMessage('No verified selections to submit.');
      return;
    }
    setLoadingIds(ids => [...ids, ...toSubmit.map(t => t.id)]);
    // simulate
    await new Promise(r => setTimeout(r, 1000));
    setTxns(txs => txs.map(t => selectedIds.includes(t.id) && t.verified ? { ...t, submitted: true } : t));
    setLoadingIds([]);
    setSelectedIds([]);
    setMessage(`Bulk submitted ${toSubmit.length} transaction(s) to SWIFT (simulated).`);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>International Payments — Employee Portal</h2>
      <p style={{ color: '#666' }}>Review incoming transactions, validate payee account & SWIFT, verify and submit to SWIFT.</p>

      <div style={{ marginBottom: 10, display: 'flex', gap: 8 }}>
        <button className="btn btn-sm btn-success" onClick={bulkSubmit}>Submit Selected to SWIFT</button>
        <button className="btn btn-sm btn-secondary" onClick={() => { localStorage.removeItem('transactions'); window.location.reload(); }}>Reset demo data</button>
        <div style={{ marginLeft: 'auto', color: '#333', alignSelf: 'center' }}>{message}</div>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th style={{ width: 36 }}></th>
            <th>ID</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Amount</th>
            <th>Provider</th>
            <th>Account Info</th>
            <th>SWIFT</th>
            <th>Status</th>
            <th style={{ minWidth: 260 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {txns.map(txn => {
            const st = formatStatus(txn);
            const isLoading = loadingIds.includes(txn.id);
            return (
              <tr key={txn.id}>
                <td><input type="checkbox" checked={selectedIds.includes(txn.id)} onChange={() => toggleSelect(txn.id)} disabled={txn.submitted} /></td>
                <td>{txn.id}</td>
                <td style={{ maxWidth: 160 }}>{txn.senderEmail}</td>
                <td style={{ maxWidth: 180 }}>{txn.receiverEmail}</td>
                <td>{txn.amount} {txn.currency}</td>
                <td>{txn.provider}</td>
                <td>{txn.accountInfo}</td>
                <td>{txn.swiftCode}</td>
                <td style={{ color: st.color, fontWeight: 600 }}>{txn.submitted ? 'Submitted' : st.text}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => checkRecord(txn)} disabled={isLoading}>
                      Check Account & SWIFT
                    </button>
                    <button className="btn btn-outline-success btn-sm" onClick={() => toggleVerify(txn)} disabled={isLoading || txn.submitted}>
                      {txn.verified ? 'Un-verify' : 'Mark Verified'}
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => submitToSwift(txn)} disabled={isLoading || txn.submitted || !txn.verified}>
                      {isLoading ? 'Submitting...' : txn.submitted ? 'Submitted' : 'Submit to SWIFT'}
                    </button>
                  </div>
                  <div style={{ marginTop: 6, color: txn.accountValid === false || txn.swiftValid === false ? 'red' : '#666' }}>
                    {txn.accountValid === null ? 'Account: unchecked' : `Account: ${txn.accountValid ? 'OK' : 'Not found'}`} · {txn.swiftValid === null ? 'SWIFT: unchecked' : `SWIFT: ${txn.swiftValid ? 'OK' : 'Mismatch'}`}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}