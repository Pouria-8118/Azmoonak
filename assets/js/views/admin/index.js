import { getSession } from '../../auth.js';
import { adminShell } from './shell.js';
import { adminExamsList } from './exams.js';
import { adminEditor } from './editor.js';
import { adminStudents } from './students.js';
import { adminResults } from './results.js';
import { adminSettings } from './settings.js';

export async function viewAdmin(seg) {
  const session = getSession();
  if (!session || session.role !== 'admin') { location.hash = '#/login?next=%23%2Fadmin'; return; }
  const tab = seg[1] || 'exams';
  if (tab === 'exams') return adminShell('exams', adminExamsList);
  if (tab === 'new') return adminShell('new', () => adminEditor(null));
  if (tab === 'edit' && seg[2]) return adminShell('new', () => adminEditor(seg[2]));
  if (tab === 'students') return adminShell('students', adminStudents);
  if (tab === 'results') return adminShell('results', adminResults);
  if (tab === 'settings') return adminShell('settings', adminSettings);
  location.hash = '#/admin';
}