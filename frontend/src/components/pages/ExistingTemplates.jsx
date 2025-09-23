// src/pages/ExistingTemplates.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadTemplates, saveTemplates, generateId } from '../utils/templateStore';
import { Edit, Copy, Trash2, Plus, Clock } from 'lucide-react';

export default function ExistingTemplates() {
  const nav = useNavigate();
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  const handleDelete = (id) => {
    if (!confirm('Delete template?')) return;
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
  };

  const handleDuplicate = (id) => {
    const existing = templates.find(t => t.id === id);
    if (!existing) return;
    const newId = generateId(templates);
    const copy = { ...existing, id: newId, name: existing.name + ' (copy)', lastModified: 'Just now' };
    const updated = [copy, ...templates];
    setTemplates(updated);
    saveTemplates(updated);
    nav(`/templates/editor/${newId}`, { state: { template: copy } });
  };

  const handleEdit = (id) => {
    const t = templates.find(x => x.id === id);
    nav(`/templates/editor/${id}`, { state: { template: t } });
  };

  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Existing Templates</h1>
            <p className="text-slate-500">Manage templates you have created.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav('/templates/build')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create New
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.length === 0 && (
            <div className="col-span-full p-8 bg-white rounded-lg text-center border">
              No templates yet — create one from the "Create New" button.
            </div>
          )}

          {templates.map(t => (
            <div key={t.id} className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md">
              <div className="h-36 overflow-hidden rounded-md border mb-3" dangerouslySetInnerHTML={{ __html: t.content }} />
              <h3 className="font-semibold">{t.name}</h3>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3" /> {t.lastModified || 'Unknown'}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handleEdit(t.id)} className="px-3 py-1 border rounded text-sm flex items-center gap-2">
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => handleDuplicate(t.id)} className="px-3 py-1 border rounded text-sm flex items-center gap-2">
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button onClick={() => handleDelete(t.id)} className="px-3 py-1 border rounded text-sm text-red-600 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
