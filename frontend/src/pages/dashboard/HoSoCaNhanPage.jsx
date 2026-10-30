import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { profileAPI } from "@/services/api";
import { positionLabel } from "@/utils/auth";
import { resolveAvatarUrl, DEFAULT_AVATAR } from "@/utils/avatar";
import { formatDate } from "@/utils/format";
import { getErrorMessage, handleApiError, showSuccess, showWarning } from "@/utils/notification";

// UC-EMP-006: JPG, JPEG, PNG hoặc WEBP, tối đa 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;
const NOT_PROVIDED = "Chưa cập nhật";

const buttonBase =
  "flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-lg font-label-lg text-label-lg font-semibold transition-colors disabled:opacity-50";

/** Một thông tin chỉ đọc: biểu tượng, nhãn nhỏ phía trên và giá trị */
const Field = ({ icon, label, value, wide = false }) => (
  <div
    className={`flex items-start gap-space-md p-space-md rounded-lg bg-surface-container ${wide ? "sm:col-span-2" : ""}`}
  >
    <span className="material-symbols-outlined text-primary text-[22px] mt-[2px]">{icon}</span>
    <div className="min-w-0">
      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</p>
      <p className="font-body-lg text-body-lg text-on-surface font-semibold break-words">{value}</p>
    </div>
  </div>
);

const Section = ({ icon, title, children }) => (
  <section className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant">
    <div className="flex items-center gap-space-sm mb-space-md">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <h2 className="font-title-lg text-title-lg font-semibold text-on-surface">{title}</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">{children}</div>
  </section>
);

/**
 * Hồ sơ cá nhân (UC-EMP-003, UC-EMP-006): chỉ xem thông tin của chính mình và đổi ảnh đại diện.
 * Không hiển thị lương; các thông tin khác chỉ do ADMIN cập nhật ở trang Quản lý nhân viên.
 */
const HoSoCaNhanPage = () => {
  const { updateEmployee } = useAuth();
  const fileInput = useRef(null);

  const [state, setState] = useState({ loading: true, error: null, profile: null });
  const [reloadToken, setReloadToken] = useState(0);
  const [selected, setSelected] = useState(null); // { file, previewUrl }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await profileAPI.get();
        if (!cancelled) setState({ loading: false, error: null, profile: res.data });
      } catch (error) {
        if (!cancelled) {
          setState({ loading: false, error: getErrorMessage(error, "Không thể tải hồ sơ cá nhân."), profile: null });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  // Giải phóng ảnh xem trước khi chọn ảnh khác, hủy hoặc rời trang
  useEffect(
    () => () => {
      if (selected) URL.revokeObjectURL(selected.previewUrl);
    },
    [selected],
  );

  const handleRetry = () => {
    setState({ loading: true, error: null, profile: null });
    setReloadToken((t) => t + 1);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng một tệp
    if (!file) return;
    // Kiểm tra sơ bộ, máy chủ vẫn kiểm tra lại nội dung thực tế
    if (!ALLOWED_TYPES.includes(file.type)) {
      showWarning("Ảnh không hợp lệ", "Chỉ chấp nhận tệp JPG, JPEG, PNG hoặc WEBP.");
      return;
    }
    if (file.size > MAX_SIZE) {
      showWarning("Ảnh không hợp lệ", "Dung lượng ảnh không được vượt quá 5 MB.");
      return;
    }
    setSelected({ file, previewUrl: URL.createObjectURL(file) });
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await profileAPI.updateAvatar(selected.file);
      setState((s) => ({ ...s, profile: res.data }));
      updateEmployee({ avatar: res.data.avatar });
      setSelected(null);
      showSuccess("Cập nhật ảnh đại diện thành công");
    } catch (error) {
      // Ảnh hiện tại được giữ nguyên, người dùng có thể thử lại
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const { loading, error, profile } = state;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-space-xl">
        <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-space-md py-space-xl text-center">
        <p className="font-body-lg text-body-lg text-error">{error}</p>
        <button onClick={handleRetry} className={`${buttonBase} bg-primary text-on-primary hover:bg-primary/90`}>
          Thử lại
        </button>
      </div>
    );
  }

  const value = (v) => (v === null || v === undefined || v === "" ? NOT_PROVIDED : v);
  const avatarSrc = selected ? selected.previewUrl : resolveAvatarUrl(profile.avatar);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-space-lg">
      {/* Ảnh bìa, ảnh đại diện và thao tác đổi ảnh */}
      <div className="rounded-xl bg-surface-container-low border border-outline-variant overflow-hidden">
        <div className="h-36 bg-gradient-to-r from-brand-light to-brand-dark" />

        <div className="px-space-xl pb-space-lg">
          <div className="flex flex-col md:flex-row md:items-end gap-space-lg -mt-16">
            <img
              src={avatarSrc}
              alt={`Ảnh đại diện ${profile.fullName}`}
              className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover ring-4 ring-surface-container-low bg-surface-container-high self-center md:self-auto"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />

            <div className="flex-1 min-w-0 text-center md:text-left md:pb-space-sm">
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold truncate">
                {profile.fullName}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-space-sm mt-space-xs">
                <span className="px-space-md py-space-xs rounded-full bg-primary/15 text-primary font-label-md text-label-md font-semibold">
                  {positionLabel(profile.position)}
                </span>
                <span className="font-body-md text-body-md text-on-surface-variant">@{profile.username}</span>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-space-xs md:pb-space-sm">
              {!selected && (
                <button
                  onClick={() => fileInput.current?.click()}
                  className={`${buttonBase} bg-primary text-on-primary hover:bg-primary/90`}
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  Thay đổi ảnh đại diện
                </button>
              )}
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                JPG, JPEG, PNG hoặc WEBP, tối đa 5 MB
              </p>
            </div>
          </div>

          {/* Ảnh mới chưa lưu: chỉ khi bấm Lưu thay đổi ảnh mới được áp dụng */}
          {selected && (
            <div className="mt-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-md rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary">info</span>
                <p className="font-body-md text-body-md text-on-surface">
                  Đang xem trước ảnh mới. Ảnh chỉ được thay đổi sau khi bạn nhấn <strong>Lưu thay đổi</strong>.
                </p>
              </div>
              <div className="flex flex-wrap gap-space-sm">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`${buttonBase} bg-primary text-on-primary hover:bg-primary/90`}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  onClick={() => fileInput.current?.click()}
                  disabled={saving}
                  className={`${buttonBase} bg-surface-container-high hover:bg-surface-container-highest text-on-surface`}
                >
                  Chọn ảnh khác
                </button>
                <button
                  onClick={() => setSelected(null)}
                  disabled={saving}
                  className={`${buttonBase} text-on-surface-variant hover:bg-surface-container-high`}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInput}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Thông tin chỉ đọc */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg">
        <Section icon="badge" title="Thông tin cá nhân">
          <Field icon="person" label="Họ và tên" value={value(profile.fullName)} wide />
          <Field icon="wc" label="Giới tính" value={value(profile.gender)} />
          <Field
            icon="cake"
            label="Ngày sinh"
            value={profile.dateOfBirth ? formatDate(profile.dateOfBirth) : NOT_PROVIDED}
          />
          <Field icon="fingerprint" label="CCCD" value={value(profile.citizenId)} wide />
        </Section>

        <Section icon="contact_phone" title="Liên hệ và công việc">
          <Field icon="work" label="Chức vụ" value={value(positionLabel(profile.position))} />
          <Field icon="phone" label="Số điện thoại" value={value(profile.phone)} />
          <Field icon="mail" label="Email" value={value(profile.email)} wide />
          <Field icon="home" label="Địa chỉ" value={value(profile.address)} wide />
        </Section>
      </div>
    </div>
  );
};

export default HoSoCaNhanPage;
