'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { jobsApi, Job } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800';
    case 'quote':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function BookingsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data, error } = await jobsApi.getAll();
        if (data?.jobs) {
          setJobs(data.jobs);
        } else if (error) {
          setError(error);
        }
      } catch (err) {
        setError('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    }

    fetchJobs();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-black">
        No bookings found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Link
          key={job.uuid}
          href={`/dashboard/bookings/${job.uuid}`}
          className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {job.generated_job_id}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-black">
                  {job.job_description}
                </p>
                <p className="mt-2 text-sm text-black">
                  📍 {job.job_address}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm text-black">
                  {new Date(job.date).toLocaleDateString()}
                </p>
                {Number(job.total_invoice_amount) > 0 && (
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    ${Number(job.total_invoice_amount).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
            <p className="mt-1 text-sm text-black">
              View and manage your service bookings
            </p>
          </div>
          <BookingsList />
        </main>
      </div>
    </ProtectedRoute>
  );
}

