import React from "react";
import KaizenPublicSubmitForm from "@/modules/ci/KaizenPublicSubmitForm";

export const metadata = {
  title: "Đăng Ký Đề Xuất Cải Tiến Kaizen | Công Nhân Quét Mã QR",
  description: "Trang nộp đề xuất cải tiến Kaizen dành riêng cho công nhân quét mã QR điện thoại (Không cần đăng nhập)",
};

export default function KaizenPublicRegisterPage() {
  return <KaizenPublicSubmitForm />;
}
