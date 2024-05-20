import { useEffect, useState, Fragment } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Menu, Transition } from '@headlessui/react'

interface DataRow {
  id: number
  name: string
  age: number
  birthday: string
  profile_picture: string
  [key: string]: any; // 动态添加新列
}

const DataTable = () => {
  const [data, setData] = useState<DataRow[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [isEditing, setIsEditing] = useState<null | number>(null)
  const [editedData, setEditedData] = useState<Partial<DataRow>>({})
  const [newData, setNewData] = useState<Partial<DataRow>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [file, setFile] = useState<File | null>(null)
  const [showImage, setShowImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('realtime:public:Example')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Example' }, (payload: any) => {
        console.log('Change received!', payload)
        setData(prevData => {
          const newData = [...prevData]
          if (payload.eventType === 'INSERT') {
            newData.push(payload.new)
          } else if (payload.eventType === 'UPDATE') {
            const index = newData.findIndex(row => row.id === payload.old.id)
            if (index !== -1) newData[index] = payload.new
          } else if (payload.eventType === 'DELETE') {
            const index = newData.findIndex(row => row.id === payload.old.id)
            if (index !== -1) newData.splice(index, 1)
          }
          return newData
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchData = async () => {
    const { data: tableData, error } = await supabase
      .from('Example')
      .select('*')

    if (error) {
      console.error('Error fetching data:', error.message)
    } else {
      setData(tableData || [])
      setTotalPages(Math.ceil((tableData?.length || 0) / pageSize))
    }
  }

  const handleEdit = (id: number) => {
    setIsEditing(id)
    const rowData = data.find(row => row.id === id)
    setEditedData(rowData || {})
    setFile(null) // 清除文件
  }

  const handleSave = async (id: number) => {
    setLoading(true)
    if (file) {
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(`public/${file.name}`, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError.message)
        setLoading(false)
        return
      }

      if (uploadData) {
        editedData.profile_picture = uploadData.path
      }
    }

    const { error } = await supabase
      .from('Example')
      .update(editedData)
      .eq('id', id)

    if (error) {
      console.error('Error updating data:', error.message)
    } else {
      setData(prevData => prevData.map(row => (row.id === id ? { ...row, ...editedData } : row)))
      setIsEditing(null)
      setEditedData({})
      setFile(null)
    }
    setLoading(false)
  }

  const handleNewDataSave = async () => {
    setLoading(true)
    if (file) {
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(`public/${file.name}`, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError.message)
        setLoading(false)
        return
      }

      if (uploadData) {
        newData.profile_picture = uploadData.path
      }
    }

    const { error } = await supabase
      .from('Example')
      .insert([newData])

    if (error) {
      console.error('Error inserting data:', error.message)
    } else {
      setNewData({})
      setFile(null)
      fetchData()
    }
    setLoading(false)
    setShowForm(false) // 隐藏表单
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, rowId: number) => {
    const file = e.target.files?.[0]
    if (file && file.size <= 2 * 1024 * 1024) {
      setFile(file)
      if (rowId !== -1) {
        setEditedData(prev => ({ ...prev, profile_picture: file.name }))
      } else {
        setNewData(prev => ({ ...prev, profile_picture: file.name }))
      }
    } else {
      console.error('File size exceeds 2MB limit')
    }
  }

  const handleFileSave = async (rowId: number) => {
    if (file) {
      setLoading(true)
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(`public/${file.name}`, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError.message)
        setLoading(false)
        return
      }

      if (uploadData) {
        const newPath = uploadData.path
        if (rowId !== -1) {
          setEditedData(prev => ({ ...prev, profile_picture: newPath }))
        } else {
          setNewData(prev => ({ ...prev, profile_picture: newPath }))
        }
        setFile(null) // 清除文件
      }
      setLoading(false)
    }
  }

  const handleNewDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewData(prev => ({ ...prev, [name]: value }))
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1) // 重置到第一页
  }

  const handleSearch = () => {
    if (!searchQuery) {
      fetchData()
      return
    }
    const query = searchQuery.toLowerCase()
    const filteredData = data.filter(row =>
      row.id.toString().toLowerCase().includes(query) || row.name.toLowerCase().includes(query)
    )
    setData(filteredData)
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortOrder('asc')
    }
  }

  const handleImageClick = (url: string) => {
    setShowImage(url)
  }

  const handleCloseImage = () => {
    setShowImage(null)
  }

  const toggleForm = () => {
    setShowForm(!showForm)
  }

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

  return (
    <div className="container mx-auto p-4">
      <div className="sm:flex sm:items-center justify-between">
        <div className="flex">
          <input
            type="text"
            placeholder="Search by id or name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded p-2 mr-2"
          />
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
        </div>
        <div className="flex items-center">
          <Menu as="div" className="relative inline-block text-left mr-4">
            <div>
              <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Rows per page
                <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }: { active: boolean }) => (
                      <button
                        onClick={() => handlePageSizeChange(10)}
                        className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                      >
                        10 rows per page
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }: { active: boolean }) => (
                      <button
                        onClick={() => handlePageSizeChange(50)}
                        className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                      >
                        50 rows per page
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }: { active: boolean }) => (
                      <button
                        onClick={() => handlePageSizeChange(100)}
                        className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                      >
                        100 rows per page
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
          <button
            type="button"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={toggleForm}
          >
            {showForm ? "Close Form" : "Add user"}
          </button>
        </div>
      </div>
      {showForm && (
        <div className="flex mb-4 mt-4 space-x-4">
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={newData.name || ''}
            onChange={handleNewDataChange}
            className="border rounded p-2"
          />
          <input
            type="number"
            placeholder="Age"
            name="age"
            value={newData.age || ''}
            onChange={handleNewDataChange}
            className="border rounded p-2"
          />
          <input
            type="date"
            placeholder="Birthday"
            name="birthday"
            value={newData.birthday || ''}
            onChange={handleNewDataChange}
            className="border rounded p-2"
          />
          <input
            type="file"
            onChange={(e) => handleFileChange(e, -1)} // -1 表示新数据
            className="border rounded p-2"
          />
          {file && (
            <button onClick={() => handleFileSave(-1)} className="bg-blue-500 text-white px-2 py-1 rounded">
              Save
            </button>
          )}
          <button onClick={handleNewDataSave} className="bg-green-500 text-white px-4 py-2 rounded">Add New Data</button>
        </div>
      )}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0 cursor-pointer" onClick={() => handleSort('id')}>
                    ID {sortColumn === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                    Name {sortColumn === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('age')}>
                    Age {sortColumn === 'age' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('birthday')}>
                    Birthday {sortColumn === 'birthday' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Profile Picture
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{row.id}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {isEditing === row.id ? (
                        <input
                          type="text"
                          name="name"
                          value={editedData.name || ''}
                          onChange={handleChange}
                          className="border rounded p-1"
                        />
                      ) : (
                        row.name
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {isEditing === row.id ? (
                        <input
                          type="number"
                          name="age"
                          value={editedData.age || ''}
                          onChange={handleChange}
                          className="border rounded p-1"
                        />
                      ) : (
                        row.age
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {isEditing === row.id ? (
                        <input
                          type="date"
                          name="birthday"
                          value={editedData.birthday || ''}
                          onChange={handleChange}
                          className="border rounded p-1"
                        />
                      ) : (
                        row.birthday
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {row.profile_picture ? (
                        <>
                          <a
                            href="#"
                            className="text-blue-500 underline"
                            onClick={(e) => {
                              e.preventDefault()
                              handleImageClick(supabase.storage.from('avatars').getPublicUrl(row.profile_picture).data.publicUrl)
                            }}
                          >
                            View Image
                          </a>
                          {showImage && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <div className="relative">
                                <img src={showImage} alt="Full Profile" className="max-w-sm max-h-sm" />
                                <button onClick={handleCloseImage} className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded">Close</button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <input type="file" onChange={(e) => handleFileChange(e, row.id)} className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none" />
                          {file && isEditing === row.id && (
                            <button onClick={() => handleFileSave(row.id)} className="bg-blue-500 text-white px-2 py-1 rounded ml-2">
                              Save
                            </button>
                          )}
                        </>
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      {isEditing === row.id ? (
                        <button onClick={() => handleSave(row.id)} className="bg-blue-500 text-white px-2 py-1 rounded">
                          Save
                        </button>
                      ) : (
                        <button onClick={() => handleEdit(row.id)} className="bg-yellow-500 text-white px-2 py-1 rounded">
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <nav
        className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 bg-gray-50"
        aria-label="Pagination"
      >
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, data.length)}</span> of{' '}
            <span className="font-medium">{data.length}</span> results
          </p>
        </div>
        <div className="flex flex-1 justify-between sm:justify-end">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </nav>

    </div>
  )
}

export default DataTable
