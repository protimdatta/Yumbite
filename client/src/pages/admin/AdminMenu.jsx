import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, X, Upload, Image as ImageIcon, BadgePercent } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { menuAPI, uploadAPI } from '../../services/api';
import { formatPrice, CATEGORIES, effectivePrice, hasDiscount, getDiscount } from '../../utils/helpers';
import { toast } from 'react-hot-toast';

const emptyForm = { name: '', description: '', price: '', discount: '', category: 'Burgers', image: '', isAvailable: true, isPopular: false, ingredients: '', spicyLevel: 0 };

export default function AdminMenu() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await menuAPI.getAll({ limit: 100 });
      if (r.success) setItems(r.data);
    } catch (e) { toast.error('Failed to load menu'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setPreview(''); setShowForm(true); };
  const openEdit = (it) => {
    setEditing(it);
    setForm({ ...emptyForm, ...it, price: String(it.price), discount: it.discount ? String(it.discount) : '', ingredients: (it.ingredients || []).join(', ') });
    setPreview(it.image || '');
    setShowForm(true);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    // Instant local preview
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const r = await uploadAPI.uploadImage(file, token);
      if (r.success) {
        setForm((p) => ({ ...p, image: r.imageUrl }));
        setPreview(r.imageUrl);
        toast.success('Photo uploaded');
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
      setPreview(form.image || '');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price) { toast.error('Fill required fields'); return; }
    const discountNum = form.discount === '' ? 0 : Number(form.discount);
    if (Number.isNaN(discountNum) || discountNum < 0 || discountNum > 100) { toast.error('Discount must be 0–100%'); return; }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      discount: discountNum,
      spicyLevel: Number(form.spicyLevel),
      ingredients: form.ingredients ? form.ingredients.split(',').map((s) => s.trim()).filter(Boolean) : []
    };
    try {
      if (editing) {
        const r = await menuAPI.update(editing._id, payload, token);
        if (r.success) toast.success('Updated');
      } else {
        const r = await menuAPI.create(payload, token);
        if (r.success) toast.success('Created');
      }
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this item?')) return;
    try { await menuAPI.delete(id, token); toast.success('Deleted'); load(); }
    catch (e) { toast.error(e.message); }
  };

  const toggle = async (id) => {
    try { await menuAPI.toggleAvailability(id, token); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-heading-xl text-yumbite-white">Menu Management</h1>
          <p className="text-yumbite-muted text-body-sm">{items.length} items</p>
        </div>
        <button onClick={openAdd} className="btn-primary w-full justify-center sm:w-auto"><Plus className="w-4 h-4" />Add Food</button>
      </div>

      {loading ? <p className="text-yumbite-muted">Loading...</p> : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((it) => (
            <motion.div key={it._id} layout className="card-base p-4">
              {it.image ? (
                <img src={it.image} alt={it.name} className="w-full h-32 object-cover rounded-radius-lg mb-3" loading="lazy" />
              ) : null}
              <div className="flex justify-between gap-2 mb-2">
                <h3 className="font-semibold text-yumbite-white truncate">{it.name}</h3>
                <span className="text-yumbite-yellow font-bold whitespace-nowrap">
                  {hasDiscount(it) && <span className="text-yumbite-white/40 line-through font-normal text-body-sm mr-1">{formatPrice(it.price)}</span>}
                  {formatPrice(effectivePrice(it))}
                </span>
              </div>
              <p className="text-caption text-yumbite-muted line-clamp-2 mb-3">{it.description}</p>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge-yellow">{it.category}</span>
                {hasDiscount(it) && <span className="badge-red">-{getDiscount(it)}% OFF</span>}
                {!it.isAvailable && <span className="badge-red">Hidden</span>}
                {it.isPopular && <span className="badge">Popular</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(it)} className="btn-ghost text-body-sm"><Pencil className="w-4 h-4" />Edit</button>
                <button onClick={() => toggle(it._id)} className="btn-ghost text-body-sm">{it.isAvailable ? 'Hide' : 'Show'}</button>
                <button onClick={() => remove(it._id)} className="btn-ghost text-body-sm hover:text-yumbite-red"><Trash2 className="w-4 h-4" />Delete</button>
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
              <h2 className="font-display font-bold text-yumbite-white">{editing ? 'Edit Item' : 'Add Food'}</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Close"><X className="w-5 h-5 text-yumbite-white/60" /></button>
            </div>

            <div>
              <label className="label-base">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-base" required />
            </div>

            <div>
              <label className="label-base">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-base resize-none" rows={3} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base">Price (BDT) *</label>
                <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-base" required />
              </div>
              <div>
                <label className="label-base flex items-center gap-1"><BadgePercent className="w-4 h-4 text-yumbite-yellow" />Discount %</label>
                <input type="number" min="0" max="100" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className="input-base" placeholder="e.g. 20" />
              </div>
            </div>
            {form.price && form.discount > 0 && (
              <p className="text-body-sm text-yumbite-yellow">
                Customer pays {formatPrice(Math.round(Number(form.price) * (1 - Number(form.discount) / 100)))} instead of {formatPrice(Number(form.price))}
              </p>
            )}

            <div>
              <label className="label-base">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-base">
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>

            <div>
              <label className="label-base">Photo</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" aria-label="Choose food photo" />
              <div className="flex items-start gap-3">
                <div className="w-24 h-24 rounded-radius-lg overflow-hidden bg-yumbite-black border border-yumbite-border flex-shrink-0 flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="Food preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-yumbite-muted" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-secondary w-full justify-center py-2.5 text-body-sm">
                    {uploading ? (<><Loader2 className="w-4 h-4 animate-spin" />Uploading...</>) : (<><Upload className="w-4 h-4" />Choose Photo</>)}
                  </button>
                  <input value={form.image} onChange={(e) => { setForm({ ...form, image: e.target.value }); setPreview(e.target.value); }} className="input-base" placeholder="...or paste image link" />
                </div>
              </div>
              <p className="text-caption text-yumbite-muted mt-2">JPG/PNG/WebP, max 5MB. Stored on server (Cloudinary-ready later).</p>
            </div>

            <div>
              <label className="label-base">Ingredients (comma separated)</label>
              <input value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} className="input-base" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-yumbite-white/80 text-body-sm">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="custom-checkbox" />Available
              </label>
              <label className="flex items-center gap-2 text-yumbite-white/80 text-body-sm">
                <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} className="custom-checkbox" />Popular
              </label>
            </div>

            <button disabled={saving || uploading} className="btn-primary w-full justify-center">
              {saving ? (<><Loader2 className="w-4 h-4 animate-spin" />Saving...</>) : (editing ? 'Save Changes' : 'Add Item')}
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
}