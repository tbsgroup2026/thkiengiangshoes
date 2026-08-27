import { NextResponse } from "next/server";
import { DEFAULT_BRAND_PARTNERS, BrandPartner } from "@/lib/landingCMS";

export const dynamic = "force-static";

// In-memory / dynamic store for server runtime (synced with client storage)
let brandPartnersStore: BrandPartner[] = [...DEFAULT_BRAND_PARTNERS];

export async function GET() {
  const sorted = [...brandPartnersStore].sort((a, b) => a.displayOrder - b.displayOrder);
  return NextResponse.json({
    success: true,
    data: sorted,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, logo, displayOrder, isActive } = body;

    if (!name || !logo) {
      return NextResponse.json(
        { success: false, message: "Tên thương hiệu và đường dẫn logo không được để trống" },
        { status: 400 }
      );
    }

    const newPartner: BrandPartner = {
      id: `bp-${Date.now()}`,
      name: String(name).trim(),
      logo: String(logo).trim(),
      displayOrder: Number(displayOrder) || brandPartnersStore.length + 1,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    brandPartnersStore.push(newPartner);
    brandPartnersStore.sort((a, b) => a.displayOrder - b.displayOrder);

    return NextResponse.json({
      success: true,
      message: "Thêm logo đối tác thương hiệu thành công",
      data: newPartner,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, logo, displayOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Thiếu ID thương hiệu" }, { status: 400 });
    }

    const idx = brandPartnersStore.findIndex((b) => b.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: "Không tìm thấy logo thương hiệu" }, { status: 404 });
    }

    brandPartnersStore[idx] = {
      ...brandPartnersStore[idx],
      name: name !== undefined ? String(name).trim() : brandPartnersStore[idx].name,
      logo: logo !== undefined ? String(logo).trim() : brandPartnersStore[idx].logo,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : brandPartnersStore[idx].displayOrder,
      isActive: isActive !== undefined ? Boolean(isActive) : brandPartnersStore[idx].isActive,
      updatedAt: new Date().toISOString(),
    };

    brandPartnersStore.sort((a, b) => a.displayOrder - b.displayOrder);

    return NextResponse.json({
      success: true,
      message: "Cập nhật thương hiệu thành công",
      data: brandPartnersStore[idx],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Thiếu ID cần xóa" }, { status: 400 });
    }

    brandPartnersStore = brandPartnersStore.filter((b) => b.id !== id);

    return NextResponse.json({
      success: true,
      message: "Đã xóa logo đối tác thương hiệu",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
