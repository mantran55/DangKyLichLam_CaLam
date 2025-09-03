const API_URL = "https://script.google.com/macros/s/AKfycbw.../exec"; // Thay bằng URL của bạn

async function callApi(params) {
  try {
    const url = new URL(API_URL);
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    showNotification("Lỗi kết nối đến máy chủ", "error");
    return null;
  }
}

async function login(email, password) {
  const result = await callApi({
    action: "login",
    email: email,
    password: password
  });
  
  if (result && result.status === "success") {
    localStorage.setItem("user", JSON.stringify(result.user));
    window.location.href = result.user.role === "Admin" ? "admin.html" : "nhan-vien.html";
  } else {
    showNotification(result?.message || "Đăng nhập thất bại", "error");
  }
}

async function getSchedule(email, type) {
  const result = await callApi({
    action: "getSchedule",
    email: email,
    type: type
  });
  
  if (result && result.status === "success") {
    return result.data;
  } else {
    showNotification(result?.message || "Lỗi khi lấy lịch", "error");
    return [];
  }
}

async function registerSchedule(email, data) {
  const result = await callApi({
    action: "registerSchedule",
    email: email,
    data: JSON.stringify(data)
  });
  
  if (result && result.status === "success") {
    showNotification(result.message, "success");
    return true;
  } else {
    showNotification(result?.message || "Lỗi khi đăng ký lịch", "error");
    return false;
  }
}

async function submitComplaint(email, type, date, shift, content, receiver) {
  const result = await callApi({
    action: "submitComplaint",
    email: email,
    type: type,
    date: date,
    shift: shift,
    content: content,
    receiver: receiver || ""
  });
  
  if (result && result.status === "success") {
    showNotification(result.message, "success");
    return true;
  } else {
    showNotification(result?.message || "Lỗi khi gửi khiếu nại", "error");
    return false;
  }
}

async function getComplaints(role, email) {
  const result = await callApi({
    action: "getComplaints",
    role: role,
    email: email
  });
  
  if (result && result.status === "success") {
    return result.data;
  } else {
    showNotification(result?.message || "Lỗi khi lấy khiếu nại", "error");
    return [];
  }
}

async function updateComplaint(id, status) {
  const result = await callApi({
    action: "updateComplaint",
    id: id,
    status: status
  });
  
  if (result && result.status === "success") {
    showNotification(result.message, "success");
    return true;
  } else {
    showNotification(result?.message || "Lỗi khi cập nhật khiếu nại", "error");
    return false;
  }
}

async function getWorkingHours(email, month, year) {
  const result = await callApi({
    action: "getWorkingHours",
    email: email,
    month: month,
    year: year
  });
  
  if (result && result.status === "success") {
    return result.data;
  } else {
    showNotification(result?.message || "Lỗi khi lấy giờ công", "error");
    return null;
  }
}

async function updateWorkingHours(email, month, year, data) {
  const result = await callApi({
    action: "updateWorkingHours",
    email: email,
    month: month,
    year: year,
    data: JSON.stringify(data)
  });
  
  if (result && result.status === "success") {
    showNotification(result.message, "success");
    return true;
  } else {
    showNotification(result?.message || "Lỗi khi cập nhật giờ công", "error");
    return false;
  }
}

async function publishSchedule(data) {
  const result = await callApi({
    action: "publishSchedule",
    data: JSON.stringify(data)
  });
  
  if (result && result.status === "success") {
    showNotification(result.message, "success");
    return true;
  } else {
    showNotification(result?.message || "Lỗi khi công bố lịch", "error");
    return false;
  }
}

async function getEmployees() {
  const result = await callApi({
    action: "getEmployees"
  });
  
  if (result && result.status === "success") {
    return result.data;
  } else {
    showNotification(result?.message || "Lỗi khi lấy danh sách nhân viên", "error");
    return [];
  }
}

function showNotification(message, type) {
  const messageElement = document.getElementById("message") || 
                        document.getElementById("register-message") || 
                        document.getElementById("complaint-message") || 
                        document.getElementById("publish-message") || 
                        document.getElementById("working-hours-message") || 
                        document.getElementById("employee-message");
  
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = "block";
    
    setTimeout(() => {
      messageElement.style.display = "none";
    }, 5000);
  }
}