const mockCompanies = [
  {
    uuid: 'company-001',
    name: 'Smith Residence',
    email: 'john.smith@example.com',
    phone: '0412345678',
    address: '123 Main Street, Sydney NSW 2000',
    active: 1
  },
  {
    uuid: 'company-002',
    name: 'Johnson Family',
    email: 'sarah.johnson@example.com',
    phone: '0498765432',
    address: '456 Oak Avenue, Melbourne VIC 3000',
    active: 1
  },
  {
    uuid: 'company-003',
    name: 'Williams Corp',
    email: 'mike.williams@example.com',
    phone: '0423456789',
    address: '789 Business Park, Brisbane QLD 4000',
    active: 1
  }
];

const mockJobs = [
  {
    uuid: 'job-001',
    company_uuid: 'company-001',
    job_address: '123 Main Street, Sydney NSW 2000',
    status: 'Completed',
    job_description: 'Annual air conditioning service and filter replacement',
    generated_job_id: 'JOB-2024-001',
    date: '2024-11-20',
    total_invoice_amount: 350.00,
    work_done_description: 'Serviced split system AC unit. Replaced filters and cleaned coils.',
    category_uuid: 'cat-hvac'
  },
  {
    uuid: 'job-002',
    company_uuid: 'company-001',
    job_address: '123 Main Street, Sydney NSW 2000',
    status: 'Scheduled',
    job_description: 'Ducted heating system inspection and repair',
    generated_job_id: 'JOB-2024-002',
    date: '2024-12-05',
    total_invoice_amount: 0,
    work_done_description: '',
    category_uuid: 'cat-hvac'
  },
  {
    uuid: 'job-003',
    company_uuid: 'company-002',
    job_address: '456 Oak Avenue, Melbourne VIC 3000',
    status: 'In Progress',
    job_description: 'Kitchen renovation - electrical and plumbing',
    generated_job_id: 'JOB-2024-003',
    date: '2024-11-25',
    total_invoice_amount: 2500.00,
    work_done_description: 'Completed electrical wiring. Plumbing work in progress.',
    category_uuid: 'cat-renovation'
  },
  {
    uuid: 'job-004',
    company_uuid: 'company-002',
    job_address: '456 Oak Avenue, Melbourne VIC 3000',
    status: 'Quote',
    job_description: 'Bathroom waterproofing and tiling',
    generated_job_id: 'JOB-2024-004',
    date: '2024-12-10',
    total_invoice_amount: 1800.00,
    work_done_description: '',
    category_uuid: 'cat-renovation'
  },
  {
    uuid: 'job-005',
    company_uuid: 'company-003',
    job_address: '789 Business Park, Brisbane QLD 4000',
    status: 'Completed',
    job_description: 'Commercial CCTV installation - 8 cameras',
    generated_job_id: 'JOB-2024-005',
    date: '2024-11-15',
    total_invoice_amount: 4200.00,
    work_done_description: 'Installed 8 HD cameras with DVR system and remote access.',
    category_uuid: 'cat-security'
  }
];

const mockAttachments = [
  {
    uuid: 'attach-001',
    related_object_uuid: 'job-001',
    file_type: 'image/jpeg',
    attachment_name: 'before_service.jpg',
    attachment_source: 'photo',
    created_date: '2024-11-20T09:00:00Z',
    file_url: 'https://placehold.co/600x400/png?text=Before+Service'
  },
  {
    uuid: 'attach-002',
    related_object_uuid: 'job-001',
    file_type: 'image/jpeg',
    attachment_name: 'after_service.jpg',
    attachment_source: 'photo',
    created_date: '2024-11-20T11:00:00Z',
    file_url: 'https://placehold.co/600x400/png?text=After+Service'
  },
  {
    uuid: 'attach-003',
    related_object_uuid: 'job-001',
    file_type: 'application/pdf',
    attachment_name: 'invoice_JOB-2024-001.pdf',
    attachment_source: 'document',
    created_date: '2024-11-20T12:00:00Z',
    file_url: 'https://example.com/invoice.pdf'
  },
  {
    uuid: 'attach-004',
    related_object_uuid: 'job-003',
    file_type: 'image/jpeg',
    attachment_name: 'kitchen_progress.jpg',
    attachment_source: 'photo',
    created_date: '2024-11-25T14:00:00Z',
    file_url: 'https://placehold.co/600x400/png?text=Kitchen+Progress'
  },
  {
    uuid: 'attach-005',
    related_object_uuid: 'job-005',
    file_type: 'application/pdf',
    attachment_name: 'cctv_layout.pdf',
    attachment_source: 'document',
    created_date: '2024-11-15T08:00:00Z',
    file_url: 'https://example.com/cctv_layout.pdf'
  },
  {
    uuid: 'attach-006',
    related_object_uuid: 'job-005',
    file_type: 'image/jpeg',
    attachment_name: 'camera_positions.jpg',
    attachment_source: 'photo',
    created_date: '2024-11-15T16:00:00Z',
    file_url: 'https://placehold.co/600x400/png?text=Camera+Positions'
  }
];

const mockJobActivities = [
  {
    uuid: 'activity-001',
    job_uuid: 'job-002',
    activity_was_scheduled: 1,
    start_date: '2024-12-05T09:00:00Z',
    end_date: '2024-12-05T12:00:00Z',
    staff_uuid: 'staff-001'
  },
  {
    uuid: 'activity-002',
    job_uuid: 'job-003',
    activity_was_scheduled: 1,
    start_date: '2024-11-25T08:00:00Z',
    end_date: '2024-11-25T17:00:00Z',
    staff_uuid: 'staff-002'
  }
];

module.exports = {
  mockCompanies,
  mockJobs,
  mockAttachments,
  mockJobActivities
};
