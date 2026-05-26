import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, KeyRound, UserPlus, Trash2, Pencil, ShieldCheck, X, ChevronDown, ChevronUp, Calendar, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import HostProfileEditor from './HostProfileEditor';

const formatDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
};

const PasswordReveal = ({ value, testid }) => {
  const [shown, setShown] = useState(false);
  if (!value) {
    return <span className="text-slate-400 italic text-xs" data-testid={testid}>changed by user</span>;
  }
  return (
    <div className="inline-flex items-center gap-2" data-testid={testid}>
      <code className="font-mono text-xs bg-amber-50 border border-amber-200 text-amber-900 px-2 py-1 rounded">
        {shown ? value : '•'.repeat(Math.min(value.length, 12))}
      </code>
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        className="text-slate-500 hover:text-slate-800"
        aria-label={shown ? 'Hide password' : 'Reveal password'}
      >
        {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(value);
          toast.success('Temporary password copied');
        }}
        className="text-xs text-orange-600 hover:text-orange-800 font-semibold"
      >
        Copy
      </button>
    </div>
  );
};

const InviteModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ email: '', name: '', temp_password: 'Orgainse25%Web..' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.adminUsersInvite({
        email: form.email.trim().toLowerCase(),
        name: form.name.trim(),
        temp_password: form.temp_password,
      });
      toast.success(`Invited ${res.user?.email}`);
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to invite user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" data-testid="users-invite-modal">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-bold text-slate-900">Invite a new admin</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Work email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="newadmin@orgainse.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              data-testid="users-invite-email"
            />
            <p className="text-[11px] text-slate-500 mt-1">Must end with <code>@orgainse.com</code>.</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Display name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Jane Doe"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              data-testid="users-invite-name"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Temporary password</label>
            <input
              type="text"
              required
              minLength={8}
              value={form.temp_password}
              onChange={(e) => setForm((p) => ({ ...p, temp_password: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              data-testid="users-invite-temp-password"
            />
            <p className="text-[11px] text-slate-500 mt-1">They will be forced to change this on first login.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Cancel</button>
            <button
              type="submit"
              disabled={submitting}
              data-testid="users-invite-submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 inline-flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {submitting ? 'Inviting…' : 'Invite admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ResetModal = ({ user, onClose, onDone }) => {
  const [pw, setPw] = useState('Orgainse25%Web..');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.adminUsersReset(user.id, pw);
      toast.success(`Password reset for ${user.email}`);
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Reset failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" data-testid="users-reset-modal">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-bold text-slate-900">Reset password</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <p className="text-sm text-slate-600">
            Set a new <strong>temporary</strong> password for <strong>{user.email}</strong>.
            They'll be forced to change it on their next login.
          </p>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Temporary password</label>
            <input
              type="text"
              required
              minLength={8}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              data-testid="users-reset-password-input"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Cancel</button>
            <button
              type="submit"
              disabled={submitting}
              data-testid="users-reset-submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50 inline-flex items-center gap-2"
            >
              <KeyRound className="h-4 w-4" />
              {submitting ? 'Saving…' : 'Reset password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminUsersManager = () => {
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [editingName, setEditingName] = useState({}); // { [id]: string }
  const [expanded, setExpanded] = useState({}); // { [id]: boolean }

  const toggleExpand = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.adminUsersList();
      setUsers(res.users || []);
      setMe(res.me || null);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const saveName = async (user) => {
    const next = (editingName[user.id] ?? user.name ?? '').trim();
    if (!next || next === user.name) {
      setEditingName((p) => { const c = { ...p }; delete c[user.id]; return c; });
      return;
    }
    try {
      await api.adminUsersUpdate(user.id, { name: next });
      toast.success('Name updated');
      setEditingName((p) => { const c = { ...p }; delete c[user.id]; return c; });
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const remove = async (user) => {
    if (!window.confirm(`Delete admin ${user.email}? They will lose access immediately.`)) return;
    try {
      await api.adminUsersDelete(user.id);
      toast.success(`Deleted ${user.email}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-slate-500">Loading admins…</div>;
  }
  if (error) {
    return <div className="py-10 text-center text-red-600" data-testid="users-error">{error}</div>;
  }

  return (
    <div data-testid="admin-users-manager">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Admin users</h2>
          <p className="text-sm text-slate-500">
            Manage who can sign in. Expand a row to set that user's <strong>host profile</strong> (designation, photo, booking URL, custom fields) for the public Book-a-Call modal. Only the super-admin can view temporary passwords.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowInvite(true)}
          data-testid="users-invite-open"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          <UserPlus className="h-4 w-4" /> Invite admin
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left px-4 py-3 w-8"></th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Host</th>
              <th className="text-left px-4 py-3">Temp password</th>
              <th className="text-left px-4 py-3">Last login</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => {
              const isEditing = editingName[u.id] !== undefined;
              const isSelf = me && u.id === me.id;
              const isOpen = !!expanded[u.id];
              return (
                <React.Fragment key={u.id}>
                <tr data-testid={`users-row-${u.email}`} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(u.id)}
                      aria-label={isOpen ? 'Collapse host profile' : 'Expand host profile'}
                      data-testid={`users-row-expand-${u.email}`}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName[u.id]}
                          onChange={(e) => setEditingName((p) => ({ ...p, [u.id]: e.target.value }))}
                          className="px-2 py-1 border border-slate-300 rounded text-sm w-40"
                          data-testid={`users-edit-name-${u.email}`}
                        />
                        <button onClick={() => saveName(u)} className="text-xs text-orange-600 font-semibold">Save</button>
                        <button onClick={() => setEditingName((p) => { const c = { ...p }; delete c[u.id]; return c; })} className="text-xs text-slate-400">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{u.name}</span>
                        <button
                          onClick={() => setEditingName((p) => ({ ...p, [u.id]: u.name || '' }))}
                          className="text-slate-400 hover:text-slate-700"
                          aria-label="Edit name"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    {u.designation && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{u.designation}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.is_super_admin ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                        <ShieldCheck className="h-3 w-3" /> Super admin
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">Admin</span>
                    )}
                    {isSelf && <span className="ml-2 text-[10px] uppercase tracking-wider text-slate-400">(you)</span>}
                  </td>
                  <td className="px-4 py-3" data-testid={`users-host-status-${u.email}`}>
                    {u.show_as_host && u.booking_url ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                        <Calendar className="h-3 w-3" /> Live
                      </span>
                    ) : u.booking_url ? (
                      <span className="text-[11px] text-slate-500">Hidden</span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No URL</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.must_change_password ? (
                      <PasswordReveal value={u.temp_password_plain} testid={`users-temp-pw-${u.email}`} />
                    ) : (
                      <span className="text-slate-400 italic text-xs">user has set their own</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(u.last_login_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-3">
                      <button
                        onClick={() => setResetTarget(u)}
                        data-testid={`users-reset-${u.email}`}
                        className="text-xs font-semibold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1"
                      >
                        <KeyRound className="h-3.5 w-3.5" /> Reset
                      </button>
                      {!u.is_super_admin && !isSelf && (
                        <button
                          onClick={() => remove(u)}
                          data-testid={`users-delete-${u.email}`}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <HostProfileEditor user={u} onSaved={() => fetchUsers()} />
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onCreated={fetchUsers} />}
      {resetTarget && <ResetModal user={resetTarget} onClose={() => setResetTarget(null)} onDone={fetchUsers} />}
    </div>
  );
};

export default AdminUsersManager;
