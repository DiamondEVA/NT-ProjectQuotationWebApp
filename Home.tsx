import { useState } from 'react';

export default function PriceCalculator() {
  // สร้างตัวแปรเก็บสถานะ (State) ของข้อมูล
  const [price, setPrice] = useState<number>(100);
  const [qty, setQty] = useState<number>(1);

  // คำนวณราคารวมสดๆ ทุกครั้งที่ตัวแปรเปลี่ยน
  const total = price * qty;
  const vat = total * 0.07;
  const grandTotal = total + vat;

  return (
    // class เหล่านี้คือ Tailwind CSS (bg-white = พื้นหลังขาว, p-6 = padding, rounded = มุมโค้ง)
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
      <h2 className="text-xl font-bold mb-4">คำนวณราคาใบเสนอราคา</h2>
      
      {/* ช่องกรอกราคา (เหมือน HTML Input ปกที) */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">ราคาสินค้า (บาท)</label>
        <input 
          type="number" 
          value={price} 
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>

      {/* ช่องกรอกจำนวน */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">จำนวน</label>
        <input 
          type="number" 
          value={qty} 
          onChange={(e) => setQty(Number(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>

      {/* ส่วนแสดงผลลัพธ์การคำนวณ (ดึงตัวแปรมาแสดงในปีกกาได้เลย) */}
      <div className="border-t pt-4 text-sm">
        <div className="flex justify-between mb-1">
          <span>ราคารวม:</span>
          <span>{total.toLocaleString()} บาท</span>
        </div>
        <div className="flex justify-between mb-1 text-red-500">
          <span>ภาษี (VAT 7%):</span>
          <span>{vat.toLocaleString()} บาท</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 text-green-600">
          <span>ยอดสุทธิ:</span>
          <span>{grandTotal.toLocaleString()} บาท</span>
        </div>
      </div>
    </div>
  );
}
