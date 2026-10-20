import { Button } from 'notation-ui';

export default function FormAction({
    handleCancel,
    handleSave,
    saveText = "Save",
    loading = false,
}: {
    handleSave: (e: any) => void;
    handleCancel: (e: any) => void;
    saveText?: string;
    loading?: boolean;
}) {
    return (
        <div className="flex justify-end gap-3">
            <div className="flex justify-end gap-2">
                <Button variant="danger" styleType="outline" onClick={handleCancel}>
                    Cancel
                </Button>
            </div>
            <div>
                <Button variant="success" className="w-full" onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : saveText}
                </Button>
            </div>
        </div>
    );
}
