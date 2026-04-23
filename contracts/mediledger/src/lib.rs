#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, Symbol, Vec, String, Address};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct HealthRecord {
    pub id: String,
    pub patient_address: Address,
    pub hospital_address: Address,
    pub record_hash: String, // Integrity anchor
    pub encrypted_uri: String, // Pointer to IPFS/Off-chain storage
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AccessPermission {
    pub patient_address: Address,
    pub app_address: Address, // Doctor/App address
    pub granted: bool,
    pub expires_at: u64,
}

#[contract]
pub struct MediLedgerContract;

#[contractimpl]
impl MediLedgerContract {
    /// Anchors a new health record to the ledger
    pub fn anchor_record(
        env: Env,
        hospital: Address,
        record: HealthRecord,
    ) {
        hospital.require_auth();
        
        let mut records: Vec<HealthRecord> = env.storage().instance().get(&symbol_short!("RECORDS")).unwrap_or(Vec::new(&env));
        records.push_back(record.clone());
        
        env.storage().instance().set(&symbol_short!("RECORDS"), &records);
        
        // Emit event for real-time tracking
        env.events().publish((symbol_short!("RECORD"), record.id), record.patient_address);
    }

    /// Grants or revokes access to a doctor/entity
    pub fn update_permission(
        env: Env,
        patient: Address,
        permission: AccessPermission,
    ) {
        patient.require_auth();
        
        let key = (symbol_short!("PERM"), patient.clone(), permission.app_address.clone());
        env.storage().instance().set(&key, &permission);
        
        env.events().publish((symbol_short!("PERM_UP"), patient), permission.app_address);
    }

    /// Checks if a doctor has access to a patient's records
    pub fn has_access(env: Env, patient: Address, doctor: Address) -> bool {
        let key = (symbol_short!("PERM"), patient, doctor);
        let perm: Option<AccessPermission> = env.storage().instance().get(&key);
        
        match perm {
            Some(p) => p.granted && p.expires_at > env.ledger().timestamp(),
            None => false,
        }
    }

    /// Fetches all records anchored for a patient
    pub fn get_patient_records(env: Env, patient: Address) -> Vec<HealthRecord> {
        let records: Vec<HealthRecord> = env.storage().instance().get(&symbol_short!("RECORDS")).unwrap_or(Vec::new(&env));
        let mut filtered = Vec::new(&env);
        
        for record in records.iter() {
            if record.patient_address == patient {
                filtered.push_back(record);
            }
        }
        filtered
    }
}
