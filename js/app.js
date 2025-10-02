// Mailbox Modal-Logik
let currentMail = null;

async function loadMailbox() {
  const res = await fetch('http://localhost:3001/api/mailbox');
  const mails = await res.json();
  renderMailboxGrid(mails);
}

function renderMailboxGrid(mails) {
  const main = document.getElementById('main-content');
  // Rollenlogik: Nur Admins und ggf. weitere Rollen dürfen Mails bearbeiten/löschen/neu
  let canEdit = currentUser && Array.isArray(currentUser.departmentRoles) && (currentUser.departmentRoles.includes('Admin') || currentUser.departmentRoles.includes('Mailbox-Manager'));
  main.innerHTML = '<div class="d-flex justify-content-between align-items-center mb-2">'
    + '<h4>Mailbox</h4>'
    + (canEdit ? '<button class="btn btn-success btn-sm" id="addMailBtn">Neue E-Mail</button>' : '')
    + '</div>'
    + '<table class="table table-dark table-striped"><thead><tr><th>Von</th><th>An</th><th>Betreff</th><th>Gesendet am</th><th></th></tr></thead><tbody>'
    + mails.map(m => {
        let buttons = '';
        if (canEdit) {
          buttons += `<button class="btn btn-danger btn-sm" onclick="deleteMail('${m.id}')">Löschen</button>`;
        }
        return `
      <tr>
        <td>${m.from_addr}</td>
        <td>${m.to_addr}</td>
        <td>${m.subject}</td>
        <td>${m.sent_at ? new Date(m.sent_at).toLocaleString('de-DE') : ''}</td>
        <td>${buttons}</td>
      </tr>
        `;
      }).join('')
    + '</tbody></table>';
  if (canEdit) document.getElementById('addMailBtn').onclick = () => openMailboxModal();
}

function openMailboxModal() {
  currentMail = null;
  fillMailboxForm(null);
  const modal = new bootstrap.Modal(document.getElementById('mailboxModal'));
  modal.show();
}

function fillMailboxForm(mail) {
  document.getElementById('mailbox-id').value = mail ? mail.id : '';
  document.getElementById('mailbox-from').value = mail ? mail.from_addr : '';
  document.getElementById('mailbox-to').value = mail ? mail.to_addr : '';
  document.getElementById('mailbox-subject').value = mail ? mail.subject : '';
  document.getElementById('mailbox-body').value = mail ? mail.body : '';
}

document.getElementById('mailboxForm').onsubmit = async function(e) {
  e.preventDefault();
  const now = new Date();
  const mail = {
    id: crypto.randomUUID(),
    from_addr: document.getElementById('mailbox-from').value,
    to_addr: document.getElementById('mailbox-to').value,
    subject: document.getElementById('mailbox-subject').value,
    body: document.getElementById('mailbox-body').value,
    sent_at: now.toISOString().slice(0, 19).replace('T', ' ')
  };
  await fetch('http://localhost:3001/api/mailbox', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mail)
  });
  bootstrap.Modal.getInstance(document.getElementById('mailboxModal')).hide();
  loadMailbox();
};

async function deleteMail(id) {
  if (confirm('Wirklich löschen?')) {
    await fetch(`http://localhost:3001/api/mailbox/${id}`, { method: 'DELETE' });
    loadMailbox();
  }
}
// Checklist Modal-Logik
let currentChecklist = null;

// Hilfsfunktion zum Befüllen von Officer-Dropdowns
async function fillOfficerDropdown(selectId, selectedId = '') {
  const res = await fetch('http://localhost:3001/api/officers');
  const officers = await res.json();
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">Bitte wählen</option>' + officers.map(o =>
    `<option value="${o.id}" ${o.id === selectedId ? 'selected' : ''}>${o.first_name} ${o.last_name} (${o.rank})</option>`
  ).join('');
}

async function loadChecklists() {
  const res = await fetch('http://localhost:3001/api/checklists');
  const checklists = await res.json();
  renderChecklistGrid(checklists);
}

function renderChecklistGrid(checklists) {
  const main = document.getElementById('main-content');
  let canEdit = currentUser && Array.isArray(currentUser.departmentRoles) && (currentUser.departmentRoles.includes('Admin') || currentUser.departmentRoles.includes('Personalabteilung'));
  main.innerHTML = '<div class="d-flex justify-content-between align-items-center mb-2">'
    + '<h4>Checklisten</h4>'
    + (canEdit ? '<button class="btn btn-success btn-sm" id="addChecklistBtn">Neu</button>' : '')
    + '</div>'
    + '<table class="table table-dark table-striped"><thead><tr><th>Officer</th><th>Items</th><th>Abgeschlossen</th><th></th></tr></thead><tbody>'
    + checklists.map(c => {
        let buttons = '';
        if (canEdit) {
          buttons += `<button class="btn btn-primary btn-sm me-1" onclick="openChecklistModal('${c.id}')">Bearbeiten</button>`;
          buttons += `<button class="btn btn-danger btn-sm" onclick="deleteChecklist('${c.id}')">Löschen</button>`;
        }
        return `
      <tr>
        <td>${c.officer_id}</td>
        <td><pre class="text-light" style="white-space:pre-wrap;max-width:300px;">${c.items}</pre></td>
        <td>${c.is_completed ? 'Ja' : 'Nein'}</td>
        <td>${buttons}</td>
      </tr>
        `;
      }).join('')
    + '</tbody></table>';
  if (canEdit) document.getElementById('addChecklistBtn').onclick = () => openChecklistModal();
}

async function openChecklistModal(id) {
  if (id) {
    const res = await fetch('http://localhost:3001/api/checklists');
    const checklists = await res.json();
    currentChecklist = checklists.find(c => c.id === id);
  } else {
    currentChecklist = null;
  }
  await fillOfficerDropdown('checklist-officer-id', currentChecklist ? currentChecklist.officer_id : '');
  fillChecklistForm(currentChecklist);
  const modal = new bootstrap.Modal(document.getElementById('checklistModal'));
  modal.show();
}

function fillChecklistForm(checklist) {
  document.getElementById('checklist-id').value = checklist ? checklist.id : '';
  document.getElementById('checklist-officer-id').value = checklist ? checklist.officer_id : '';
  document.getElementById('checklist-items').value = checklist ? checklist.items : '';
  document.getElementById('checklist-completed').value = checklist ? (checklist.is_completed ? '1' : '0') : '0';
}

document.getElementById('checklistForm').onsubmit = async function(e) {
  e.preventDefault();
  const id = document.getElementById('checklist-id').value;
  let items = document.getElementById('checklist-items').value;
  try { JSON.parse(items); } catch { alert('Items müssen gültiges JSON sein!'); return; }
  const checklist = {
    id: id || crypto.randomUUID(),
    officer_id: document.getElementById('checklist-officer-id').value,
    items,
    is_completed: document.getElementById('checklist-completed').value === '1' ? 1 : 0
  };
  if (id) {
    await fetch(`http://localhost:3001/api/checklists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checklist)
    });
  } else {
    await fetch('http://localhost:3001/api/checklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checklist)
    });
  }
  bootstrap.Modal.getInstance(document.getElementById('checklistModal')).hide();
  loadChecklists();
};

async function deleteChecklist(id) {
  if (confirm('Wirklich löschen?')) {
    await fetch(`http://localhost:3001/api/checklists/${id}`, { method: 'DELETE' });
    loadChecklists();
  }
}
// ITLog Modal-Logik
let currentITLog = null;

async function loadITLogs() {
  const res = await fetch('http://localhost:3001/api/itlogs');
  const itlogs = await res.json();
  renderITLogGrid(itlogs);
}

function renderITLogGrid(itlogs) {
  const main = document.getElementById('main-content');
  let canEdit = currentUser && Array.isArray(currentUser.departmentRoles) && (currentUser.departmentRoles.includes('Admin') || currentUser.departmentRoles.includes('IT-Manager'));
  main.innerHTML = '<div class="d-flex justify-content-between align-items-center mb-2">'
    + '<h4>IT-Logs</h4>'
    + (canEdit ? '<button class="btn btn-success btn-sm" id="addITLogBtn">Neu</button>' : '')
    + '</div>'
    + '<table class="table table-dark table-striped"><thead><tr><th>Typ</th><th>Officer</th><th>Beschreibung</th><th>Erstellt am</th><th></th></tr></thead><tbody>'
    + itlogs.map(l => {
        let buttons = '';
        if (canEdit) {
          buttons += `<button class="btn btn-primary btn-sm me-1" onclick="openITLogModal('${l.id}')">Bearbeiten</button>`;
          buttons += `<button class="btn btn-danger btn-sm" onclick="deleteITLog('${l.id}')">Löschen</button>`;
        }
        return `
      <tr>
        <td>${l.event_type}</td>
        <td>${l.officer_id}</td>
        <td>${l.description || ''}</td>
        <td>${l.created_at ? new Date(l.created_at).toLocaleString('de-DE') : ''}</td>
        <td>${buttons}</td>
      </tr>
        `;
      }).join('')
    + '</tbody></table>';
  if (canEdit) document.getElementById('addITLogBtn').onclick = () => openITLogModal();
}

async function openITLogModal(id) {
  if (id) {
    const res = await fetch('http://localhost:3001/api/itlogs');
    const itlogs = await res.json();
    currentITLog = itlogs.find(l => l.id === id);
  } else {
    currentITLog = null;
  }
  await fillOfficerDropdown('itlog-officer-id', currentITLog ? currentITLog.officer_id : '');
  fillITLogForm(currentITLog);
  const modal = new bootstrap.Modal(document.getElementById('itlogModal'));
  modal.show();
}

function fillITLogForm(log) {
  document.getElementById('itlog-id').value = log ? log.id : '';
  document.getElementById('itlog-event-type').value = log ? log.event_type : '';
  document.getElementById('itlog-officer-id').value = log ? log.officer_id : '';
  document.getElementById('itlog-description').value = log ? log.description : '';
  document.getElementById('itlog-created-at').value = log ? new Date(log.created_at).toISOString().slice(0,16) : '';
}

document.getElementById('itlogForm').onsubmit = async function(e) {
  e.preventDefault();
  const id = document.getElementById('itlog-id').value;
  const log = {
    id: id || crypto.randomUUID(),
    event_type: document.getElementById('itlog-event-type').value,
    officer_id: document.getElementById('itlog-officer-id').value,
    description: document.getElementById('itlog-description').value,
    created_at: new Date(document.getElementById('itlog-created-at').value).toISOString().slice(0, 19).replace('T', ' ')
  };
  if (id) {
    await fetch(`http://localhost:3001/api/itlogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
  } else {
    await fetch('http://localhost:3001/api/itlogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
  }
  bootstrap.Modal.getInstance(document.getElementById('itlogModal')).hide();
  loadITLogs();
};

async function deleteITLog(id) {
  if (confirm('Wirklich löschen?')) {
    await fetch(`http://localhost:3001/api/itlogs/${id}`, { method: 'DELETE' });
    loadITLogs();
  }
}
// Document Modal-Logik
let currentDocument = null;

async function loadDocuments() {
  const res = await fetch('http://localhost:3001/api/documents');
  const documents = await res.json();
  renderDocumentGrid(documents);
}

function renderDocumentGrid(documents) {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="d-flex justify-content-between align-items-center mb-2">'
    + '<h4>Dokumente</h4>'
    + '<button class="btn btn-success btn-sm" id="addDocumentBtn">Neu</button>'
    + '</div>'
    + '<div class="row">'
    + documents.map(d => `
      <div class="col-md-6">
        <div class="card bg-secondary mb-3">
          <div class="card-body">
            <h5 class="card-title">${d.title}</h5>
            <p>${d.content.length > 100 ? d.content.substring(0, 100) + '...' : d.content}</p>
            <small class="text-light">${d.created_at ? new Date(d.created_at).toLocaleString('de-DE') : ''}</small><br>
            <button class="btn btn-primary btn-sm me-1" onclick="openDocumentModal('${d.id}')">Bearbeiten</button>
            <button class="btn btn-danger btn-sm" onclick="deleteDocument('${d.id}')">Löschen</button>
          </div>
        </div>
      </div>
    `).join('')
    + '</div>';
  document.getElementById('addDocumentBtn').onclick = () => openDocumentModal();
}

async function openDocumentModal(id) {
  if (id) {
    const res = await fetch('http://localhost:3001/api/documents');
    const documents = await res.json();
    currentDocument = documents.find(d => d.id === id);
  } else {
    currentDocument = null;
  }
  fillDocumentForm(currentDocument);
  const modal = new bootstrap.Modal(document.getElementById('documentModal'));
  modal.show();
}

function fillDocumentForm(document) {
  document.getElementById('document-id').value = document ? document.id : '';
  document.getElementById('document-title').value = document ? document.title : '';
  document.getElementById('document-content').value = document ? document.content : '';
}

document.getElementById('documentForm').onsubmit = async function(e) {
  e.preventDefault();
  const id = document.getElementById('document-id').value;
  const now = new Date();
  const doc = {
    id: id || crypto.randomUUID(),
    title: document.getElementById('document-title').value,
    content: document.getElementById('document-content').value,
    created_at: id ? undefined : now.toISOString().slice(0, 19).replace('T', ' ')
  };
  if (id) {
    await fetch(`http://localhost:3001/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    });
  } else {
    await fetch('http://localhost:3001/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    });
  }
  bootstrap.Modal.getInstance(document.getElementById('documentModal')).hide();
  loadDocuments();
};

async function deleteDocument(id) {
  if (confirm('Wirklich löschen?')) {
    await fetch(`http://localhost:3001/api/documents/${id}`, { method: 'DELETE' });
    loadDocuments();
  }
}
// Module Modal-Logik
let currentModule = null;

async function loadModules() {
  const res = await fetch('http://localhost:3001/api/modules');
  const modules = await res.json();
  renderModuleGrid(modules);
}

function renderModuleGrid(modules) {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="d-flex justify-content-between align-items-center mb-2">'
    + '<h4>Module</h4>'
    + '<button class="btn btn-success btn-sm" id="addModuleBtn">Neu</button>'
    + '</div>'
    + '<div class="row">'
    + modules.map(m => `
      <div class="col-md-4">
        <div class="card bg-secondary mb-3">
          <div class="card-body">
            <h5 class="card-title">${m.name}</h5>
            <p>${m.description || ''}</p>
            <button class="btn btn-primary btn-sm me-1" onclick="openModuleModal('${m.id}')">Bearbeiten</button>
            <button class="btn btn-danger btn-sm" onclick="deleteModule('${m.id}')">Löschen</button>
          </div>
        </div>
      </div>
    `).join('')
    + '</div>';
  document.getElementById('addModuleBtn').onclick = () => openModuleModal();
}

async function openModuleModal(id) {
  if (id) {
    const res = await fetch('http://localhost:3001/api/modules');
    const modules = await res.json();
    currentModule = modules.find(m => m.id === id);
  } else {
    currentModule = null;
  }
  fillModuleForm(currentModule);
  const modal = new bootstrap.Modal(document.getElementById('moduleModal'));
  modal.show();
}

function fillModuleForm(module) {
  document.getElementById('module-id').value = module ? module.id : '';
  document.getElementById('module-name').value = module ? module.name : '';
  document.getElementById('module-description').value = module ? module.description : '';
}

document.getElementById('moduleForm').onsubmit = async function(e) {
  e.preventDefault();
  const id = document.getElementById('module-id').value;
  const module = {
    id: id || crypto.randomUUID(),
    name: document.getElementById('module-name').value,
    description: document.getElementById('module-description').value
  };
  if (id) {
    await fetch(`http://localhost:3001/api/modules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(module)
    });
  } else {
    await fetch('http://localhost:3001/api/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(module)
    });
  }
  bootstrap.Modal.getInstance(document.getElementById('moduleModal')).hide();
  loadModules();
};

async function deleteModule(id) {
  if (confirm('Wirklich löschen?')) {
    await fetch(`http://localhost:3001/api/modules/${id}`, { method: 'DELETE' });
    loadModules();
  }
}
// Zentrale JS-Datei für KLO Webanwendung


// Officer Modal-Logik
let currentOfficer = null;

async function loadOfficers() {
  const res = await fetch('http://localhost:3001/api/officers');
  const officers = await res.json();
  renderOfficerSidebar(officers);
}

function renderOfficerSidebar(officers) {
  const sidebar = document.getElementById('officer-sidebar');
  // Rollenlogik: Nur Admins und Personalabteilung dürfen Officers bearbeiten/löschen/neu
    let canEdit = currentUser && Array.isArray(currentUser.departmentRoles) && (currentUser.departmentRoles.includes('Admin') || currentUser.departmentRoles.includes('Personalabteilung'));
    sidebar.innerHTML = '<div class="d-flex justify-content-between align-items-center mb-2">'
      + '<h4>Officers</h4>'
      + (canEdit ? '<button class="btn btn-success btn-sm" id="addOfficerBtn">Neu</button>' : '')
      + '</div>'
      + '<ul class="list-group">'
      + officers.map(o => {
          let buttons = '';
          if (canEdit) {
            buttons += `<button class="btn btn-sm btn-primary me-1" onclick="openOfficerModal('${o.id}')">Bearbeiten</button>`;
            buttons += `<button class="btn btn-sm btn-danger me-1" onclick="deleteOfficer('${o.id}')">Löschen</button>`;
            buttons += `<button class="btn btn-sm btn-warning me-1" onclick="openAssignRoleModal('${o.id}')">Rollen zuweisen</button>`;
            buttons += `<button class="btn btn-sm btn-secondary" onclick="openCredentialsModal('${o.id}')">Zugangsdaten</button>`;
          }
          return `<li class="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
          <span>${o.first_name} ${o.last_name} <span class="badge bg-primary ms-2">${o.rank}</span></span>
          <div>${buttons}</div>
        </li>`;
        }).join('')
      + '</ul>';
    if (canEdit) document.getElementById('addOfficerBtn').onclick = () => openOfficerModal();
}

async function openOfficerModal(id) {
  if (id) {
    const res = await fetch(`http://localhost:3001/api/officers`);
    const officers = await res.json();
    currentOfficer = officers.find(o => o.id === id);
  } else {
    currentOfficer = null;
  }
  fillOfficerForm(currentOfficer);
  const modal = new bootstrap.Modal(document.getElementById('officerModal'));
  modal.show();
}

function fillOfficerForm(officer) {
  document.getElementById('officer-id').value = officer ? officer.id : '';
  document.getElementById('officer-badge').value = officer ? officer.badge_number : '';
  document.getElementById('officer-firstname').value = officer ? officer.first_name : '';
  document.getElementById('officer-lastname').value = officer ? officer.last_name : '';
  document.getElementById('officer-phone').value = officer ? officer.phone_number : '';
  document.getElementById('officer-gender').value = officer ? officer.gender : 'male';
  document.getElementById('officer-rank').value = officer ? officer.rank : '';
}

document.getElementById('officerForm').onsubmit = async function(e) {
  e.preventDefault();
  const id = document.getElementById('officer-id').value;
  const officer = {
    id: id || crypto.randomUUID(),
    badge_number: document.getElementById('officer-badge').value,
    first_name: document.getElementById('officer-firstname').value,
    last_name: document.getElementById('officer-lastname').value,
    phone_number: document.getElementById('officer-phone').value,
    gender: document.getElementById('officer-gender').value,
    rank: document.getElementById('officer-rank').value
  };
  if (id) {
    await fetch(`http://localhost:3001/api/officers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(officer)
    });
  } else {
    await fetch('http://localhost:3001/api/officers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(officer)
    });
  }
  bootstrap.Modal.getInstance(document.getElementById('officerModal')).hide();
  loadOfficers();
};

async function deleteOfficer(id) {
  if (confirm('Wirklich löschen?')) {
    await fetch(`http://localhost:3001/api/officers/${id}`, { method: 'DELETE' });
    loadOfficers();
  }
}


// Vehicle Modal-Logik
let currentVehicle = null;

async function loadVehicles() {
  const res = await fetch('http://localhost:3001/api/vehicles');
  const vehicles = await res.json();
  renderVehicleGrid(vehicles);
}

function renderVehicleGrid(vehicles) {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="d-flex justify-content-between align-items-center mb-2">'
    + '<h4>Fahrzeuge</h4>'
    + '<button class="btn btn-success btn-sm" id="addVehicleBtn">Neu</button>'
    + '</div>'
    + '<div class="row">'
    + vehicles.map(v => `
      <div class="col-md-4">
        <div class="card bg-secondary mb-3">
          <div class="card-body">
            <h5 class="card-title">${v.name}</h5>
            <p>Kategorie: ${v.category}</p>
            <p>Sitzplätze: ${v.capacity}</p>
            <p>Kennzeichen: ${v.license_plate}</p>
            <p>Kilometerstand: ${v.mileage}</p>
            <button class="btn btn-primary btn-sm me-1" onclick="openVehicleModal('${v.id}')">Bearbeiten</button>
            <button class="btn btn-danger btn-sm" onclick="deleteVehicle('${v.id}')">Löschen</button>
          </div>
        </div>
      </div>
    `).join('')
    + '</div>';
  document.getElementById('addVehicleBtn').onclick = () => openVehicleModal();
}

async function openVehicleModal(id) {
  if (id) {
    const res = await fetch('http://localhost:3001/api/vehicles');
    const vehicles = await res.json();
    currentVehicle = vehicles.find(v => v.id === id);
  } else {
    currentVehicle = null;
  }
  fillVehicleForm(currentVehicle);
  const modal = new bootstrap.Modal(document.getElementById('vehicleModal'));
  modal.show();
}

function fillVehicleForm(vehicle) {
  document.getElementById('vehicle-id').value = vehicle ? vehicle.id : '';
  document.getElementById('vehicle-name').value = vehicle ? vehicle.name : '';
  document.getElementById('vehicle-category').value = vehicle ? vehicle.category : '';
  document.getElementById('vehicle-capacity').value = vehicle ? vehicle.capacity : '';
  document.getElementById('vehicle-plate').value = vehicle ? vehicle.license_plate : '';
  document.getElementById('vehicle-mileage').value = vehicle ? vehicle.mileage : '';
}

document.getElementById('vehicleForm').onsubmit = async function(e) {
  e.preventDefault();
  const id = document.getElementById('vehicle-id').value;
  const vehicle = {
    id: id || crypto.randomUUID(),
    name: document.getElementById('vehicle-name').value,
    category: document.getElementById('vehicle-category').value,
    capacity: parseInt(document.getElementById('vehicle-capacity').value, 10),
    license_plate: document.getElementById('vehicle-plate').value,
    mileage: parseInt(document.getElementById('vehicle-mileage').value, 10)
  };
  if (id) {
    await fetch(`http://localhost:3001/api/vehicles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicle)
    });
  } else {
    await fetch('http://localhost:3001/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicle)
    });
  }
  bootstrap.Modal.getInstance(document.getElementById('vehicleModal')).hide();
  loadVehicles();
};

async function deleteVehicle(id) {
  if (confirm('Wirklich löschen?')) {
    await fetch(`http://localhost:3001/api/vehicles/${id}`, { method: 'DELETE' });
    loadVehicles();
  }
}


// Sanction Modal-Logik
let currentSanction = null;

async function loadSanctions() {
  const res = await fetch('http://localhost:3001/api/sanctions');
  const sanctions = await res.json();
  renderSanctionsTable(sanctions);
}

function renderSanctionsTable(sanctions) {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="d-flex justify-content-between align-items-center mb-2">'
    + '<h4>Sanktionen</h4>'
    + '<button class="btn btn-success btn-sm" id="addSanctionBtn">Neu</button>'
    + '</div>'
    + '<table class="table table-dark table-striped"><thead><tr><th>Datum</th><th>Officer</th><th>Typ</th><th>Ausgestellt von</th><th></th></tr></thead><tbody>'
    + sanctions.map(s => `
      <tr>
        <td>${new Date(s.timestamp).toLocaleString('de-DE')}</td>
        <td>${s.officer_id}</td>
        <td>${s.sanction_type}</td>
        <td>${s.issued_by}</td>
        <td>
          <button class="btn btn-primary btn-sm me-1" onclick="openSanctionModal('${s.id}')">Bearbeiten</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSanction('${s.id}')">Löschen</button>
        </td>
      </tr>
    `).join('')
    + '</tbody></table>';
  document.getElementById('addSanctionBtn').onclick = () => openSanctionModal();
}

async function openSanctionModal(id) {
  if (id) {
    const res = await fetch('http://localhost:3001/api/sanctions');
    const sanctions = await res.json();
    currentSanction = sanctions.find(s => s.id === id);
  } else {
    currentSanction = null;
  }
  await fillOfficerDropdown('sanction-officer-id', currentSanction ? currentSanction.officer_id : '');
  fillSanctionForm(currentSanction);
  const modal = new bootstrap.Modal(document.getElementById('sanctionModal'));
  modal.show();
}

function fillSanctionForm(sanction) {
  document.getElementById('sanction-id').value = sanction ? sanction.id : '';
  document.getElementById('sanction-officer-id').value = sanction ? sanction.officer_id : '';
  document.getElementById('sanction-type').value = sanction ? sanction.sanction_type : '';
  document.getElementById('sanction-issued-by').value = sanction ? sanction.issued_by : '';
  document.getElementById('sanction-timestamp').value = sanction ? new Date(sanction.timestamp).toISOString().slice(0,16) : '';
}

document.getElementById('sanctionForm').onsubmit = async function(e) {
  e.preventDefault();
  const id = document.getElementById('sanction-id').value;
  const sanction = {
    id: id || crypto.randomUUID(),
    officer_id: document.getElementById('sanction-officer-id').value,
    sanction_type: document.getElementById('sanction-type').value,
    issued_by: document.getElementById('sanction-issued-by').value,
    timestamp: new Date(document.getElementById('sanction-timestamp').value).toISOString()
  };
  if (id) {
    await fetch(`http://localhost:3001/api/sanctions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanction)
    });
  } else {
    await fetch('http://localhost:3001/api/sanctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanction)
    });
  }
  bootstrap.Modal.getInstance(document.getElementById('sanctionModal')).hide();
  loadSanctions();
};

async function deleteSanction(id) {
  if (confirm('Wirklich löschen?')) {
    await fetch(`http://localhost:3001/api/sanctions/${id}`, { method: 'DELETE' });
    loadSanctions();
  }
}

// Navigation-Handler
function setupNavigation() {
  function setActiveNav(hash) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const nav = document.querySelector(`.nav-link[href='${hash}']`);
    if (nav) nav.classList.add('active');
  }
  window.addEventListener('hashchange', () => {
    route();
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      setActiveNav(link.getAttribute('href'));
    });
  });
}

function route() {
  const hash = window.location.hash || '#officers';
  switch (hash) {
    case '#meindienst': renderMeinDienst(); break;
    case '#officers': loadOfficers(); break;
    case '#vehicles': loadVehicles(); break;
    case '#sanctions': loadSanctions(); break;
    case '#modules': loadModules(); break;
    case '#documents': loadDocuments(); break;
    case '#itlogs': loadITLogs(); break;
    case '#checklists': loadChecklists(); break;
    case '#mailbox': loadMailbox(); break;
    default: loadOfficers(); break;
  }
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const nav = document.querySelector(`.nav-link[href='${hash}']`);
  if (nav) nav.classList.add('active');
}

// --- MEIN DIENST (Dashboard) ---
function renderMeinDienst() {
  if (!currentUser) {
    document.getElementById('main-content').innerHTML = '<div class="alert alert-warning mt-4">Bitte einloggen, um den Dienstbereich zu sehen.</div>';
    return;
  }
  const clockedIn = sessionStorage.getItem('clockedIn') === '1';
  const clockInTime = sessionStorage.getItem('clockInTime');
  const now = new Date();
  let hours = 0;
  if (clockedIn && clockInTime) {
    hours = Math.floor((now - new Date(clockInTime)) / 1000 / 60 / 60);
  }
  document.getElementById('main-content').innerHTML = `
    <div class="container py-4">
      <h2 class="mb-4 text-primary">Mein Dienst</h2>
      <div class="row g-4">
        <div class="col-md-6 col-lg-4">
          <div class="card bg-dark text-light h-100">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title">Stempeluhr</h5>
              <p class="card-text">Status: <span id="clock-status">${clockedIn ? 'Eingestempelt' : 'Ausgestempelt'}</span></p>
              <p class="card-text">${clockedIn && clockInTime ? 'Seit: ' + new Date(clockInTime).toLocaleString('de-DE') : ''}</p>
              <button class="btn btn-${clockedIn ? 'danger' : 'success'} mt-2" id="clock-btn">${clockedIn ? 'Ausstempeln' : 'Einstempeln'}</button>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <div class="card bg-dark text-light h-100">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title">Officer-Info</h5>
              <p class="card-text mb-1"><strong>${currentUser.first_name} ${currentUser.last_name}</strong> (${currentUser.rank})</p>
              <p class="card-text mb-1">Badge: ${currentUser.badge_number || '-'}</p>
              <p class="card-text mb-1">Telefon: ${currentUser.phone_number || '-'}</p>
              <p class="card-text mb-1">Rollen: ${(currentUser.departmentRoles || []).join(', ')}</p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <div class="card bg-dark text-light h-100">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title">Lizenzen</h5>
              <ul class="list-group list-group-flush" id="licenses-list"></ul>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <div class="card bg-dark text-light h-100">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title">Karriere</h5>
              <p class="card-text">Bereit für den nächsten Schritt?</p>
              <button class="btn btn-info mt-2" id="uprank-btn">Uprank anfragen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  // Clock-In/Out-Button-Logik
  document.getElementById('clock-btn').onclick = function() {
    if (sessionStorage.getItem('clockedIn') === '1') {
      sessionStorage.setItem('clockedIn', '0');
      sessionStorage.removeItem('clockInTime');
    } else {
      sessionStorage.setItem('clockedIn', '1');
      sessionStorage.setItem('clockInTime', new Date().toISOString());
    }
    renderMeinDienst();
  };
  // Uprank-Button-Logik
  document.getElementById('uprank-btn').onclick = function() {
    alert('Uprank-Anfrage wurde gesendet!');
  };
  // Lizenzen anzeigen
  const licenses = (currentUser.licenses || []);
  const list = document.getElementById('licenses-list');
  if (licenses.length === 0) {
    list.innerHTML = '<li class="list-group-item bg-dark text-light">Keine Lizenzen vorhanden.</li>';
  } else {
    list.innerHTML = licenses.map(l => `<li class="list-group-item bg-dark text-light">${l.name} <span class="badge bg-secondary ms-2">${l.issued_by || ''}</span></li>`).join('');
  }
}

// --- Login- und Sichtbarkeits-Logik ---
let currentUser = null;

function showPublicHome() {
  document.getElementById('public-home').style.display = '';
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('main-nav').innerHTML = '';
}

function showInternalApp() {
  document.getElementById('public-home').style.display = 'none';
  document.getElementById('main-content').style.display = '';
  let nav = '';
  nav += '<li class="nav-item"><a class="nav-link" href="#officers">Officers</a></li>';
  nav += '<li class="nav-item"><a class="nav-link" href="#vehicles">Fahrzeuge</a></li>';
  nav += '<li class="nav-item"><a class="nav-link" href="#sanctions">Sanktionen</a></li>';
  nav += '<li class="nav-item"><a class="nav-link" href="#modules">Module</a></li>';
  nav += '<li class="nav-item"><a class="nav-link" href="#documents">Dokumente</a></li>';
  nav += '<li class="nav-item"><a class="nav-link" href="#itlogs">IT-Logs</a></li>';
  nav += '<li class="nav-item"><a class="nav-link" href="#checklists">Checklisten</a></li>';
  nav += '<li class="nav-item"><a class="nav-link" href="#mailbox">Mailbox</a></li>';
  if (currentUser && Array.isArray(currentUser.departmentRoles) && currentUser.departmentRoles.includes('Admin')) {
    nav += '<li class="nav-item"><a class="nav-link text-warning" href="#admin">Admin</a></li>';
  }
  nav += '<li class="nav-item"><a class="nav-link" href="#" id="logoutNavBtn">Logout</a></li>';
  document.getElementById('main-nav').innerHTML = nav;
  document.getElementById('logoutNavBtn').onclick = function(e) {
    e.preventDefault();
    handleLogout();
  };
}

function handleLoginSuccess(user) {
  currentUser = user;
  sessionStorage.setItem('loggedInUser', JSON.stringify(user));
  showInternalApp();
  route();
}

// Login-Modal öffnen
document.getElementById('loginNavBtn').onclick = function(e) {
  e.preventDefault();
  const modal = new bootstrap.Modal(document.getElementById('loginModal'));
  modal.show();
};

// Login-Formular-Handler (Dummy, Backend folgt)
document.getElementById('loginForm').onsubmit = async function(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  // TODO: API-Call ersetzen, hier Dummy-Login für Demo
  if (username === 'admin' && password === 'admin') {
    handleLoginSuccess({ username: 'admin', roles: ['Admin'] });
    bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
    document.getElementById('login-error').style.display = 'none';
  } else {
    document.getElementById('login-error').innerText = 'Login fehlgeschlagen!';
    document.getElementById('login-error').style.display = '';
  }
};

// Beim Laden prüfen, ob User eingeloggt ist
document.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('loggedInUser');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      showInternalApp();
      route();
      return;
    } catch {}
  }
  showPublicHome();
});

// Admin-Seite rendern
function renderAdminPage() {
  if (!currentUser || !Array.isArray(currentUser.departmentRoles) || !currentUser.departmentRoles.includes('Admin')) {
    document.getElementById('main-content').innerHTML = '<div class="alert alert-danger mt-4">Kein Zugriff: Nur für Admins!</div>';
    return;
  }
  document.getElementById('main-content').innerHTML = `
    <div class="container py-5">
      <h2 class="mb-4 text-primary">Admin Bereich</h2>
      <div class="row g-4">
        <div class="col-md-6 col-lg-4">
          <div class="card bg-dark text-light h-100">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title">Officer verwalten</h5>
              <p class="card-text">Alle Officers anzeigen, bearbeiten, löschen und Rollen zuweisen.</p>
              <button class="btn btn-primary mt-2" onclick="loadOfficers()">Öffnen</button>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <div class="card bg-dark text-light h-100">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title">Homepage bearbeiten</h5>
              <p class="card-text">Startseite und öffentliche Inhalte verwalten.</p>
              <button class="btn btn-primary mt-2" onclick="alert('Feature folgt!')">Öffnen</button>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <div class="card bg-dark text-light h-100">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title">IT-Protokolle ansehen</h5>
              <p class="card-text">Alle IT-Logs und Systemereignisse einsehen.</p>
              <button class="btn btn-primary mt-2" onclick="loadITLogs()">Öffnen</button>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <div class="card bg-dark text-light h-100">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title">Fuhrpark verwalten</h5>
              <p class="card-text">Fahrzeuge anzeigen, bearbeiten und verwalten.</p>
              <button class="btn btn-primary mt-2" onclick="loadVehicles()">Öffnen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Credentials Management
function openCredentialsModal(officerId) {
  if (!currentUser || !Array.isArray(currentUser.departmentRoles) || (!currentUser.departmentRoles.includes('Admin') && !currentUser.departmentRoles.includes('Personalabteilung'))) {
    alert('Kein Zugriff!');
    return;
  }
  fetch('http://localhost:3001/api/officers')
    .then(res => res.json())
    .then(officers => {
      const officer = officers.find(o => o.id == officerId);
      if (!officer) return;
      document.getElementById('credentials-officer-id').value = officer.id;
      document.getElementById('credentials-username').value = officer.username;
      document.getElementById('credentials-password').value = '';
      const modal = new bootstrap.Modal(document.getElementById('credentialsModal'));
      modal.show();
    });
}

function saveCredentials() {
  const officerId = document.getElementById('credentials-officer-id').value;
  const username = document.getElementById('credentials-username').value;
  const password = document.getElementById('credentials-password').value;
  // Username ändern
  fetch(`http://localhost:3001/api/officers/${officerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  }).then(() => {
    // Passwort ändern, falls gesetzt
    if (password) {
      fetch(`http://localhost:3001/api/officers/${officerId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      }).then(() => {
        bootstrap.Modal.getInstance(document.getElementById('credentialsModal')).hide();
        loadOfficers();
      });
    } else {
      bootstrap.Modal.getInstance(document.getElementById('credentialsModal')).hide();
      loadOfficers();
    }
  });
}
