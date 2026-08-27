import prisma from "./prisma";
import { hashPassword } from "./crypto";

export async function seedDatabase() {
  try {
    // 1. Check if roles exist
    const rolesCount = await prisma.role.count();
    if (rolesCount > 0) {
      console.log("Database already seeded. Updating admin password if needed...");
      // Always ensure admin user has correct password
      const existingAdmin = await prisma.user.findUnique({
        where: { email: "admin@tbsgroup.vn" },
      });
      if (existingAdmin) {
        await prisma.user.update({
          where: { email: "admin@tbsgroup.vn" },
          data: { passwordHash: hashPassword("Admin@123456") },
        });
        console.log("Admin password reset to Admin@123456");
      }
      return;
    }

    console.log("Seeding database initial records...");

    // 2. Create Roles
    const rAdmin = await prisma.role.create({
      data: {
        name: "ADMIN",
        permissions: JSON.stringify({ screens: ["*"], endpoints: ["*"], writeAccess: true })
      }
    });

    const rGiamDoc = await prisma.role.create({
      data: {
        name: "GIAM_DOC",
        permissions: JSON.stringify({ screens: ["*"], endpoints: ["*"], writeAccess: true })
      }
    });

    const rTruongPhong = await prisma.role.create({
      data: {
        name: "TRUONG_PHONG",
        permissions: JSON.stringify({
          screens: ["dashboard", "workspace", "chat"],
          endpoints: ["approve-doc", "reject-doc", "create-doc", "chat-msg"],
          writeAccess: true
        })
      }
    });

    const rNhanVienVanPhong = await prisma.role.create({
      data: {
        name: "NHAN_VIEN_VAN_PHONG",
        permissions: JSON.stringify({
          screens: ["workspace", "chat"],
          endpoints: ["create-doc", "chat-msg"],
          writeAccess: true
        })
      }
    });

    const rNhanVienBaoTri = await prisma.role.create({
      data: {
        name: "NHAN_VIEN_BAO_TRI",
        permissions: JSON.stringify({
          screens: ["maintenance", "chat"],
          endpoints: ["claim-ticket", "update-ticket", "chat-msg"],
          writeAccess: true
        })
      }
    });

    const rLaoDongPhoThong = await prisma.role.create({
      data: {
        name: "LAO_DONG_PHO_THONG",
        permissions: JSON.stringify({
          screens: ["worker"],
          endpoints: ["report-error"],
          writeAccess: true
        })
      }
    });

    // 3. Create Departments
    const dAdmin = await prisma.department.create({ data: { name: "IT & System Admin", code: "ADM" } });
    const dHr = await prisma.department.create({ data: { name: "Human Resources", code: "HRD" } });
    const dAcc = await prisma.department.create({ data: { name: "Accounting & Finance", code: "ACC" } });
    const dPur = await prisma.department.create({ data: { name: "Purchasing Department", code: "PUR" } });
    const dMnt = await prisma.department.create({ data: { name: "Maintenance & Engineering", code: "MNT" } });
    const dProd = await prisma.department.create({ data: { name: "Production Shopfloor", code: "PROD" } });

    // 4. Create Initial User Profiles
    await prisma.user.create({
      data: {
        email: "admin@tbsgroup.vn",
        passwordHash: hashPassword("Admin@123456"),
        fullName: "TBS Chief Admin",
        departmentId: dAdmin.id,
        roleId: rAdmin.id
      }
    });

    await prisma.user.create({
      data: {
        email: "director@tbsgroup.vn",
        passwordHash: hashPassword("DirectorPassword123!"),
        fullName: "TBS Board of Director",
        departmentId: dAdmin.id,
        roleId: rGiamDoc.id
      }
    });

    // Create a department manager (Trưởng phòng mua hàng)
    const purManager = await prisma.user.create({
      data: {
        email: "purchasing.manager@tbsgroup.vn",
        passwordHash: hashPassword("ManagerPassword123!"),
        fullName: "Nguyen Van Binh (Purchasing Head)",
        departmentId: dPur.id,
        roleId: rTruongPhong.id
      }
    });

    // Create office worker
    await prisma.user.create({
      data: {
        email: "purchasing.staff@tbsgroup.vn",
        passwordHash: hashPassword("StaffPassword123!"),
        fullName: "Tran Thi Hoa (Purchasing Staff)",
        departmentId: dPur.id,
        roleId: rNhanVienVanPhong.id
      }
    });

    // Create accounting manager (for workflow step approvals)
    await prisma.user.create({
      data: {
        email: "accounting.manager@tbsgroup.vn",
        passwordHash: hashPassword("ManagerPassword123!"),
        fullName: "Le Van Dung (Accounting Head)",
        departmentId: dAcc.id,
        roleId: rTruongPhong.id
      }
    });

    // Create maintenance engineering staff
    await prisma.user.create({
      data: {
        email: "maintenance.staff@tbsgroup.vn",
        passwordHash: hashPassword("StaffPassword123!"),
        fullName: "Pham Minh Duc (Maintenance Tech)",
        departmentId: dMnt.id,
        roleId: rNhanVienBaoTri.id
      }
    });

    // Create generic worker account
    await prisma.user.create({
      data: {
        email: "worker.shopfloor@tbsgroup.vn",
        passwordHash: hashPassword("WorkerPassword123!"),
        fullName: "Worker Team A (Shopfloor)",
        departmentId: dProd.id,
        roleId: rLaoDongPhoThong.id
      }
    });

    // 5. Create Default Workflows
    // PURCHASE order approval chain: Purchasing Staff (Create) -> Purchasing Manager (Approve) -> Accounting Manager (Approve) -> Director (Final Approval)
    await prisma.workflow.create({
      data: {
        name: "Purchase Requisition Approval Chain",
        triggerDocumentType: "PURCHASE",
        steps: JSON.stringify([
          { name: "PURCHASE_MANAGER_APPROVAL", role: "TRUONG_PHONG", department: "SAME", slaHours: 3 },
          { name: "FINANCE_APPROVAL", role: "TRUONG_PHONG", department: "ACC", slaHours: 3 },
          { name: "DIRECTOR_APPROVAL", role: "GIAM_DOC", department: "ALL", slaHours: 3 }
        ])
      }
    });

    // 6. Create Chat Rooms
    const chatMnt = await prisma.chatRoom.create({
      data: {
        name: "Engineering & Maintenance Hot-line",
        type: "DEPARTMENT",
        departmentId: dMnt.id
      }
    });

    await prisma.chatMessage.create({
      data: {
        roomId: chatMnt.id,
        senderId: (await prisma.user.findFirst({ where: { role: { name: "ADMIN" } } }))!.id,
        text: "Welcome to the Maintenance dispatch chat. Machine warnings and alerts will be logged here."
      }
    });

    // 7. Create Mock Machines
    await prisma.machine.create({ data: { name: "Sewing Machine Juki #01", qrCode: "MCH-JUKI-01", area: "Line A - Building 01", status: "ACTIVE" } });
    await prisma.machine.create({ data: { name: "Sewing Machine Brother #05", qrCode: "MCH-BRO-05", area: "Line B - Building 01", status: "ACTIVE" } });
    await prisma.machine.create({ data: { name: "Cutting Machine Laser #02", qrCode: "MCH-LASER-02", area: "Cutting Zone - Building 02", status: "ACTIVE" } });
    await prisma.machine.create({ data: { name: "Stitching Machine Durkopp #11", qrCode: "MCH-DURKOPP-11", area: "Line C - Building 01", status: "ACTIVE" } });

    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}
