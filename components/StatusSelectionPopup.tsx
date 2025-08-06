import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Function to get status description
const getStatusDescription = (statusId: string): string => {
  const descriptions: Record<string, string> = {
    'draft': 'Initial planning phase - task is being prepared',
    'new': 'Fresh task that needs to be started',
    'to_do': 'Ready to begin work',
    'requested': 'Task has been requested but not yet started',
    'in_progress': 'Currently being worked on',
    'working': 'Active development in progress',
    'ongoing': 'Continuous work being done',
    'doing': 'Task is actively being processed',
    'assigned': 'Task has been assigned to someone',
    'in_review': 'Task is under review or approval',
    'scheduled': 'Task is scheduled for future work',
    'blocked': 'Work is temporarily stopped due to an issue',
    'needs_input': 'Waiting for information or decision',
    'needs_work': 'Requires additional work or revision',
    'on_hold': 'Temporarily paused',
    'paused': 'Work has been paused temporarily',
    'waiting': 'Waiting for external dependency or action',
    'done': 'Work is completed',
    'approved': 'Task has been reviewed and approved',
    'validated': 'Task has been verified and validated',
    'paid': 'Task has been completed and paid for',
    'completed': 'Task has been fully completed',
    'rejected': 'Task has been rejected',
    'canceled': 'Task has been cancelled',
    'closed': 'Task is finished and closed',
    'declined': 'Task has been declined',
    'terminated': 'Task has been terminated'
  };
  
  return descriptions[statusId] || 'Status description not available';
};

interface Status {
  id: string;
  title: string;
  color: string;
}

interface StatusSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedStatus: string) => void;
  availableStatuses: Status[];
  taskTitle: string;
  fromGroup: string;
  toGroup: string;
}

const StatusSelectionPopup: React.FC<StatusSelectionPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  availableStatuses,
  taskTitle,
  fromGroup,
  toGroup
}) => {
  const [selectedStatus, setSelectedStatus] = React.useState<string>('');

  React.useEffect(() => {
    if (isOpen && availableStatuses.length > 0) {
      // Auto-select first status for better UX
      setSelectedStatus(availableStatuses[0].id);
    }
  }, [isOpen, availableStatuses]);

  const handleConfirm = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedStatus('');
    onClose();
  };

  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Status</DialogTitle>
          <DialogDescription>
            Choose the status for task "{taskTitle}" when moving from {fromGroup} to {toGroup}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            {availableStatuses.map((status) => (
              <div
                key={status.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedStatus === status.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
                onClick={() => setSelectedStatus(status.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={status.color}>
                      {status.title}
                    </Badge>
                  </div>
                </div>
                {selectedStatus === status.id && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            💡 <strong>Tip:</strong> {availableStatuses.length > 1 
              ? 'Choose the most appropriate status for this task. You can always change it later.'
              : 'Confirm the status change for this task.'
            }
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedStatus}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusSelectionPopup; 