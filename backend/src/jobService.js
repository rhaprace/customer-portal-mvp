class JobService {
  constructor(servicem8Client, mockData, useRealApi) {
    this.servicem8 = servicem8Client;
    this.mockJobs = mockData.mockJobs;
    this.mockAttachments = mockData.mockAttachments;
    this.mockJobActivities = mockData.mockJobActivities;
    this.useRealApi = useRealApi;
  }

  async getJobsByCompany(companyUuid) {
    if (this.useRealApi) {
      return this.servicem8.getJobsByCompany(companyUuid);
    }
    return this.mockJobs.filter(j => j.company_uuid === companyUuid);
  }

  async getJob(uuid) {
    if (this.useRealApi) {
      return this.servicem8.getJob(uuid);
    }
    return this.mockJobs.find(j => j.uuid === uuid) || null;
  }

  async getJobAttachments(jobUuid) {
    if (this.useRealApi) {
      return this.servicem8.getJobAttachments(jobUuid);
    }
    return this.mockAttachments.filter(a => a.related_object_uuid === jobUuid);
  }

  async getJobActivities(jobUuid) {
    if (this.useRealApi) {
      return this.servicem8.getJobActivities(jobUuid);
    }
    return this.mockJobActivities.filter(a => a.job_uuid === jobUuid);
  }
  async getAuthorizedJob(jobUuid, companyUuid) {
    const job = await this.getJob(jobUuid);
    if (!job || job.company_uuid !== companyUuid) {
      return null;
    }
    return job;
  }
}

module.exports = JobService;

