import { useEffect, useState } from 'react';
import { User, Lock, Store, Truck, Save, Loader2, Bell, CheckCircle, ShoppingBag, Code2, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { authAPI, settingsAPI } from '../../services/api';
import { applySiteSettings } from '../../utils/brand';
import { PageHeader } from '../../components/admin/AdminUI';
import { toast } from 'react-hot-toast';

function Section({ icon: Icon, title, children }) {
  return (
    <section className="card-base p-6">
      <h2 className="font-display font-semibold text-heading-md text-yumbite-white flex items-center gap-2 mb-5">
        <Icon className="w-5 h-5 text-yumbite-yellow" />{title}
      </h2>
      {children}
    </section>
  );
}

export default function AdminSettings() {
  const { token, admin, updateAdmin } = useAdminAuth();
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [site, setSite] = useState(null);
  const [busy, setBusy] = useState({ profile: false, pw: false, site: false });

  useEffect(() => {
    if (admin) setProfile({ username: admin.username || '', email: admin.email || '' });
  }, [admin]);

  useEffect(() => {
    (async () => {
      try {
        const r = await settingsAPI.get();
        if (r.success) setSite(r.data);
      } catch (e) {
        toast.error('Could not load settings');
      }
    })();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.username.trim() || !profile.email.trim()) { toast.error('Name and email are required'); return; }
    setBusy((b) => ({ ...b, profile: true }));
    try {
      const r = await authAPI.updateProfile({ username: profile.username.trim(), email: profile.email.trim() }, token);
      if (r.success) {
        updateAdmin(r.data);
        toast.success('Profile updated');
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy((b) => ({ ...b, profile: false }));
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!pw.currentPassword || !pw.newPassword) { toast.error('Fill in both password fields'); return; }
    if (pw.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pw.newPassword !== pw.confirm) { toast.error('New passwords do not match'); return; }
    setBusy((b) => ({ ...b, pw: true }));
    try {
      const r = await authAPI.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }, token);
      if (r.success) {
        toast.success(r.message || 'Password changed');
        setPw({ currentPassword: '', newPassword: '', confirm: '' });
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy((b) => ({ ...b, pw: false }));
    }
  };

  const saveSite = async (e) => {
    e.preventDefault();
    const fee = Number(site.deliveryFee);
    const threshold = Number(site.freeDeliveryThreshold);
    if (!Number.isFinite(fee) || fee < 0) { toast.error('Delivery fee must be 0 or more'); return; }
    if (!Number.isFinite(threshold) || threshold < 0) { toast.error('Free-delivery threshold must be 0 or more'); return; }
    setBusy((b) => ({ ...b, site: true }));
    try {
      const r = await settingsAPI.update({
        restaurantName: site.restaurantName.trim(),
        tagline: site.tagline.trim(),
        phone: site.phone.trim(),
        address: site.address.trim(),
        hours: site.hours.trim(),
        deliveryFee: fee,
        freeDeliveryThreshold: threshold,
        currency: site.currency,
        notificationsEmail: (site.notificationsEmail || '').trim(),
      }, token);
      if (r.success) {
        setSite(r.data);
        applySiteSettings(r.data);
        localStorage.setItem('refresh_settings', '1');
        toast.success('Website settings saved — new orders use the updated delivery charges');
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy((b) => ({ ...b, site: false }));
    }
  };

  // ---- Hero Section save ----
  const saveHero = async (e) => {
    e.preventDefault();
    setBusy((b) => ({ ...b, site: true }));
    try {
      const r = await settingsAPI.update({
        heroSmallHeading: (site.heroSmallHeading || '').trim(),
        heroMainHeadingLine1: (site.heroMainHeadingLine1 || '').trim(),
        heroMainHeadingLine2: (site.heroMainHeadingLine2 || '').trim(),
        heroDescription: (site.heroDescription || '').trim(),
        heroDecorativeText: (site.heroDecorativeText || '').trim(),
        heroPrimaryButtonText: (site.heroPrimaryButtonText || '').trim(),
        heroPrimaryButtonLink: (site.heroPrimaryButtonLink || '').trim(),
        heroSecondaryButtonText: (site.heroSecondaryButtonText || '').trim(),
        heroSecondaryButtonLink: (site.heroSecondaryButtonLink || '').trim(),
        heroBackgroundImage: (site.heroBackgroundImage || '').trim(),
      }, token);
      if (r.success) {
        setSite(r.data);
        applySiteSettings(r.data);
        localStorage.setItem('refresh_settings', '1');
        toast.success('Hero section settings saved');
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy((b) => ({ ...b, site: false }));
    }
  };

  // ---- About Section save ----
  const saveAbout = async (e) => {
    e.preventDefault();
    setBusy((b) => ({ ...b, site: true }));
    try {
      const r = await settingsAPI.update({
        aboutSectionLabel: (site.aboutSectionLabel || '').trim(),
        aboutSectionTitle: (site.aboutSectionTitle || '').trim(),
        aboutDescription: (site.aboutDescription || '').trim(),
        aboutFeature1Title: (site.aboutFeature1Title || '').trim(),
        aboutFeature1Description: (site.aboutFeature1Description || '').trim(),
        aboutFeature2Title: (site.aboutFeature2Title || '').trim(),
        aboutFeature2Description: (site.aboutFeature2Description || '').trim(),
        aboutFeature3Title: (site.aboutFeature3Title || '').trim(),
        aboutFeature3Description: (site.aboutFeature3Description || '').trim(),
        aboutFeature4Title: (site.aboutFeature4Title || '').trim(),
        aboutFeature4Description: (site.aboutFeature4Description || '').trim(),
        aboutCTAText: (site.aboutCTAText || '').trim(),
        aboutCTALink: (site.aboutCTALink || '').trim(),
      }, token);
      if (r.success) {
        setSite(r.data);
        applySiteSettings(r.data);
        localStorage.setItem('refresh_settings', '1');
        toast.success('About section settings saved');
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy((b) => ({ ...b, site: false }));
    }
  };

  // ---- Popular Menu Section save ----
  const savePopular = async (e) => {
    e.preventDefault();
    setBusy((b) => ({ ...b, site: true }));
    try {
      const r = await settingsAPI.update({
        popularSectionTitle: (site.popularSectionTitle || '').trim(),
        popularSectionDescription: (site.popularSectionDescription || '').trim(),
        viewFullMenuButtonText: (site.viewFullMenuButtonText || '').trim(),
        viewFullMenuButtonLink: (site.viewFullMenuButtonLink || '').trim(),
      }, token);
      if (r.success) {
        setSite(r.data);
        applySiteSettings(r.data);
        localStorage.setItem('refresh_settings', '1');
        toast.success('Popular menu section settings saved');
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy((b) => ({ ...b, site: false }));
    }
  };

  // ---- Footer Section save ----
  const saveFooter = async (e) => {
    e.preventDefault();
    setBusy((b) => ({ ...b, site: true }));
    try {
      const r = await settingsAPI.update({
        footerTagline: (site.footerTagline || '').trim(),
        footerCopyright: (site.footerCopyright || '').trim(),
      }, token);
      if (r.success) {
        setSite(r.data);
        applySiteSettings(r.data);
        localStorage.setItem('refresh_settings', '1');
        toast.success('Footer settings saved');
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy((b) => ({ ...b, site: false }));
    }
  };

  const field = (id, label, props, textarea = false) => (
    <div>
      <label className="label-base" htmlFor={id}>{label}</label>
      {textarea
        ? <textarea id={id} rows={2} className="input-base resize-none" {...props} />
        : <input id={id} className="input-base" {...props} />}
    </div>
  );

  return (
    <div>
      <PageHeader title="Settings" sub="Admin profile, restaurant info and ordering rules." />
      <div className="grid xl:grid-cols-2 gap-4 items-start">
        <div className="space-y-4">
          <Section icon={User} title="Admin Profile">
            <form onSubmit={saveProfile} className="space-y-4" noValidate>
              {field('set-username', 'Display name *', { value: profile.username, onChange: (e) => setProfile({ ...profile, username: e.target.value }), required: true })}
              {field('set-email', 'Email *', { type: 'email', value: profile.email, onChange: (e) => setProfile({ ...profile, email: e.target.value }), required: true })}
              <div className="flex gap-2">
                <button disabled={busy.profile} className="btn-primary py-2.5 text-body-sm">
                  {busy.profile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Profile
                </button>
                <button type="button" onClick={() => setProfile({ username: admin?.username || '', email: admin?.email || '' })} className="btn-ghost text-body-sm">Cancel</button>
              </div>
            </form>
          </Section>

          <Section icon={Lock} title="Change Password">
            <form onSubmit={savePassword} className="space-y-4" noValidate>
              {field('set-cur', 'Current password *', { type: 'password', value: pw.currentPassword, onChange: (e) => setPw({ ...pw, currentPassword: e.target.value }), autoComplete: 'current-password', required: true })}
              {field('set-new', 'New password (min 6 chars) *', { type: 'password', value: pw.newPassword, onChange: (e) => setPw({ ...pw, newPassword: e.target.value }), autoComplete: 'new-password', required: true, minLength: 6 })}
              {field('set-confirm', 'Confirm new password *', { type: 'password', value: pw.confirm, onChange: (e) => setPw({ ...pw, confirm: e.target.value }), autoComplete: 'new-password', required: true })}
              <button disabled={busy.pw} className="btn-primary py-2.5 text-body-sm">
                {busy.pw ? <Loader2 className="w-4 h-4 animate-spin" /> : null}Change Password
              </button>
            </form>
          </Section>

          <Section icon={Bell} title="Notifications">
            {field('set-notif', 'Notification email (order alerts go here, optional)', { type: 'email', placeholder: 'owner@example.com', value: site?.notificationsEmail ?? '', onChange: (e) => setSite({ ...site, notificationsEmail: e.target.value }) })}
            <p className="text-caption text-yumbite-muted mt-2">Saved with Website settings below.</p>
          </Section>
        </div>

        <div className="space-y-4">
          <Section icon={Store} title="Restaurant Information">
            {!site ? <p className="text-yumbite-muted text-body-sm">Loading...</p> : (
              <form onSubmit={saveSite} className="space-y-4" noValidate>
                {field('set-rname', 'Restaurant name *', { value: site.restaurantName, onChange: (e) => setSite({ ...site, restaurantName: e.target.value }), required: true })}
                {field('set-tag', 'Tagline', { value: site.tagline, onChange: (e) => setSite({ ...site, tagline: e.target.value }) })}
                {field('set-phone', 'Phone *', { value: site.phone, onChange: (e) => setSite({ ...site, phone: e.target.value }), required: true })}
                {field('set-addr', 'Address', { value: site.address, onChange: (e) => setSite({ ...site, address: e.target.value }) }, true)}
                {field('set-hours', 'Opening hours', { value: site.hours, onChange: (e) => setSite({ ...site, hours: e.target.value }) })}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-base" htmlFor="set-currency">Currency</label>
                    <select id="set-currency" value={site.currency} onChange={(e) => setSite({ ...site, currency: e.target.value })} className="input-base">
                      <option value="BDT">BDT (৳)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>
                <div className="border-t border-yumbite-border pt-4">
                  <h3 className="font-display font-semibold text-yumbite-white mb-3 flex items-center gap-2"><Truck className="w-4 h-4 text-yumbite-yellow" />Delivery Charges</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {field('set-fee', 'Delivery fee (৳) *', { type: 'number', min: 0, value: site.deliveryFee, onChange: (e) => setSite({ ...site, deliveryFee: e.target.value }), required: true })}
                    {field('set-threshold', 'Free above (৳) *', { type: 'number', min: 0, value: site.freeDeliveryThreshold, onChange: (e) => setSite({ ...site, freeDeliveryThreshold: e.target.value }), required: true })}
                  </div>
                  <p className="text-caption text-yumbite-muted mt-2">Applies to new delivery orders immediately (server-side math).</p>
                </div>
                <button disabled={busy.site} className="btn-primary py-2.5 text-body-sm">
                  {busy.site ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Website Settings
                </button>
              </form>
            )}
          </Section>
        </div>

        {/* --- Hero Section --- */}
        <div className="space-y-4">
          <Section icon={Sparkles} title="Hero Section">
            {!site ? <p className="text-yumbite-muted text-body-sm">Loading...</p> : (
              <form onSubmit={saveHero} className="space-y-4" noValidate>
                {field('hero-small', 'Small heading', { value: site.heroSmallHeading, onChange: (e) => setSite({ ...site, heroSmallHeading: e.target.value }) })}
                {field('hero-main-1', 'Main heading line 1', { value: site.heroMainHeadingLine1, onChange: (e) => setSite({ ...site, heroMainHeadingLine1: e.target.value }) })}
                {field('hero-main-2', 'Main heading line 2', { value: site.heroMainHeadingLine2, onChange: (e) => setSite({ ...site, heroMainHeadingLine2: e.target.value }) })}
                {field('hero-desc', 'Description', { value: site.heroDescription, onChange: (e) => setSite({ ...site, heroDescription: e.target.value }) }, true)}
                {field('hero-deco', 'Decorative text', { value: site.heroDecorativeText, onChange: (e) => setSite({ ...site, heroDecorativeText: e.target.value }) })}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-base" htmlFor="hero-primary-btn">Primary button text</label>
                    <input id="hero-primary-btn" value={site.heroPrimaryButtonText || 'VIEW MENU'} className="input-base" onChange={(e) => setSite({ ...site, heroPrimaryButtonText: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-base" htmlFor="hero-primary-link">Primary button link</label>
                    <input id="hero-primary-link" value={site.heroPrimaryButtonLink || '/menu'} className="input-base" onChange={(e) => setSite({ ...site, heroPrimaryButtonLink: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-base" htmlFor="hero-secondary-btn">Secondary button text</label>
                    <input id="hero-secondary-btn" value={site.heroSecondaryButtonText || 'FIND US'} className="input-base" onChange={(e) => setSite({ ...site, heroSecondaryButtonText: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-base" htmlFor="hero-secondary-link">Secondary button link</label>
                    <input id="hero-secondary-link" value={site.heroSecondaryButtonLink || '/contact'} className="input-base" onChange={(e) => setSite({ ...site, heroSecondaryButtonLink: e.target.value })} />
                  </div>
                </div>
                {field('hero-bgimg', 'Background image URL', {
                  value: site.heroBackgroundImage || '/images/exterior.jpg',
                  onChange: (e) => setSite({ ...site, heroBackgroundImage: e.target.value })
                })}
                <button disabled={busy.site} className="btn-primary py-2.5 text-body-sm">
                  {busy.site ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Hero Settings
                </button>
              </form>
            )}
          </Section>
        </div>

        {/* --- About YumBite Section --- */}
        <div className="space-y-4">
          <Section icon={CheckCircle} title="About YumBite">
            {!site ? <p className="text-yumbite-muted text-body-sm">Loading...</p> : (
              <form onSubmit={saveAbout} className="space-y-4" noValidate>
                {field('about-label', 'Section label', { value: site.aboutSectionLabel, onChange: (e) => setSite({ ...site, aboutSectionLabel: e.target.value }) })}
                {field('about-title', 'Section title', { value: site.aboutSectionTitle, onChange: (e) => setSite({ ...site, aboutSectionTitle: e.target.value }) })}
                {field('about-desc', 'Description', { value: site.aboutDescription, onChange: (e) => setSite({ ...site, aboutDescription: e.target.value }) }, true)}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-base" htmlFor="feat1-title">Feature 1 title</label>
                    <input id="feat1-title" value={site.aboutFeature1Title || 'Fresh Ingredients'} className="input-base" onChange={(e) => setSite({ ...site, aboutFeature1Title: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-base" htmlFor="feat2-title">Feature 2 title</label>
                    <input id="feat2-title" value={site.aboutFeature2Title || 'Skilled Chefs'} className="input-base" onChange={(e) => setSite({ ...site, aboutFeature2Title: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-base" htmlFor="feat3-title">Feature 3 title</label>
                    <input id="feat3-title" value={site.aboutFeature3Title || 'Hygienic & Safe'} className="input-base" onChange={(e) => setSite({ ...site, aboutFeature3Title: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-base" htmlFor="feat4-title">Feature 4 title</label>
                    <input id="feat4-title" value={site.aboutFeature4Title || 'Customer Satisfaction'} className="input-base" onChange={(e) => setSite({ ...site, aboutFeature4Title: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-base" htmlFor="about-cta-text">CTA text</label>
                    <input id="about-cta-text" value={site.aboutCTAText || 'Explore Our Menu'} className="input-base" onChange={(e) => setSite({ ...site, aboutCTAText: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-base" htmlFor="about-cta-link">CTA link</label>
                    <input id="about-cta-link" value={site.aboutCTALink || '/menu'} className="input-base" onChange={(e) => setSite({ ...site, aboutCTALink: e.target.value })} />
                  </div>
                </div>
                <button disabled={busy.site} className="btn-primary py-2.5 text-body-sm">
                  {busy.site ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save About Settings
                </button>
              </form>
            )}
          </Section>
        </div>

        {/* --- Popular Menu Section --- */}
        <div className="space-y-4">
          <Section icon={ShoppingBag} title="Popular Menu">
            {!site ? <p className="text-yumbite-muted text-body-sm">Loading...</p> : (
              <form onSubmit={savePopular} className="space-y-4" noValidate>
                {field('pop-title', 'Section title', { value: site.popularSectionTitle, onChange: (e) => setSite({ ...site, popularSectionTitle: e.target.value }) })}
                {field('pop-desc', 'Section description', { value: site.popularSectionDescription, onChange: (e) => setSite({ ...site, popularSectionDescription: e.target.value }) })}
                {field('view-btn', 'View Full Menu button text', { value: site.viewFullMenuButtonText, onChange: (e) => setSite({ ...site, viewFullMenuButtonText: e.target.value }) })}
                {field('view-link', 'View Full Menu button link', { value: site.viewFullMenuButtonLink || '/menu', onChange: (e) => setSite({ ...site, viewFullMenuButtonLink: e.target.value }) })}
                <button disabled={busy.site} className="btn-primary py-2.5 text-body-sm">
                  {busy.site ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Popular Menu Settings
                </button>
              </form>
            )}
          </Section>
        </div>

        {/* --- Footer Section --- */}
        <div className="space-y-4">
          <Section icon={Code2} title="Footer">
            {!site ? <p className="text-yumbite-muted text-body-sm">Loading...</p> : (
              <form onSubmit={saveFooter} className="space-y-4" noValidate>
                {field('footer-tag', 'Tagline', { value: site.footerTagline, onChange: (e) => setSite({ ...site, footerTagline: e.target.value }) })}
                {field('footer-copyright', 'Copyright text', { value: site.footerCopyright, onChange: (e) => setSite({ ...site, footerCopyright: e.target.value }) })}
                <button disabled={busy.site} className="btn-primary py-2.5 text-body-sm">
                  {busy.site ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Footer Settings
                </button>
              </form>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}