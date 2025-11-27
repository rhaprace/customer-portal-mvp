require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const { initializeDatabase, customerOps, sessionOps, messageOps } = require('./database');
const ServiceM8Client = require('./servicem8');
const mockData = require('./mockData');
const JobService = require('./jobService');
const { HTTP_STATUS, success, error, asyncHandler } = require('./responseHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initializeDatabase();

const servicem8ApiKey = process.env.SERVICEM8_API_KEY;
const useRealApi = servicem8ApiKey && servicem8ApiKey.trim() !== '';
const servicem8 = useRealApi ? new ServiceM8Client(servicem8ApiKey) : null;
const jobService = new JobService(servicem8, mockData, useRealApi);

console.log(`ServiceM8 API mode: ${useRealApi ? 'REAL API' : 'MOCK DATA'}`);

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return error(res, 'Access token required', HTTP_STATUS.UNAUTHORIZED);

  const session = sessionOps.findByToken(token);
  if (!session) return error(res, 'Invalid or expired token', HTTP_STATUS.FORBIDDEN);

  const customer = customerOps.findById(session.customer_id);
  if (!customer) return error(res, 'Customer not found', HTTP_STATUS.FORBIDDEN);

  req.customer = customer;
  next();
};

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, phone } = req.body;
  if (!email || !phone) return error(res, 'Email and phone are required', HTTP_STATUS.BAD_REQUEST);

  const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
  const normalizedEmail = email.toLowerCase().trim();

  let customer = customerOps.findByEmailAndPhone(normalizedEmail, normalizedPhone);

  if (!customer) {
    let companyData = useRealApi
      ? await servicem8.findCompanyByEmail(normalizedEmail).catch(() => null)
      : mockData.mockCompanies.find(c => c.email.toLowerCase() === normalizedEmail);

    if (!companyData) return error(res, 'Customer not found. Please contact support.', HTTP_STATUS.UNAUTHORIZED);

    const companyPhone = (companyData.phone || '').replace(/[\s\-\(\)]/g, '');
    if (companyPhone !== normalizedPhone) return error(res, 'Invalid email or phone number', HTTP_STATUS.UNAUTHORIZED);

    customerOps.upsert(uuidv4(), normalizedEmail, normalizedPhone, companyData.name, companyData.uuid);
    customer = customerOps.findByEmailAndPhone(normalizedEmail, normalizedPhone);
  }

  const token = uuidv4();
  sessionOps.create(uuidv4(), customer.id, token, new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

  success(res, { success: true, token, customer: { id: customer.id, email: customer.email, name: customer.name, companyUuid: customer.company_uuid } });
}));

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  sessionOps.deleteByToken(req.headers['authorization']?.split(' ')[1]);
  success(res, { success: true });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  success(res, { customer: { id: req.customer.id, email: req.customer.email, name: req.customer.name, companyUuid: req.customer.company_uuid } });
});

app.get('/api/jobs', authenticateToken, asyncHandler(async (req, res) => {
  const jobs = await jobService.getJobsByCompany(req.customer.company_uuid);
  success(res, { jobs });
}));

app.get('/api/jobs/:uuid', authenticateToken, asyncHandler(async (req, res) => {
  const job = await jobService.getAuthorizedJob(req.params.uuid, req.customer.company_uuid);
  if (!job) return error(res, 'Job not found or access denied', HTTP_STATUS.NOT_FOUND);
  success(res, { job });
}));

app.get('/api/jobs/:uuid/attachments', authenticateToken, asyncHandler(async (req, res) => {
  const job = await jobService.getAuthorizedJob(req.params.uuid, req.customer.company_uuid);
  if (!job) return error(res, 'Access denied', HTTP_STATUS.FORBIDDEN);
  const attachments = await jobService.getJobAttachments(req.params.uuid);
  success(res, { attachments });
}));

app.get('/api/jobs/:uuid/messages', authenticateToken, asyncHandler(async (req, res) => {
  const job = await jobService.getAuthorizedJob(req.params.uuid, req.customer.company_uuid);
  if (!job) return error(res, 'Access denied', HTTP_STATUS.FORBIDDEN);
  success(res, { messages: messageOps.findByJobUuid(req.params.uuid) });
}));

app.post('/api/jobs/:uuid/messages', authenticateToken, asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return error(res, 'Message content is required', HTTP_STATUS.BAD_REQUEST);

  const job = await jobService.getAuthorizedJob(req.params.uuid, req.customer.company_uuid);
  if (!job) return error(res, 'Access denied', HTTP_STATUS.FORBIDDEN);

  const messageId = uuidv4();
  messageOps.create(messageId, req.params.uuid, req.customer.id, content.trim(), 'customer');
  success(res, { message: messageOps.findById(messageId) }, HTTP_STATUS.CREATED);
}));

app.get('/api/jobs/:uuid/activities', authenticateToken, asyncHandler(async (req, res) => {
  const job = await jobService.getAuthorizedJob(req.params.uuid, req.customer.company_uuid);
  if (!job) return error(res, 'Access denied', HTTP_STATUS.FORBIDDEN);
  success(res, { activities: await jobService.getJobActivities(req.params.uuid) });
}));

app.get('/api/health', (_req, res) => {
  success(res, { status: 'ok', apiMode: useRealApi ? 'real' : 'mock', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
