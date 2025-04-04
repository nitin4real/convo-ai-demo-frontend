import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { FeedbackDialogRef } from './FeedbackDialog';

interface PlatformUsageDialogProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    feedbackDialogRef?: React.RefObject<FeedbackDialogRef | null>;
}

export interface PlatformUsageDialogRef {
    open: () => void;
    close: () => void;
}

export const PlatformUsageDialog = forwardRef<PlatformUsageDialogRef, PlatformUsageDialogProps>(({
    isOpen: externalIsOpen,
    onOpenChange: externalOnOpenChange,
    feedbackDialogRef
}, ref) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const navigate = useNavigate();

    const isOpen = externalIsOpen ?? internalIsOpen;
    const setIsOpen = externalOnOpenChange ?? setInternalIsOpen;

    useImperativeHandle(ref, () => ({
        open: () => setIsOpen(true),
        close: () => setIsOpen(false)
    }));

    const handleClose = () => {
        console.log('Closing platform usage dialog', feedbackDialogRef?.current);   
        feedbackDialogRef?.current?.open('/dashboard');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Platform Usage Time Expired</DialogTitle>
                    <DialogDescription className="pt-2">
                        Your platform usage time has expired. Please contact the administrator to get more access time.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-4">
                    <Button
                        onClick={handleClose}
                        variant="default"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}); 