import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, X, Upload, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { galleryAPI, uploadAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const CATS = ['Exterior', 'Interior', 'Food', 'Branding', 'Other'];
const emptyForm = { imageUrl: '', caption: '', category: 'Food', isVisible: true };

export default function AdminGallery() {
  const { token } = useAdminAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await galleryAPI.getAllAdmin(token);
      if (r.success) setImages(r.data);
    } catch (e) { toast.error('Failed to load gallery'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (im) => {
    setEditing(im);
    setForm({ imageUrl: im.imageUrl || '', caption: im.caption || '', category: im.category || 'Other', isVisible: im.isVisible !== false });
    setShowForm(true);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setUploading(true);
    try {
      const r = await uploadAPI.uploadImage(file, token);
      if (r.success) {
        setForm((p) => ({ ...p, imageUrl: r.imageUrl }));
        toast.success('Photo uploaded — now add caption & save');
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.imageUrl) { toast.error('Add a photo first (choose file or paste link)'); return; }
    setSaving(true);
    try {
      if (editing) {
        const r = await galleryAPI.update(editing._id, form, token);
        if (r.success) toast.success('Updated');
      } else {
        const r = await galleryAPI.create(form, token);
        if (r.success) toast.success('Photo added to gallery');
      }
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this photo from gallery?')) return;
    try { await galleryAPI.delete(id, token); toast.success('Deleted'); load(); }
    catch (e) { toast.error(e.message); }
  };

  const toggle = async (im) => {
    try {
      await galleryAPI.update(im._id, { ...im, isVisible: !im.isVisible }, token);
      toast.success(im.isVisible ? 'Hidden from site' : 'Visible on site');
      load();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-heading-xl text-yumbite-white">Gallery Management</h1>
          <p className="text-yumbite-muted text-body-sm">{images.length} photos • shown on Gallery page & home</p>
        </div>
        <button onClick={openAdd} className="btn-primary w-full justify-center sm:w-auto"><Plus className="w-4 h-4" />Add Photo</button>
      </div>

      {loading ? <p className="text-yumbite-muted">Loading...</p> : images.length === 0 ? (
        <div className="card-base p-12 text-center">
          <ImageIcon className="w-12 h-12 text-yumbite-muted mx-auto mb-4" />
          <h2 className="font-display font-semibold text-heading-lg text-yumbite-white mb-2">No photos yet</h2>
          <p className="text-yumbite-white/60 mb-6">Add your first gallery photo.</p>
          <button onClick={openAdd} className="btn-primary">Add Photo</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((im) => (
            <motion.div key={im._id} layout className={`card-base overflow-hidden ${!im.isVisible ? 'opacity-60' : ''}`}>
              <div className="relative aspect-square">
                <img src={im.imageUrl} alt={im.caption || 'Gallery photo'} className="w-full h-full object-cover" loading="lazy" />
                {!im.isVisible && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-yumbite-black/80 text-yumbite-white/70 text-caption font-bold rounded-radius-sm">HIDDEN</span>
                )}
                <span className="absolute bottom-2 left-2 badge-yellow">{im.category}</span>
              </div>
              <div className="p-3">
                <p className="text-yumbite-white text-body-sm truncate mb-3">{im.caption || '—'}</p>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(im)} className="btn-ghost text-body-sm p-2" aria-label="Edit photo"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => toggle(im)} className="btn-ghost text-body-sm p-2" aria-label={im.isVisible ? 'Hide photo' : 'Show photo'}>
                    {im.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => remove(im._id)} className="btn-ghost text-body-sm p-2 hover:text-yumbite-red" aria-label="Delete photo"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowForm(false)}>
          <motion.form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card-base p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-display font-bold text-yumbite-white">{editing ? 'Edit Photo' : 'Add Photo'}</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Close"><X className="w-5 h-5 text-yumbite-white/60" /></button>
            </div>

            <div>
              <label className="label-base">Photo *</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" aria-label="Choose gallery photo" />
              {form.imageUrl ? (
                <div className="relative rounded-radius-lg overflow-hidden bg-yumbite-black border border-yumbite-border">
                  <img src={form.imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                  <button type="button" onClick={() => setForm((p) => ({ ...p, imageUrl: '' }))} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-yumbite-black/70 text-yumbite-white flex items-center justify-center" aria-label="Remove photo">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full border-2 border-dashed border-yumbite-border hover:border-yumbite-yellow/50 rounded-radius-lg p-8 flex flex-col items-center gap-2 text-yumbite-white/60 hover:text-yumbite-yellow transition-colors">
                  {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                  <span className="font-medium">{uploading ? 'Uploading...' : 'Choose photo from device'}</span>
                  <span className="text-caption">JPG/PNG/WebP, max 5MB</span>
                </button>
              )}
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input-base mt-2" placeholder="...or paste image link" />
            </div>

            <div>
              <label className="label-base" htmlFor="gal-caption">Caption</label>
              <input id="gal-caption" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} className="input-base" placeholder="e.g. Friday night crowd" maxLength={200} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-base">
                  {CATS.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-yumbite-white/80 text-body-sm pt-8">
                <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} className="custom-checkbox" />Show on site
              </label>
            </div>

            <button disabled={saving || uploading} className="btn-primary w-full justify-center">
              {saving ? (<><Loader2 className="w-4 h-4 animate-spin" />Saving...</>) : (editing ? 'Save Changes' : 'Add to Gallery')}
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
}