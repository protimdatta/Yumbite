import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { reviewAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function AdminReviews() {
  const { token } = useAdminAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await reviewAPI.getAllAdmin(token);
      if (r.success) setReviews(r.data);
    } catch (e) { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    try {
      const r = await reviewAPI.toggle(id, token);
      if (r.success) {
        toast.success(r.data.isApproved ? 'Review visible' : 'Review hidden');
        load();
      }
    } catch (e) { toast.error(e.message); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this review?')) return;
    try { await reviewAPI.delete(id, token); toast.success('Deleted'); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-heading-xl text-yumbite-white">Review Management</h1>
        <p className="text-yumbite-muted text-body-sm">{reviews.length} customer reviews • hidden ones don't show on site</p>
      </div>

      {loading ? <p className="text-yumbite-muted">Loading...</p> : reviews.length === 0 ? (
        <div className="card-base p-12 text-center">
          <Star className="w-12 h-12 text-yumbite-muted mx-auto mb-4" />
          <h2 className="font-display font-semibold text-heading-lg text-yumbite-white mb-2">No reviews yet</h2>
          <p className="text-yumbite-white/60">Customer reviews from the website will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <motion.div key={r._id} layout className={`card-base p-4 ${!r.isApproved ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                {r.user?.avatar ? (
                  <img src={r.user.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" loading="lazy" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yumbite-yellow to-yumbite-red flex items-center justify-center font-display font-bold text-yumbite-ink text-body-sm flex-shrink-0">
                    {(r.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-yumbite-white text-body-sm">{r.name}</span>
                    <span className="flex items-center gap-0.5 text-yumbite-yellow">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-yumbite-white/20'}`} />
                      ))}
                    </span>
                    {!r.isApproved && <span className="badge-red">Hidden</span>}
                  </div>
                  <p className="text-yumbite-white/70 text-body-sm mt-1">{r.text}</p>
                  <p className="text-caption text-yumbite-muted mt-1">
                    {new Date(r.createdAt).toLocaleString()}{r.user?.email ? ` • ${r.user.email}` : ''}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => toggle(r._id)} className="btn-ghost text-body-sm p-2" aria-label={r.isApproved ? 'Hide review' : 'Show review'}>
                    {r.isApproved ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => remove(r._id)} className="btn-ghost text-body-sm p-2 hover:text-yumbite-red" aria-label="Delete review">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}