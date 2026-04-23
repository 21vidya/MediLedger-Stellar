import { 
  Networks, 
  TransactionBuilder, 
  Horizon, 
  rpc, 
  Contract, 
  Address,
  scValToNative
} from 'stellar-sdk';
import { isConnected, getAddress, signTransaction } from '@stellar/freighter-api';

/**
 * Stellar & Soroban Service
 * Primary interface for managing medical record hashes and access control on-chain.
 */
export const StellarService = {
  horizonUrl: 'https://horizon-testnet.stellar.org',
  rpcUrl: 'https://soroban-testnet.stellar.org', // Public testnet RPC
  network: Networks.TESTNET,
  // Placeholder Contract ID - in production, this would be retrieved from .env
  contractId: 'CD6VBN5E5E5E5E5E5E5E5E5E5E5E5E5E5E5E5E5E5E5E5E5E5E5E5E5E',

  getRpcServer: () => new rpc.Server('https://soroban-testnet.stellar.org'),
  getHorizonServer: () => new Horizon.Server('https://horizon-testnet.stellar.org'),

  checkFreighter: async () => {
    return await isConnected();
  },

  getWalletAddress: async () => {
    try {
      const result = await getAddress();
      return result.address;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return null;
    }
  },

  /**
   * Invokes a Soroban contract method (Mutation)
   */
  invokeContract: async (method: string, args: any[] = []) => {
    const address = await StellarService.getWalletAddress();
    if (!address) throw new Error('Wallet not connected');

    const server = StellarService.getRpcServer();
    const horizon = StellarService.getHorizonServer();
    
    // 1. Fetch account sequence
    const account = await horizon.loadAccount(address);
    
    // 2. Initialize contract instance
    const contract = new Contract(StellarService.contractId);
    
    // 3. Build the transaction call
    const tx = new TransactionBuilder(account, {
      fee: '1000',
      networkPassphrase: StellarService.network
    })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

    // 4. Simulate the transaction (Soroban Requirement)
    console.log(`[Soroban] Simulating ${method}...`);
    const simulation = await server.simulateTransaction(tx);
    
    if (rpc.Api.isSimulationError(simulation)) {
      throw new Error(`Simulation failed: ${simulation.error}`);
    }

    // 5. Assemble and Prepare for signing
    // assembleTransaction returns the ready-to-sign transaction
    const preparedTx = rpc.assembleTransaction(tx, simulation).build();
    
    // 6. Sign using Freighter
    const signedResult = await signTransaction(preparedTx.toXDR(), {
      networkPassphrase: StellarService.network
    });

    if (signedResult.error) {
      throw new Error(`Freighter Error: ${signedResult.error}`);
    }

    // 7. Submit to RPC
    const submission = await server.sendTransaction(TransactionBuilder.fromXDR(signedResult.signedTxXdr, StellarService.network));
    
    if (submission.status === 'ERROR') {
      throw new Error('Transaction submission failed');
    }

    return submission.hash;
  },

  /**
   * Records a medical record hash on the Soroban ledger
   */
  anchorRecordHash: async (patientAddr: string, ipfsHash: string, dataHash: string) => {
    // Mapping to Soroban ScVal types usually happens here
    // For this simulation, we describe the intended contract arguments:
    // [Address(patientAddr), String(ipfsHash), Bytes(dataHash)]
    console.log(`[Soroban] Invoking anchor_record_hash for patient: ${patientAddr}`);
    return await StellarService.invokeContract('anchor_record_hash', [
      new Address(patientAddr),
      ipfsHash,
      dataHash
    ]);
  },

  /**
   * Manages access control via the smart contract
   */
  grantAccess: async (doctorAddr: string, category: string, expiry: number) => {
    console.log(`[Soroban] Invoking grant_access for doctor: ${doctorAddr}`);
    return await StellarService.invokeContract('grant_access', [
      new Address(doctorAddr),
      category,
      expiry
    ]);
  }
};
