import React, { useState } from 'react';
import { User } from '../../types';
import { formatDate } from '../../../../utils/date';
import Button from '../../../../components/Button';
import UserRoleIndicator from '../../../../components/UserRoleIndicator';
import DeleteUserDialog from './DeleteUserDialog';
import EditUserDialog from './EditUserDialog';

interface Props {
  users: User[];
  loading: boolean;
  onUpdateRole: (userId: string, role: User['role']) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export default function UserTable({ users, loading, onUpdateRole, onDeleteUser }: Props) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (loading) {
    return <div className="animate-pulse">Loading users...</div>;
  }

  return (
    <>
      <div className="bg-background-alt shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background-alt divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-primary">
                      {user.full_name}
                    </div>
                    <div className="text-sm text-primary-light">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UserRoleIndicator role={user.role} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-light">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-light">
                    <div className="flex space-x-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EditUserDialog
        user={selectedUser}
        isOpen={isEditOpen}
        onClose={() => {
          setSelectedUser(null);
          setIsEditOpen(false);
        }}
        onUpdateRole={onUpdateRole}
      />

      <DeleteUserDialog
        user={selectedUser}
        isOpen={isDeleteOpen}
        onClose={() => {
          setSelectedUser(null);
          setIsDeleteOpen(false);
        }}
        onDelete={onDeleteUser}
      />
    </>
  );
}