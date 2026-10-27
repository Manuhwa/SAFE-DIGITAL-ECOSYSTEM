import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import sexualOffences from '../data/sexualOffencesSections';
import sexualOffencesTranslations from '../data/sexualOffencesSections.i18n';

const API = '/api';
const LANG_KEY = 'safe_legal_language';

export default function Legal() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'en');

  useEffect(() => {
    fetch(`${API}/legal`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  if (loading) return <p style={{ color: 'var(--textMuted)' }}>Loading…</p>;
  if (!data) {
    return (
      <div style={styles.container}>
        <h1 className="page-title">Legal Aid – Zimbabwe</h1>
        <p style={{ color: 'var(--textMuted)' }}>
          {sexualOffencesTranslations[lang]?.ui.offlineFallback ||
            'Could not load the full legal guidance (you may be offline). The statutory sections below are stored on this device.'}
        </p>
        <SexualOffencesGroup lang={lang} setLang={setLang} showLangToggle />
      </div>
    );
  }

  const languages = data.languages || [
    { code: 'en', nativeName: 'English' },
    { code: 'sn', nativeName: 'ChiShona' },
    { code: 'nd', nativeName: 'IsiNdebele' },
  ];
  const pack = data.translations?.[lang] || data.translations?.en || data;
  const acts = pack.acts || [];
  const generalSteps = pack.generalSteps || [];

  return (
    <div style={styles.container} lang={lang}>
      <h1 className="page-title">{pack.pageTitle || 'Legal Aid – Zimbabwe'}</h1>

      <div className="language-switcher" role="group" aria-label={pack.languageLabel || 'Choose language'}>
        <p className="language-switcher-label">{pack.languageLabel || 'Choose language'}</p>
        <div className="language-switcher-options">
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              className={`language-option${lang === item.code ? ' language-option--active' : ''}`}
              onClick={() => setLang(item.code)}
              lang={item.code}
            >
              {item.nativeName || item.name}
            </button>
          ))}
        </div>
        <p className="language-switcher-hint">{pack.languageHint}</p>
      </div>

      <p style={styles.intro}>{pack.intro}</p>

      <div style={styles.general} className="legal-block">
        <h2 style={styles.sectionTitle}>{pack.generalStepsTitle || 'General steps'}</h2>
        <ul style={styles.list}>
          {generalSteps.map((step, i) => (
            <li key={i} style={styles.listItem}>{step}</li>
          ))}
        </ul>
      </div>

      {acts.map((act, idx) => (
        <section key={idx} style={styles.act} className="legal-block">
          <h2 style={styles.actName}>{act.name}</h2>
          <p style={styles.relevance}><strong>{pack.relevanceLabel || 'Relevance'}:</strong> {act.relevance}</p>
          <h3 style={styles.subTitle}>{pack.legalRouteTitle || 'Steps for legal route'}</h3>
          <ol style={styles.list}>
            {act.steps.map((step, i) => (
              <li key={i} style={styles.listItem}>{step}</li>
            ))}
          </ol>
          <h3 style={styles.subTitle}>{pack.relevantSectionsTitle || 'Relevant sections'}</h3>
          <ul style={styles.list}>
            {act.sections.map((sec, i) => (
              <li key={i} style={styles.listItem}>{sec}</li>
            ))}
          </ul>
        </section>
      ))}

      <SexualOffencesGroup lang={lang} setLang={setLang} />
    </div>
  );
}

function Block({ b }) {
  const indent = { sub: 0, tail: 0, para: 1.5, proviso: 2, note: 0, subpara: 3, subtail: 1.5 }[b.k] ?? 0;
  const style = {
    ...styles.block,
    paddingLeft: `${indent}rem`,
    ...(b.k === 'note' ? styles.note : null),
    ...(b.k === 'proviso' ? { fontStyle: 'normal', textIndent: '1.5rem' } : null),
  };
  return (
    <p style={style}>
      {b.l ? <span style={styles.blockLabel}>{b.l}</span> : null}
      {b.t}
    </p>
  );
}

const EN_UI = {
  heading: 'Sexual Offences – Criminal Law Code',
  section: 'Section',
  open: 'Open', close: 'Close',
  source: 'Source', retrieved: 'Retrieved',
  unavailable: 'The official text of this section could not be retrieved, so it is not shown here.',
  latest: 'Latest consolidated version:',
};
const EN_NOTICE = 'Unofficial translation for understanding only. The English text of the Criminal Law (Codification and Reform) Act is the legally binding version.';
const LANG_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'sn', label: 'ChiShona' },
  { code: 'nd', label: 'IsiNdebele' },
];

function SexualOffencesGroup({ lang = 'en', setLang, showLangToggle = false }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const src = sexualOffences.source;
  const tr = sexualOffencesTranslations[lang] || null;
  const translated = Boolean(tr) && !showEnglish;
  const ui = translated ? { ...EN_UI, ...tr.ui } : EN_UI;

  useEffect(() => { setShowEnglish(false); }, [lang]);
  const accent = theme === 'light' ? '#7a2e2e' : '#f2b8b5';

  return (
    <section style={styles.act} className="legal-block" aria-labelledby="so-heading">
      <h2 id="so-heading" style={styles.actName} lang={translated ? lang : 'en'}>{ui.heading}</h2>
      {showLangToggle && setLang && (
        <div role="group" aria-label="Language" style={styles.langRow}>
          {LANG_OPTIONS.map((o) => (
            <button key={o.code} type="button" lang={o.code} onClick={() => setLang(o.code)}
              className={`language-option${lang === o.code ? ' language-option--active' : ''}`}>{o.label}</button>
          ))}
        </div>
      )}
      <p style={styles.relevance}>
        {src.act}. {translated ? tr.ui.intro : 'Tap a section to read the full text. These sections are saved in the app and can be read offline.'}
      </p>
      {tr && (
        <div style={{ ...styles.status, borderColor: accent }} role="note">
          {translated && <p style={{ margin: '0 0 0.35rem' }} lang={lang}><strong>{tr.ui.notice}</strong></p>}
          {translated && <p style={{ margin: '0 0 0.5rem' }} lang="en">{EN_NOTICE}</p>}
          <button type="button" onClick={() => setShowEnglish((v) => !v)} style={{ ...styles.switchBtn, color: accent, borderColor: accent }}>
            {translated ? tr.ui.showEnglish : tr.ui.showTranslation}
          </button>
        </div>
      )}
      <div role="list">
        {sexualOffences.sections.map((sec) => {
          const isOpen = open === sec.number;
          const panelId = `so-panel-${sec.number}`;
          const available = Array.isArray(sec.blocks) && sec.blocks.length > 0;
          const tsec = translated ? tr.sections[sec.number] : null;
          const blocks = tsec ? sec.blocks.map((b, i) => (tsec.blocks[i] == null ? b : { ...b, t: tsec.blocks[i] })) : sec.blocks;
          const status = tsec?.status || sec.status;
          return (
            <div key={sec.number} role="listitem" style={styles.accItem}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-label={`${isOpen ? ui.close : ui.open}: ${ui.section} ${sec.number}`}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : sec.number)}
                style={{ ...styles.accButton, color: 'var(--text)' }}
              >
                <span style={{ ...styles.accNum, color: accent }}>{ui.section} {sec.number}</span>
                <span style={styles.accTitle} lang={tsec ? lang : 'en'}>{tsec ? tsec.title : sec.title}</span>
                <span aria-hidden="true" style={styles.accChevron}>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div id={panelId} style={styles.accPanel} lang={tsec ? lang : 'en'}>
                  {tsec && (
                    <p style={styles.note}>
                      {tr.ui.notice} <span lang="en">({EN_NOTICE})</span>{' '}
                      <button type="button" onClick={() => setShowEnglish(true)} style={{ ...styles.linkBtn, color: accent }}>{tr.ui.showEnglish}</button>
                    </p>
                  )}
                  {status && <p style={{ ...styles.status, borderColor: accent }}>{status}</p>}
                  {available ? (
                    blocks.map((b, i) => <Block key={i} b={b} />)
                  ) : (
                    <p style={styles.note}>{ui.unavailable}</p>
                  )}
                  <p style={styles.cite}>
                    {ui.source}:{' '}
                    <a href={sec.source === 's70' ? src.s70Url : src.primaryUrl} target="_blank" rel="noreferrer" style={{ color: accent }}>
                      {sec.source === 's70' ? src.s70Label : src.primaryLabel}
                    </a>
                    . {ui.retrieved} {src.retrieved}.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p style={styles.cite}>
        {translated ? `${tr.ui.disclaimer} ` : ''}{src.disclaimer} {ui.latest}{' '}
        <a href={src.zimliiUrl} target="_blank" rel="noreferrer" style={{ color: accent }}>ZimLII</a>.
      </p>
    </section>
  );
}

const styles = {
  container: {},
  intro: { color: 'var(--textMuted)', marginBottom: '1.5rem', fontStyle: 'italic' },
  sectionTitle: { marginBottom: '0.75rem', color: 'var(--text)' },
  act: { marginBottom: '2rem', padding: '1.25rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--surface2)' },
  actName: { marginBottom: '0.5rem', color: 'var(--text)' },
  relevance: { color: 'var(--textMuted)', fontSize: '0.95rem', marginBottom: '1rem' },
  subTitle: { marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text)' },
  list: { paddingLeft: '1.25rem', margin: '0 0 0.5rem', color: 'var(--text)' },
  listItem: { marginBottom: '0.35rem' },
  block: { margin: '0 0 0.5rem', color: 'var(--text)', lineHeight: 1.6, overflowWrap: 'anywhere' },
  blockLabel: { fontWeight: 600, marginRight: '0.5rem' },
  note: { color: 'var(--textMuted)', fontSize: '0.85rem', fontStyle: 'italic', margin: '0 0 0.5rem' },
  status: { color: 'var(--text)', fontSize: '0.9rem', background: 'var(--surface2)', borderLeft: '4px solid', padding: '0.6rem 0.8rem', borderRadius: '6px', margin: '0 0 1rem' },
  cite: { color: 'var(--textMuted)', fontSize: '0.8rem', marginTop: '0.75rem', overflowWrap: 'anywhere' },
  langRow: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '0 0 0.75rem' },
  switchBtn: { background: 'transparent', border: '1px solid', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', font: 'inherit', fontSize: '0.85rem' },
  linkBtn: { background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', font: 'inherit' },
  accItem: { borderTop: '1px solid var(--surface2)' },
  accButton: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', padding: '0.85rem 0.25rem', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit' },
  accNum: { fontWeight: 700, whiteSpace: 'nowrap' },
  accTitle: { flex: '1 1 12rem', fontWeight: 500 },
  accChevron: { fontSize: '1.25rem', lineHeight: 1 },
  accPanel: { padding: '0.25rem 0.25rem 1rem', maxWidth: '75ch' },
  general: { marginBottom: '2rem', padding: '1.25rem', background: 'var(--surface2)', borderRadius: 'var(--radius)' },
};
