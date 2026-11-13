async function fetchAllQuotations() {
    const { data, error } = await supabaseClient
        .from('quotations')
        .select('quotation_no, customer_name, created_at')
        .order('created_at', { ascending: false }); // เรียงจากใหม่อยู่บนสุด

    if (!error) {
        console.log('รายการใบเสนอราคาทั้งหมด:', data);
        // นำ data ไปแสดงใน Modal หรือ Dropdown ให้ผู้ใช้เลือกกดโหลดได้
    }
}