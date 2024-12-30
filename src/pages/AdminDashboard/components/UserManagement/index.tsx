import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import UserFilters from './UserFilters';
import UserTable from './UserTable';
import AddUserDialog from './AddUserDialog';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useAddUser } from '../../hooks/useAddUser';
import Button from '../../../../components/Button';

export default function UserManagement() {
  const {
    users,
    filters,
    setFilters,
    loading,
    error,
    updateUserRole,
    deleteUser,
  } = useUserManagement();

  const { addUser, loading: addingUser } = useAddUser();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  if (error) {
    return (
      <div className="text-red-600">
        Error loading users. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">User Management</h1>
          <p className="mt-1 text-sm text-primary-light">
            Manage user accounts and permissions
          </p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsAddUserOpen(true)}
          isLoading={addingUser}
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <UserFilters filters={filters} onFilterChange={setFilters} />
      
      <UserTable
        users={users}
        loading={loading}
        onUpdateRole={updateUserRole}
        onDeleteUser={deleteUser}
      />

      <AddUserDialog
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onAdd={addUser}
      />
    </div>
  );
}