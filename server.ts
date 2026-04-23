import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { v4 as uuidv4 } from "uuid";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory "Blockchain" and "Off-chain Meta" store for the prototype
  const db = {
    users: [
      { address: "G-HOSPITAL-CITY-CENTRAL", role: "HOSPITAL", name: "City Central General" },
      { address: "G-PATIENT-JOHN-DOE", role: "PATIENT", name: "John Doe" },
      { address: "G-DOCTOR-SMITH-SURGEON", role: "DOCTOR", name: "Dr. Smith (Surgeon)" },
    ] as any[],
    records: [
      { 
        id: "rec-1", 
        title: "Initial Health Screening", 
        category: "GENERAL", 
        patientAddress: "G-PATIENT-JOHN-DOE", 
        hospitalAddress: "G-HOSPITAL-CITY-CENTRAL", 
        ipfsHash: "QmXoyp...1a2b3c", 
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString() 
      },
      { 
        id: "rec-2", 
        title: "Blood Panel Results", 
        category: "LAB_REPORT", 
        patientAddress: "G-PATIENT-JOHN-DOE", 
        hospitalAddress: "G-HOSPITAL-CITY-CENTRAL", 
        ipfsHash: "QmYzp...4d5e6f", 
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString() 
      },
    ] as any[],
    permissions: [
      {
        id: "perm-1",
        patientAddress: "G-PATIENT-JOHN-DOE",
        doctorAddress: "G-DOCTOR-SMITH-SURGEON",
        category: "ALL",
        expiryTimestamp: new Date(Date.now() + 3600000).toISOString(),
        grantedAt: new Date().toISOString()
      }
    ] as any[],
    auditLogs: [
      { id: "log-1", action: 'UPLOAD', actorAddress: 'G-HOSPITAL-CITY-CENTRAL', targetAddress: 'G-PATIENT-JOHN-DOE', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: "log-2", action: 'GRANT_ACCESS', actorAddress: 'G-PATIENT-JOHN-DOE', targetAddress: 'G-DOCTOR-SMITH-SURGEON', timestamp: new Date().toISOString() },
    ] as any[],
    accessRequests: [] as any[],
    notifications: [] as any[],
  };

  // API Routes
  app.get("/api/notifications/:address", (req, res) => {
    const userNotifications = db.notifications.filter(n => n.recipientAddress === req.params.address);
    res.json(userNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  });

  app.post("/api/notifications/read/:id", (req, res) => {
    const n = db.notifications.find(n => n.id === req.params.id);
    if (n) n.read = true;
    res.json({ success: true });
  });

  app.get("/api/users/:address", (req, res) => {
    const user = db.users.find(u => u.address === req.params.address);
    res.json(user || null);
  });

  app.post("/api/users", (req, res) => {
    const { address, role, name } = req.body;
    const existing = db.users.find(u => u.address === address);
    if (existing) {
      existing.role = role;
      existing.name = name;
      return res.json(existing);
    }
    const newUser = { address, role, name };
    db.users.push(newUser);
    res.json(newUser);
  });

  // Records
  app.get("/api/records/patient/:address", (req, res) => {
    const searchingAddress = req.params.address.toUpperCase();
    const records = db.records.filter(r => r.patientAddress.toUpperCase() === searchingAddress);
    res.json(records);
  });

  app.post("/api/records", (req, res) => {
    const record = { 
      ...req.body, 
      id: uuidv4(), 
      timestamp: new Date().toISOString(),
      patientAddress: req.body.patientAddress.toUpperCase(),
      hospitalAddress: req.body.hospitalAddress.toUpperCase()
    };
    db.records.push(record);
    
    // Auto-log
    db.auditLogs.push({
      id: uuidv4(),
      recordId: record.id,
      action: 'UPLOAD',
      actorAddress: record.hospitalAddress,
      targetAddress: record.patientAddress,
      timestamp: record.timestamp
    });

    // Notify Patient
    db.notifications.push({
      id: uuidv4(),
      recipientAddress: record.patientAddress,
      title: 'New Medical Record',
      message: `Hospital ${record.hospitalAddress} has uploaded a new ${record.category} record: ${record.title}`,
      type: 'RECORD',
      read: false,
      timestamp: record.timestamp
    });
    
    res.json(record);
  });

  // Permissions
  app.get("/api/permissions/patient/all", (req, res) => {
    res.json(db.permissions);
  });

  app.get("/api/permissions/patient/:address", (req, res) => {
    const searchingAddress = req.params.address.toUpperCase();
    const perms = db.permissions.filter(p => p.patientAddress.toUpperCase() === searchingAddress);
    res.json(perms);
  });

  app.post("/api/permissions", (req, res) => {
    const perm = { 
      ...req.body, 
      id: uuidv4(), 
      grantedAt: new Date().toISOString(),
      patientAddress: req.body.patientAddress.toUpperCase(),
      doctorAddress: req.body.doctorAddress.toUpperCase()
    };
    db.permissions.push(perm);

    db.auditLogs.push({
      id: uuidv4(),
      action: 'GRANT_ACCESS',
      actorAddress: perm.patientAddress,
      targetAddress: perm.doctorAddress,
      timestamp: perm.grantedAt
    });

    // Notify Doctor
    db.notifications.push({
      id: uuidv4(),
      recipientAddress: perm.doctorAddress,
      title: 'New Patient Access',
      message: `Patient ${perm.patientAddress} has granted you ${perm.category} access. Review is required.`,
      type: 'ACCESS',
      read: false,
      timestamp: perm.grantedAt
    });

    res.json(perm);
  });

  app.delete("/api/permissions/:id", (req, res) => {
    const index = db.permissions.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      const perm = db.permissions[index];
      db.permissions.splice(index, 1);
      
      db.auditLogs.push({
        id: uuidv4(),
        action: 'REVOKE_ACCESS',
        actorAddress: perm.patientAddress,
        targetAddress: perm.doctorAddress,
        timestamp: new Date().toISOString()
      });
    }
    res.json({ success: true });
  });

  // Access Requests
  app.get("/api/requests/doctor/:address", (req, res) => {
    res.json(db.accessRequests.filter(r => r.doctorAddress === req.params.address));
  });

  app.get("/api/requests/patient/:address", (req, res) => {
    res.json(db.accessRequests.filter(r => r.patientAddress === req.params.address));
  });

  app.post("/api/requests", (req, res) => {
    const request = { ...req.body, id: uuidv4(), status: 'PENDING', timestamp: new Date().toISOString() };
    db.accessRequests.push(request);
    res.json(request);
  });

  // Logs
  app.get("/api/logs/:address", (req, res) => {
    const searchingAddress = req.params.address.toUpperCase();
    const logs = db.auditLogs.filter(l => 
      l.actorAddress.toUpperCase() === searchingAddress || 
      l.targetAddress.toUpperCase() === searchingAddress
    );
    res.json(logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
