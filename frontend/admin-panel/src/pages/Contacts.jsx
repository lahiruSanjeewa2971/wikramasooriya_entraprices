import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MessageSquare } from 'lucide-react';
import adminService from '../services/adminService';

export default function Contacts() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: contactsData, isLoading } = useQuery({
    queryKey: ['admin-contacts', searchTerm],
    queryFn: () => adminService.getContacts({ search: searchTerm }),
  });

  const contacts = contactsData?.data?.contacts || [];
  console.log('Contacts:', contacts);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Messages</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage customer contact form submissions
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Messages
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No contacts</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No contact messages found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {contact.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {contact.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Subject: {contact.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {contact.message}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
