import { ModalBody, Modal as NotationUIModal } from 'notation-ui';
import FormAction from './FormAction';

type ModalProps = {
    open: boolean;
    onClose: () => void;
    onSave?: (e?: any) => void;
    title: string;
    children: React.ReactNode;
    hasFooter?: boolean;
    saveText?: string;
    loading?: boolean;
};

export default function Modal({
    open,
    onClose,
    onSave,
    title,
    children,
    hasFooter = true,
    saveText = "Save",
    loading = false,
}: ModalProps) {
    return (
        <NotationUIModal
            isOpen={open}
            onClose={onClose}
            title={title}
            footer={
                hasFooter && onSave ? (
                    <FormAction
                        handleCancel={onClose}
                        handleSave={onSave}
                        saveText={saveText}
                        loading={loading}
                    />
                ) : null
            }
        >
            <ModalBody className="space-y-4 py-2">
                {children}
            </ModalBody>
        </NotationUIModal>
    );
}
