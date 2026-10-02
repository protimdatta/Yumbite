import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Phone, Navigation2 } from 'lucide-react';
import { BRAND, openMaps, callYumbite } from '../utils/brand';

export default function QuickInfoBar() {
  // Built at render time so Admin → Settings edits apply site-wide
  const infoItems = [
    {
      icon: Star,
      label: `${BRAND.rating} Rating`,
      value: `${BRAND.reviewCount} Reviews`,
      color: 'text-yumbite-yellow'
    },
    {
      icon: MapPin,
      label: "Cox's Bazar",
      value: BRAND.addressShort.split(',')[1]?.trim() || 'Buddhist Temple Rd',
      color: 'text-yumbite-white/80'
    },
    {
      icon: Clock,
      label: 'Open Now',
      value: BRAND.hours,
      color: 'text-yumbite-white/80'
    },
    {
      icon: Phone,
      label: 'Call Us',
      value: BRAND.phoneDisplay,
      color: 'text-yumbite-white/80',
      action: callYumbite
    },
    {
      icon: Navigation2,
      label: 'View on Google Maps',
      value: 'Get directions',
      color: 'text-yumbite-white/80',
      action: openMaps
    },
  ];
  return (
    <section 
      className="relative border-b border-yumbite-border bg-yumbite-darker py-3 lg:py-4"
      aria-label="Quick Information"
    >
      <div className="noise-overlay absolute inset-0" aria-hidden="true" />
      
      <div className="container-custom relative">
        <div className="grid grid-cols-2 gap-y-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0">
          {infoItems.map((item, index) => {
            const InfoItem = item.action ? motion.button : motion.div;
            return (
            <InfoItem
              key={item.label}
              type={item.action ? 'button' : undefined}
              onClick={item.action}
              className="group flex min-w-0 items-center gap-2 border-yumbite-border px-2 py-2 text-left first:pl-0 sm:px-3 lg:border-r lg:last:border-r-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={item.action ? { y: -1 } : undefined}
              whileTap={item.action ? { scale: 0.98 } : undefined}
              aria-label={item.action ? item.label : undefined}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${item.color}`} aria-hidden="true" />
              <div className="min-w-0">
                <div className="truncate text-caption font-medium text-yumbite-white sm:text-body-sm">{item.label}</div>
                <div className={`break-words text-caption ${item.color}`}>{item.value}</div>
              </div>
            </InfoItem>
          )})}
        </div>
      </div>
    </section>
  );
}