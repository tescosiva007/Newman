import React from 'react'
import { X, Calendar, User } from 'lucide-react'

interface Message {
  id: string
  title: string
  body: string
  created_at: string
  user_id: string
  stores: any[]
  store_selection_type: string
}

interface MessageModalProps {
  message: Message
  onClose: () => void
}

const MessageModal: React.FC<MessageModalProps> = ({ message, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Message Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">{message.title}</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(message.created_at)}
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                ID: {message.id.substring(0, 8)}...
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Target Stores</h5>
            <div className="bg-gray-50 rounded-lg p-4">
              {message.store_selection_type === 'all' ? (
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    All Stores ({message.stores?.length || 0} stores)
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {(message.stores || []).map((store: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                      <div>
                        <div className="font-medium text-gray-900">{store.name || `Store ${store.code}`}</div>
                        <div className="text-sm text-gray-500">{store.code}</div>
                      </div>
                      {store.manual && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Manual Entry
                        </span>
                      )}
                    </div>
                  ))}
                  {(message.stores || []).length === 0 && (
                    <p className="text-gray-500 italic">No stores selected</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Message Body</h5>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{message.body}</p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default MessageModal