import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

type NoticeType = 'important' | 'warning' | 'reminder';

interface Notice {
  id: string;
  title: string;
  date: string;
  type: NoticeType;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

const NoticeBoard = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notices?where[isActive][equals]=true&sort=-date');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notices');
      }
      
      const data = await response.json();
      setNotices(data.docs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTypeBadgeStyles = (type: NoticeType) => {
    switch (type) {
      case 'important':
        return 'bg-red-900/40 text-red-400 border border-red-800/50';
      case 'warning':
        return 'bg-orange-900/40 text-orange-400 border border-orange-800/50';
      case 'reminder':
        return 'bg-green-900/40 text-green-400 border border-green-800/50';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/50 rounded-2xl border border-slate-800/50 shadow-2xl p-6">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <p className="text-slate-400">Loading notices...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/50 rounded-2xl border border-slate-800/50 shadow-2xl p-6">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/50 rounded-2xl border border-slate-800/50 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="text-orange-500" size={28} />
            <h1 className="text-2xl font-bold text-white">Notice Board</h1>
          </div>
          <p className="text-slate-400 text-sm">Important announcements and updates</p>
        </div>
        
        {notices.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-500">No notices available at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="p-6 hover:bg-slate-800/30 transition-colors duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">{notice.title}</h3>
                    {notice.description && (
                      <p className="text-slate-400 text-sm mb-2">{notice.description}</p>
                    )}
                    <p className="text-slate-500 text-sm">{formatDate(notice.date)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTypeBadgeStyles(notice.type)}`}>
                    {notice.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;