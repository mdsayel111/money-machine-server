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
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
                variant="danger"
                styleType="outline"
                size="sm"
                onClick={handleCancel}
                type="button"
                className="cursor-pointer"
            >
                Cancel
            </Button>
            <Button
                variant="success"
                size="sm"
                className="bg-[#00C076] hover:bg-[#009E60] text-white border-none cursor-pointer font-bold"
                onClick={handleSave}
                type="button"
                disabled={loading}
            >
                {loading ? "Saving..." : saveText}
            </Button>
        </div>
    );
}
