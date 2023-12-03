let users = []; // It will store fetched users from API 
let currentPage = 1;
const pageSize = 10;

// Fetch users from the API
async function fetchUsers() {
  const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
  users = await response.json();
  renderTable();
}

// Render the table inside HTML with pagination
function renderTable() {
  const table = document.getElementById('userTable');
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const paginatedUsers = users.slice(start, end);

  table.innerHTML = '';

  const headers = Object.keys(paginatedUsers[0]);
  const headerRow = document.createElement('tr');

// Render checkbox header
const checkboxHeader = document.createElement('th');
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.addEventListener('change', toggleSelectAll);
checkboxHeader.appendChild(checkbox);
headerRow.appendChild(checkboxHeader);

headers.forEach(header => {
  const th = document.createElement('th');
  th.textContent = header.charAt(0).toUpperCase() + header.slice(1);
  headerRow.appendChild(th);
});

// Render Actions headers
  const actionHeader = document.createElement('th');
  actionHeader.textContent = 'Actions';
  headerRow.appendChild(actionHeader);
  table.appendChild(headerRow);

// Render table rows
paginatedUsers.forEach(user => {
  const tr = document.createElement('tr');
  tr.dataset.id = user.id;

// Render checkbox column
  const checkboxColumn = document.createElement('td');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.addEventListener('change', toggleRowSelection);
  checkboxColumn.appendChild(checkbox);
  tr.appendChild(checkboxColumn);

  headers.forEach(header => {
    const td = document.createElement('td');
    td.textContent = user[header];
    tr.appendChild(td);
  });

  // Render edit save & delete buttons
  const editButton = createActionButton('Edit', 'edit', editRow);
  const saveButton = createActionButton('Save', 'save', saveRow);
  const deleteButton = createActionButton('Delete', 'delete', deleteRow);

  // Render Actions column with buttons
  const actionsColumn = document.createElement('td');
  actionsColumn.appendChild(editButton);
  actionsColumn.appendChild(saveButton);
  actionsColumn.appendChild(deleteButton);
  tr.appendChild(actionsColumn);

  table.appendChild(tr);
});

  renderPagination();
}

function createActionButton(text, className, onClick) {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = className;
  button.addEventListener('click', onClick);
  return button;
}


// Render pagination buttons
function renderPagination() {
  const totalPages = Math.ceil(users.length / pageSize);
  const pagination = document.querySelector('.pagination');
  pagination.innerHTML = '';

  const createNavigationButton = (text, page, className) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    button.addEventListener('click', () => changePage(page));
    return button;
  };

  // Render first previous next & last page buttons
  pagination.appendChild(createNavigationButton('First', 1, 'first-page'));
  pagination.appendChild(createNavigationButton('Previous', currentPage - 1, 'previous-page'));
  
  for (let i = 1; i <= totalPages; i++) {
    pagination.appendChild(createNavigationButton(i, i, i === currentPage ? 'active' : ''));
  }

  pagination.appendChild(createNavigationButton('Next', currentPage + 1, 'next-page'));
  pagination.appendChild(createNavigationButton('Last', totalPages, 'last-page'));
}


// Added page navigation button
function createPageButton(text, page) {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = page <= 0 || page > Math.ceil(users.length / pageSize) ? 'disabled' : `page-${text.toLowerCase()}`;
  button.addEventListener('click', () => changePage(page));
  return button;
}

function changePage(page) {
  if (page > 0 && page <= Math.ceil(users.length / pageSize)) {
    currentPage = page;
    renderTable();
  }
}

// Search
function search() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const filteredUsers = users.filter(user =>
    Object.values(user).some(value => value.toString().toLowerCase().includes(searchTerm))
  );

  currentPage = 1;
  users = filteredUsers;
  renderTable();
}

// Bulk delete 
function bulkDelete() {
  const selectedRows = document.querySelectorAll('.selected');
  selectedRows.forEach(row => {
    const id = row.dataset.id;
    users = users.filter(user => user.id !== id);
  });

  renderTable();
}

// Select all checkboxes
function toggleSelectAll() {
  const checkboxes = document.querySelectorAll('#userTable input[type="checkbox"]');
  const selectAllCheckbox = checkboxes[0];

  checkboxes.forEach((checkbox, index) => {
    if (index === 0) {
      return; 
    }

    checkbox.checked = selectAllCheckbox.checked;
    const tr = checkbox.closest('tr');
    tr.classList.toggle('selected', checkbox.checked);
  });
}

// Row selection
function toggleRowSelection(event) {
  const tr = event.target.closest('tr');
  tr.classList.toggle('selected');
}

// Row editing
function editRow(event) {
  const tr = event.target.closest('tr');
  const id = tr.dataset.id;

  // Only id name email & role editable
  const editableColumns = ['id', 'name', 'email', 'role'];
  const tds = tr.querySelectorAll('td');

  tds.forEach((td, index) => {
    if (index === 0) {
      return;
    }

    const columnName = Object.keys(users[0])[index - 1]; 
    if (editableColumns.includes(columnName)) {
      td.contentEditable = true;
    } else {
      td.contentEditable = false;
    }
  });
}



// Row deletion
function deleteRow(event) {
  const tr = event.target.closest('tr');
  const id = tr.dataset.id;

  if (tr.classList.contains('selected')) {
    tr.classList.remove('selected');
  }

  users = users.filter(user => user.id !== id);
  renderTable();
}

// Row saving
function saveRow(event) {
  const tr = event.target.closest('tr');
  const id = tr.dataset.id;

  // Only id name email & role editable 
  const editableColumns = ['id', 'name', 'email', 'role'];
  const tds = tr.querySelectorAll('td');

  tds.forEach((td, index) => {
    if (index === 0) {
      return;
    }

    const columnName = Object.keys(users[0])[index - 1]; 
    if (editableColumns.includes(columnName)) {
      const editedValue = td.innerText;
      console.log(`Saving edited value "${editedValue}" for column "${columnName}" in row with ID ${id}`);
    }
  });

  tds.forEach(td => {
    td.contentEditable = false;
  });
}


fetchUsers();
