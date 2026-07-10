function IconMapPin({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

function IconPhone({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a1.5 1.5 0 001.5-1.5v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 00-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
}

function IconMail({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function IconFacebook({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 21v-7.878h2.649l.396-3.076H13.5V8.075c0-.891.247-1.498 1.524-1.498h1.63V3.85A21.87 21.87 0 0014.42 3.7c-2.363 0-3.982 1.443-3.982 4.09v2.256H7.78v3.076h2.658V21h3.062Z" />
    </svg>
  );
}

function IconZalo({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3C6.925 3 2.75 6.94 2.75 11.7c0 2.61 1.257 4.947 3.238 6.53-.106 1.06-.44 2.4-.988 3.52a.35.35 0 00.46.47c1.61-.67 2.99-1.5 3.9-2.13.86.216 1.77.34 2.72.34 5.075 0 9.25-3.94 9.25-8.73C21.33 6.94 17.155 3 12 3Z" />
    </svg>
  );
}

function IconYoutube({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.582 7.2a2.51 2.51 0 00-1.768-1.777C18.254 5 12 5 12 5s-6.254 0-7.814.423A2.51 2.51 0 002.418 7.2 26.24 26.24 0 002 12a26.24 26.24 0 00.418 4.8 2.51 2.51 0 001.768 1.777C5.746 19 12 19 12 19s6.254 0 7.814-.423a2.51 2.51 0 001.768-1.777A26.24 26.24 0 0022 12a26.24 26.24 0 00-.418-4.8ZM10 15V9l5.196 3L10 15Z" />
    </svg>
  );
}

export default function Footer({ profile }) {
  const contacts = [
    { Icon: IconMapPin, text: profile?.address || "K7/25 Quang Trung, Hải Châu, TP Đà Nẵng" },
    { Icon: IconPhone, text: profile?.socialLinks?.phone || "0919.609.161" },
    { Icon: IconMail, text: profile?.socialLinks?.email || "hothikhanhhuyen@dtu.edu.vn" },
  ];

  const socials = [
    { Icon: IconFacebook, href: profile?.socialLinks?.facebookUrl || "#", label: "Facebook", bg: "bg-[#1877F2]" },
    { Icon: IconZalo, href: profile?.socialLinks?.zaloUrl || "#", label: "Zalo", bg: "bg-[#0068FF]" },
    { Icon: IconYoutube, href: profile?.socialLinks?.youtubeUrl || "#", label: "YouTube", bg: "bg-[#FF0000]" },
  ];

  return (
    <footer className="mt-16 border-t border-primary-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
            <img
              src="/logo.jpg"
              alt={profile?.name || "Khánh Huyền Chinese"}
              className="h-[168px] w-[168px] rounded-full object-cover"
            />
            <div className="flex flex-col gap-1.5 text-sm text-primary-900/70">
              {contacts.map(({ Icon, text }, i) => (
                <span key={i} className="flex items-center justify-center gap-2 sm:justify-start">
                  <Icon className="h-4 w-4 shrink-0 text-primary-500" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 sm:items-end">
            <p className="text-sm font-semibold text-primary-900">Kết nối với chúng tôi</p>
            <div className="flex items-center gap-3">
              {socials.map(({ Icon, href, label, bg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform hover:scale-105 ${bg}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-primary-900/40">
          © {new Date().getFullYear()} {profile?.name || "Khánh Huyền Chinese"}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
