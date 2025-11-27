'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobsApi, Job, Attachment, Message } from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import StateHandler from '@/components/ui/StateHandler';
import StatusBadge from '@/components/ui/StatusBadge';

function AttachmentsList({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) {
    return <p className="text-black text-sm">No attachments</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {attachments.map((attachment) => (
        <div key={attachment.uuid} className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {attachment.file_type?.includes('image') ? (
                <span className="text-2xl">🖼️</span>
              ) : (
                <span className="text-2xl">📄</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachment.attachment_name}
              </p>
              <p className="text-xs text-black">
                {new Date(attachment.created_date).toLocaleDateString()}
              </p>
            </div>
            {attachment.file_url && (
              <a
                href={attachment.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MessagesSection({ jobUuid }: { jobUuid: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function fetchMessages() {
      const { data } = await jobsApi.getMessages(jobUuid);
      if (data?.messages) {
        setMessages(data.messages);
      }
      setIsLoading(false);
    }
    fetchMessages();
  }, [jobUuid]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const { data } = await jobsApi.sendMessage(jobUuid, newMessage);
      if (data?.message) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage('');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-t-lg">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-black py-4">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_type === 'customer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.sender_type === 'customer' ? 'text-blue-100' : 'text-black'}`}>
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSend} className="flex space-x-2 p-3 bg-white border-t rounded-b-lg">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isSending || !newMessage.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

function BookingDetail() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const [job, setJob] = useState<Job | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobRes, attachRes] = await Promise.all([
          jobsApi.getById(uuid),
          jobsApi.getAttachments(uuid),
        ]);

        if (jobRes.error) {
          setError(jobRes.error);
          return;
        }

        if (jobRes.data?.job) {
          setJob(jobRes.data.job);
        }
        if (attachRes.data?.attachments) {
          setAttachments(attachRes.data.attachments);
        }
      } catch {
        setError('Failed to load booking');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [uuid]);

  return (
    <StateHandler isLoading={isLoading} error={error || (!job ? 'Booking not found' : '')}>
      {job && (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
      >
        <span>←</span>
        <span>Back to Bookings</span>
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">{job.generated_job_id}</h2>
              <StatusBadge status={job.status} size="md" />
            </div>
            <p className="mt-1 text-black">{job.job_description}</p>
          </div>
          {Number(job.total_invoice_amount) > 0 && (
            <div className="text-right">
              <p className="text-sm text-black">Total</p>
              <p className="text-2xl font-bold text-gray-900">${Number(job.total_invoice_amount).toFixed(2)}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-b">
          <div>
            <p className="text-sm text-black">Address</p>
            <p className="font-medium text-black">{job.job_address}</p>
          </div>
          <div>
            <p className="text-sm text-black">Date</p>
            <p className="font-medium text-black">{new Date(job.date).toLocaleDateString()}</p>
          </div>
        </div>

        {job.work_done_description && (
          <div className="mt-4">
            <p className="text-sm text-black">Work Completed</p>
            <p className="mt-1 text-black">{job.work_done_description}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Attachments</h3>
          <AttachmentsList attachments={attachments} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Messages</h3>
          <MessagesSection jobUuid={uuid} />
        </div>
      </div>
    </div>
      )}
    </StateHandler>
  );
}

export default function BookingDetailPage() {
  return (
    <PageLayout>
      <BookingDetail />
    </PageLayout>
  );
}
