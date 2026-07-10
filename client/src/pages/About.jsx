import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

export default function About() {
  const { profile } = useOutletContext();
  const [lightbox, setLightbox] = useState(null);

  if (!profile) {
    return <div className="py-24 text-center text-primary-900/50">Đang tải thông tin...</div>;
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-linear-to-br from-primary-200 to-accent-200 sm:h-64 md:h-80 lg:h-96">
        {profile.coverUrl && (
          <img src={profile.coverUrl} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/5 to-transparent" />
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-px pb-12 sm:px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative z-10 -mt-16 h-32 w-32 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-primary-200 to-accent-200 shadow-xl ring-4 ring-white sm:-mt-20 sm:h-40 sm:w-40">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl text-white/80">中</div>
            )}
          </div>
          <div className="mt-4">
            <h1 className="font-display text-3xl font-extrabold text-primary-900">{profile.name}</h1>
            <Badge className="mt-2 bg-accent-100 text-accent-700">{profile.title}</Badge>
          </div>
        </div>

        {/* Bio */}
        <Card className="mt-10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-primary-900">Đôi nét về tôi</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-primary-900/80">{profile.bio}</p>
        </Card>

        {/* Achievements timeline */}
        {profile.achievements?.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-bold text-primary-900">Thành tích nổi bật</h2>
            <div className="mt-5 space-y-4">
              {profile.achievements.map((a) => (
                <Card key={a._id} className="flex gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 font-display font-bold text-primary-600">
                    {a.year || "★"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">{a.title}</h3>
                    {a.description && <p className="mt-1 text-sm text-primary-900/60">{a.description}</p>}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Certificates */}
        {profile.certificates?.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-bold text-primary-900">Chứng chỉ</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {profile.certificates.map((c) => (
                <Card
                  key={c._id}
                  className="cursor-pointer overflow-hidden p-0"
                  onClick={() => c.imageUrl && setLightbox(c)}
                >
                  <div className="aspect-[3/4] w-full bg-linear-to-br from-primary-100 to-accent-100">
                    {c.imageUrl && (
                      <img src={c.imageUrl} alt={c.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-primary-900">{c.title}</p>
                    <p className="text-xs text-primary-900/50">
                      {c.issuer} {c.year && `· ${c.year}`}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox.imageUrl}
            alt={lightbox.title}
            className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
