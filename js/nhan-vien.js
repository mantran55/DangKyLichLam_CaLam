document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Tab Lịch công bố
  const currentWeekElement = document.getElementById('current-week');
  const prevWeekBtn = document.getElementById('prev-week');
  const nextWeekBtn = document.getElementById('next-week');
  const weekDatesElement = document.getElementById('week-dates');
  const scheduleRowElement = document.getElementById('schedule-row');
  
  let currentWeekStart = new Date();
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Thứ 2
  
  function updatePublishedSchedule() {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Chủ nhật
    
    currentWeekElement.textContent = `${formatDate(currentWeekStart)} - ${formatDate(weekEnd)}`;
    
    // Cập nhật ngày trong tuần
    weekDatesElement.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      const th = document.createElement('th');
      th.textContent = formatDate(date);
      weekDatesElement.appendChild(th);
    }
    
    // Lấy lịch công bố
    getSchedule(user.email, 'published').then(schedule => {
      scheduleRowElement.innerHTML = '';
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        const dateStr = formatDateISO(date);
        
        const td = document.createElement('td');
        const daySchedule = schedule.find(item => item.date === dateStr);
        
        if (daySchedule) {
          const div = document.createElement('div');
          div.className = 'shift-info';
          div.textContent = daySchedule.shift;
          td.appendChild(div);
        } else {
          td.textContent = 'OFF';
        }
        
        scheduleRowElement.appendChild(td);
      }
    });
  }
  
  prevWeekBtn.addEventListener('click', function() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    updatePublishedSchedule();
  });
  
  nextWeekBtn.addEventListener('click', function() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    updatePublishedSchedule();
  });
  
  updatePublishedSchedule();
  
  // Tab Đăng ký lịch
  const currentWeekRegisterElement = document.getElementById('current-week-register');
  const prevWeekRegisterBtn = document.getElementById('prev-week-register');
  const nextWeekRegisterBtn = document.getElementById('next-week-register');
  const weekDatesRegisterElement = document.getElementById('week-dates-register');
  const registerRowElement = document.getElementById('register-row');
  const submitRegisterBtn = document.getElementById('submit-register');
  
  let currentWeekRegisterStart = new Date();
  currentWeekRegisterStart.setDate(currentWeekRegisterStart.getDate() - currentWeekRegisterStart.getDay() + 1); // Thứ 2
  
  const registeredShifts = {};
  
  function updateRegisterSchedule() {
    const weekEnd = new Date(currentWeekRegisterStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Chủ nhật
    
    currentWeekRegisterElement.textContent = `${formatDate(currentWeekRegisterStart)} - ${formatDate(weekEnd)}`;
    
    // Cập nhật ngày trong tuần
    weekDatesRegisterElement.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekRegisterStart);
      date.setDate(date.getDate() + i);
      const th = document.createElement('th');
      th.textContent = formatDate(date);
      weekDatesRegisterElement.appendChild(th);
    }
    
    // Lấy lịch đăng ký
    getSchedule(user.email, 'registered').then(schedule => {
      registerRowElement.innerHTML = '';
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekRegisterStart);
        date.setDate(date.getDate() + i);
        const dateStr = formatDateISO(date);
        
        const td = document.createElement('td');
        td.dataset.date = dateStr;
        
        const daySchedule = schedule.find(item => item.date === dateStr);
        
        if (daySchedule) {
          const div = document.createElement('div');
          div.className = 'shift-info';
          div.textContent = daySchedule.shift;
          td.appendChild(div);
          registeredShifts[dateStr] = daySchedule.shift;
        } else {
          td.textContent = 'OFF';
          registeredShifts[dateStr] = 'OFF';
        }
        
        td.addEventListener('click', function() {
          openShiftModal(dateStr, registeredShifts[dateStr]);
        });
        
        registerRowElement.appendChild(td);
      }
    });
  }
  
  prevWeekRegisterBtn.addEventListener('click', function() {
    currentWeekRegisterStart.setDate(currentWeekRegisterStart.getDate() - 7);
    updateRegisterSchedule();
  });
  
  nextWeekRegisterBtn.addEventListener('click', function() {
    currentWeekRegisterStart.setDate(currentWeekRegisterStart.getDate() + 7);
    updateRegisterSchedule();
  });
  
  submitRegisterBtn.addEventListener('click', function() {
    const data = [];
    
    for (const date in registeredShifts) {
      if (registeredShifts[date] !== 'OFF') {
        data.push({
          date: date,
          shift: registeredShifts[date]
        });
      }
    }
    
    registerSchedule(user.email, data).then(success => {
      if (success) {
        updateRegisterSchedule();
      }
    });
  });
  
  updateRegisterSchedule();
  
  // Modal chọn ca
  const shiftModal = document.getElementById('shift-modal');
  const cancelShiftBtn = document.getElementById('cancel-shift');
  const confirmShiftBtn = document.getElementById('confirm-shift');
  const shiftOptions = document.querySelectorAll('.shift-options input[type="checkbox"]');
  
  let currentDateStr = '';
  
  function openShiftModal(dateStr, currentShift) {
    currentDateStr = dateStr;
    
    // Reset checkboxes
    shiftOptions.forEach(option => {
      option.checked = false;
    });
    
    // Set current shift
    if (currentShift !== 'OFF') {
      if (currentShift === 'FULL') {
        document.querySelector('input[value="FULL"]').checked = true;
      } else if (currentShift.includes(',')) {
        const shifts = currentShift.split(',');
        shifts.forEach(shift => {
          const checkbox = document.querySelector(`input[value="${shift}"]`);
          if (checkbox) checkbox.checked = true;
        });
      } else {
        const checkbox = document.querySelector(`input[value="${currentShift}"]`);
        if (checkbox) checkbox.checked = true;
      }
    }
    
    shiftModal.style.display = 'block';
  }
  
  cancelShiftBtn.addEventListener('click', function() {
    shiftModal.style.display = 'none';
  });
  
  confirmShiftBtn.addEventListener('click', function() {
    const selectedShifts = [];
    const fullCheckbox = document.querySelector('input[value="FULL"]');
    
    if (fullCheckbox.checked) {
      registeredShifts[currentDateStr] = 'FULL';
    } else {
      shiftOptions.forEach(option => {
        if (option.checked && option.value !== 'FULL') {
          selectedShifts.push(option.value);
        }
      });
      
      if (selectedShifts.length === 0) {
        registeredShifts[currentDateStr] = 'OFF';
      } else {
        registeredShifts[currentDateStr] = selectedShifts.join(',');
      }
    }
    
    updateRegisterSchedule();
    shiftModal.style.display = 'none';
  });
  
  // Tab Khiếu nại
  const complaintTypeSelect = document.getElementById('complaint-type');
  const complaintDateInput = document.getElementById('complaint-date');
  const complaintShiftSelect = document.getElementById('complaint-shift');
  const receiverGroup = document.getElementById('receiver-group');
  const complaintReceiverSelect = document.getElementById('complaint-receiver');
  const complaintContentTextarea = document.getElementById('complaint-content');
  const submitComplaintBtn = document.getElementById('submit-complaint');
  
  complaintTypeSelect.addEventListener('change', function() {
    if (this.value === 'Pass ca') {
      receiverGroup.style.display = 'block';
      // Load danh sách nhân viên
      getEmployees().then(employees => {
        complaintReceiverSelect.innerHTML = '';
        employees.forEach(emp => {
          if (emp.email !== user.email) {
            const option = document.createElement('option');
            option.value = emp.email;
            option.textContent = emp.name;
            complaintReceiverSelect.appendChild(option);
          }
        });
      });
    } else {
      receiverGroup.style.display = 'none';
    }
  });
  
  submitComplaintBtn.addEventListener('click', function() {
    const type = complaintTypeSelect.value;
    const date = complaintDateInput.value;
    const shift = complaintShiftSelect.value;
    const content = complaintContentTextarea.value;
    let receiver = '';
    
    if (!date || !content) {
      showNotification('Vui lòng nhập đầy đủ thông tin', 'error');
      return;
    }
    
    if (type === 'Pass ca') {
      receiver = complaintReceiverSelect.value;
      if (!receiver) {
        showNotification('Vui lòng chọn người nhận ca', 'error');
        return;
      }
    }
    
    submitComplaint(user.email, type, date, shift, content, receiver).then(success => {
      if (success) {
        // Reset form
        complaintDateInput.value = '';
        complaintContentTextarea.value = '';
      }
    });
  });
  
  // Tab Giờ công
  const currentMonthElement = document.getElementById('current-month');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const workingHoursRowElement = document.getElementById('working-hours-row');
  const totalHoursElement = document.getElementById('total-hours');
  const totalShiftsElement = document.getElementById('total-shifts');
  
  let currentMonth = new Date().getMonth() + 1;
  let currentYear = new Date().getFullYear();
  
  function updateWorkingHours() {
    currentMonthElement.textContent = `Tháng ${currentMonth}/${currentYear}`;
    
    // Tạo header cho bảng
    const headerRow = document.querySelector('#working-hours thead tr');
    headerRow.innerHTML = '<th>Họ và tên</th>';
    
    for (let i = 1; i <= 31; i++) {
      const th = document.createElement('th');
      th.textContent = i;
      headerRow.appendChild(th);
    }
    
    // Lấy giờ công
    getWorkingHours(user.email, currentMonth, currentYear).then(data => {
      if (data) {
        workingHoursRowElement.innerHTML = `<td>${user.name}</td>`;
        
        for (let i = 0; i < 31; i++) {
          const td = document.createElement('td');
          td.textContent = data.days[i] || 0;
          workingHoursRowElement.appendChild(td);
        }
        
        totalHoursElement.textContent = data.totalHours;
        totalShiftsElement.textContent = data.totalShifts;
      }
    });
  }
  
  prevMonthBtn.addEventListener('click', function() {
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    updateWorkingHours();
  });
  
  nextMonthBtn.addEventListener('click', function() {
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    updateWorkingHours();
  });
  
  updateWorkingHours();
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