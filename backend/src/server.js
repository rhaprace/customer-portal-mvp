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
const { mockCompanies, mockJobs, mockAttachments, mockJobActivities } = require('./mockData');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initializeDatabase();

const servicem8ApiKey = process.env.SERVICEM8_API_KEY;
const useRealApi = servicem8ApiKey && servicem8ApiKey.trim() !== '';
const servicem8 = useRealApi ? new ServiceM8Client(servicem8ApiKey) : null;

console.log(`ServiceM8 API mode: ${useRealApi ? 'REAL API' : 'MOCK DATA'}`);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const session = sessionOps.findByToken(token);
  if (!session) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  const customer = customerOps.findById(session.customer_id);
  if (!customer) {
    return res.status(403).json({ error: 'Customer not found' });
  }

  req.customer = customer;
  next();
};

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ error: 'Email and phone are required' });
    }

    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    const normalizedEmail = email.toLowerCase().trim();

    let customer = customerOps.findByEmailAndPhone(normalizedEmail, normalizedPhone);
    let companyData = null;

    if (!customer) {
      if (useRealApi) {
        try {
          companyData = await servicem8.findCompanyByEmail(normalizedEmail);
        } catch (error) {
          console.error('ServiceM8 API error:', error.message);
        }
      } else {
        companyData = mockCompanies.find(c => c.email.toLowerCase() === normalizedEmail);
      }

      if (companyData) {
        const companyPhone = (companyData.phone || '').replace(/[\s\-\(\)]/g, '');
        if (companyPhone !== normalizedPhone) {
          return res.status(401).json({ error: 'Invalid email or phone number' });
        }

        const customerId = uuidv4();
        customerOps.upsert(customerId, normalizedEmail, normalizedPhone, companyData.name, companyData.uuid);
        customer = customerOps.findByEmailAndPhone(normalizedEmail, normalizedPhone);
      } else {
        return res.status(401).json({ error: 'Customer not found. Please contact support.' });
      }
    }

    const token = uuidv4();
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    sessionOps.create(sessionId, customer.id, token, expiresAt);

    res.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        companyUuid: customer.company_uuid
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  sessionOps.deleteByToken(token);
  res.json({ success: true });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    customer: {
      id: req.customer.id,
      email: req.customer.email,
      name: req.customer.name,
      companyUuid: req.customer.company_uuid
    }
  });
});

app.get('/api/jobs', authenticateToken, async (req, res) => {
  try {
    const companyUuid = req.customer.company_uuid;
    let jobs;

    if (useRealApi) {
      jobs = await servicem8.getJobsByCompany(companyUuid);
    } else {
      jobs = mockJobs.filter(j => j.company_uuid === companyUuid);
    }

    res.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/api/jobs/:uuid', authenticateToken, async (req, res) => {
  try {
    const { uuid } = req.params;
    const companyUuid = req.customer.company_uuid;
    let job;

    if (useRealApi) {
      job = await servicem8.getJob(uuid);
    } else {
      job = mockJobs.find(j => j.uuid === uuid);
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.company_uuid !== companyUuid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

app.get('/api/jobs/:uuid/attachments', authenticateToken, async (req, res) => {
  try {
    const { uuid } = req.params;
    const companyUuid = req.customer.company_uuid;

    let job;
    if (useRealApi) {
      job = await servicem8.getJob(uuid);
    } else {
      job = mockJobs.find(j => j.uuid === uuid);
    }

    if (!job || job.company_uuid !== companyUuid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let attachments;
    if (useRealApi) {
      attachments = await servicem8.getJobAttachments(uuid);
    } else {
      attachments = mockAttachments.filter(a => a.related_object_uuid === uuid);
    }

    res.json({ attachments });
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
});

app.get('/api/jobs/:uuid/messages', authenticateToken, async (req, res) => {
  try {
    const { uuid } = req.params;
    const companyUuid = req.customer.company_uuid;

    let job;
    if (useRealApi) {
      job = await servicem8.getJob(uuid);
    } else {
      job = mockJobs.find(j => j.uuid === uuid);
    }

    if (!job || job.company_uuid !== companyUuid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = messageOps.findByJobUuid(uuid);
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/jobs/:uuid/messages', authenticateToken, async (req, res) => {
  try {
    const { uuid } = req.params;
    const { content } = req.body;
    const companyUuid = req.customer.company_uuid;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    let job;
    if (useRealApi) {
      job = await servicem8.getJob(uuid);
    } else {
      job = mockJobs.find(j => j.uuid === uuid);
    }

    if (!job || job.company_uuid !== companyUuid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messageId = uuidv4();
    messageOps.create(messageId, uuid, req.customer.id, content.trim(), 'customer');

    const message = messageOps.findById(messageId);
    res.status(201).json({ message });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

app.get('/api/jobs/:uuid/activities', authenticateToken, async (req, res) => {
  try {
    const { uuid } = req.params;
    const companyUuid = req.customer.company_uuid;

    let job;
    if (useRealApi) {
      job = await servicem8.getJob(uuid);
    } else {
      job = mockJobs.find(j => j.uuid === uuid);
    }

    if (!job || job.company_uuid !== companyUuid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let activities;
    if (useRealApi) {
      activities = await servicem8.getJobActivities(uuid);
    } else {
      activities = mockJobActivities.filter(a => a.job_uuid === uuid);
    }

    res.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    apiMode: useRealApi ? 'real' : 'mock',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
