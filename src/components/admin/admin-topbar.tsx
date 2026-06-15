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
  mobileNavOpen?: boolean;
}

export function AdminTopbar({
  user,
  companyName,
  onMenuClick,
  mobileNavOpen,
}: AdminTopbarProps) {
  const initials = getInitials(user.firstName, user.lastName);

  return (
    <header className="glass-panel relative z-20 flex min-h-14 shrink-0 items-center justify-between gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:min-h-16 sm:px-6 sm:pb-0 sm:pt-0">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 touch-manipulation lg:hidden"
          onClick={() => onMenuClick?.()}
          aria-label={mobileNavOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileNavOpen ?? false}
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
          <Button
            variant="ghost"
            className="relative h-9 w-9 shrink-0 rounded-full sm:h-10 sm:w-10"
          >
            <Avatar className="h-9 w-9 border border-white/80 sm:h-10 sm:w-10">
              <AvatarFallback className="bg-[#1e3a5f] text-xs text-white sm:text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
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
