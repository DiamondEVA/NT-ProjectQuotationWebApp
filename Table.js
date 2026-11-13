async function fetchFromSupabase() {
    if (!supabaseClient) {
        alert('กรุณาตั้งค่า SUPABASE_URL และ SUPABASE_ANON_KEY ในโค้ดก่อนครับ');
        return;
    }
    
    // 1. ดึงค่าเลขที่ใบเสนอราคาจากหน้าเว็บ
    const qNo = document.getElementById('quotationNo').value;
    if (!qNo) {
        alert('กรุณากรอกเลขที่ใบเสนอราคาเพื่อดึงข้อมูล');
        return;
    }

    // 2. ยิง Query ไปหา Supabase (.eq หมายถึง equal)
    const { data, error } = await supabaseClient
        .from('quotations')
        .select('*')
        .eq('quotation_no', qNo)
        .single(); // ดึงมาแค่ 1 รายการ

    // 3. จัดการข้อมูลที่ดึงกลับมาได้
    if (error) {
        alert('ไม่พบข้อมูลใบเสนอราคานี้ในระบบ Cloud หรือเกิดข้อผิดพลาด');
        console.error(error);
    } else if (data && data.quotation_data) {
        const qd = data.quotation_data;
        
        // กระจายข้อมูลใส่ช่อง Input ในหน้าเว็บ
        document.getElementById('docReceiveNo').value = qd.docReceiveNo || '';
        document.getElementById('quotationDate').value = qd.quotationDate || '';
        document.getElementById('department').value = qd.department || '';
        document.getElementById('deptPhone').value = qd.deptPhone || '';
        document.getElementById('custName').value = data.customer_name || '';
        document.getElementById('custAddress').value = qd.custAddress || '';
        document.getElementById('custPhone').value = qd.custPhone || '';
        document.getElementById('custContact').value = qd.custContact || '';
        document.getElementById('notes').value = qd.notes || '';
        
        // อัปเดตรายการตารางสินค้าและคำนวณราคาใหม่
        if (qd.items) items = qd.items;
        renderRows();
        
        alert('ดึงข้อมูลล่าสุดจาก Cloud สำเร็จ!');
    }
}