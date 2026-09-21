import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../../components/ui/dropdown-menu";
import styles from "./planner.module.scss";

interface TripMenuProps {
  onEdit: () => void;
  onExport: () => void;
  // Share channels. Only email exists today; WhatsApp and others slot in here later.
  onShareEmail: () => void;
}

// Kebab menu in the sticky trip-summary header, built on the shadcn dropdown
// (Radix): the content is portaled to <body>, so it escapes the header's
// `overflow: hidden`, and "Share" is a submenu that flies out to the side.
export function TripMenu({ onEdit, onExport, onShareEmail }: TripMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={styles.menuButton} aria-label="Trip options">
        ⋯
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onEdit}>
          <span aria-hidden="true">✏️</span> Edit trip
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onExport}>
          <span aria-hidden="true">📄</span> Export PDF
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span aria-hidden="true">🔗</span> Share
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={onShareEmail}>
              <span aria-hidden="true">✉️</span> Email
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
