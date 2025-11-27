'use client';

interface StateHandlerProps {
  isLoading: boolean;
  error?: string;
  children: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export default function StateHandler({ 
  isLoading, 
  error, 
  children, 
  emptyMessage = 'No data found.',
  isEmpty = false 
}: StateHandlerProps) {
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

  if (isEmpty) {
    return <div className="text-center py-12 text-black">{emptyMessage}</div>;
  }

  return <>{children}</>;
}

