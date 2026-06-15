"use client";

import { useState } from "react";
import { StaffPermission, UserRole } from "@prisma/client";
import { toast } from "sonner";
import { Pencil, Trash2, UserPlus, X } from "lucide-react";
import { USER_ROLE_LABELS } from "@/types/enums";
import { ALL_STAFF_PERMISSIONS, PERMISSION_META } from "@/config/permissions";
import {
  createStaffAction,
  deleteStaffAction,
  updateStaffAction,
} from "@/server/actions/user.actions";
import type { CompanyUser } from "@/server/services/user.service";
import { PermissionCheckboxes } from "@/components/settings/permission-checkboxes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TeamManagementProps {
  users: CompanyUser[];
}

function permissionLabels(permissions: StaffPermission[]) {
  if (permissions.length === 0) return "Aucun accès";
  return permissions.map((p) => PERMISSION_META[p].label).join(", ");
}

export function TeamManagement({ users: initialUsers }: TeamManagementProps) {
  const [users, setUsers] = useState(initialUsers);
  const [showCreate, setShowCreate] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    permissions: [] as StaffPermission[],
  });

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    permissions: [] as StaffPermission[],
    isActive: true,
  });

  function openEdit(user: CompanyUser) {
    setEditUserId(user.id);
    setShowCreate(false);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      permissions: user.permissions,
      isActive: user.isActive,
    });
  }

  async function handleCreate() {
    setLoading(true);
    const result = await createStaffAction(createForm);
    setLoading(false);

    if (!result.success) {
      if (result.fieldErrors) {
        const first = Object.values(result.fieldErrors)[0]?.[0];
        if (first) toast.error(first);
      } else {
        toast.error(result.error ?? "Erreur");
      }
      return;
    }

    toast.success("Compte employé créé");
    setShowCreate(false);
    setCreateForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      permissions: [],
    });
    window.location.reload();
  }

  async function handleUpdate() {
    if (!editUserId) return;
    setLoading(true);
    const result = await updateStaffAction(editUserId, editForm);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Erreur");
      return;
    }

    toast.success("Droits mis à jour");
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editUserId
          ? {
              ...u,
              firstName: editForm.firstName,
              lastName: editForm.lastName,
              permissions: editForm.permissions,
              isActive: editForm.isActive,
            }
          : u,
      ),
    );
    setEditUserId(null);
  }

  async function handleDelete(userId: string) {
    setLoading(true);
    const result = await deleteStaffAction(userId);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Erreur lors de la suppression");
      return;
    }

    toast.success("Employé supprimé");
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (editUserId === userId) setEditUserId(null);
  }

  return (
    <div className="space-y-6">
      {showCreate && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Nouvel employé</CardTitle>
              <CardDescription>
                Créez un compte et choisissez ses droits d&apos;accès.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  value={createForm.firstName}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={createForm.lastName}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe initial</Label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Droits d&apos;accès</Label>
              <PermissionCheckboxes
                value={createForm.permissions}
                onChange={(permissions) =>
                  setCreateForm((f) => ({ ...f, permissions }))
                }
              />
            </div>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "Création…" : "Créer le compte"}
            </Button>
          </CardContent>
        </Card>
      )}

      {editUserId && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Modifier les droits</CardTitle>
              <CardDescription>
                Cochez les modules accessibles pour cet employé.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setEditUserId(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                />
              </div>
            </div>
            <PermissionCheckboxes
              value={editForm.permissions}
              onChange={(permissions) =>
                setEditForm((f) => ({ ...f, permissions }))
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
              Compte actif (peut se connecter)
            </label>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Équipe</CardTitle>
            <CardDescription>
              Employés et leurs accès aux modules de l&apos;application
            </CardDescription>
          </div>
          {!showCreate && (
            <Button onClick={() => { setShowCreate(true); setEditUserId(null); }}>
              <UserPlus className="mr-2 h-4 w-4" />
              Créer un employé
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <Badge variant={user.role === UserRole.ADMIN ? "default" : "secondary"}>
                    {USER_ROLE_LABELS[user.role]}
                  </Badge>
                  {!user.isActive && <Badge variant="muted">Désactivé</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user.role === UserRole.ADMIN
                    ? `Accès complet — ${ALL_STAFF_PERMISSIONS.map((p) => PERMISSION_META[p].label).join(", ")}`
                    : permissionLabels(user.permissions)}
                </p>
              </div>
              {user.role === UserRole.STAFF && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(user)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={loading}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cet employé ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Le compte de{" "}
                          <strong>
                            {user.firstName} {user.lastName}
                          </strong>{" "}
                          ({user.email}) sera définitivement supprimé. Cette
                          action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(user.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
