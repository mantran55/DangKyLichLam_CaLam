document.addEventListener('DOMContentLoaded', function() {
  // Kiểm tra đăng nhập
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage === 'index.html') {
    // Nếu đã đăng nhập, chuyển hướng
    if (user) {
      window.location.href = user.role === 'Admin' ? 'admin.html' : 'nhan-vien.html';
      return;
    }
    
    // Xử lý đăng nhập
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', async function() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
          showNotification('Vui lòng nhập email và mật khẩu', 'error');
          return;
        }
        
        try {
          // Gọi API trực tiếp
          const response = await fetch(`${API_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (result && result.status === "success") {
            localStorage.setItem("user", JSON.stringify(result.user));
            window.location.href = result.user.role === "Admin" ? "admin.html" : "nhan-vien.html";
          } else {
            showNotification(result?.message || "Đăng nhập thất bại", "error");
          }
        } catch (error) {
          console.error('Lỗi đăng nhập:', error);
          showNotification('Lỗi kết nối đến máy chủ: ' + error.message, 'error');
        }
      });
    }
  } else {
    // Các trang khác yêu cầu đăng nhập
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    
    // Hiển thị thông tin user
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = user.name;
    }
    
    // Kiểm tra quyền truy cập
    if (currentPage === 'admin.html' && user.role !== 'Admin') {
      window.location.href = 'nhan-vien.html';
      return;
    }
    
    // Xử lý đăng xuất
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = 'index.html';
      });
    }
    
    // Xử lý chuyển tab
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        // Ẩn tất cả tab
        document.querySelectorAll('.tab-pane').forEach(pane => {
          pane.classList.remove('active');
        });
        
        // Hiển thị tab được chọn
        document.getElementById(tabId).classList.add('active');
        
        // Cập nhật trạng thái active của nút
        tabBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }
});
