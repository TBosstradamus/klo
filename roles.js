// Rollen- und Rechteverwaltung für Officer-Management (AssignRoleModal)

const DEPARTMENT_ROLES = [
  'Personalabteilung',
  'Leitung Personalabteilung',
  'IT-Manager',
  'Fuhrpark',
  'Mailbox-Manager',
  'Admin'
];

// Öffnet das Rollen-Modal für einen Officer
function openAssignRoleModal(officerId) {
  fetch('http://localhost:3001/api/officers')
    .then(res => res.json())
    .then(officers => {
      const officer = officers.find(o => o.id === officerId);
      if (!officer) return;
      document.getElementById('assignrole-officer-id').value = officer.id;
      document.getElementById('assignrole-officer-name').textContent = officer.first_name + ' ' + officer.last_name;
      // Checkboxen setzen
      DEPARTMENT_ROLES.forEach(role => {
        const cb = document.getElementById('assignrole-role-' + role);
        if (cb) cb.checked = (officer.department_roles || '').split(',').includes(role);
      });
      const modal = new bootstrap.Modal(document.getElementById('assignRoleModal'));
      modal.show();
    });
}

// Speichert die Rollen für einen Officer
function saveAssignedRoles() {
  const officerId = document.getElementById('assignrole-officer-id').value;
  const roles = DEPARTMENT_ROLES.filter(role => document.getElementById('assignrole-role-' + role).checked);
  fetch(`http://localhost:3001/api/officers/${officerId}/roles`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roles })
  }).then(() => {
    bootstrap.Modal.getInstance(document.getElementById('assignRoleModal')).hide();
    loadOfficers();
  });
}
