"use client";

import { LogOut, Menu, User } from "lucide-react";
import { UserRole } from "@prisma/client";
import { getInitials } from "@/lib/utils";
import { USER_ROLE_LABELS } from "@/types/enums";
import { logoutAction } from "@/server/actions/auth.actions";
import { APP_NAME } from "@/config/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminTopbarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  };
  companyName: string;
  onMenuClick?: () => void;
}

export function AdminTopbar({ user, companyName, onMenuClick }: AdminTopbarProps) {
  const initials = getInitials(user.firstName, user.lastName);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-4 sm:h-16 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground lg:hidden">
            {APP_NAME}
          </p>
          <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
            {companyName}
          </h1>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Espace de gestion
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 shrink-0 rounded-full sm:h-10 sm:w-10">
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
              <AvatarFallback className="text-xs sm:text-sm">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {USER_ROLE_LABELS[user.role]}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <User className="mr-2 h-4 w-4" />
            Mon profil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => logoutAction()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
