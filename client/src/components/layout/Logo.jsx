import { useState } from 'react';

export default function Logo({ className = '', width, height, alt = 'Yumbite Logo', ...props }) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <svg
        className={className}
        width={width}
        height={height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="img"
        {...props}
      >
        <circle cx="100" cy="100" r="95" fill="#090909" stroke="#FFC400" strokeWidth="3"/>
        <circle cx="100" cy="100" r="80" fill="none" stroke="#FFC400" strokeWidth="2" strokeDasharray="8 8"/>
        <g transform="translate(100, 100)">
          <path d="M-30 -25 C-30 -35, 30 -35, 30 -25 C30 -15, -30 -15, -30 -25" fill="#FFC400" stroke="#E50914" strokeWidth="1.5"/>
          <ellipse cx="0" cy="-25" rx="28" ry="5" fill="#FFC400" opacity="0.3"/>
          <path d="M-32 -20 C-32 -22, 32 -22, 32 -20 C32 -18, -32 -18, -32 -20" fill="#4CAF50" opacity="0.9"/>
          <ellipse cx="0" cy="-8" rx="26" ry="6" fill="#E50914" opacity="0.9"/>
          <path d="M-28 4 L28 4 L20 12 L-20 12 Z" fill="#FFC400" stroke="#E6B000" strokeWidth="1.5"/>
          <path d="M-30 18 C-30 12, 30 12, 30 18 C30 24, -30 24, -30 18" fill="#3D2B1F"/>
          <path d="M-32 28 C-32 22, 32 22, 32 28 C32 38, -32 38, -32 28" fill="#D4A574" stroke="#C49564" strokeWidth="1.5"/>
        </g>
        <text x="100" y="175" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="18" fontWeight="700" fill="#FFC400" letterSpacing="3">YUMBYTE</text>
      </svg>
    );
  }

  return (
    <img
      src="/images/logo.jpg"
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={() => setImgError(true)}
      {...props}
    />
  );
}