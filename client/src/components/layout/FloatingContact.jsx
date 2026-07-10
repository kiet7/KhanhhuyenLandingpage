import { useState } from "react";

function IconZalo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.03 2 11c0 2.83 1.44 5.35 3.7 7.02L5 22l4.3-2.05c.86.24 1.77.37 2.7.37 5.52 0 10-4.03 10-9s-4.48-9-10-9Z" fill="currentColor" />
    </svg>
  );
}
function IconMessenger() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.13 2 11.2c0 2.9 1.46 5.48 3.75 7.17V22l3.43-1.88c.9.25 1.85.38 2.82.38 5.52 0 10-4.13 10-9.3S17.52 2 12 2Zm1.02 12.5-2.55-2.72-4.98 2.72 5.48-5.82 2.6 2.72 4.93-2.72-5.48 5.82Z" fill="currentColor" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function FloatingContact({ profile }) {
  const [open, setOpen] = useState(false);
  const links = profile?.socialLinks;
  if (!links) return null;

  const items = [
    links.zaloUrl && { href: links.zaloUrl, label: "Zalo", icon: <IconZalo />, color: "bg-[#0068ff]" },
    links.messengerUrl && {
      href: links.messengerUrl,
      label: "Messenger",
      icon: <IconMessenger />,
      color: "bg-[#0084ff]",
    },
    links.phone && {
      href: `tel:${links.phone}`,
      label: "Gọi điện",
      icon: <IconPhone />,
      color: "bg-primary-500",
    },
  ].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open &&
        items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith("tel:") ? undefined : "_blank"}
            rel="noreferrer"
            className={`flex items-center gap-2 rounded-full ${item.color} py-2 pl-4 pr-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105`}
          >
            {item.label}
            {item.icon}
          </a>
        ))}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-primary-500 to-accent-500 text-white shadow-xl transition-transform hover:scale-105"
        aria-label="Liên hệ nhanh"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <IconPhone />
        )}
      </button>
    </div>
  );
}
