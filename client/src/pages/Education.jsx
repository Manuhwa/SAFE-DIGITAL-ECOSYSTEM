import { useState, useEffect } from 'react';

const API = '/api';

export default function Education() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/education`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        if (data.length) setSelected(data[0]);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--textMuted)' }}>Loading…</p>;

  return (
    <div style={styles.container}>
      <h1 className="page-title">Learn About Sexual Harassment</h1>
      <p className="page-subtitle">
        What it is, its effects, and your rights in the Zimbabwean context. This content is shown to educate and support students.
      </p>

      <div className="education-layout">
        <nav className="education-nav">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              style={{
                ...styles.navBtn,
                ...(selected?.id === item.id ? styles.navBtnActive : {}),
              }}
            >
              {item.title}
            </button>
          ))}
        </nav>
        <article className="education-article" style={styles.article}>
          {selected && (
            <>
              <h2 style={styles.articleTitle}>{selected.title}</h2>
              {selected.summary && <p style={styles.summary}>{selected.summary}</p>}
              <div style={styles.content}>{selected.content}</div>
            </>
          )}
        </article>
      </div>
    </div>
  );
}

const styles = {
  container: {},
  navBtn: {
    padding: '0.6rem 1rem',
    textAlign: 'left',
    background: 'var(--surface)',
    border: '1px solid var(--surface2)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
  },
  navBtnActive: { borderColor: 'var(--accent)', color: 'var(--accentLight)' },
  article: { background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--surface2)' },
  articleTitle: { marginBottom: '0.5rem', color: 'var(--text)' },
  summary: { color: 'var(--textMuted)', fontSize: '0.95rem', marginBottom: '1rem' },
  content: { whiteSpace: 'pre-line', lineHeight: 1.7, color: 'var(--text)' },
};
