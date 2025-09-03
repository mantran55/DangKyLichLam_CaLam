document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Tab Lịch đăng ký
  const currentWeekAdminElement = document.getElementById('current-week-admin');
  const prevWeekAdminBtn = document.getElementById('prev-week-admin');
  const nextWeekAdminBtn = document.getElementById('next-week-admin');
  const weekDatesAdminElement = document.getElementById('week-dates-admin');
  const adminScheduleBodyElement = document.getElementById('admin-schedule-body');
  
  let currentWeekAdminStart = new Date();
  currentWeekAdminStart.setDate(currentWeekAdminStart.getDate() - currentWeekAdminStart.getDay() + 1); // Thứ 2
  
  function updateAdminSchedule() {
    const weekEnd = new Date(currentWeekAdminStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Chủ nhật
    
    currentWeekAdminElement.textContent = `${formatDate(currentWeekAdminStart)} - ${formatDate(weekEnd)}`;
    
    // Cập nhật ngày trong tuần
    weekDatesAdminElement.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekAdminStart);
      date.setDate(date.getDate() + i);
      const th = document.createElement('th');
      th.textContent = formatDate(date);
      weekDatesAdminElement.appendChild(th);
    }
    
    // Lấy danh sách nhân viên
    getEmployees().then(employees => {
      adminScheduleBodyElement.innerHTML = '';
      
      employees.forEach(emp => {
        const row = document.createElement('tr');
        
        // Tên nhân viên
        const nameCell = document.createElement('td');
        nameCell.textContent = emp.name;
        row.appendChild(nameCell);
        
        // Lịch đăng ký của nhân viên
        getSchedule(emp.email, 'registered').then(schedule => {
          for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekAdminStart);
            date.setDate(date.getDate() + i);
            const dateStr = formatDateISO(date);
            
            const cell = document.createElement('td');
            const daySchedule = schedule.find(item => item.date === dateStr);
            
            if (daySchedule) {
              cell.textContent = daySchedule.shift;
            } else {
              cell.textContent = 'OFF';
            }
            
            row.appendChild(cell);
          }
        });
        
        adminScheduleBodyElement.appendChild(row);
      });
    });
  }
  
  prevWeekAdminBtn.addEventListener('click', function() {
    currentWeekAdminStart.setDate(currentWeekAdminStart.getDate() - 7);
    updateAdminSchedule();
  });
  
  nextWeekAdminBtn.addEventListener('click', function() {
    currentWeekAdminStart.setDate(currentWeekAdminStart.getDate() + 7);
    updateAdminSchedule();
  });
  
  updateAdminSchedule();
  
  // Tab Công bố lịch
  const currentWeekPublishElement = document.getElementById('current-week-publish');
  const prevWeekPublishBtn = document.getElementById('prev-week-publish');
  const nextWeekPublishBtn = document.getElementById('next-week-publish');
  const weekDatesPublishElement = document.getElementById('week-dates-publish');
  const publishScheduleBodyElement = document.getElementById('publish-schedule-body');
  const publishScheduleBtn = document.getElementById('publish-schedule');
  
  let currentWeekPublishStart = new Date();
  currentWeekPublishStart.setDate(currentWeekPublishStart.getDate() - currentWeekPublishStart.getDay() + 1); // Thứ 2
  
  function updatePublishSchedule() {
    const weekEnd = new Date(currentWeekPublishStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Chủ nhật
    
    currentWeekPublishElement.textContent = `${formatDate(currentWeekPublishStart)} - ${formatDate(weekEnd)}`;
    
    // Cập nhật ngày trong tuần
    weekDatesPublishElement.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekPublishStart);
      date.setDate(date.getDate() + i);
      const th = document.createElement('th');
      th.textContent = formatDate(date);
      weekDatesPublishElement.appendChild(th);
    }
    
    // Lấy danh sách nhân viên
    getEmployees().then(employees => {
      publishScheduleBodyElement.innerHTML = '';
      
      employees.forEach(emp => {
        const row = document.createElement('tr');
        row.dataset.email = emp.email;
        
        // Tên nhân viên
        const nameCell = document.createElement('td');
        nameCell.textContent = emp.name;
        row.appendChild(nameCell);
        
        // Lịch đăng ký của nhân viên
        getSchedule(emp.email, 'registered').then(schedule => {
          let totalShifts = 0;
          
          for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekPublishStart);
            date.setDate(date.getDate() + i);
            const dateStr = formatDateISO(date);
            
            const cell = document.createElement('td');
            const daySchedule = schedule.find(item => item.date === dateStr);
            
            if (daySchedule) {
              const select = document.createElement('select');
              select.className = 'shift-select';
              select.dataset.date = dateStr;
              
              const options = ['OFF', 'CA1', 'CA2', 'CA3', 'FULL'];
              options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = option;
                if (option === daySchedule.shift) {
                  opt.selected = true;
                }
                select.appendChild(opt);
              });
              
              cell.appendChild(select);
              
              if (daySchedule.shift !== 'OFF') {
                totalShifts++;
              }
            } else {
              const select = document.createElement('select');
              select.className = 'shift-select';
              select.dataset.date = dateStr;
              
              const options = ['OFF', 'CA1', 'CA2', 'CA3', 'FULL'];
              options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = option;
                select.appendChild(opt);
              });
              
              cell.appendChild(select);
            }
            
            row.appendChild(cell);
          }
          
          // Tổng ca
          const totalCell = document.createElement('td');
          totalCell.textContent = totalShifts;
          row.appendChild(totalCell);
        });
        
        publishScheduleBodyElement.appendChild(row);
      });
    });
  }
  
  prevWeekPublishBtn.addEventListener('click', function() {
    currentWeekPublishStart.setDate(currentWeekPublishStart.getDate() - 7);
    updatePublishSchedule();
  });
  
  nextWeekPublishBtn.addEventListener('click', function() {
    currentWeekPublishStart.setDate(currentWeekPublishStart.getDate() + 7);
    updatePublishSchedule();
  });
  
  publishScheduleBtn.addEventListener('click', function() {
    const data = [];
    const rows = publishScheduleBodyElement.querySelectorAll('tr');
    
    rows.forEach(row => {
      const email = row.dataset.email;
      const selects = row.querySelectorAll('.shift-select');
      
      selects.forEach(select => {
        const date = select.dataset.date;
        const shift = select.value;
        
        if (shift !== 'OFF') {
          data.push({
            email: email,
            date: date,
            shift: shift
          });
        }
      });
    });
    
    publishSchedule(data).then(success => {
      if (success) {
        updateAdminSchedule();
      }
    });
  });
  
  updatePublishSchedule();
  
  // Tab Khiếu nại
  const complaintsBodyElement = document.getElementById('complaints-body');
  
  function updateComplaints() {
    getComplaints('Admin', '').then(complaints => {
      complaintsBodyElement.innerHTML = '';
      
      complaints.forEach(complaint => {
        const row = document.createElement('tr');
        
        // ID
        const idCell = document.createElement('td');
        idCell.textContent = complaint.id;
        row.appendChild(idCell);
        
        // Email
        const emailCell = document.createElement('td');
        emailCell.textContent = complaint.email;
        row.appendChild(emailCell);
        
        // Loại
        const typeCell = document.createElement('td');
        typeCell.textContent = complaint.type;
        row.appendChild(typeCell);
        
        // Ngày
        const dateCell = document.createElement('td');
        dateCell.textContent = complaint.date;
        row.appendChild(dateCell);
        
        // Ca
        const shiftCell = document.createElement('td');
        shiftCell.textContent = complaint.shift;
        row.appendChild(shiftCell);
        
        // Nội dung
        const contentCell = document.createElement('td');
        contentCell.textContent = complaint.content;
        row.appendChild(contentCell);
        
        // Người nhận ca
        const receiverCell = document.createElement('td');
        receiverCell.textContent = complaint.receiver || '-';
        row.appendChild(receiverCell);
        
        // Trạng thái
        const statusCell = document.createElement('td');
        statusCell.textContent = complaint.status;
        row.appendChild(statusCell);
        
        // Hành động
        const actionCell = document.createElement('td');
        actionCell.className = 'action-buttons';
        
        if (complaint.status === 'Chờ xử lý') {
          const approveBtn = document.createElement('button');
          approveBtn.className = 'approve-btn';
          approveBtn.textContent = 'Đồng ý';
          approveBtn.addEventListener('click', function() {
            updateComplaint(complaint.id, 'Đã xử lý').then(success => {
              if (success) {
                updateComplaints();
              }
            });
          });
          actionCell.appendChild(approveBtn);
          
          const rejectBtn = document.createElement('button');
          rejectBtn.className = 'reject-btn';
          rejectBtn.textContent = 'Từ chối';
          rejectBtn.addEventListener('click', function() {
            updateComplaint(complaint.id, 'Từ chối').then(success => {
              if (success) {
                updateComplaints();
              }
            });
          });
          actionCell.appendChild(rejectBtn);
        }
        
        row.appendChild(actionCell);
        
        complaintsBodyElement.appendChild(row);
      });
    });
  }
  
  updateComplaints();
  
  // Tab Giờ công
  const currentMonthAdminElement = document.getElementById('current-month-admin');
  const prevMonthAdminBtn = document.getElementById('prev-month-admin');
  const nextMonthAdminBtn = document.getElementById('next-month-admin');
  const workingHoursBodyElement = document.getElementById('working-hours-body');
  const saveWorkingHoursBtn = document.getElementById('save-working-hours');
  
  let currentMonthAdmin = new Date().getMonth() + 1;
  let currentYearAdmin = new Date().getFullYear();
  
  function updateWorkingHoursAdmin() {
    currentMonthAdminElement.textContent = `Tháng ${currentMonthAdmin}/${currentYearAdmin}`;
    
    // Tạo header cho bảng
    const headerRow = document.querySelector('#working-hours thead tr');
    headerRow.innerHTML = '<th>Email</th>';
    
    for (let i = 1; i <= 31; i++) {
      const th = document.createElement('th');
      th.textContent = i;
      headerRow.appendChild(th);
    }
    
    // Lấy danh sách nhân viên
    getEmployees().then(employees => {
      workingHoursBodyElement.innerHTML = '';
      
      employees.forEach(emp => {
        const row = document.createElement('tr');
        row.dataset.email = emp.email;
        
        // Email
        const emailCell = document.createElement('td');
        emailCell.textContent = emp.email;
        row.appendChild(emailCell);
        
        // Giờ công
        getWorkingHours(emp.email, currentMonthAdmin, currentYearAdmin).then(data => {
          if (data) {
            for (let i = 0; i < 31; i++) {
              const cell = document.createElement('td');
              const input = document.createElement('input');
              input.type = 'number';
              input.min = '0';
              input.step = '0.5';
              input.value = data.days[i] || 0;
              input.dataset.day = i + 1;
              cell.appendChild(input);
              row.appendChild(cell);
            }
          } else {
            for (let i = 0; i < 31; i++) {
              const cell = document.createElement('td');
              const input = document.createElement('input');
              input.type = 'number';
              input.min = '0';
              input.step = '0.5';
              input.value = 0;
              input.dataset.day = i + 1;
              cell.appendChild(input);
              row.appendChild(cell);
            }
          }
        });
        
        workingHoursBodyElement.appendChild(row);
      });
    });
  }
  
  prevMonthAdminBtn.addEventListener('click', function() {
    currentMonthAdmin--;
    if (currentMonthAdmin < 1) {
      currentMonthAdmin = 12;
      currentYearAdmin--;
    }
    updateWorkingHoursAdmin();
  });
  
  nextMonthAdminBtn.addEventListener('click', function() {
    currentMonthAdmin++;
    if (currentMonthAdmin > 12) {
      currentMonthAdmin = 1;
      currentYearAdmin++;
    }
    updateWorkingHoursAdmin();
  });
  
  saveWorkingHoursBtn.addEventListener('click', function() {
    const rows = workingHoursBodyElement.querySelectorAll('tr');
    const updates = [];
    
    rows.forEach(row => {
      const email = row.dataset.email;
      const inputs = row.querySelectorAll('input');
      const days = new Array(31).fill(0);
      let totalHours = 0;
      
      inputs.forEach(input => {
        const day = parseInt(input.dataset.day) - 1;
        const value = parseFloat(input.value) || 0;
        days[day] = value;
        totalHours += value;
      });
      
      updates.push({
        email: email,
        month: currentMonthAdmin,
        year: currentYearAdmin,
        data: {
          days: days,
          totalHours: totalHours,
          totalShifts: 0
        }
      });
    });
    
    // Cập nhật từng nhân viên
    let count = 0;
    updates.forEach(update => {
      updateWorkingHours(update.email, update.month, update.year, update.data).then(success => {
        count++;
        if (count === updates.length) {
          showNotification('Cập nhật giờ công thành công', 'success');
        }
      });
    });
  });
  
  updateWorkingHoursAdmin();
  
  // Tab Quản lý nhân viên
  const employeesBodyElement = document.getElementById('employees-body');
  const addEmployeeBtn = document.getElementById('add-employee');
  
  function updateEmployees() {
    getEmployees().then(employees => {
      employeesBodyElement.innerHTML = '';
      
      employees.forEach(emp => {
        const row = document.createElement('tr');
        
        // Email
        const emailCell = document.createElement('td');
        emailCell.textContent = emp.email;
        row.appendChild(emailCell);
        
        // Tên
        const nameCell = document.createElement('td');
        nameCell.textContent = emp.name;
        row.appendChild(nameCell);
        
        // Vai trò
        const roleCell = document.createElement('td');
        roleCell.textContent = emp.role;
        row.appendChild(roleCell);
        
        // Hành động
        const actionCell = document.createElement('td');
        actionCell.className = 'action-buttons';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Sửa';
        actionCell.appendChild(editBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Xóa';
        actionCell.appendChild(deleteBtn);
        
        row.appendChild(actionCell);
        
        employeesBodyElement.appendChild(row);
      });
    });
  }
  
  addEmployeeBtn.addEventListener('click', function() {
    showNotification('Chức năng đang phát triển', 'error');
  });
  
  updateEmployees();
});

// Helper functions
function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}/${month}`;
}

function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}