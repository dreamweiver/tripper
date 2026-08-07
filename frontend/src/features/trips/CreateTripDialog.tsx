import type { TripInput } from "@tripper/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { CreateTripForm } from "./CreateTripForm";

interface CreateTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: TripInput) => void;
}

export function CreateTripDialog({ open, onOpenChange, onSubmit }: CreateTripDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Plan a new trip</DialogTitle>
        </DialogHeader>
        <CreateTripForm onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
