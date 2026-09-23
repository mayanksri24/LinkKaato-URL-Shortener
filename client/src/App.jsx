import { useEffect, useState } from 'react';

const apiBase = import.meta.env.VITE_API_URL || '';
const publicBase = import.meta.env.VITE_SHORT_URL_BASE || 'http://localhost:5000';

function shortLink(code) {
  return `${publicBase.replace(/\/$/, '')}/${code}`;
}

function truncate(value, length = 58) {
  return value.length > length ? `${value.slice(0, length)}…` : value;
}

export default function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    async function loadUrls() {
      try {
        const response = await fetch(`${apiBase}/api/urls`);
        if (!response.ok) throw new Error('Unable to load links.');
        setUrls(await response.json());
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }
    loadUrls();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(`${apiBase}/api/urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to shorten this URL.');
      setUrls((current) => [result, ...current]);
      setOriginalUrl('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink(code) {
    try {
      await navigator.clipboard.writeText(shortLink(code));
      setCopied(code);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      setError('Could not copy the link. Please copy it manually.');
    }
  }

  async function deleteLink(id) {
    if (!window.confirm('Delete this short link? This cannot be undone.')) return;

    setError('');
    setDeletingId(id);

    try {
      const response = await fetch(`${apiBase}/api/urls/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'Unable to delete this link.');
      }
      setUrls((current) => current.filter((url) => url._id !== id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId('');
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="brand"><span className="brand-mark">↗</span> SnapLink</div>
        <p className="eyebrow">A simpler way to share</p>
        <h1>Long link in.<br /><em>Short link out.</em></h1>
        <p className="subtitle">Turn unwieldy URLs into clean, shareable links and see every click at a glance.</p>

        <form className="shorten-form" onSubmit={handleSubmit}>
          <label htmlFor="url">Paste a long URL</label>
          <div className="input-row">
            <input id="url" type="text" value={originalUrl} onChange={(event) => setOriginalUrl(event.target.value)} placeholder="https://your-very-long-link.com/..." autoComplete="url" />
            <button disabled={submitting}>{submitting ? 'Creating…' : 'Shorten link'}</button>
          </div>
          {error && <p className="message error">{error}</p>}
        </form>
      </section>

      <section className="links-section" aria-live="polite">
        <div className="section-heading">
          <div><p className="eyebrow">Your dashboard</p><h2>Shortened links</h2></div>
          <span className="link-total">{urls.length} {urls.length === 1 ? 'link' : 'links'}</span>
        </div>

        {loading ? <p className="empty-state">Loading your links…</p> : urls.length === 0 ? (
          <div className="empty-state"><span>⌁</span><p>Your shortened links will appear here.</p></div>
        ) : (
          <div className="link-list">
            {urls.map((url) => (
              <article className="link-card" key={url._id}>
                <div className="link-details">
                  <a href={shortLink(url.shortCode)} target="_blank" rel="noreferrer" className="short-url">{shortLink(url.shortCode)} <span>↗</span></a>
                  <p title={url.originalUrl}>{truncate(url.originalUrl)}</p>
                </div>
                <div className="link-actions">
                  <span className="clicks"><strong>{url.clicks}</strong> {url.clicks === 1 ? 'click' : 'clicks'}</span>
                  <button className="copy-button" onClick={() => copyLink(url.shortCode)}>{copied === url.shortCode ? 'Copied!' : 'Copy'}</button>
                  <button className="delete-button" onClick={() => deleteLink(url._id)} disabled={deletingId === url._id} aria-label={`Delete ${url.shortCode}`}>{deletingId === url._id ? 'Deleting…' : 'Delete'}</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
