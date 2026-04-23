# MediLedger: Stellar-Powered Bio-Data Vault

MediLedger is a decentralized medical record management system built on the Stellar network. It provides a secure, patient-centric ecosystem for sharing healthcare data with end-to-end encryption and auditability.

## 🚀 Key Features
- **Patient-Centric Sovereignty**: Patients own and control access to their records.
- **Stellar Anchor**: Integrity hashes and permissions are anchored to the Stellar network (Soroban-compatible).
- **IPFS Distribution**: Clinical payloads are encrypted and stored on decentralized storage.
- **Role-Based Dashboards**: Tailored interfaces for Hospitals (Submitters), Patients (Owners), and Doctors (Surveillants).
- **Immutable Audit Trail**: Every access event is logged on a decentralized chronological sub-ledger.

## 🛠️ Technical Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion.
- **Backend**: Express.js (Node.js) with Vite Middleware.
- **Blockchain**: Stellar SDK (Soroban simulation).
- **Storage**: Mock IPFS / Encrypted Binary Streams.

## 📖 How to Demo (Manual)
The project is designed for a seamless manual walkthrough. Please refer to `DEMO_MANUAL.md` for the exact steps and master keys to use.

## ⚙️ Setup & Installation
1. **Clone the repo**:
   ```bash
   git clone <your-repo-url>
   cd mediledger
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

## 🛡️ Security Logic
- **Encryption**: AES-256 for clinical data.
- **Normalization**: Automatic wallet address normalization (Uppercase) to prevent identity mismatch.
- **Validation**: Schema-level verification for all incoming ledger anchors.
