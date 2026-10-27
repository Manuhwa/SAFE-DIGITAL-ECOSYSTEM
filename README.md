# Safe Digital Ecosystem

A **student harassment reporting system** for Zimbabwean institutions. Students can report anonymously or with their details, via **text** or **audio** (audio is transcribed after submission). The system includes **educational content** on sexual harassment (what it is, effects, Zimbabwean context), **legal aid** references to the **Criminal Law (Codification and Reform) Act** and **Labour Act**, **timestamped reporting**, **cross-reference database**, **severity detection** with **academic accommodation** alerts to admins, and **AI pattern analysis** on report data.

## Features

- **Anonymous or signed reports** – Choose to submit without identity or with student ID, name, email, phone, faculty, year of study.
- **Text or audio** – Write the report or record audio; audio is stored and can be transcribed (integration point for Whisper or similar).
- **Timestamped reporting** – Every report is stored with a creation timestamp.
- **Cross-reference database** – Reports are linked by location, category, and keywords for pattern analysis and related-report lookup.
- **Severity detection** – The system classifies reports (low / medium / high / critical) and **notifies admins** when **academic accommodation** may be needed (high/critical).
- **Educational messages** – In-app content on what sexual harassment is, its effects, and the Zimbabwean context.
- **Legal aid** – Steps based on the **Criminal Law (Codification and Reform) Act [Chapter 9:23]** (e.g. S65–S71) and **Labour Act [Chapter 28:01] Section 8(h)** for the legal route.
- **AI pattern analysis** – Analyse patterns from existing data (severity, location, category, keywords, trends). Run from the Admin panel.
-Tier 1 – Information and Self-Help: For survivors who only want information, the system provides access to an anonymized resource library, self-guided educational modules, and a moderated anonymous forum. This respects survivors who may not be ready for formal intervention.
-Tier 2 – Support Services: For those seeking support, the system automatically:
  - Matches the survivor with a trauma-trained counsellor based on language preference, trauma type, and availability.
  - Connects them with a trained peer supporter via encrypted chat, using an algorithm that matches survivors with peers who have similar experiences (anonymised).
  - Initiates automated daily wellness check-ins (via SMS or app) with mood tracking; escalation alerts are sent to human responders if distress is detected.
-Tier 3 – Academic Accommodations: For survivors who file formal reports, the system automatically generates accommodation letters (e.g., deadline extensions, alternative supervision, exam adjustments) and routes them to relevant lecturers while preserving survivor anonymity. Accommodations are tracked for implementation and renewed automatically while the case is active.
-Tier 4 – Legal and Formal Action: If the survivor chooses to pursue formal institutional or legal action, the system:
  - Packages case evidence into a secure, encrypted dossier.
  - Facilitates referral to partner legal aid providers.
  - Auto-generates formal complaint documents for the institutional disciplinary committee and tracks their progress through the workflow.
  - Provides guidance for engaging with police if criminal charges are pursued.
Empirical Grounding: Participants like Tino described declining grades and inability to concentrate; automated accommodations directly address this. The tiered approach respects the diversity of survivor needs documented in Theme 5, where some sought counselling while others preferred silence or advocacy.
4. Trust Vault
Purpose: To serve as the secure, confidential computing layer that underpins the entire ecosystem. It ensures that all data—whether at rest, in transit, or in use—is protected through state-of-the-art cryptographic methods.
Key Functions:
-Encryption Architecture:
  -Data at Rest: AES-256 encryption with keys stored in hardware security modules (HSMs). Data is shared across multiple jurisdictions to prevent single-point compromise.
  -Data in Transit: TLS 1.3 with perfect forward secrecy ensures all communications are secure.
  -Data in Use: Intel SGX/AMD SEV enclaves enable computation on encrypted data without exposing it. Homomorphic encryption allows analytics on encrypted data, and secure multi-party computation enables collaborative analysis without data sharing.
-Zero-Knowledge Proofs (ZKPs): Cryptographic methods that allow one party to prove knowledge of information without revealing the information itself. Applications include:
  - Survivors can prove they submitted a report on a certain date without revealing its content.
  - The system can prove that a lecturer has multiple reports without revealing any reporter's identity.
  - Eligibility for accommodations can be verified without disclosing the nature of the trauma.
-Differential Privacy: Mathematical framework guaranteeing that query outputs do not reveal whether any individual's data was included. Laplacian noise is added to aggregate queries (e.g., "How many reports in Department X?"), so that even an attacker with full background knowledge cannot infer individual contributions. A privacy budget (epsilon) is tracked and capped per data subject.
-Access Control: Strict role-based access ensures that only authorised personnel can view specific data, and only to the extent necessary. Survivors control access to their own reports and can grant or revoke permissions. All access is logged and auditable.
Empirical Grounding: Participants' fear of retaliation and exposure (Theme 2) is directly addressed by the Trust Vault's radical confidentiality. Zero-knowledge proofs and differential privacy enable institutional accountability without sacrificing survivor safety.
Data Flow and Module Integration
The modules operate in a seamless, automated workflow:
1. A survivor submits a report via any channel of the Reporting Module.
2. The report is encrypted and hashed; the hash is timestamped on the blockchain via the Verification Module, providing an immutable receipt.
3. The Verification Module's AI analyses the report (within a secure enclave) against existing data, generating pattern insights without revealing individual identities.
4. Based on the survivor's preferences and the analysis, the Intervention Module triggers appropriate responses—counselling referrals, accommodations, etc.
5. All data is stored in the Trust Vault, with access strictly controlled.
6. Anonymised aggregate data flows to a public Transparency Dashboard (an optional feature), allowing the community to monitor institutional responsiveness and building trust.
This integration ensures that no single module operates in isolation; the ecosystem functions as a cohesive whole, with each component reinforcing the others.
Governance and Ethical Safeguards
To prevent misuse and ensure ongoing accountability, the model includes a robust governance framework:
-Independent Oversight Body: Comprising survivor representatives, data privacy experts, legal scholars, feminist technologists, and external ethicists. The body conducts quarterly audits, tests for algorithmic bias, reviews survivor feedback, and publishes annual public reports.
-Survivor Charter of Rights: A formal document guaranteeing survivors' rights to control their data, withdraw consent, access their information, request rectification or erasure, object to automated decisions, and request human review.
-Algorithmic Fairness Protocols: Regular testing for bias across race, socioeconomic status, age, disability, and language. Mitigation strategies include diverse training data, fairness constraints in optimisation, and human-in-the-loop for edge cases.
-Ethical Review Board: An independent ethics committee reviews any proposed changes to the system or its algorithms.
Implementation Considerations
The model is designed for phased implementation in Zimbabwean teachers' colleges:
-Phase 1 (Foundation): Stakeholder consultations, ethical clearance, infrastructure assessment, co-creation of survivor charter, establishment of oversight body.
-Phase 2 (Development): Agile development of modules, blockchain deployment, AI training on anonymised historical data, user acceptance testing with survivor focus groups.
-Phase 3 (Pilot): Soft launch in one department, continuous feedback collection, real-time dashboard activation, independent audit.
-Phase 4 (Evaluation and Scaling): Mixed-methods evaluation, impact assessment, refinement, full rollout planning.
Key performance indicators include increased reporting rates, reduced time to intervention, high survivor satisfaction, decreased repeat incidents, and improved institutional trust indices.

## Tech stack

- **Backend:** Node.js, Express, SQLite (better-sqlite3), Multer (audio uploads).
- **Frontend:** React 18, Vite, React Router.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```

   If the API fails with `NODE_MODULE_VERSION` / `better-sqlite3` errors after upgrading Node.js, rebuild the native module for your current Node version:
   ```bash
   npm run rebuild:sqlite
   ```
   Or reinstall from the project root: `npm install`

2. **Run the app (backend + frontend)**

   The frontend proxies `/api` to the backend. **The backend must be running** or you will get `ECONNREFUSED` errors.

   **Option A – Single command (recommended)**  
   From the project root:
   ```bash
   npm run dev
   ```
   This starts both the API server (port 3001) and the Vite dev server (port 3000). Open http://localhost:3000

   **Option B – Two terminals**  
   - Terminal 1 (API):
     ```bash
     npm run dev:server
     ```
     Leave it running. You should see: `Safe Digital Ecosystem API running at http://localhost:3001`
   - Terminal 2 (frontend):
     ```bash
     npm run dev:client
     ```
     Then open http://localhost:3000

   **Option C – Cursor / VS Code (no CLI typing)**  
   Open the Command Palette (`Ctrl+Shift+P`), run **Tasks: Run Task**, then choose **Run Backend** and **Run Frontend** (each opens its own terminal; run backend first or both). For one terminal with both servers, pick **Run Full Stack (backend + frontend)**.

   **Option D – Windows, no IDE (double-click)**  
   Double-click **`start-dev.bat`** in the project folder. It will:
   - Install dependencies if missing (root + `client`)
   - Rebuild `better-sqlite3` for your Node version if needed
   - Start the **backend** (port 3001) and **frontend** (port 3000) in two windows
   - Open http://localhost:3000 in your browser  

   Keep **both** windows open — Learn and Legal Aid load content from the API on port 3001.  
   Uses `npm.cmd` so it works even when PowerShell blocks `npm.ps1`.  
   Or use **`run-backend.bat`** and **`run-frontend.bat`** separately. [Node.js](https://nodejs.org/) required.

3. **Initialize database only** (optional; server also initializes on first run)
   ```bash
   npm run init-db
   ```

4. **Create an admin user** (required to access the Admin section)
   ```bash
   node server/scripts/createAdmin.js admin@your-institution.org YourSecurePassword
   ```
   Or set env vars: `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then run `npm run create-admin`.

   **Temporary demo admin** (development only — change before production):
   - Username: `mderedzai`
   - Password: `2026`
   - Create or reset with: `node server/scripts/createAdmin.js mderedzai 2026`

5. **Production**
   - Build client: `npm run build`
   - Serve: set `PORT` and run `npm start`; serve the `client/dist` folder as static files or via a reverse proxy.

## API overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/reports/submit` | Submit text report (anonymous/signed, optional metadata). |
| `POST /api/reports/submit/audio` | Submit audio report (multipart form with `audio` file). |
| `GET /api/reports/cross-reference/:id` | Get report plus related reports by location/category. |
| `GET /api/education` | List educational content. |
| `GET /api/education/:id` | Get one education item. |
| `GET /api/legal` | Get legal aid content (Criminal Code & Labour Act steps). |
| `POST /api/analysis/run` | Run AI pattern analysis (**admin auth required**). |
| `GET /api/analysis/latest` | Get latest pattern analysis result (**admin auth required**). |
| `GET /api/admin/accommodation-alerts` | List accommodation alerts (**admin auth required**). |
| `PATCH /api/admin/accommodation-alerts/:id/acknowledge` | Acknowledge an alert (**admin auth required**). |
| `GET /api/admin/reports` | List all reports (**admin auth required**). |
| `GET /api/admin/reports/:id` | Get one report full detail (**admin auth required**). |
| `POST /api/admin/login` | Admin login; returns `{ token, admin }`. |
| `POST /api/admin/logout` | Invalidate session (optional). |

## Legal references (Zimbabwe)

- **Criminal Law (Codification and Reform) Act [Chapter 9:23]** – Sections 65–71 (rape, indecent assault, consent, etc.).
- **Labour Act [Chapter 28:01], Section 8(h)** – Sexual harassment as unfair labour practice; penalties include cessation, compensation, criminal sanction.

This system is for students and is designed to be used within institutional policies and in conjunction with professional legal advice where needed.
