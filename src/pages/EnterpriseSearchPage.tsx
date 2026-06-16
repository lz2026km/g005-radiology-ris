import { useState } from 'react';
import { searchClient } from '../services/search';

export default function EnterpriseSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);

  const handleSearch = async () => {
    const res = await searchClient.search(query);
    setResults(res);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Enterprise Search</h1>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search patients, exams, reports..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}
        />
        <button onClick={handleSearch} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Search</button>
      </div>
      {results && (
        <div style={{ marginTop: 16 }}>
          <p>{results.total} results ({results.tookMs}ms)</p>
          {results.results?.map((r: any) => (
            <div key={r.id} style={{ padding: 12, marginTop: 8, background: '#f8fafc', borderRadius: 6 }}>
              <strong>{r.title}</strong>
              <div style={{ color: '#64748b', fontSize: 13 }}>{r.description}</div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>Score: {r.score?.toFixed(1)} | Type: {r.type}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
