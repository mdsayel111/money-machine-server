import PageHeader from "@/component/shared/PageHeader";
import RootLayout from "@/component/shared/RootLayout";
import Modal from "@/component/shared/Modal";
import { useForm } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Input } from "notation-ui";
import { FiEdit3 } from "react-icons/fi";

type MembershipTier = {
    id: number;
    slug: string;
    name: string;
    subtitle: string;
    price: number;
    price_text: string;
    daily_tasks_limit: number;
    referral_commission_rate: number;
    withdrawal_fee_percent: number;
    vip_support: boolean;
    instant_payouts: boolean;
    users_count?: number;
};

export default function TiersIndex({ tiers }: { tiers: MembershipTier[] }) {
    const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);

    const { data, setData, patch, processing, reset } = useForm({
        subtitle: "",
        price: 0,
        price_text: "",
        daily_tasks_limit: 5,
        referral_commission_rate: 5.0,
        withdrawal_fee_percent: 2.5,
        vip_support: false,
        instant_payouts: false,
        is_active: true,
    });

    const handleOpenEdit = (tier: MembershipTier) => {
        setEditingTier(tier);
        setData({
            subtitle: tier.subtitle,
            price: tier.price,
            price_text: tier.price_text,
            daily_tasks_limit: tier.daily_tasks_limit,
            referral_commission_rate: tier.referral_commission_rate,
            withdrawal_fee_percent: tier.withdrawal_fee_percent,
            vip_support: tier.vip_support,
            instant_payouts: tier.instant_payouts,
            is_active: true,
        });
    };

    const handleSave = () => {
        if (!editingTier) return;
        patch(`/tiers/${editingTier.id}`, {
            onSuccess: () => {
                toast.success("Membership tier updated successfully!");
                setEditingTier(null);
                reset();
            },
            onError: () => toast.error("Could not update tier."),
        });
    };

    return (
        <RootLayout>
            <PageHeader
                title="Membership Tiers & Downline Rates"
                subtitle="Configure membership annual pricing, daily task volume limits, and referral commission percentages."
                hasBack={false}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {tiers.map((tier) => (
                    <div
                        key={tier.id}
                        className="bg-foreground border rounded-md p-5 flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                                    {tier.name}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold mt-3">
                                {tier.price_text}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium mt-1">{tier.subtitle}</p>

                            <div className="mt-5 space-y-2.5 text-xs divide-y divide-border-color">
                                <div className="pt-2 flex justify-between">
                                    <span className="text-gray-500">Daily Tasks Limit:</span>
                                    <span className="font-semibold">
                                        {tier.daily_tasks_limit === -1 ? 'Unlimited' : `${tier.daily_tasks_limit} / day`}
                                    </span>
                                </div>
                                <div className="pt-2 flex justify-between">
                                    <span className="text-gray-500">Referral Commission:</span>
                                    <span className="font-bold text-secondary">
                                        {tier.referral_commission_rate}%
                                    </span>
                                </div>
                                <div className="pt-2 flex justify-between">
                                    <span className="text-gray-500">Withdrawal Fee:</span>
                                    <span className="font-semibold">
                                        {tier.withdrawal_fee_percent}%
                                    </span>
                                </div>
                                <div className="pt-2 flex justify-between">
                                    <span className="text-gray-500">Instant Cashout:</span>
                                    <span className={`font-semibold ${tier.instant_payouts ? 'text-secondary' : 'text-gray-400'}`}>
                                        {tier.instant_payouts ? 'Enabled' : 'Standard'}
                                    </span>
                                </div>
                                <div className="pt-2 flex justify-between">
                                    <span className="text-gray-500">Enrolled Users:</span>
                                    <span className="font-semibold text-blue-500">
                                        {tier.users_count || 0} Members
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            styleType="outline"
                            onClick={() => handleOpenEdit(tier)}
                            className="mt-6 w-full flex items-center justify-center gap-2"
                        >
                            <FiEdit3 />
                            Configure Parameters
                        </Button>
                    </div>
                ))}
            </div>

            {/* Edit Tier Modal */}
            {editingTier && (
                <Modal
                    open={Boolean(editingTier)}
                    onClose={() => setEditingTier(null)}
                    title={`Configure ${editingTier.name} Tier`}
                    onSave={handleSave}
                    loading={processing}
                >
                    <div className="space-y-3.5">
                        <Input
                            label="Subtitle / Headline"
                            value={data.subtitle}
                            onChange={(e) => setData('subtitle', e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Annual Fee Numeric (৳)"
                                type="number"
                                value={data.price.toString()}
                                onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                            />
                            <Input
                                label="Display Price Text"
                                value={data.price_text}
                                onChange={(e) => setData('price_text', e.target.value)}
                                placeholder="e.g. ৳ 2,500/yr or Free"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <Input
                                label="Daily Tasks (-1=Unlim)"
                                type="number"
                                value={data.daily_tasks_limit.toString()}
                                onChange={(e) => setData('daily_tasks_limit', parseInt(e.target.value) || 0)}
                            />
                            <Input
                                label="Commission Rate (%)"
                                type="number"
                                step="0.5"
                                value={data.referral_commission_rate.toString()}
                                onChange={(e) => setData('referral_commission_rate', parseFloat(e.target.value) || 0)}
                            />
                            <Input
                                label="Withdrawal Fee (%)"
                                type="number"
                                step="0.5"
                                value={data.withdrawal_fee_percent.toString()}
                                onChange={(e) => setData('withdrawal_fee_percent', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="flex items-center gap-6 pt-2">
                            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.instant_payouts}
                                    onChange={(e) => setData('instant_payouts', e.target.checked)}
                                    className="w-4 h-4 text-secondary rounded cursor-pointer"
                                />
                                Instant Payouts Privilege
                            </label>

                            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.vip_support}
                                    onChange={(e) => setData('vip_support', e.target.checked)}
                                    className="w-4 h-4 text-secondary rounded cursor-pointer"
                                />
                                Priority VIP Support
                            </label>
                        </div>
                    </div>
                </Modal>
            )}
        </RootLayout>
    );
}
