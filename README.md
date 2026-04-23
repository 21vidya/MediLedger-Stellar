# MediLedger: Stellar-Powered Bio-Data Vault 🏥 🔒

### Decentralized Medical Record Management & Verification System
---

## 🎓 Overview
**MediLedger** is a secure, patient-centric ecosystem designed to solve the challenges of fragmented healthcare data. By leveraging the **Stellar Blockchain**, it ensures that medical records are immutable, easily verifiable, and strictly controlled by the patient. 

### Secure Bio-Data Vault
* **Institution Portal**: Hospitals can securely submit patient records (EHR/Lab results).
* **Patient Sovereignty**: Patients manage their data permissions and privacy via a personalized dashboard.
* **Doctor Surveillants**: Physicians access real-time, authorized data for informed clinical decisions.
* **Verification Logic**: Instant verification of record integrity using on-chain hashes.

---

## 🏗️ Architecture
### Technology Stack
* **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion (Animations).
* **Backend API**: Express.js, TypeScript, Node.js.
* **Blockchain**: Stellar SDK (Soroban Simulation for Ledger Anchoring).
* **Storage**: Encrypted IPFS-style decentralized storage simulation.
* **Security**: AES-256 Record Encryption & RSA-based Key Exchange simulation.

### System Components
1. **Clinical Submitter**: Validates and encrypts raw medical data before ledger anchoring.
2. **Permission Ledger**: A decentralized registry of "Who has access to What" stored on Stellar.
3. **Audit Engine**: Tracks every access/query event into a chronological immutable log.

---

## 📁 Project Structure
```text
├── src/
│   ├── components/       # Reusable UI Blocks (VaultCards, LedgerTable)
│   ├── pages/            # Role-Based Dashboards (Patient, Doctor, Hospital)
│   ├── services/         # Stellar SDK & Encryption Logic
│   ├── lib/              # Theme & Layout configuration
│   └── types.ts          # Global Medical Entity Definitions
├── server.ts             # Express Secure API Gateway
├── DEMO_MANUAL.md        # Step-by-step Presentation Guide
├── README.md             # Project Documentation
└── vite.config.ts        # Build Pipeline
```

---

## 🚀 Getting Started
### Prerequisites
* Node.js v18 or higher
* NPM or Yarn
* A web browser with modern JS support

### Installation
1. **Clone the Project**
   ```bash
   git clone <your-repo-link>
   cd mediledger-vault
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```

### Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the integrated portal.

---

## 📋 Features
### Phase 1: Clinical Vault (Current)
* **Encryption on Submission**: All bio-data is encrypted client-side.
* **Relational Anchoring**: Links records to Patient Wallet IDs.
* **Audit Ledger**: Real-time tracking of data usage.

### Phase 2: Interoperability (Upcoming)
* **Multi-Chain Bridge**: Support for cross-chain verification.
* **AI Diagnostic Tipping**: Automated analysis for authorized doctors.

---

## 🔐 Patient ID & Record Format
To maintain privacy, all records follow a standardized, secure format:
* **Patient Key**: `VAULT-XXXX-XXXX` (Derived from Public Key)
* **Record Hash**: SHA-256 anchor of encrypted contents.
* **Permission Token**: Time-bound access grants stored on-chain.

---

## 📊 Data Storage
### On-Chain (Stellar Blockchain)
* Record Integrity Hashes (Verification)
* Access Control Lists (ACL)
* Permission Tokens
* Audit Signatures

### Off-Chain (Decentralized Storage)
* Encrypted Medical Documentation (EHR)
* Laboratory Images (Radiology/Ultrasound)
* Detailed Patient History

---

## 🔒 Security Features
* **End-to-End Encryption**: Data is unreadable by the platform/host.
* **Wallet Normalization**: Strict casing enforcement for Public Keys to prevent spoofing.
* **Verification Gate**: Integrated checksum validation for every viewed file.

---

## 🛠️ Development
### API Endpoints (Development)
* `GET /api/health`: System status check.
* `POST /api/ledger/anchor`: Write a new integrity hash to the simulated ledger.
* `POST /api/vault/access`: Validate permissions and retrieve encrypted payload.

---

## 👥 Contributors
* **Project Lead**: [Your Name/Team]
* **Environment**: Developed in Google AI Studio Build

---
## 📞 Support
For project inquiries or technical support, please contact the repository owner via GitHub Issues.
