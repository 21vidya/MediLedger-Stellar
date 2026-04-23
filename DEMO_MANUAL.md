# 🏥 MediLedger Demo Cheat Sheet

This manual ensures a 100% successful full-stack walkthrough of the decentralized healthcare network.

## 🗝️ Core Demo Personas (Master Keys)

Use these exact strings in the **"Public Wallet Key"** field on the Login Page for maximum interconnectedness:

*   **🏢 Hospital**: `G-HOSPITAL-CITY`
*   **👤 Patient**: `G-PATIENT-SARAH`
*   **👨‍⚕️ Doctor**: `G-DR-ALEX`

---

## 🚀 The Step-by-Step Demo script

### **Phase 1: Secure Anchoring (The Hospital)**
1.  **Login**: Choose `HOSPITAL` role. (Name: `City Hospital`, Key: `G-HOSPITAL-CITY`).
2.  **Action**: Click **"Anchor New Medical Record"**.
3.  **Inputs**:
    *   **Patient Identity**: `G-PATIENT-SARAH` (Match exactly!)
    *   **Report Type**: Prescription
    *   **Clinical Summary**: `Vitamin D3 Dosage: 2000 IU Daily.`
4.  **Execute**: Click **"Anchor to Decentralized Ledger"**.
5.  **Explanation**: *"We just encrypted this report and sent it to IPFS. The hash of the record was then anchored to the Stellar Soroban ledger."*

### **Phase 2: Immediate Awareness (The Patient)**
1.  **Logout & Re-login**: Choose `PATIENT` role. (Name: `Sarah`, Key: `G-PATIENT-SARAH`).
2.  **Notice**: Look at the **Notification Bell** (top right). Sarah has a real-time alert!
3.  **Action**: Open the bell to see the "New Medical Record" notification from the hospital.
4.  **Confirm**: View your "Private Health Vault". The record is there but is **locked** from everyone else.
5.  **Permission Grant**: 
    *   Click "Manage Permissions" or use the Grant section.
    *   **Doctor Key**: `G-DR-ALEX` (Targeting the doctor specifically).
    *   Select **PRESCRIPTION** and click **Grant Access**.

### **Phase 3: The Data Handshake (The Doctor)**
1.  **Logout & Re-login**: Choose `DOCTOR` role. (Name: `Dr. Alex`, Key: `G-DR-ALEX`).
2.  **Notice**: Look at the **Notification Bell**. Alex is notified that Sarah has granted him access.
3.  **Action**: Go to **Authorized Patient Vaults**.
4.  **Review**: You will see **Sarah Jenkins** in your list. Click **View Vault**.
5.  **Unlock**: Click the record to decrypt the clinical summary locally on your machine.

---

## 🛡️ Critical Design Highlights
*   **No Centralized Passwords**: Everything is governed by the Private/Public Key relationship (simulated via Wallet Keys).
*   **Audit-Proof**: Every action (Upload, Grant, View) is logged in the "Network Activity" log at the bottom of the dashboards.
*   **Self-Sovereign**: The data remains dormant on the cloud until the patient "signs" the permission release.
