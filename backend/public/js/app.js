// API Base URL
const API_URL = '/api/v1';

// State
let token = localStorage.getItem('token');
let currentProvider = null;

// DOM Elements
const authSection = document.getElementById('auth-section');
const providersSection = document.getElementById('providers-section');
const providerDetail = document.getElementById('provider-detail');
const bookingsSection = document.getElementById('bookings-section');
const authForm = document.getElementById('authForm');
const authLink = document.getElementById('authLink');
const authTitle = document.getElementById('authTitle');
const toggleAuth = document.getElementById('toggleAuth');
const nameGroup = document.getElementById('nameGroup');
const telGroup = document.getElementById('telGroup');
const roleGroup = document.getElementById('roleGroup');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        authLink.textContent = 'ออกจากระบบ';
        authLink.onclick = logout;
        showProviders();
    } else {
        showAuth();
    }

    setupNavigation();
});

// Navigation
function setupNavigation() {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (e.target.id === 'authLink') return;

            e.preventDefault();
            const href = e.target.getAttribute('href');

            if (href === '#home') {
                if (token) showProviders();
                else showAuth();
            } else if (href === '#providers') {
                if (token) showProviders();
                else showMessage('กรุณาเข้าสู่ระบบก่อน', 'error');
            } else if (href === '#bookings') {
                if (token) showBookings();
                else showMessage('กรุณาเข้าสู่ระบบก่อน', 'error');
            }
        });
    });
}

// Toggle between login and register
let isLogin = true;
toggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;

    if (isLogin) {
        authTitle.textContent = 'เข้าสู่ระบบ';
        toggleAuth.textContent = 'สร้างบัญชีใหม่';
        nameGroup.style.display = 'none';
        telGroup.style.display = 'none';
        roleGroup.style.display = 'none';
        authForm.querySelector('button').textContent = 'เข้าสู่ระบบ';
    } else {
        authTitle.textContent = 'สร้างบัญชี';
        toggleAuth.textContent = 'เข้าสู่ระบบ';
        nameGroup.style.display = 'block';
        telGroup.style.display = 'block';
        roleGroup.style.display = 'block';
        authForm.querySelector('button').textContent = 'สมัครสมาชิก';
    }
});

// Auth Form Submit
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        let response;

        if (isLogin) {
            response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
        } else {
            const name = document.getElementById('name').value;
            const tel = document.getElementById('tel').value;
            const role = document.getElementById('role').value;

            response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, tel, role })
            });
        }

        const data = await response.json();

        if (data.success) {
            token = data.token;
            localStorage.setItem('token', token);
            authLink.textContent = 'ออกจากระบบ';
            authLink.onclick = logout;
            showMessage(isLogin ? 'เข้าสู่ระบบสำเร็จ' : 'สมัครสมาชิกสำเร็จ', 'success');
            authForm.reset();
            showProviders();
        } else {
            showMessage(data.message || 'เกิดข้อผิดพลาด', 'error');
        }
    } catch (error) {
        showMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์', 'error');
    }
});

// Logout
function logout(e) {
    e.preventDefault();
    token = null;
    localStorage.removeItem('token');
    authLink.textContent = 'เข้าสู่ระบบ';
    authLink.onclick = null;
    showAuth();
    showMessage('ออกจากระบบสำเร็จ', 'success');
}

// Show Sections
function showAuth() {
    hideAllSections();
    authSection.style.display = 'block';
}

function showProviders() {
    hideAllSections();
    providersSection.style.display = 'block';
    loadProviders();
}

function showProviderDetail(provider) {
    hideAllSections();
    providerDetail.style.display = 'block';
    currentProvider = provider;

    document.getElementById('providerInfo').innerHTML = `
        <h3>${provider.name}</h3>
        <p><strong>ที่อยู่:</strong> ${provider.address}</p>
        <p><strong>เบอร์โทร:</strong> ${provider.tel}</p>
        <p><strong>เวลาเปิด-ปิด:</strong> ${provider.opentime} - ${provider.closetime}</p>
    `;

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').min = today;
}

function showBookings() {
    hideAllSections();
    bookingsSection.style.display = 'block';
    loadBookings();
}

function hideAllSections() {
    authSection.style.display = 'none';
    providersSection.style.display = 'none';
    providerDetail.style.display = 'none';
    bookingsSection.style.display = 'none';
}

// Load Providers
async function loadProviders() {
    try {
        const response = await fetch(`${API_URL}/providers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            displayProviders(data.data);
        } else {
            showMessage('ไม่สามารถโหลดข้อมูลศูนย์บริการได้', 'error');
        }
    } catch (error) {
        showMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
}

function displayProviders(providers) {
    const list = document.getElementById('providersList');

    if (providers.length === 0) {
        list.innerHTML = '<p>ไม่พบศูนย์บริการ</p>';
        return;
    }

    list.innerHTML = providers.map(provider => `
        <div class="provider-card" onclick='showProviderDetail(${JSON.stringify(provider)})'>
            <h3>${provider.name}</h3>
            <p>${provider.address}</p>
            <p>โทร: ${provider.tel}</p>
            <p>เวลา: ${provider.opentime} - ${provider.closetime}</p>
        </div>
    `).join('');
}

// Booking Form
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const bookingDate = document.getElementById('bookingDate').value;

    try {
        const response = await fetch(`${API_URL}/providers/${currentProvider._id}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bookingDate })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('จองบริการสำเร็จ', 'success');
            document.getElementById('bookingForm').reset();
            showBookings();
        } else {
            showMessage(data.message || 'ไม่สามารถจองได้', 'error');
        }
    } catch (error) {
        showMessage('เกิดข้อผิดพลาดในการจอง', 'error');
    }
});

// Load Bookings
async function loadBookings() {
    try {
        const response = await fetch(`${API_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            displayBookings(data.data);
        } else {
            showMessage('ไม่สามารถโหลดข้อมูลการจองได้', 'error');
        }
    } catch (error) {
        showMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
}

function displayBookings(bookings) {
    const list = document.getElementById('bookingsList');

    if (bookings.length === 0) {
        list.innerHTML = '<p>ยังไม่มีการจอง</p>';
        return;
    }

    list.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <h3>${booking.provider?.name || 'ไม่ระบุ'}</h3>
            <p><strong>วันที่:</strong> ${new Date(booking.bookingDate).toLocaleDateString('th-TH')}</p>
            <p><strong>สถานะ:</strong> <span class="status status-${booking.status}">${getStatusText(booking.status)}</span></p>
            ${booking.status === 'pending' ? `
                <button class="btn btn-danger" onclick="cancelBooking('${booking._id}')" style="width:auto;margin-top:1rem;">ยกเลิก</button>
            ` : ''}
        </div>
    `).join('');
}

// Cancel Booking
async function cancelBooking(bookingId) {
    if (!confirm('คุณต้องการยกเลิกการจองนี้หรือไม่?')) return;

    try {
        const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            showMessage('ยกเลิกการจองสำเร็จ', 'success');
            loadBookings();
        } else {
            showMessage(data.message || 'ไม่สามารถยกเลิกได้', 'error');
        }
    } catch (error) {
        showMessage('เกิดข้อผิดพลาดในการยกเลิก', 'error');
    }
}

// Helper Functions
function getStatusText(status) {
    const statusMap = {
        'pending': 'รอดำเนินการ',
        'confirmed': 'ยืนยันแล้ว',
        'cancelled': 'ยกเลิกแล้ว'
    };
    return statusMap[status] || status;
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;

    const main = document.querySelector('main');
    main.insertBefore(messageDiv, main.firstChild);

    setTimeout(() => messageDiv.remove(), 3000);
}
