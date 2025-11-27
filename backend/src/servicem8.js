const axios = require('axios');

const SERVICEM8_API_BASE = 'https://api.servicem8.com/api_1.0';

class ServiceM8Client {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: SERVICEM8_API_BASE,
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async getJobs() {
    try {
      const response = await this.client.get('/job.json');
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs from ServiceM8:', error.message);
      throw error;
    }
  }

  async getJob(uuid) {
    try {
      const response = await this.client.get(`/job/${uuid}.json`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job ${uuid} from ServiceM8:`, error.message);
      throw error;
    }
  }

  async getJobsByCompany(companyUuid) {
    try {
      const response = await this.client.get('/job.json', {
        params: {
          '$filter': `company_uuid eq '${companyUuid}'`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching jobs for company ${companyUuid}:`, error.message);
      throw error;
    }
  }

  async getCompanies() {
    try {
      const response = await this.client.get('/company.json');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies from ServiceM8:', error.message);
      throw error;
    }
  }

  async getCompany(uuid) {
    try {
      const response = await this.client.get(`/company/${uuid}.json`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching company ${uuid} from ServiceM8:`, error.message);
      throw error;
    }
  }

  async findCompanyByEmail(email) {
    try {
      const contactResponse = await this.client.get('/companycontact.json', {
        params: {
          '$filter': `email eq '${email}'`
        }
      });

      if (contactResponse.data && contactResponse.data.length > 0) {
        const contact = contactResponse.data[0];
        const companyResponse = await this.client.get(`/company/${contact.company_uuid}.json`);
        if (companyResponse.data) {
          return {
            ...companyResponse.data,
            email: contact.email,
            phone: contact.mobile || contact.phone || ''
          };
        }
      }    
      const response = await this.client.get('/company.json', {
        params: {
          '$filter': `email eq '${email}'`
        }
      });
      return response.data[0] || null;
    } catch (error) {
      console.error(`Error finding company by email ${email}:`, error.message);
      throw error;
    }
  }

  async getJobAttachments(jobUuid) {
    try {
      const response = await this.client.get('/attachment.json', {
        params: {
          '$filter': `related_object_uuid eq '${jobUuid}'`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching attachments for job ${jobUuid}:`, error.message);
      throw error;
    }
  }

  async getAttachment(uuid) {
    try {
      const response = await this.client.get(`/attachment/${uuid}.json`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching attachment ${uuid}:`, error.message);
      throw error;
    }
  }

  async getJobActivities(jobUuid) {
    try {
      const response = await this.client.get('/jobactivity.json', {
        params: {
          '$filter': `job_uuid eq '${jobUuid}'`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching activities for job ${jobUuid}:`, error.message);
      throw error;
    }
  }

  async getJobNotes(jobUuid) {
    try {
      const response = await this.client.get('/note.json', {
        params: {
          '$filter': `related_object_uuid eq '${jobUuid}'`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching notes for job ${jobUuid}:`, error.message);
      throw error;
    }
  }
}

module.exports = ServiceM8Client;
