// ==========================================
// JAVASCRIPT LOGIC (ระบบหลังบ้านและคำนวณ)
// ==========================================

// ----------------------------------------
// 🔑 จุดที่ 1: ตั้งค่าเชื่อมต่อ SUPABASE
// ----------------------------------------
const SUPABASE_URL = 'https://vsmeoydbseqjzuelmnew.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_BaCMogY7fSPAPSGXv9s3lg_IB1tAvwc';

let supabaseClient = null;
if (window.supabase && SUPABASE_URL !== 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ----------------------------------------
// 📦 จุดที่ 2: หมวดหมู่และราคาสินค้าตั้งต้น
// ----------------------------------------
const productCategories = [
    {
        category: "หมวด ตู้สาขาและอุปกรณ์ระบบไอพี (IP-PBX & Rack)",
        items: [
            { name: "ตู้ Rack จัดเก็บอุปกรณ์", cost: 3500 },
            { name: "ตู้สาขาโทรศัพท์ระบบไอพี (IP-PBX)", cost: 17500 },
            { name: "FXS Gateway แปลงสัญญาณโทรศัพท์ให้เป็น VOIP - ขนาด 24 port", cost: 24500 }
        ]
    },
    {
        category: "หมวด อุปกรณ์กระจายสัญญาณและสาย LAN",
        items: [
            { name: "อุปกรณ์กระจายสาย LAN แบบ PoE ขนาด 8 ช่อง", cost: 4350 },
            { name: "เครื่องโทรศัพท์ ระบบ IP (ประเภท LAN)", cost: 1650 },
            { name: "เครื่องโทรศัพท์ Analog Phone", cost: 470 }
        ]
    },
    {
        category: "หมวด ค่าบริการติดตั้งและโครง network",
        items: [
            { name: "ค่าดำเนินการติดตั้งและตั้งค่าระบบ IP-PBX / วงจร", cost: 4600 },
            { name: "ค่าธรรมเนียมในการขอใช้บริการอินเทอร์เน็ต", cost: 800 },
            { name: "ค่าเดินสาย UTP Cable CAT6 พร้อมทดสอบสัญญาณ", cost: 280 }
        ]
    }
];

// อาร์เรย์เก็บรายการสินค้าในหน้าปัจจุบัน
let items = [];

// ----------------------------------------
// 💾 จุดที่ 3: ระบบโหลดและบันทึกข้อมูล LOCALSTORAGE
// ----------------------------------------
function loadData() {
    document.getElementById('quotationDate').valueAsDate = new Date();
    
    const savedData = localStorage.getItem('nt_quotation_clean_v1');
    if (savedData) {
        const data = JSON.parse(savedData);
        document.getElementById('docReceiveNo').value = data.docReceiveNo || '';
        document.getElementById('quotationNo').value = data.quotationNo || '';
        if (data.quotationDate) document.getElementById('quotationDate').value = data.quotationDate;
        document.getElementById('department').value = data.department || 'ศูนย์ขายติดตามหนี้ และวิศวกรรมบริการ';
        document.getElementById('deptPhone').value = data.deptPhone || '03731 1617';
        document.getElementById('custName').value = data.custName || '';
        document.getElementById('custAddress').value = data.custAddress || '';
        document.getElementById('custPhone').value = data.custPhone || '';
        document.getElementById('custContact').value = data.custContact || '';
        document.getElementById('notes').value = data.notes || '1. รับประกันอุปกรณ์ 1 ปี\n2. มีระบบ Monitor การทำงานของอุปกรณ์ พร้อมทีมช่าง แก้ไขปัญหาการใช้งานเบื้องต้นภายใน 24 ชั่วโมง';
        if (data.items) items = data.items;
    }
    renderRows();
}

function saveData() {
    const data = {
        docReceiveNo: document.getElementById('docReceiveNo').value,
        quotationNo: document.getElementById('quotationNo').value,
        quotationDate: document.getElementById('quotationDate').value,
        department: document.getElementById('department').value,
        deptPhone: document.getElementById('deptPhone').value,
        custName: document.getElementById('custName').value,
        custAddress: document.getElementById('custAddress').value,
        custPhone: document.getElementById('custPhone').value,
        custContact: document.getElementById('custContact').value,
        notes: document.getElementById('notes').value,
        items: items
    };
    localStorage.setItem('nt_quotation_clean_v1', JSON.stringify(data));
}

// ----------------------------------------
// ☁️ จุดที่ 4: ระบบรับ-ส่งข้อมูลกับ SUPABASE CLOUD
// ----------------------------------------
async function saveToSupabase() {
    if (!supabaseClient) {
        alert('กรุณาตั้งค่า SUPABASE_URL และ SUPABASE_ANON_KEY ในโค้ดก่อนใช้งาน Cloud ครับ');
        return;
    }
    saveData();
    const payload = {
        quotation_no: document.getElementById('quotationNo').value,
        customer_name: document.getElementById('custName').value,
        quotation_data: {
            docReceiveNo: document.getElementById('docReceiveNo').value,
            quotationDate: document.getElementById('quotationDate').value,
            department: document.getElementById('department').value,
            deptPhone: document.getElementById('deptPhone').value,
            custAddress: document.getElementById('custAddress').value,
            custPhone: document.getElementById('custPhone').value,
            custContact: document.getElementById('custContact').value,
            notes: document.getElementById('notes').value,
            items: items
        }
    };

    const { error } = await supabaseClient.from('quotations').upsert(payload, { onConflict: 'quotation_no' });
    if (error) {
        alert('บันทึกขึ้น Cloud ไม่สำเร็จ: ' + error.message);
    } else {
        alert('บันทึกข้อมูลใบเสนอราคาขึ้น Supabase Cloud สำเร็จเรียบร้อย!');
    }
}

async function fetchFromSupabase() {
    if (!supabaseClient) {
        alert('กรุณาตั้งค่า SUPABASE_URL และ SUPABASE_ANON_KEY ในโค้ดก่อนครับ');
        return;
    }
    const qNo = document.getElementById('quotationNo').value;
    if (!qNo) {
        alert('กรุณากรอกเลขที่ใบเสนอราคาเพื่อดึงข้อมูล');
        return;
    }
    const { data, error } = await supabaseClient.from('quotations').select('*').eq('quotation_no', qNo).single();
    if (error) {
        alert('ไม่พบข้อมูลในระบบ Cloud หรือเกิดข้อผิดพลาด');
    } else if (data && data.quotation_data) {
        const qd = data.quotation_data;
        document.getElementById('docReceiveNo').value = qd.docReceiveNo || '';
        document.getElementById('quotationDate').value = qd.quotationDate || '';
        document.getElementById('department').value = qd.department || '';
        document.getElementById('deptPhone').value = qd.deptPhone || '';
        document.getElementById('custName').value = data.customer_name || '';
        document.getElementById('custAddress').value = qd.custAddress || '';
        document.getElementById('custPhone').value = qd.custPhone || '';
        document.getElementById('custContact').value = qd.custContact || '';
        document.getElementById('notes').value = qd.notes || '';
        if (qd.items) items = qd.items;
        renderRows();
        alert('ดึงข้อมูลล่าสุดจาก Cloud สำเร็จ!');
    }
}

// ----------------------------------------
// 🖥️ จุดที่ 5: ระบบวาดแถวตารางและคำนวณราคา
// ----------------------------------------
function renderRows() {
    const tbody = document.getElementById('itemRows');
    tbody.innerHTML = '';
    
    items.forEach((item, index) => {
        let cost = parseFloat(item.cost) || 0;
        let profit = parseFloat(item.profit) || 20;
        let unitPrice = cost * (1 + (profit / 100));
        item.price = unitPrice;

        let total = item.qty * unitPrice;
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td class="p-2 border border-slate-400 text-center text-slate-700">${index + 1}</td>
            <td class="p-2 border border-slate-400">
                <input type="text" value="${item.name}" placeholder="ระบุชื่ออุปกรณ์" onchange="updateItem(${index}, 'name', this.value)" class="w-full text-xs font-medium text-slate-900 bg-transparent">
            </td>
            <td class="p-2 border border-slate-400 text-center">
                <input type="number" value="${item.qty}" min="1" onchange="updateItem(${index}, 'qty', this.value)" class="w-12 text-center text-xs bg-transparent font-semibold">
            </td>
            <td class="p-2 border border-slate-400 text-right no-print">
                <input type="number" value="${cost}" min="0" onchange="updateItem(${index}, 'cost', this.value)" class="w-20 text-right text-xs bg-transparent">
            </td>
            <td class="p-2 border border-slate-400 text-center no-print">
                <input type="number" value="${profit}" min="15" max="30" step="1" onchange="updateItem(${index}, 'profit', this.value)" class="w-16 text-center text-xs bg-amber-50 border border-amber-300 rounded px-1 font-semibold text-slate-900">
            </td>
            <td class="p-2 border border-slate-400 text-right font-medium text-slate-800">
                ${unitPrice.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </td>
            <td class="p-2 border border-slate-400 text-right font-semibold text-slate-900">
                ${total.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </td>
            <td class="p-2 border border-slate-400 text-center no-print">
                <button onclick="removeItem(${index})" class="text-rose-600 font-bold text-sm hover:text-rose-800">&times;</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    calculateTotal();
    saveData();
}

// ----------------------------------------
// 🗂️ จุดที่ 6: ฟังก์ชันจัดการ POPUP หมวดหมู่
// ----------------------------------------
function openProductModal() {
    const container = document.getElementById('modalCategoryList');
    container.innerHTML = '';

    productCategories.forEach((cat, catIdx) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'bg-white border rounded-xl overflow-hidden shadow-sm';
        groupDiv.innerHTML = `
            <button type="button" onclick="toggleCategory(${catIdx})" class="w-full bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-left font-bold text-slate-700 text-xs flex justify-between items-center transition">
                <span>📁 ${cat.category}</span>
                <span id="icon-${catIdx}" class="text-slate-500 font-bold">▼ พับเก็บ</span>
            </button>
            <div id="cat-items-${catIdx}" class="divide-y divide-slate-100 p-2 space-y-1">
                ${cat.items.map(prod => `
                    <div onclick="addProductFromModal('${prod.name.replace(/'/g, "\\'")}', ${prod.cost})" class="p-2 hover:bg-amber-50 rounded-lg cursor-pointer flex justify-between items-center transition text-xs">
                        <span class="text-slate-800 font-medium">${prod.name}</span>
                        <span class="text-amber-700 font-bold whitespace-nowrap ml-2">ทุน: ${prod.cost.toLocaleString()} บาท</span>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(groupDiv);
    });

    document.getElementById('productModal').classList.remove('hidden');
}

function toggleCategory(catIdx) {
    const content = document.getElementById(`cat-items-${catIdx}`);
    const icon = document.getElementById(`icon-${catIdx}`);
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.innerText = '▼ พับเก็บ';
    } else {
        content.style.display = 'none';
        icon.innerText = '▶ กดเพื่อขยาย';
    }
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
}

function addProductFromModal(name, cost) {
    items.push({ name: name, qty: 1, cost: cost, profit: 20 });
    renderRows();
    closeProductModal();
}

// ----------------------------------------
// ➕ จุดที่ 7: ฟังก์ชันจัดการแถว เพิ่ม-ลบ-อัปเดต
// ----------------------------------------
function addRow() {
    items.push({ name: "", qty: 1, cost: 0, profit: 20 });
    renderRows();
}

function removeItem(index) {
    items.splice(index, 1);
    renderRows();
}

function updateItem(index, field, value) {
    if (field === 'qty' || field === 'cost' || field === 'profit') {
        items[index][field] = parseFloat(value) || 0;
    } else {
        items[index][field] = value;
    }
    renderRows();
}

// ----------------------------------------
// 🧮 จุดที่ 8: คำนวณยอดเงินรวมและแปลงตัวหนังสือ
// ----------------------------------------
function calculateTotal() {
    let subtotal = items.reduce((sum, item) => {
        let c = parseFloat(item.cost) || 0;
        let p = parseFloat(item.profit) || 20;
        let uPrice = c * (1 + (p / 100));
        return sum + (item.qty * uPrice);
    }, 0);

    let vat = subtotal * 0.07;
    let grand = subtotal + vat;

    document.getElementById('subTotal').innerText = subtotal.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('vatTotal').innerText = vat.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('grandTotal').innerText = grand.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('thaiBahtText').innerText = "(" + ArabicNumberToText(grand) + ")";
    saveData();
}

// แปลงตัวเลขเป็นตัวหนังสือภาษาไทย
function ArabicNumberToText(N) {
    if (N === 0) return "ศูนย์บาทถ้วน";
    let BahtText = "";
    let ReadNum = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
    let ReadPos = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
    
    let strN = N.toFixed(2);
    let parts = strN.split(".");
    let intPart = parts[0];
    let decPart = parts[1];

    function convertInt(s) {
        let t = "";
        let len = s.length;
        for (let i = 0; i < len; i++) {
            let d = parseInt(s.charAt(i));
            let pos = len - i - 1;
            if (d !== 0) {
                if (pos === 1 && d === 1) {
                    t += "สิบ";
                } else if (pos === 1 && d === 2) {
                    t += "ยี่สิบ";
                } else if (pos === 0 && d === 1 && len > 1 && s.charAt(len - 2) !== '0') {
                    t += "เอ็ด";
                } else {
                    t += ReadNum[d] + ReadPos[pos];
                }
            }
        }
        return t;
    }

    BahtText += convertInt(intPart) + "บาท";
    if (decPart === "00") {
        BahtText += "ถ้วน";
    } else {
        BahtText += convertInt(decPart) + "สตางค์";
    }
    return BahtText;
}

function clearData() {
    if (confirm('คุณต้องการล้างข้อมูลทั้งหมดเพื่อเริ่มทำใบเสนอราคาใหม่ใช่หรือไม่?')) {
        localStorage.removeItem('nt_quotation_clean_v1');
        document.getElementById('docReceiveNo').value = '';
        document.getElementById('quotationNo').value = '';
        document.getElementById('custName').value = '';
        document.getElementById('custAddress').value = '';
        document.getElementById('custPhone').value = '';
        document.getElementById('custContact').value = '';
        items = [];
        renderRows();
    }
}

// เริ่มต้นโหลดข้อมูลเมื่อเปิดหน้าเว็บ
loadData();
