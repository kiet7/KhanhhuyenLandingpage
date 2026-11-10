import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../api/profile";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ImageUploader from "../components/ImageUploader";

const emptyAchievement = { title: "", description: "", year: "", imageUrl: "" };
const emptyCertificate = { title: "", issuer: "", year: "", imageUrl: "" };
const emptyTestimonial = { studentName: "", content: "", rating: 5, avatarUrl: "" };

function Field({ label, hint, className = "", children }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm font-semibold text-primary-900">{label}</span>
      {children}
      {hint && <span className="text-xs text-primary-900/50">{hint}</span>}
    </label>
  );
}

export default function ManageProfile() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    getProfile().then((data) =>
      setProfile(
        data || {
          name: "",
          title: "",
          bio: "",
          avatarUrl: "",
          coverUrl: "",
          address: "",
          yearsExperience: 0,
          studentsCount: 0,
          socialLinks: {
            zaloUrl: "",
            messengerUrl: "",
            facebookUrl: "",
            youtubeUrl: "",
            phone: "",
            email: "",
          },
          achievements: [],
          certificates: [],
          testimonials: [],
        }
      )
    );
  }, []);

  function field(key, value) {
    setProfile((p) => ({ ...p, [key]: value }));
  }
  function socialField(key, value) {
    setProfile((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: value } }));
  }
  function updateListItem(listKey, index, key, value) {
    setProfile((p) => {
      const list = [...p[listKey]];
      list[index] = { ...list[index], [key]: value };
      return { ...p, [listKey]: list };
    });
  }
  function addListItem(listKey, empty) {
    setProfile((p) => ({ ...p, [listKey]: [...p[listKey], { ...empty }] }));
  }
  function removeListItem(listKey, index) {
    setProfile((p) => ({ ...p, [listKey]: p[listKey].filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await updateProfile(profile);
      setProfile(saved);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-primary-200 px-4 py-2.5 outline-none focus:border-primary-400";

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-primary-900">Thông tin cá nhân</h1>

      <Card className="p-6">
        <h2 className="font-semibold text-primary-900">Thông tin chung</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Họ tên" hint="Hiển thị ở trang chủ, trang giới thiệu và chân trang">
            <input
              placeholder="VD: Hồ Thị Khánh Huyền"
              value={profile.name}
              onChange={(e) => field("name", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Chức danh" hint="Dòng mô tả ngắn dưới họ tên">
            <input
              placeholder="VD: Giảng viên tiếng Trung"
              value={profile.title}
              onChange={(e) => field("title", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Số năm kinh nghiệm" hint="Chỉ nhập số, hiển thị ở trang chủ">
            <input
              type="number"
              min={0}
              placeholder="VD: 5"
              value={profile.yearsExperience}
              onChange={(e) => field("yearsExperience", Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Số học viên" hint="Tổng số học viên đã dạy, hiển thị ở trang chủ">
            <input
              type="number"
              min={0}
              placeholder="VD: 500"
              value={profile.studentsCount}
              onChange={(e) => field("studentsCount", Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Địa chỉ" hint="Hiển thị ở chân trang" className="mt-4">
          <input
            placeholder="VD: K7/25 Quang Trung, Hải Châu, TP Đà Nẵng"
            value={profile.address}
            onChange={(e) => field("address", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Giới thiệu bản thân" hint="Đoạn giới thiệu ở trang chủ và trang giới thiệu" className="mt-4">
          <textarea
            placeholder="Vài dòng về kinh nghiệm, phong cách giảng dạy..."
            value={profile.bio}
            onChange={(e) => field("bio", e.target.value)}
            rows={5}
            className={inputClass}
          />
        </Field>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <ImageUploader
            label="Ảnh đại diện"
            value={profile.avatarUrl}
            onChange={(url) => field("avatarUrl", url)}
            recommended={{ width: 800, height: 800 }}
            hint="Ảnh vuông 1:1, khuôn mặt ở giữa. Hiển thị ở trang chủ và trang giới thiệu (cắt tròn)."
          />
          <ImageUploader
            label="Ảnh bìa (banner trang giới thiệu)"
            value={profile.coverUrl}
            onChange={(url) => field("coverUrl", url)}
            recommended={{ width: 1920, height: 600 }}
            previewClassName="h-20 w-40"
            hint="Ảnh ngang ~3:1. Hai bên mép bị cắt bớt trên điện thoại, nên để nội dung chính ở giữa."
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-primary-900">Liên hệ nhanh</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input
            placeholder="Link Zalo"
            value={profile.socialLinks.zaloUrl}
            onChange={(e) => socialField("zaloUrl", e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Link Messenger"
            value={profile.socialLinks.messengerUrl}
            onChange={(e) => socialField("messengerUrl", e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Link Facebook"
            value={profile.socialLinks.facebookUrl}
            onChange={(e) => socialField("facebookUrl", e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Link YouTube"
            value={profile.socialLinks.youtubeUrl}
            onChange={(e) => socialField("youtubeUrl", e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Số điện thoại"
            value={profile.socialLinks.phone}
            onChange={(e) => socialField("phone", e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Email"
            value={profile.socialLinks.email}
            onChange={(e) => socialField("email", e.target.value)}
            className={inputClass}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-primary-900">Thành tích</h2>
          <button
            type="button"
            onClick={() => addListItem("achievements", emptyAchievement)}
            className="text-sm font-semibold text-primary-600 hover:underline"
          >
            + Thêm thành tích
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {profile.achievements.map((a, i) => (
            <div key={i} className="rounded-2xl border border-primary-100 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Tiêu đề"
                  value={a.title}
                  onChange={(e) => updateListItem("achievements", i, "title", e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="Năm"
                  value={a.year}
                  onChange={(e) => updateListItem("achievements", i, "year", e.target.value)}
                  className={inputClass}
                />
              </div>
              <textarea
                placeholder="Mô tả"
                value={a.description}
                onChange={(e) => updateListItem("achievements", i, "description", e.target.value)}
                rows={2}
                className={`${inputClass} mt-3`}
              />
              <div className="mt-3 flex items-center justify-between">
                <ImageUploader value={a.imageUrl} onChange={(url) => updateListItem("achievements", i, "imageUrl", url)} />
                <button
                  type="button"
                  onClick={() => removeListItem("achievements", i)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-primary-900">Chứng chỉ</h2>
          <button
            type="button"
            onClick={() => addListItem("certificates", emptyCertificate)}
            className="text-sm font-semibold text-primary-600 hover:underline"
          >
            + Thêm chứng chỉ
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {profile.certificates.map((c, i) => (
            <div key={i} className="rounded-2xl border border-primary-100 p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  placeholder="Tên chứng chỉ"
                  value={c.title}
                  onChange={(e) => updateListItem("certificates", i, "title", e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="Đơn vị cấp"
                  value={c.issuer}
                  onChange={(e) => updateListItem("certificates", i, "issuer", e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="Năm"
                  value={c.year}
                  onChange={(e) => updateListItem("certificates", i, "year", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <ImageUploader value={c.imageUrl} onChange={(url) => updateListItem("certificates", i, "imageUrl", url)} />
                <button
                  type="button"
                  onClick={() => removeListItem("certificates", i)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-primary-900">Cảm nhận học viên</h2>
          <button
            type="button"
            onClick={() => addListItem("testimonials", emptyTestimonial)}
            className="text-sm font-semibold text-primary-600 hover:underline"
          >
            + Thêm cảm nhận
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {profile.testimonials.map((t, i) => (
            <div key={i} className="rounded-2xl border border-primary-100 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Tên học viên"
                  value={t.studentName}
                  onChange={(e) => updateListItem("testimonials", i, "studentName", e.target.value)}
                  className={inputClass}
                />
                <input
                  type="number"
                  min={1}
                  max={5}
                  placeholder="Số sao (1-5)"
                  value={t.rating}
                  onChange={(e) => updateListItem("testimonials", i, "rating", Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <textarea
                placeholder="Nội dung cảm nhận"
                value={t.content}
                onChange={(e) => updateListItem("testimonials", i, "content", e.target.value)}
                rows={3}
                className={`${inputClass} mt-3`}
              />
              <div className="mt-3 flex items-center justify-between">
                <ImageUploader
                  label="Ảnh học viên"
                  value={t.avatarUrl}
                  onChange={(url) => updateListItem("testimonials", i, "avatarUrl", url)}
                />
                <button
                  type="button"
                  onClick={() => removeListItem("testimonials", i)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
        {savedAt && <span className="text-sm text-primary-600">Đã lưu!</span>}
      </div>
    </form>
  );
}
