const API_URL = "https://script.google.com/macros/s/AKfycbx09PpwSpt9q4mv2Ml6_9pVR8HKzL8SuoT8_H6y6CDZhw1-jHMM0fp9o13tAvGnLTWH/exec";

// Hàm gọi API sử dụng JSONP
function callApiJsonp(params) {
  return new Promise((resolve, reject) => {
    // Tạo URL với tham số
    const url = new URL(API_URL);
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
    
    // Tạo callback name
    const callbackName = 'jsonpCallback_' + Math.round(100000 * Math.random());
    
    // Tạo script element
    const script = document.createElement('script');
    script.src = url.toString() + '&callback=' + callbackName;
    
    // Xử lý response
    window[callbackName] = function(response) {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(response);
    };
    
    // Xử lý lỗi
    script.onerror = function() {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error('Network error'));
    };
    
    // Thêm script vào DOM
    document.body.appendChild(script);
  });
}

// Hàm đăng nhập
async function login(email, password) {
  try {
    console.log("Attempting login with:", email);
    
    const result = await callApiJsonp({
      action: "login",
      email: email,
      password: password
    });
    
    console.log("Login result:", result);
    
    if (result && result.status === "success") {
      localStorage.setItem("user", JSON.stringify(result.user));
      window.location.href = result.user.role === "Admin" ? "admin.html" : "nhan-vien.html";
    } else {
      showNotification(result?.message || "Đăng nhập thất bại", "error");
    }
  } catch (error) {
    console.error("Login error:", error);
    showNotification("Lỗi kết nối đến máy chủ: " + error.message, "error");
  }
}

// Hàm lấy lịch
async function getSchedule(email, type) {
  try {
    const result = await callApiJsonp({
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
  } catch (error) {
    console.error("Get schedule error:", error);
    showNotification("Lỗi kết nối đến máy chủ", "error");
    return [];
  }
}

// Hàm đăng ký lịch
async function registerSchedule(email, data) {
  try {
    const result = await callApiJsonp({
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
  } catch (error) {
    console.error("Register schedule error:", error);
    showNotification("Lỗi kết nối đến máy chủ", "error");
    return false;
  }
}

// Hàm gửi khiếu nại
async function submitComplaint(email, type, date, shift, content, receiver) {
  try {
    const result = await callApiJsonp({
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
  } catch (error) {
    console.error("Submit complaint error:", error);
    showNotification("Lỗi kết nối đến máy chủ", "error");
    return false;
  }
}

// Hàm lấy danh sách khiếu nại
async function getComplaints(role, email) {
  try {
    const result = await callApiJsonp({
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
  } catch (error) {
    console.error("Get complaints error:", error);
    showNotification("Lỗi kết nối đến máy chủ", "error");
    return [];
  }
}

// Hàm cập nhật khiếu nại
async function updateComplaint(id, status) {
  try {
    const result = await callApiJsonp({
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
  } catch (error) {
    console.error("Update complaint error:", error);
    showNotification("Lỗi kết nối đến máy chủ", "error");
    return false;
  }
}

// Hàm lấy giờ công
async function getWorkingHours(email, month, year) {
  try {
    const result = await callApiJsonp({
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
  } catch (error) {
    console.error("Get working hours error:", error);
    showNotification("Lỗi kết nối đến máy chủ", "error");
    return null;
  }
}

// Hàm cập nhật giờ công
async function updateWorkingHours(email, month, year, data) {
  try {
    const result = await callApiJsonp({
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
  } catch (error) {
    console.error("Update working hours error:", error);
    showNotification("Lỗi kết nối đến máy chủ", "error");
    return false;
  }
}

// Hàm công bố lịch
async function publishSchedule(data) {
  try {
    const result = await callApiJsonp({
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
  } catch (error) {
    console.error("Publish schedule error:", error);
    showNotification("Lỗi kết nối đến máy chủ", "error");
    return false;
  }
}

// Hàm lấy danh sách nhân viên
async function getEmployees() {
  try {
    const result = await callApiJsonp({
      action: "getEmployees"
    });
    
    if (result && result.status === "success") {
      return result.data;
    } else {
      showNotification(result?.message || "Lỗi khi lấy danh sách nhân viên", "error");
      return [];
    }
  } catch (error) {
    console.error("Get employees error:", error);
    showNotification("Lỗi kết nối đến máy chủ", "error");
    return [];
  }
}

// Hàm hiển thị thông báo
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

// Định nghĩa hàm toàn cục
window.login = login;
window.getSchedule = getSchedule;
window.registerSchedule = registerSchedule;
window.submitComplaint = submitComplaint;
window.getComplaints = getComplaints;
window.updateComplaint = updateComplaint;
window.getWorkingHours = getWorkingHours;
window.updateWorkingHours = updateWorkingHours;
window.publishSchedule = publishSchedule;
window.getEmployees = getEmployees;
window.showNotification = showNotification;


