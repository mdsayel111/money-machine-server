import PageHeader from "@/component/shared/PageHeader";
import RootLayout from "@/component/shared/RootLayout";
import Modal from "@/component/shared/Modal";
import { useForm } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Input } from "notation-ui";
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {tiers.map((tier) => (
                    <div
                        key={tier.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                    {tier.name}
                                </span>
                                <button
                                    onClick={() => handleOpenEdit(tier)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-all"
                                    title="Edit Tier Parameters"
                                >
                                    <FiEdit3 className="text-base" />
                                </button>
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-4">
                                {tier.price_text}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">{tier.subtitle}</p>

                            <div className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800">
                                <div className="pt-2 flex justify-between">
                                    <span className="text-slate-400">Daily Tasks Limit:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {tier.daily_tasks_limit === -1 ? 'Unlimited' : `${tier.daily_tasks_limit} / day`}
                                    </span>
                                </div>
                                <div className="pt-2 flex justify-between">
                                    <span className="text-slate-400">Referral Commission:</span>
                                    <span className="font-bold text-emerald-600">
                                        {tier.referral_commission_rate}%
                                    </span>
                                </div>
                                <div className="pt-2 flex justify-between">
                                    <span className="text-slate-400">Withdrawal Fee:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {tier.withdrawal_fee_percent}%
                                    </span>
                                </div>
                                <div className="pt-2 flex justify-between">
                                    <span className="text-slate-400">Instant Cashout:</span>
                                    <span className={`font-bold ${tier.instant_payouts ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {tier.instant_payouts ? 'Enabled' : 'Standard'}
                                    </span>
                                </div>
                                <div className="pt-2 flex justify-between">
                                    <span className="text-slate-400">Enrolled Users:</span>
                                    <span className="font-bold text-indigo-600">
                                        {tier.users_count || 0} Members
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleOpenEdit(tier)}
                            className="mt-6 w-full py-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
                        >
                            Configure Parameters
                        </button>
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
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.instant_payouts}
                                    onChange={(e) => setData('instant_payouts', e.target.checked)}
                                    className="w-4 h-4 text-emerald-600 rounded"
                                />
                                Instant Payouts Privilege
                            </label>

                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.vip_support}
                                    onChange={(e) => setData('vip_support', e.target.checked)}
                                    className="w-4 h-4 text-emerald-600 rounded"
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
