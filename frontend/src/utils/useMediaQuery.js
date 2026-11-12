import { useSyncExternalStore } from "react";

/** Theo dõi một media query (ví dụ "(min-width: 1024px)"); đổi kích thước hoặc xoay màn hình thì cập nhật ngay */
export const useMediaQuery = (query) =>
  useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );

/** Từ 1024px trở lên: thanh bên cố định cạnh nội dung; nhỏ hơn: thanh bên là ngăn kéo mở bằng nút menu */
export const DESKTOP_QUERY = "(min-width: 1024px)";
