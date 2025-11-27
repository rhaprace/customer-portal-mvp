'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { jobsApi, Job } from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import StateHandler from '@/components/ui/StateHandler';
import StatusBadge from '@/components/ui/StatusBadge';

function BookingsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data, error } = await jobsApi.getAll();
        if (data?.jobs) setJobs(data.jobs);
        else if (error) setError(error);
      } catch {
        setError('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <StateHandler isLoading={isLoading} error={error} isEmpty={jobs.length === 0} emptyMessage="No bookings found.">
      <div className="space-y-4">
        {jobs.map((job) => (
          <Link key={job.uuid} href={`/dashboard/bookings/${job.uuid}`} className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-gray-900">{job.generated_job_id}</h3>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="mt-1 text-sm text-black">{job.job_description}</p>
                  <p className="mt-2 text-sm text-black">📍 {job.job_address}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm text-black">{new Date(job.date).toLocaleDateString()}</p>
                  {Number(job.total_invoice_amount) > 0 && (
                    <p className="mt-1 text-lg font-semibold text-gray-900">${Number(job.total_invoice_amount).toFixed(2)}</p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </StateHandler>
  );
}

export default function DashboardPage() {
  return (
    <PageLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <p className="mt-1 text-sm text-black">View and manage your service bookings</p>
      </div>
      <BookingsList />
    </PageLayout>
  );
}

