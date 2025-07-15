import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Store, List, Globe, X } from 'lucide-react'

interface Store {
  id: string
  name: string
  code: string
}

const CreateMessage: React.FC = () => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [storeMode, setStoreMode] = useState<'manual' | 'select' | 'all' | null>(null)
  const [manualStores, setManualStores] = useState('')
  const [availableStores, setAvailableStores] = useState<Store[]>([])
  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      console.log('Fetching stores...')
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name')

      console.log('Stores response:', { data, error })

      if (error) {
        console.error('Error fetching stores:', error)
      } else {
        setAvailableStores(data || [])
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title || !body) {
      setError('Please fill in all required fields')
      return
    }

    if (!storeMode) {
      setError('Please select a store option')
      return
    }

    if (storeMode === 'manual' && !manualStores.trim()) {
      setError('Please enter store codes')
      return
    }

    if (storeMode === 'select' && selectedStores.length === 0) {
      setError('Please select at least one store')
      return
    }

    setLoading(true)

    // Prepare stores data based on selection type
    let storesData: any[] = []
    
    if (storeMode === 'all') {
      storesData = availableStores.map(store => ({
        id: store.id,
        name: store.name,
        code: store.code
      }))
    } else if (storeMode === 'select') {
      storesData = selectedStores.map(storeId => {
        const store = availableStores.find(s => s.id === storeId)
        return {
          id: store?.id,
          name: store?.name,
          code: store?.code
        }
      }).filter(store => store.id) // Remove any undefined stores
    } else if (storeMode === 'manual') {
      // Parse manual store codes
      const storeCodes = manualStores.split(',').map(code => code.trim()).filter(code => code)
      storesData = storeCodes.map(code => ({
        code: code,
        name: `Store ${code}`, // Default name for manual entries
        manual: true
      }))
    }
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            title,
            body,
            user_id: user?.id,
            stores: storesData,
            store_selection_type: storeMode
          }
        ])

      if (error) {
        setError('Failed to create message')
        console.error('Error creating message:', error)
      } else {
        console.log('Message created successfully with stores:', storesData)
        navigate('/messages')
      }
    } catch (error) {
      setError('Failed to create message')
      console.error('Error creating message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStoreToggle = (storeId: string) => {
    setSelectedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    )
  }

  const getSelectedStoreNames = () => {
    if (storeMode === 'all') return 'All stores'
    if (storeMode === 'manual') return manualStores
    if (storeMode === 'select') {
      const names = selectedStores.map(id => 
        availableStores.find(store => store.id === id)?.name
      ).filter(Boolean)
      return names.join(', ')
    }
    return ''
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/messages')}
          className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Messages
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Message</h1>
          <p className="mt-1 text-sm text-gray-600">
            Compose and send a message to selected stores
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Message Details</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Subject *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter message subject"
                required
              />
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                Message Body *
              </label>
              <textarea
                id="body"
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your message"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Store Selection</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setStoreMode('manual')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  storeMode === 'manual' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Store className="h-6 w-6 mb-2" />
                <h3 className="font-medium">Enter Store List</h3>
                <p className="text-sm text-gray-600">Manually enter store codes</p>
              </button>

              <button
                type="button"
                onClick={() => setStoreMode('select')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  storeMode === 'select' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <List className="h-6 w-6 mb-2" />
                <h3 className="font-medium">Choose from List</h3>
                <p className="text-sm text-gray-600">Select from available stores</p>
              </button>

              <button
                type="button"
                onClick={() => setStoreMode('all')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  storeMode === 'all' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Globe className="h-6 w-6 mb-2" />
                <h3 className="font-medium">Send to All</h3>
                <p className="text-sm text-gray-600">Broadcast to all stores</p>
              </button>
            </div>

            {storeMode === 'manual' && (
              <div>
                <label htmlFor="manualStores" className="block text-sm font-medium text-gray-700">
                  Enter Store Codes
                </label>
                <textarea
                  id="manualStores"
                  rows={3}
                  value={manualStores}
                  onChange={(e) => setManualStores(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter store codes separated by commas (e.g., DT001, ML002, AB003)"
                />
              </div>
            )}

            {storeMode === 'select' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Stores
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md">
                  {availableStores.map((store) => (
                    <label
                      key={store.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStores.includes(store.id)}
                        onChange={() => handleStoreToggle(store.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{store.name}</div>
                        <div className="text-sm text-gray-500">{store.code}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {storeMode && (
              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Stores:</h4>
                <p className="text-sm text-gray-900">{getSelectedStoreNames()}</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <X className="h-5 w-5 text-red-400 mr-2" />
              <div className="text-sm text-red-600">{error}</div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/messages')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Message'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateMessage