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
    + (canEdit ? '<div><button class="btn btn-secondary btn-sm me-2" id="templateBtn">Vorlage</button><button class="btn btn-success btn-sm" id="addChecklistBtn">Neu</button></div>' : '')
    + '</div>'
    + '<table class="table table-dark table-striped"><thead><tr><th>Officer</th><th>Items</th><th>Abgeschlossen</th><th></th></tr></thead><tbody>'
    + checklists.map(c => {
        let buttons = '';
        if (canEdit) {
          buttons += `<button class="btn btn-primary btn-sm me-1" onclick="openChecklistModal('${c.id}')">Bearbeiten</button>`;
          buttons += `<button class="btn btn-danger btn-sm" onclick="deleteChecklist('${c.id}')">Löschen</button>`;
        }
        // Items als Liste anzeigen
        let itemsHtml = '';
        try {
          const arr = JSON.parse(c.items);
          if (Array.isArray(arr)) {
            itemsHtml = '<ul class="mb-0">' + arr.map(i => `<li>${i}</li>`).join('') + '</ul>';
          } else {
            itemsHtml = `<pre class="text-light" style="white-space:pre-wrap;max-width:300px;">${c.items}</pre>`;
          }
        } catch { itemsHtml = `<pre class="text-light" style="white-space:pre-wrap;max-width:300px;">${c.items}</pre>`; }
        return `
      <tr>
        <td>${c.officer_id}</td>
        <td>${itemsHtml}</td>
        <td>${c.is_completed ? 'Ja' : 'Nein'}</td>
        <td>${buttons}</td>
      </tr>
        `;
      }).join('')
    + '</tbody></table>';
  if (canEdit) document.getElementById('addChecklistBtn').onclick = () => openChecklistModal();
  if (canEdit) document.getElementById('templateBtn').onclick = openChecklistTemplateModal;
}

// Vorlagenverwaltung
function openChecklistTemplateModal() {
  let template = localStorage.getItem('checklist_template') || '["Ausrüstung geprüft","Fahrzeug gecheckt","Status gemeldet"]';
  const html = `
    <div class="modal fade" id="checklistTemplateModal" tabindex="-1" aria-labelledby="checklistTemplateModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="checklistTemplateModalLabel">Checklistenvorlage bearbeiten</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <textarea class="form-control" id="checklist-template-text" rows="6">${template}</textarea>
            <div class="form-text">Bitte als JSON-Array eingeben, z.B. ["Ausrüstung geprüft","Fahrzeug gecheckt"]</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
            <button type="button" class="btn btn-primary" id="saveChecklistTemplateBtn">Speichern</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  const modal = new bootstrap.Modal(document.getElementById('checklistTemplateModal'));
  modal.show();
  document.getElementById('saveChecklistTemplateBtn').onclick = function() {
    const val = document.getElementById('checklist-template-text').value;
    try { JSON.parse(val); } catch { alert('Ungültiges JSON!'); return; }
    localStorage.setItem('checklist_template', val);
    bootstrap.Modal.getInstance(document.getElementById('checklistTemplateModal')).hide();
    document.getElementById('checklistTemplateModal').remove();
  };
  document.getElementById('checklistTemplateModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('checklistTemplateModal').remove();
  });
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
  let canEdit = currentUser && Array.isArray(currentUser.departmentRoles) && (currentUser.departmentRoles.includes('Admin') || currentUser.departmentRoles.includes('Leitung Field Training Officer'));
  main.innerHTML = '<div class="d-flex justify-content-between align-items-center mb-2">'
    + '<h4>Module</h4>'
    + (canEdit ? '<button class="btn btn-success btn-sm" id="addModuleBtn">Neu</button>' : '')
    + '</div>'
    + '<div class="row">'
    + modules.map(m => {
      let buttons = '';
      if (canEdit) {
        buttons += `<button class="btn btn-primary btn-sm me-1" onclick="openModuleModal('${m.id}')">Bearbeiten</button>`;
        buttons += `<button class="btn btn-danger btn-sm" onclick="deleteModule('${m.id}')">Löschen</button>`;
      }
      // Abschluss-Button für alle User
      buttons += `<button class="btn btn-success btn-sm" onclick="completeModule('${m.id}')">Abschließen</button>`;
      // Fortschritt anzeigen (Dummy: abgeschlossen, wenn localStorage-Eintrag vorhanden)
      let done = localStorage.getItem('module_done_' + m.id) === '1';
      return `
      <div class="col-md-4">
        <div class="card bg-secondary mb-3">
          <div class="card-body">
            <h5 class="card-title">${m.name}</h5>
            <p>${m.description || ''}</p>
            <div class="mb-2">Status: <span class="badge ${done ? 'bg-success' : 'bg-secondary'}">${done ? 'Abgeschlossen' : 'Offen'}</span></div>
            ${buttons}
          </div>
        </div>
      </div>
      `;
    }).join('')
    + '</div>';
  if (canEdit) document.getElementById('addModuleBtn').onclick = () => openModuleModal();
}

function completeModule(id) {
  localStorage.setItem('module_done_' + id, '1');
  // Logging (vereinfachtes Beispiel)
  let logs = JSON.parse(localStorage.getItem('module_logs') || '[]');
  logs.push({ moduleId: id, user: currentUser ? currentUser.username : '', timestamp: new Date().toISOString() });
  localStorage.setItem('module_logs', JSON.stringify(logs));
  loadModules();
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
  case '#team': renderTeamPage(); break;
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
  // Uprank/Derank-Protokoll anzeigen
  if (document.getElementById('uprank-log-btn')) {
    document.getElementById('uprank-log-btn').onclick = function() {
      renderUprankLog();
    };
  }
// Uprank/Derank-Protokollseite
function renderUprankLog() {
  fetch('api/itlogs.php')
    .then(res => res.json())
    .then(logs => {
      // Nur Beförderungs-/Degradierungs-Logs anzeigen
      logs = logs.filter(l => l.event_type === 'officer_role_updated');
      let html = `<div class="container my-4">
        <h2 class="mb-4 text-primary">Uprank & Derank Protokoll</h2>
        <button class="btn btn-secondary mb-3" onclick="renderMeinDienst()">Zurück</button>
        <table class="table table-dark table-striped">
          <thead><tr><th>Datum & Uhrzeit</th><th>Officer</th><th>Beschreibung</th></tr></thead>
          <tbody>
            ${logs.map(log => `<tr><td>${new Date(log.created_at).toLocaleString('de-DE')}</td><td>${log.officer_id}</td><td>${log.description}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>`;
      document.getElementById('main-content').innerHTML = html;
    });
}
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
              ${(currentUser && Array.isArray(currentUser.departmentRoles) && (currentUser.departmentRoles.includes('Admin') || currentUser.departmentRoles.includes('Personalabteilung')))
                ? '<button class="btn btn-outline-light btn-sm mt-2 ms-1" id="uprank-log-btn">Uprank/Derank-Protokoll</button>'
                : ''}
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
    openUprankModal();
  };
// Uprank/Derank Modal-Logik
function openUprankModal() {
  // Nur Admin/Personalabteilung darf befördern/degradieren
  let canEditRank = currentUser && Array.isArray(currentUser.departmentRoles) && (currentUser.departmentRoles.includes('Admin') || currentUser.departmentRoles.includes('Personalabteilung'));
  let html = `
    <div class="modal fade" id="uprankModal" tabindex="-1" aria-labelledby="uprankModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="uprankModalLabel">Beförderung / Degradierung</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <label for="uprank-new-rank" class="form-label">Neuer Rang</label>
            <select class="form-select mb-2" id="uprank-new-rank">
              <option value="">Bitte wählen...</option>
              <option value="Police Officer I">Police Officer I</option>
              <option value="Police Officer II">Police Officer II</option>
              <option value="Police Officer III">Police Officer III</option>
              <option value="Detective">Detective</option>
              <option value="Sergeant">Sergeant</option>
              <option value="Sr. Sergeant">Sr. Sergeant</option>
              <option value="Lieutenant">Lieutenant</option>
              <option value="Captain">Captain</option>
              <option value="Commander">Commander</option>
              <option value="Deputy Chief of Police">Deputy Chief of Police</option>
              <option value="Assistant Chief of Police">Assistant Chief of Police</option>
              <option value="Chief of Police">Chief of Police</option>
            </select>
            <div id="uprank-error" class="text-danger small" style="display:none;"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
            <button type="button" class="btn btn-primary" id="saveUprankBtn" ${canEditRank ? '' : 'disabled'}>Speichern</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  const modal = new bootstrap.Modal(document.getElementById('uprankModal'));
  modal.show();
  document.getElementById('saveUprankBtn').onclick = function() {
    const new_rank = document.getElementById('uprank-new-rank').value;
    if (!new_rank) {
      document.getElementById('uprank-error').textContent = 'Bitte neuen Rang wählen!';
      document.getElementById('uprank-error').style.display = 'block';
      return;
    }
    fetch('api/uprank.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officer_id: currentUser.id, old_rank: currentUser.rank, new_rank })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        bootstrap.Modal.getInstance(document.getElementById('uprankModal')).hide();
        document.getElementById('uprankModal').remove();
        alert('Rang wurde geändert!');
        // Optional: Seite neu laden oder Userdaten aktualisieren
        location.reload();
      } else {
        document.getElementById('uprank-error').textContent = data.error || 'Fehler beim Speichern.';
        document.getElementById('uprank-error').style.display = 'block';
      }
    });
  };
  document.getElementById('uprankModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('uprankModal').remove();
  });
}
  // Lizenzen anzeigen
  const list = document.getElementById('licenses-list');
  let canEditLic = currentUser && Array.isArray(currentUser.departmentRoles) && (currentUser.departmentRoles.includes('Admin') || currentUser.departmentRoles.includes('Personalabteilung'));
  // AJAX: Lizenzen vom Backend holen
  fetch('api/licenses.php')
    .then(res => res.json())
    .then(licenses => {
      list.innerHTML = '';
      if (!Array.isArray(licenses) || licenses.length === 0) {
        list.innerHTML = '<li class="list-group-item bg-dark text-light">Keine Lizenzen vorhanden.</li>';
      } else {
        list.innerHTML = licenses.map((l, idx) => {
          let status = '';
          if (l.expires_at) {
            const exp = new Date(l.expires_at);
            status = exp > new Date() ? '<span class="badge bg-success ms-2">Gültig</span>' : '<span class="badge bg-danger ms-2">Abgelaufen</span>';
          }
          let btns = '';
          if (canEditLic) {
            btns = `<button class='btn btn-sm btn-primary ms-2' onclick='openLicenseModal(${JSON.stringify(l)})'>Bearbeiten</button> <button class='btn btn-sm btn-danger ms-1' onclick='deleteLicense(${JSON.stringify(l)})'>Löschen</button>`;
          }
          return `<li class="list-group-item bg-dark text-light">${l.name} <span class="badge bg-secondary ms-2">${l.issued_by || ''}</span> ${status} ${btns}</li>`;
        }).join('');
      }
      if (canEditLic) {
        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-success btn-sm mt-2';
        addBtn.textContent = 'Lizenz hinzufügen';
        addBtn.onclick = () => openLicenseModal();
        list.parentElement.appendChild(addBtn);
      }
    });
}

// Lizenz-Modal-Logik (AJAX)
function openLicenseModal(license) {
  license = license || {};
  let html = `
    <div class="modal fade" id="licenseModal" tabindex="-1" aria-labelledby="licenseModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="licenseModalLabel">Lizenz ${license.name ? 'bearbeiten' : 'hinzufügen'}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <input type="text" class="form-control mb-2" id="license-name" placeholder="Name" value="${license.name || ''}">
            <input type="text" class="form-control mb-2" id="license-issued-by" placeholder="Ausgestellt von" value="${license.issued_by || ''}">
            <input type="date" class="form-control mb-2" id="license-expires-at" placeholder="Ablaufdatum" value="${license.expires_at ? license.expires_at.slice(0,10) : ''}">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
            <button type="button" class="btn btn-primary" id="saveLicenseBtn">Speichern</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  const modal = new bootstrap.Modal(document.getElementById('licenseModal'));
  modal.show();
  document.getElementById('saveLicenseBtn').onclick = function() {
    const name = document.getElementById('license-name').value;
    const issued_by = document.getElementById('license-issued-by').value;
    const expires_at = document.getElementById('license-expires-at').value;
    const method = license.id ? 'PUT' : 'POST';
    const body = license.id ? { id: license.id, name, issued_by, expires_at } : { officer_id: currentUser.id, name, issued_by, expires_at };
    fetch('api/licenses.php', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(() => {
      bootstrap.Modal.getInstance(document.getElementById('licenseModal')).hide();
      document.getElementById('licenseModal').remove();
      renderMeinDienst();
    });
  };
  document.getElementById('licenseModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('licenseModal').remove();
  });
}

function deleteLicense(license) {
  if (!confirm('Wirklich löschen?')) return;
  fetch('api/licenses.php', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: license.id })
  })
  .then(res => res.json())
  .then(() => renderMeinDienst());
}

// --- Login- und Sichtbarkeits-Logik ---
// --- Login- und Sichtbarkeits-Logik ---
// --- TEAM ---
function renderTeamPage() {
  fetch('http://localhost:3001/api/officers')
    .then(res => res.json())
    .then(officers => {
      let html = '<h2 class="mb-4 text-primary">Unser Team</h2>';
      html += '<div class="row">';
      officers.forEach(o => {
        html += `<div class="col-md-4 mb-3"><div class="card bg-dark text-light h-100"><div class="card-body"><h5 class="card-title">${o.first_name} ${o.last_name}</h5><p class="card-text mb-1">Rang: ${o.rank}</p><p class="card-text mb-1">Badge: ${o.badge_number || '-'}</p><p class="card-text mb-1">Telefon: ${o.phone_number || '-'}</p><p class="card-text mb-1">Rollen: ${(o.departmentRoles || []).join(', ')}</p></div></div></div>`;
      });
      html += '</div>';
      document.getElementById('main-content').innerHTML = html;
    });
}

function openTeamModal() {
  fetch('http://localhost:3001/api/officers')
    .then(res => res.json())
    .then(officers => {
      let html = '<div class="row">';
      officers.forEach(o => {
        html += `<div class="col-md-4 mb-3"><div class="card bg-dark text-light h-100"><div class="card-body"><h5 class="card-title">${o.first_name} ${o.last_name}</h5><p class="card-text mb-1">Rang: ${o.rank}</p><p class="card-text mb-1">Badge: ${o.badge_number || '-'}</p><p class="card-text mb-1">Telefon: ${o.phone_number || '-'}</p><p class="card-text mb-1">Rollen: ${(o.departmentRoles || []).join(', ')}</p></div></div></div>`;
      });
      html += '</div>';
      document.getElementById('team-modal-body').innerHTML = html;
      const modal = new bootstrap.Modal(document.getElementById('teamModal'));
      modal.show();
    });
}
let currentUser = null;

function showPublicHome() {
  fetch('api/homepage.php')
    .then(res => res.json())
    .then(data => {
      document.getElementById('public-home').innerHTML = data.content || '';
      document.getElementById('public-home').style.display = '';
      document.getElementById('main-content').style.display = 'none';
      document.getElementById('main-nav').innerHTML = '';
    });
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
        <div class="col-md-6 col-lg-4">
          <div class="card bg-dark text-light h-100">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title">Team-Ansicht</h5>
              <p class="card-text">Alle Officers und Rollen im Überblick.</p>
              <button class="btn btn-primary mt-2" id="open-team-btn">Öffnen</button>
            </div>
          </div>
        </div>
// Team-Ansicht-Modal (Anzeige aller Officers, Suche, Details, Rechte)
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'open-team-btn') {
    openTeamModal();
  }
});

function openTeamModal() {
  let html = '';
  html += '<div class="modal fade" id="teamModal" tabindex="-1" aria-labelledby="teamModalLabel" aria-hidden="true">';
  html += '  <div class="modal-dialog modal-xl">';
  html += '    <div class="modal-content">';
  html += '      <div class="modal-header">';
  html += '        <h5 class="modal-title" id="teamModalLabel">Unser Team</h5>';
  html += '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
  html += '      </div>';
  html += '      <div class="modal-body">';
  html += '        <input type="text" class="form-control mb-3" id="team-search" placeholder="Officer suchen...">';
  html += '        <div id="team-list"></div>';
  html += '      </div>';
  html += '    </div>';
  html += '  </div>';
  html += '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
  loadTeamList();
  const modal = new bootstrap.Modal(document.getElementById('teamModal'));
  modal.show();
  document.getElementById('team-search').oninput = function() {
    loadTeamList(this.value);
  };
  document.getElementById('teamModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('teamModal').remove();
  });
}

function loadTeamList(search) {
  fetch('api/officers.js')
    .then(res => res.json())
    .then(officers => {
      let html = '<div class="row">';
      officers.filter(o => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (o.first_name + ' ' + o.last_name + ' ' + o.rank + ' ' + (o.departmentRoles || []).join(' ')).toLowerCase().includes(s);
      }).forEach(o => {
        html += `<div class="col-md-4 mb-3"><div class="card bg-dark text-light h-100"><div class="card-body"><h5 class="card-title">${o.first_name} ${o.last_name}</h5><p class="card-text mb-1">Rang: ${o.rank}</p><p class="card-text mb-1">Badge: ${o.badge_number || '-'}</p><p class="card-text mb-1">Telefon: ${o.phone_number || '-'}</p><p class="card-text mb-1">Rollen: ${(o.departmentRoles || []).join(', ')}</p><button class='btn btn-outline-info btn-sm mt-2' onclick='openOfficerDetailModal("${o.id}")'>Details</button></div></div></div>`;
      });
      html += '</div>';
      document.getElementById('team-list').innerHTML = html;
    });
}

function openOfficerDetailModal(id) {
  fetch('api/officers.js')
    .then(res => res.json())
    .then(officers => {
      const o = officers.find(x => x.id === id);
      if (!o) return;
      let html = '';
      html += '<div class="modal fade" id="officerDetailModal" tabindex="-1" aria-labelledby="officerDetailModalLabel" aria-hidden="true">';
      html += '  <div class="modal-dialog">';
      html += '    <div class="modal-content">';
      html += '      <div class="modal-header">';
      html += '        <h5 class="modal-title" id="officerDetailModalLabel">Officer-Details</h5>';
      html += '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
      html += '      </div>';
      html += '      <div class="modal-body">';
      html += `        <p><strong>${o.first_name} ${o.last_name}</strong> (${o.rank})</p>`;
      html += `        <p>Badge: ${o.badge_number || '-'}</p>`;
      html += `        <p>Telefon: ${o.phone_number || '-'}</p>`;
      html += `        <p>Rollen: ${(o.departmentRoles || []).join(', ')}</p>`;
      html += '      </div>';
      html += '    </div>';
      html += '  </div>';
      html += '</div>';
      document.body.insertAdjacentHTML('beforeend', html);
      const modal = new bootstrap.Modal(document.getElementById('officerDetailModal'));
      modal.show();
      document.getElementById('officerDetailModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('officerDetailModal').remove();
      });
    });
}
        <div class="col-md-6 col-lg-4">
          <div class="card bg-dark text-light h-100">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title">HR-Dokumente</h5>
              <p class="card-text">Personalabteilungs-Dokumente verwalten.</p>
              <button class="btn btn-primary mt-2" id="open-hrdocs-btn">Öffnen</button>
            </div>
          </div>
        </div>
// HR-Dokumente-Modal (Upload, Anzeige, Bearbeitung, Löschung)
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'open-hrdocs-btn') {
    openHRDocsModal();
  }
});

function openHRDocsModal() {
  let canEdit = currentUser && Array.isArray(currentUser.departmentRoles) && (currentUser.departmentRoles.includes('Personalabteilung') || currentUser.departmentRoles.includes('Admin'));
  let html = '';
  html += '<div class="modal fade" id="hrDocsModal" tabindex="-1" aria-labelledby="hrDocsModalLabel" aria-hidden="true">';
  html += '  <div class="modal-dialog modal-lg">';
  html += '    <div class="modal-content">';
  html += '      <div class="modal-header">';
  html += '        <h5 class="modal-title" id="hrDocsModalLabel">HR-Dokumente</h5>';
  html += '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
  html += '      </div>';
  html += '      <div class="modal-body">';
  if (canEdit) {
    html += '<form id="hrdoc-upload-form" class="mb-3">';
    html += '  <div class="input-group">';
    html += '    <input type="file" class="form-control" id="hrdoc-file" required accept="application/pdf,.doc,.docx,.odt,.txt">';
    html += '    <input type="text" class="form-control" id="hrdoc-title" placeholder="Titel" required>';
    html += '    <button class="btn btn-success" type="submit">Hochladen</button>';
    html += '  </div>';
    html += '</form>';
  }
  html += '<ul class="list-group" id="hrdocs-list"></ul>';
  html += '      </div>';
  html += '    </div>';
  html += '  </div>';
  html += '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
  loadHRDocsList(canEdit);
  const modal = new bootstrap.Modal(document.getElementById('hrDocsModal'));
  modal.show();
  if (canEdit) {
    document.getElementById('hrdoc-upload-form').onsubmit = function(e) {
      e.preventDefault();
      const fileInput = document.getElementById('hrdoc-file');
      const titleInput = document.getElementById('hrdoc-title');
      const file = fileInput.files[0];
      const title = titleInput.value;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      fetch('api/hrdocs.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          loadHRDocsList(canEdit);
          fileInput.value = '';
          titleInput.value = '';
        } else {
          alert(data.error || 'Fehler beim Upload!');
        }
      });
    };
  }
  document.getElementById('hrDocsModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('hrDocsModal').remove();
  });
}

function loadHRDocsList(canEdit) {
  fetch('api/hrdocs.php')
    .then(res => res.json())
    .then(docs => {
      const list = document.getElementById('hrdocs-list');
      list.innerHTML = '';
      if (!Array.isArray(docs) || docs.length === 0) {
        list.innerHTML = '<li class="list-group-item bg-dark text-light">Keine HR-Dokumente vorhanden.</li>';
      } else {
        docs.forEach(doc => {
          let actions = `<a href="${doc.url}" target="_blank" class="btn btn-sm btn-outline-info ms-2">Anzeigen</a>`;
          if (canEdit) {
            actions += ` <button class='btn btn-sm btn-danger ms-1' onclick='deleteHRDoc("${doc.id}")'>Löschen</button>`;
          }
          list.innerHTML += `<li class="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">${doc.title} <span>${actions}</span></li>`;
        });
      }
    });
}

function deleteHRDoc(id) {
  if (!confirm('Wirklich löschen?')) return;
  fetch('api/hrdocs.php', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      loadHRDocsList(true);
    } else {
      alert(data.error || 'Fehler beim Löschen!');
    }
  });
}
  // Supervisory-Warnung für Nicht-Admins
  if (!currentUser || !Array.isArray(currentUser.departmentRoles) || !currentUser.departmentRoles.includes('Admin')) {
    const main = document.getElementById('main-content');
    const warn = document.createElement('div');
    warn.className = 'alert alert-warning d-flex align-items-center my-3';
    warn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle me-2" viewBox="0 0 16 16"><path d="M7.938 2.016a.13.13 0 0 1 .125 0l6.857 11.856c.06.104-.015.228-.125.228H1.205a.145.145 0 0 1-.125-.228L7.938 2.016zm.082-1.016a1.13 1.13 0 0 0-1.938 0L.082 12.856A1.145 1.145 0 0 0 1.205 14h13.59a1.145 1.145 0 0 0 1.123-1.144c0-.2-.053-.395-.153-.572L8.02 1zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>' +
      '<div><strong>Hinweis:</strong> Sie haben Zugriff auf diese Seite. Änderungen sind nur nach Rücksprache mit der zuständigen Leitung erlaubt.</div>';
    main.prepend(warn);
  }
  // Supervisory-Warnung für Nicht-HR/Admin
  if (!currentUser || !Array.isArray(currentUser.departmentRoles) || (!currentUser.departmentRoles.includes('Personalabteilung') && !currentUser.departmentRoles.includes('Admin'))) {
    const main = document.getElementById('main-content');
    const warn = document.createElement('div');
    warn.className = 'alert alert-warning d-flex align-items-center my-3';
    warn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle me-2" viewBox="0 0 16 16"><path d="M7.938 2.016a.13.13 0 0 1 .125 0l6.857 11.856c.06.104-.015.228-.125.228H1.205a.145.145 0 0 1-.125-.228L7.938 2.016zm.082-1.016a1.13 1.13 0 0 0-1.938 0L.082 12.856A1.145 1.145 0 0 0 1.205 14h13.59a1.145 1.145 0 0 0 1.123-1.144c0-.2-.053-.395-.153-.572L8.02 1zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>' +
      '<div><strong>Hinweis:</strong> Sie haben Zugriff auf diese Seite. Änderungen sind nur nach Rücksprache mit der Personalabteilung erlaubt.</div>';
    main.prepend(warn);
  }
        <div class="col-md-6 col-lg-4">
          <div class="card bg-dark text-light h-100">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title">Einstellungen</h5>
              <p class="card-text">Systemeinstellungen und Benachrichtigungen verwalten.</p>
              <button class="btn btn-primary mt-2" id="open-settings-btn">Öffnen</button>
            </div>
          </div>
        </div>
// Einstellungen-Modal (Passwort ändern, Benachrichtigungen)
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'open-settings-btn') {
    openSettingsModal();
  }
});

function openSettingsModal() {
  let html = '';
  html += '<div class="modal fade" id="settingsModal" tabindex="-1" aria-labelledby="settingsModalLabel" aria-hidden="true">';
  html += '  <div class="modal-dialog">';
  html += '    <div class="modal-content">';
  html += '      <div class="modal-header">';
  html += '        <h5 class="modal-title" id="settingsModalLabel">Einstellungen</h5>';
  html += '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
  html += '      </div>';
  html += '      <div class="modal-body">';
  html += '        <label class="form-label">Eigenes Passwort ändern</label>';
  html += '        <input type="password" class="form-control mb-2" id="settings-old-password" placeholder="Altes Passwort">';
  html += '        <input type="password" class="form-control mb-2" id="settings-new-password" placeholder="Neues Passwort">';
  html += '        <hr>';
  html += '        <label class="form-label">Benachrichtigungen</label>';
  html += '        <div class="form-check">';
  html += '          <input class="form-check-input" type="checkbox" id="settings-email-notify">';
  html += '          <label class="form-check-label" for="settings-email-notify">E-Mail-Benachrichtigungen aktivieren</label>';
  html += '        </div>';
  html += '      </div>';
  html += '      <div class="modal-footer">';
  html += '        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>';
  html += '        <button type="button" class="btn btn-primary" id="saveSettingsBtn">Speichern</button>';
  html += '      </div>';
  html += '    </div>';
  html += '  </div>';
  html += '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
  // Vorbefüllen (Benachrichtigungen)
  fetch('api/settings.php')
    .then(res => res.json())
    .then(data => {
      document.getElementById('settings-email-notify').checked = !!data.email_notify;
    });
  const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
  modal.show();
  document.getElementById('saveSettingsBtn').onclick = function() {
    const oldpw = document.getElementById('settings-old-password').value;
    const newpw = document.getElementById('settings-new-password').value;
    const email_notify = document.getElementById('settings-email-notify').checked;
    // Passwort ändern
    if (oldpw && newpw) {
      fetch('api/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldpw, newpw, email_notify })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Einstellungen gespeichert!');
          bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
          document.getElementById('settingsModal').remove();
        } else {
          alert(data.error || 'Fehler beim Speichern!');
        }
      });
    } else {
      // Nur Benachrichtigungen speichern
      fetch('api/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_notify })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Einstellungen gespeichert!');
          bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
          document.getElementById('settingsModal').remove();
        } else {
          alert(data.error || 'Fehler beim Speichern!');
        }
      });
    }
  };
  document.getElementById('settingsModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('settingsModal').remove();
  });
}
        <div class="col-md-6 col-lg-4">
          <div class="card bg-dark text-light h-100">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title">Popout-Editor</h5>
              <p class="card-text">Popout-Inhalte für die Startseite verwalten.</p>
              <button class="btn btn-primary mt-2" id="edit-popout-btn">Öffnen</button>
            </div>
          </div>
        </div>
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
              <button class="btn btn-primary mt-2" id="edit-homepage-btn">Öffnen</button>
            </div>
          </div>
        </div>
// Homepage-Editor-Modal (HTML5/Bootstrap, Admin only)
function openHomepageEditorModal() {
  let html = '';
  html += '<div class="modal fade" id="homepageEditorModal" tabindex="-1" aria-labelledby="homepageEditorModalLabel" aria-hidden="true">';
  html += '  <div class="modal-dialog modal-lg">';
  html += '    <div class="modal-content">';
  html += '      <div class="modal-header">';
  html += '        <h5 class="modal-title" id="homepageEditorModalLabel">Homepage bearbeiten</h5>';
  html += '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
  html += '      </div>';
  html += '      <div class="modal-body">';
  html += '        <textarea class="form-control mb-2" id="homepage-content" rows="10" placeholder="HTML-Inhalt der Startseite"></textarea>';
  html += '      </div>';
  html += '      <div class="modal-footer">';
  html += '        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>';
  html += '        <button type="button" class="btn btn-primary" id="saveHomepageBtn">Speichern</button>';
  html += '      </div>';
  html += '    </div>';
  html += '  </div>';
  html += '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
  // Vorbefüllen mit aktuellem Inhalt
  fetch('api/homepage.php')
    .then(res => res.json())
    .then(data => {
      document.getElementById('homepage-content').value = data.content || '';
    });
  const modal = new bootstrap.Modal(document.getElementById('homepageEditorModal'));
  modal.show();
  document.getElementById('saveHomepageBtn').onclick = function() {
    const content = document.getElementById('homepage-content').value;
    fetch('api/homepage.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        bootstrap.Modal.getInstance(document.getElementById('homepageEditorModal')).hide();
        document.getElementById('homepageEditorModal').remove();
        alert('Homepage gespeichert!');
        location.reload();
      } else {
        alert('Fehler beim Speichern!');
      }
    });
  };
  document.getElementById('homepageEditorModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('homepageEditorModal').remove();
  });
}

// Popout-Editor-Modal (HTML5/Bootstrap, Admin only)
function openPopoutEditorModal() {
  let html = '';
  html += '<div class="modal fade" id="popoutEditorModal" tabindex="-1" aria-labelledby="popoutEditorModalLabel" aria-hidden="true">';
  html += '  <div class="modal-dialog modal-lg">';
  html += '    <div class="modal-content">';
  html += '      <div class="modal-header">';
  html += '        <h5 class="modal-title" id="popoutEditorModalLabel">Popout bearbeiten</h5>';
  html += '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
  html += '      </div>';
  html += '      <div class="modal-body">';
  html += '        <textarea class="form-control mb-2" id="popout-content" rows="10" placeholder="HTML-Inhalt für Popout"></textarea>';
  html += '      </div>';
  html += '      <div class="modal-footer">';
  html += '        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>';
  html += '        <button type="button" class="btn btn-primary" id="savePopoutBtn">Speichern</button>';
  html += '      </div>';
  html += '    </div>';
  html += '  </div>';
  html += '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
  fetch('api/popout.php')
    .then(res => res.json())
    .then(data => {
      document.getElementById('popout-content').value = data.content || '';
    });
  const modal = new bootstrap.Modal(document.getElementById('popoutEditorModal'));
  modal.show();
  document.getElementById('savePopoutBtn').onclick = function() {
    const content = document.getElementById('popout-content').value;
    fetch('api/popout.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        bootstrap.Modal.getInstance(document.getElementById('popoutEditorModal')).hide();
        document.getElementById('popoutEditorModal').remove();
        alert('Popout gespeichert!');
      } else {
        alert('Fehler beim Speichern!');
      }
    });
  };
  document.getElementById('popoutEditorModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('popoutEditorModal').remove();
  });
}

document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'edit-popout-btn') {
    openPopoutEditorModal();
  }
});
  // Popout-Button auf Startseite anzeigen
  fetch('api/popout.php')
    .then(res => res.json())
    .then(data => {
      if (data.content) {
        let btn = document.createElement('button');
        btn.className = 'btn btn-outline-info btn-sm my-3';
        btn.textContent = 'Popout anzeigen';
        btn.onclick = function() {
          openPopoutViewerModal(data.content);
        };
        document.getElementById('public-home').appendChild(btn);
      }
    });
// Popout-Viewer-Modal (nur Anzeige)
function openPopoutViewerModal(content) {
  let html = '';
  html += '<div class="modal fade" id="popoutViewerModal" tabindex="-1" aria-labelledby="popoutViewerModalLabel" aria-hidden="true">';
  html += '  <div class="modal-dialog modal-lg">';
  html += '    <div class="modal-content">';
  html += '      <div class="modal-header">';
  html += '        <h5 class="modal-title" id="popoutViewerModalLabel">Popout</h5>';
  html += '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
  html += '      </div>';
  html += '      <div class="modal-body">';
  html +=           content;
  html += '      </div>';
  html += '    </div>';
  html += '  </div>';
  html += '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
  const modal = new bootstrap.Modal(document.getElementById('popoutViewerModal'));
  modal.show();
  document.getElementById('popoutViewerModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('popoutViewerModal').remove();
  });
}
  if (e.target && e.target.id === 'edit-homepage-btn') {
    openHomepageEditorModal();
  }
});
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
