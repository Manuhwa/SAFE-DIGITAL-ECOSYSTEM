import { Link } from 'react-router-dom';
import ThemeSelector from '../components/ThemeSelector';

export default function Home() {
  return (
    <div className="home-page">
      <ThemeSelector />

      <h1 className="home-title">SAFE Digital Ecosystem</h1>
      <p className="home-subtitle">
        A safe way for students to report harassment, learn about their rights, and access legal guidance in the Zimbabwean context.
      </p>

      <div className="home-cards">
        <Link to="/report" className="home-dash-card home-card">
          <span className="home-card-icon" aria-hidden="true">📝</span>
          <h2 className="home-card-title">Report</h2>
          <p className="home-card-text">
            Submit a report anonymously or with your details. Use text or record audio (transcribed after submission). Timestamped and secure.
          </p>
        </Link>
        <Link to="/education" className="home-dash-card home-card">
          <span className="home-card-icon" aria-hidden="true">📚</span>
          <h2 className="home-card-title">Learn</h2>
          <p className="home-card-text">
            What is sexual harassment? Effects on well-being and studies. Your rights in the Zimbabwean context.
          </p>
        </Link>
        <Link to="/legal" className="home-dash-card home-card">
          <span className="home-card-icon" aria-hidden="true">⚖️</span>
          <h2 className="home-card-title">Legal Aid</h2>
          <p className="home-card-text">
            Steps based on the Criminal Law (Codification and Reform) Act and Labour Act of Zimbabwe, in English, ChiShona, and IsiNdebele.
          </p>
        </Link>
      </div>

      <div className="home-notice">
        <strong>Confidentiality:</strong> Anonymous reports do not store your identity. Signed reports store your details only for follow-up by authorised staff. Reports are timestamped and can support academic accommodation and legal steps.
      </div>
    </div>
  );
}
