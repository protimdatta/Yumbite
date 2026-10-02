import Hero from '../sections/Hero';
import QuickInfoBar from '../sections/QuickInfoBar';
import PopularMenu from '../sections/PopularMenu';
import AboutYumbite from '../sections/AboutYumbite';
import GalleryReviews from '../sections/GalleryReviews';

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <Hero />
      
      {/* Quick Info Bar */}
      <QuickInfoBar />
      
      {/* Popular Menu Section */}
      <PopularMenu />
      
      {/* About Yumbite Section */}
      <AboutYumbite />
      
      {/* Gallery & Reviews Section */}
      <GalleryReviews />
      
    </div>
  );
}