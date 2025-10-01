import { useEffect, useState } from 'react'

export default function Filters({ value, onChange, villages = [], karkaanaList = [] }) {
  const [local, setLocal] = useState(value || { village: '', karkaana: '' })

  useEffect(() => {
    setLocal(value || { village: '', karkaana: '' })
  }, [value])

  const setField = (k, v) => {
    const next = { ...local, [k]: v }
    setLocal(next)
    onChange?.(next)
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Village</label>
        <select
          className="border rounded-md px-3 py-2"
          value={local.village || ''}
          onChange={(e) => setField('village', e.target.value)}
        >
          <option value="">All</option>
          {villages.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Karkaana</label>
        <select
          className="border rounded-md px-3 py-2"
          value={local.karkaana || ''}
          onChange={(e) => setField('karkaana', e.target.value)}
        >
          <option value="">All</option>
          {karkaanaList.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
