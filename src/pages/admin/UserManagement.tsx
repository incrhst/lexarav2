import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Define types for user data
interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

// Available roles and permissions
const availableRoles = ['admin', 'agent', 'applicant'];

const availablePermissions = [
  { key: 'view_dashboard', description: 'View Dashboard' },
  { key: 'manage_users', description: 'Manage Users' },
  { key: 'manage_applications', description: 'Manage Applications' },
  { key: 'manage_certificates', description: 'Manage Certificates' },
  { key: 'manage_payments', description: 'Manage Payments' },
  { key: 'manage_oppositions', description: 'Manage Oppositions' },
];

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // State for role permissions, grouped by role
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    admin: [],
    agent: [],
    applicant: []
  });
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Fetch users from profiles with joined user_roles (if available)
  useEffect(() => {
    async function fetchUsers() {
      setLoadingUsers(true);
      try {
        // Assuming a foreign table relationship exists between profiles and user_roles
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, user_roles(role)');
        if (error) throw error;
        const usersData: User[] = (data || []).map((item: any) => ({
          id: item.id,
          email: item.email,
          full_name: item.full_name,
          role: item.user_roles ? item.user_roles.role : 'applicant'
        }));
        setUsers(usersData);
      } catch (err: any) {
        setErrorUsers(err.message);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  // Fetch role permissions from role_permissions table
  useEffect(() => {
    async function fetchRolePermissions() {
      setLoadingPermissions(true);
      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select('*');
        if (error) throw error;
        // Group permissions by role
        const grouped: Record<string, string[]> = { admin: [], agent: [], applicant: [] };
        (data || []).forEach((item: any) => {
          const role = item.role;
          const permissionKey = item.permission_key;
          if (grouped[role]) {
            grouped[role].push(permissionKey);
          }
        });
        setRolePermissions(grouped);
      } catch (err) {
        console.error('Error fetching role permissions:', err);
      } finally {
        setLoadingPermissions(false);
      }
    }
    fetchRolePermissions();
  }, []);

  const handleRoleChange = (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId)
      .then(({ error }) => {
        if (error) {
          alert('Error updating role: ' + error.message);
        } else {
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
          alert('Role updated successfully');
        }
      })
      .finally(() => setUpdatingUserId(null));
  };

  const handlePermissionToggle = async (role: string, permission: string) => {
    let updatedPermissions = [...(rolePermissions[role] || [])];
    if (updatedPermissions.includes(permission)) {
      // Remove permission
      updatedPermissions = updatedPermissions.filter(p => p !== permission);
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .match({ role, permission_key: permission });
      if (error) {
        alert('Error updating permission: ' + error.message);
        return;
      }
    } else {
      // Add permission
      updatedPermissions.push(permission);
      const { error } = await supabase
        .from('role_permissions')
        .insert([{ role, permission_key: permission, description: availablePermissions.find(p => p.key === permission)?.description || '' }]);
      if (error) {
        alert('Error updating permission: ' + error.message);
        return;
      }
    }
    setRolePermissions(prev => ({ ...prev, [role]: updatedPermissions }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="mb-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`ml-2 px-4 py-2 ${activeTab === 'roles' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Roles &amp; Permissions
        </button>
      </div>
      {activeTab === 'users' && (
        <div>
          {loadingUsers ? (
            <p>Loading users...</p>
          ) : errorUsers ? (
            <p className="text-red-500">{errorUsers}</p>
          ) : (
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">Full Name</th>
                  <th className="border px-4 py-2">Role</th>
                  <th className="border px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="border px-4 py-2">{user.email}</td>
                    <td className="border px-4 py-2">{user.full_name || '-'}</td>
                    <td className="border px-4 py-2">
                      <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                        {availableRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border px-4 py-2">
                      {updatingUserId === user.id ? 'Updating...' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {activeTab === 'roles' && (
        <div>
          {loadingPermissions ? (
            <p>Loading permissions...</p>
          ) : (
            <div>
              {availableRoles.map(role => (
                <div key={role} className="mb-4">
                  <h2 className="text-xl font-semibold capitalize">{role} Permissions</h2>
                  <div className="flex flex-wrap mt-2">
                    {availablePermissions.map(permission => (
                      <label key={permission.key} className="mr-4 mb-2 flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-1"
                          checked={rolePermissions[role]?.includes(permission.key) || false}
                          onChange={() => handlePermissionToggle(role, permission.key)}
                        />
                        <span>{permission.description}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 