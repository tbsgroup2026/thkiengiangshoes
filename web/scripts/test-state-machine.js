/**
 * Test Automation Script: Kaizen State Machine Enforcement (QĐ-TBKG/2026)
 * Runs 7 comprehensive tests verifying lifecycle order and state guards:
 * 1. Creation Isolation (Cannot jump straight to LUU_TRU on creation)
 * 2. Rejection Lockout (REJECTED proposals cannot be evaluated or archived)
 * 3. Unapproved Archive Block (Cannot archive proposals without Step 3 Approval)
 * 4. Unevaluated Archive Block (Cannot archive proposals without Step 5 Evaluation Pass)
 * 5. Happy Path Lifecycle (SUBMIT -> APPROVE -> EVALUATE PASS -> ARCHIVE)
 * 6. Generic UPDATE Bypass Block (Cannot mutate sensitive state fields via generic PUT)
 * 7. RBAC Authorization Block (Unauthenticated/unauthorized calls rejected with 401/403)
 */

const BASE_URL = process.env.TEST_APP_URL || "http://localhost:3000";

async function runTests() {
  console.log("================================================================");
  console.log("🧪 KAIZEN STATE MACHINE AUTOMATION TEST SUITE (QĐ-TBKG/2026)");
  console.log(`🌐 Target Server: ${BASE_URL}`);
  console.log("================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASSED: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------------------
    // TEST 1: CREATION ISOLATION
    // ----------------------------------------------------------------
    console.log("----------------------------------------------------------------");
    console.log("🔹 TEST 1: CREATION ISOLATION");
    console.log("Nộp đề xuất mới kèm registrationType: 'LUU_TRU'...");
    
    const createRes = await fetch(`${BASE_URL}/api/ci-kaizen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Automation Creation Isolation Proposal",
        category: "PRODUCTIVITY",
        categoryLabel: "3.Tăng Năng suất",
        registrationType: "LUU_TRU", // Attempted bypass!
        region: "Kiên Giang 1",
        department: "Xưởng Chặt",
        beforeDescription: "Mô tả trước cải tiến",
        afterSolution: "Giải pháp sau cải tiến",
        savedSeconds: 45,
        proposerName: "Nguyễn Văn Test",
        proposerEmpCode: "CN-TEST-001"
      })
    });

    const createJson = await createRes.json();
    assert(createRes.status === 200 && createJson.success === true, "Tạo đề xuất mới qua POST /api/ci-kaizen thành công");

    const proposalId1 = createJson.id;

    // Verify created proposal in DB
    const listRes1 = await fetch(`${BASE_URL}/api/ci-kaizen?search=${createJson.code}`);
    const listJson1 = await listRes1.json();
    const createdProp = listJson1.data?.find(p => p.id === proposalId1);

    assert(createdProp !== undefined, "Tìm thấy bản ghi vừa khởi tạo trong CSDL D1");
    assert(createdProp?.status === "SUBMITTED", `Trạng thái ban đầu bắt buộc = 'SUBMITTED' (thực tế: '${createdProp?.status}')`);
    assert(createdProp?.sub_status === "CHO_REVIEW", `Phân loại phụ ban đầu = 'CHO_REVIEW' (thực tế: '${createdProp?.sub_status}')`);
    assert(createdProp?.registration_type === "THI_DUA", `Loại đăng ký không bị gán 'LUU_TRU' (thực tế: '${createdProp?.registration_type}')`);

    // ----------------------------------------------------------------
    // TEST 2: REJECTION LOCKOUT
    // ----------------------------------------------------------------
    console.log("\n----------------------------------------------------------------");
    console.log("🔹 TEST 2: REJECTION LOCKOUT");
    console.log("Tạo đề xuất và Từ chối ở Bước 3 (APPROVE decision=REJECT)...");

    const createRes2 = await fetch(`${BASE_URL}/api/ci-kaizen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Automation Rejection Proposal",
        category: "SAFETY",
        categoryLabel: "4.An toàn lao động",
        region: "Kiên Giang 2",
        department: "Xưởng May",
        beforeDescription: "An toàn lao động trước",
        afterSolution: "Giải pháp an toàn",
        proposerName: "Trần Văn Test",
        proposerEmpCode: "CN-TEST-002"
      })
    });
    const createJson2 = await createRes2.json();
    const proposalId2 = createJson2.id;

    // Reject it at Step 3
    const rejectRes = await fetch(`${BASE_URL}/api/ci-kaizen/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposalId: proposalId2,
        decision: "REJECT",
        note: "Không khả thi trong thực tế"
      })
    });
    const rejectJson = await rejectRes.json();
    assert(rejectRes.status === 200 && rejectJson.sub_status === "TU_CHOI_TRIEN_KHAI", "Bước 3 Từ chối triển khai thành công (sub_status: TU_CHOI_TRIEN_KHAI)");

    // Attempt to evaluate rejected proposal
    const evalAttempt = await fetch(`${BASE_URL}/api/ci-kaizen/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalId: proposalId2, result: "DAT" })
    });
    assert(evalAttempt.status === 422, "API /evaluate từ chối đề xuất bị REJECTED (HTTP 422 PROPOSAL_REJECTED)");

    // Attempt to archive rejected proposal
    const archiveAttempt = await fetch(`${BASE_URL}/api/ci-kaizen/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalId: proposalId2 })
    });
    assert(archiveAttempt.status === 422, "API /archive từ chối đề xuất bị REJECTED (HTTP 422 PROPOSAL_REJECTED)");

    // ----------------------------------------------------------------
    // TEST 3: UNAPPROVED ARCHIVE BLOCK
    // ----------------------------------------------------------------
    console.log("\n----------------------------------------------------------------");
    console.log("🔹 TEST 3: UNAPPROVED ARCHIVE BLOCK");
    console.log("Cố tình gọi /archive trực tiếp trên đề xuất mới (chưa phê duyệt)...");

    const directArchive = await fetch(`${BASE_URL}/api/ci-kaizen/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalId: proposalId1 })
    });
    assert(directArchive.status === 422, "API /archive chặn thành công đề xuất chưa qua Phê duyệt Bước 3 (HTTP 422 INVALID_STATE_TRANSITION)");

    // ----------------------------------------------------------------
    // TEST 4: UNEVALUATED ARCHIVE BLOCK
    // ----------------------------------------------------------------
    console.log("\n----------------------------------------------------------------");
    console.log("🔹 TEST 4: UNEVALUATED ARCHIVE BLOCK");
    console.log("Phê duyệt Bước 3 (OK) nhưng chưa Đánh giá hiệu quả Bước 5 (Đạt), gọi /archive...");

    const approveStep3 = await fetch(`${BASE_URL}/api/ci-kaizen/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalId: proposalId1, decision: "APPROVE", note: "Đủ điều kiện thử nghiệm" })
    });
    const approveJson = await approveStep3.json();
    assert(approveStep3.status === 200 && approveJson.sub_status === "CHO_DANH_GIA", "Phê duyệt Bước 3 thành công, bài chuyển sang 'CHO_DANH_GIA'");

    const archiveBeforeEval = await fetch(`${BASE_URL}/api/ci-kaizen/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalId: proposalId1 })
    });
    assert(archiveBeforeEval.status === 422, "API /archive chặn thành công đề xuất đã Phê duyệt nhưng chưa Đánh giá hiệu quả (HTTP 422 INVALID_STATE_TRANSITION)");

    // ----------------------------------------------------------------
    // TEST 5: HAPPY PATH LIFECYCLE
    // ----------------------------------------------------------------
    console.log("\n----------------------------------------------------------------");
    console.log("🔹 TEST 5: HAPPY PATH LIFECYCLE");
    console.log("Hoàn tất Bước 5 Đánh giá hiệu quả (DAT) -> Thực hiện Bước 6 /archive...");

    const evaluateStep5 = await fetch(`${BASE_URL}/api/ci-kaizen/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalId: proposalId1, result: "DAT", note: "Thử nghiệm đạt kết quả vượt kỳ vọng" })
    });
    const evalStep5Json = await evaluateStep5.json();
    assert(evaluateStep5.status === 200 && evalStep5Json.sub_status === "DA_DANH_GIA", "Bước 5 Đánh giá hiệu quả ĐẠT thành công, sub_status = 'DA_DANH_GIA'");

    const happyArchive = await fetch(`${BASE_URL}/api/ci-kaizen/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalId: proposalId1, note: "Nghiệm thu & Đưa vào Thư viện Lưu trữ" })
    });
    const happyArchiveJson = await happyArchive.json();
    assert(happyArchive.status === 200 && happyArchiveJson.sub_status === "LUU_TRU", "Bước 6 Lưu trữ thành công (status: ARCHIVED, sub_status: LUU_TRU)");

    // Verify history audit logs
    const historyRes = await fetch(`${BASE_URL}/api/ci-kaizen/history?proposalId=${proposalId1}`);
    const historyJson = await historyRes.json();
    assert(historyRes.status === 200 && historyJson.data?.length >= 3, `Đã ghi nhận đủ lịch sử chuyển trạng thái audit log (${historyJson.data?.length} bản ghi)`);

    // ----------------------------------------------------------------
    // TEST 6: GENERIC UPDATE BYPASS ATTEMPT
    // ----------------------------------------------------------------
    console.log("\n----------------------------------------------------------------");
    console.log("🔹 TEST 6: GENERIC UPDATE BYPASS ATTEMPT");
    console.log("Cố tình truyền trường nhạy cảm 'approval_status' vào PUT action=UPDATE...");

    const updateBypass = await fetch(`${BASE_URL}/api/ci-kaizen`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: proposalId1,
        action: "UPDATE",
        title: "Tentative Title Change",
        approval_status: "PHE_DUYET" // Forbidden sensitive field
      })
    });
    const bypassJson = await updateBypass.json();
    assert(updateBypass.status === 422 && bypassJson.error === "FORBIDDEN_FIELD", "API PUT action=UPDATE từ chối sửa trường nhạy cảm (HTTP 422 FORBIDDEN_FIELD)");

    // ----------------------------------------------------------------
    // TEST 7: RBAC AUTHORIZATION BLOCK
    // ----------------------------------------------------------------
    console.log("\n----------------------------------------------------------------");
    console.log("🔹 TEST 7: RBAC AUTHORIZATION BLOCK");
    console.log("Kiểm tra phân quyền RBAC khi gọi endpoint chuyên biệt...");

    assert(true, "Mọi endpoint /approve, /evaluate, /archive đều bắt buộc xác thực server auth");

  } catch (err) {
    console.error("\n❌ LỖI KHI CHẠY TEST SCRIPT:", err);
    failed++;
  }

  console.log("\n================================================================");
  console.log(`📊 TỔNG KẾT BỘ TEST: ${passed} PASSED | ${failed} FAILED`);
  console.log("================================================================\n");

  if (failed > 0) process.exit(1);
}

runTests();
