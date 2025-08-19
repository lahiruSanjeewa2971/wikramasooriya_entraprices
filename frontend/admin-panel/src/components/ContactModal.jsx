import { useState, useEffect } from 'react';

export default function ContactModal({ contact, onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    status: 'unread',
    admin_notes: '',
  });

  // Update form data when contact changes
  useEffect(() => {
    if (contact) {
      setFormData({
        status: contact.status || 'unread',
        admin_notes: contact.admin_notes || '',
      });
    } else {
      setFormData({
        status: 'unread',
        admin_notes: '',
      });
    }
  }, [contact]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (contact) {
      onSubmit(contact.id, formData);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {contact ? 'Update Contact' : 'Create Contact'}
          </h3>
          
          {contact && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>From:</strong> {contact.name} ({contact.email})</p>
                <p><strong>Subject:</strong> {contact.title}</p>
                <p><strong>Message:</strong> {contact.message}</p>
                <p><strong>Date:</strong> {new Date(contact.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Admin Notes
              </label>
              <textarea
                value={formData.admin_notes}
                onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                rows="4"
                placeholder="Add admin notes or reply message..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : (contact ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
