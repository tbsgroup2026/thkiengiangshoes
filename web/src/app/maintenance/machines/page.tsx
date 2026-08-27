'use client';

import { useState, useEffect } from 'react';

export default function MachinesPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [newZone, setNewZone] = useState('Khu A - Chuyền 1');

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/maintenance/machines');
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setMachines(result.data);
      } else {
        setMachines([]);
      }
    } catch (err) {
      console.warn('Failed to fetch machines from D1:', err);
      setMachines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  return (
    <div className="min-h-screen bg-tbs-light p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-tbs-dark">Danh Mục Máy Móc & Mã QR/Barcode</h1>
          <p className="text-xs text-gray-500 mt-1">Quản lý danh sách máy móc, vị trí lắp đặt và mã QR in dán bảo trì</p>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-tbs-dark hover:bg-gray-50 shadow-sm">
            Import từ Excel
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-light transition shadow-md cursor-pointer"
          >
            + Thêm Thiết Bị Mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#eef7f2] text-xs font-semibold text-tbs-dark uppercase border-b border-emerald-100">
              <th className="p-4">Mã Máy</th>
              <th className="p-4">Tên Máy</th>
              <th className="p-4">Serial Number</th>
              <th className="p-4">Khu Vực / Chuyền</th>
              <th className="p-4">Trạng Thái</th>
              <th className="p-4 text-center">In Mã QR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {machines.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50/80 transition">
                <td className="p-4 font-mono font-bold text-accent">{m.code}</td>
                <td className="p-4 font-semibold text-tbs-dark">{m.name}</td>
                <td className="p-4 font-mono text-gray-500">{m.serial}</td>
                <td className="p-4">{m.zone}</td>
                <td className="p-4">
                  {m.status === 'OPERATING' && <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-700 font-bold rounded">Hoạt Động</span>}
                  {m.status === 'DOWN' && <span className="px-2.5 py-1 bg-red-500/20 text-red-700 font-bold rounded">Máy Hỏng</span>}
                  {m.status === 'WARNING' && <span className="px-2.5 py-1 bg-amber-500/20 text-amber-700 font-bold rounded">Cảnh Báo</span>}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => setSelectedQR(m.qrData)}
                    className="px-3 py-1 bg-emerald-100 text-accent font-bold rounded-lg hover:bg-emerald-200"
                  >
                    Xem mã QR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QR MODAL */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-tbs-dark">Mã QR Dán Trên Máy</h3>
            <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-accent rounded-2xl flex flex-col items-center justify-center p-4 shadow-inner">
              <div className="font-mono text-xs font-bold text-accent mb-2">{selectedQR}</div>
              <div className="text-[10px] text-gray-500">Quét bằng App Mobile Native</div>
            </div>
            <button
              onClick={() => setSelectedQR(null)}
              className="w-full py-2.5 bg-tbs-dark text-white rounded-xl font-bold text-xs"
            >
              Đóng Window
            </button>
          </div>
        </div>
      )}

      {/* ADD MACHINE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full text-left shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-tbs-dark">Thêm Thiết Bị / Máy Mới Vào CSDL D1</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await fetch('/api/maintenance/machines', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    code: newCode || `MC-MAY-${Math.floor(10 + Math.random() * 90)}`,
                    name: newName || 'Máy May Tự Động 1 Kim',
                    serial: newSerial || `SN-${Math.floor(10000 + Math.random() * 90000)}`,
                    zone: newZone || 'Khu A - Chuyền 1',
                    status: 'OPERATING',
                    qrData: newCode || `TBS_${Date.now()}`
                  })
                });
                fetchMachines();
              } catch(e) {}
              setIsAddModalOpen(false);
            }} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700">Mã máy</label>
                <input required type="text" value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="VD: MC-MAY-09..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-gray-700">Tên thiết bị / máy móc</label>
                <input required type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="VD: Máy May 1 Kim A9..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700">Mã Serial</label>
                  <input type="text" value={newSerial} onChange={(e) => setNewSerial(e.target.value)} placeholder="SN-99812..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-gray-700">Khu vực / Chuyền</label>
                  <input type="text" value={newZone} onChange={(e) => setNewZone(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 rounded-xl font-bold">Hủy</button>
                <button type="submit" className="flex-1 py-2.5 bg-accent text-white rounded-xl font-bold">Lưu CSDL D1</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
