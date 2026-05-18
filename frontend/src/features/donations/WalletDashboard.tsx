import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallet, fetchDisbursements, createDisbursement } from './donationsSlice';
import { AppDispatch, RootState } from '../../store';
import { fetchShelters } from '../shelters/shelterSlice';

const WalletDashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { wallet, disbursements, isLoading } = useSelector((state: RootState) => state.donations);
    const { shelters } = useSelector((state: RootState) => state.shelters);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [amount, setAmount] = useState('');
    const [shelterId, setShelterId] = useState('');
    const [purpose, setPurpose] = useState('');
    const [reference, setReference] = useState('');

    useEffect(() => {
        dispatch(fetchWallet());
        dispatch(fetchDisbursements());
        dispatch(fetchShelters());
    }, [dispatch]);

    const handleSendFunds = async (e: React.FormEvent) => {
        e.preventDefault();
        await dispatch(createDisbursement({
            amount,
            shelter_home: shelterId,
            purpose_description: purpose,
            transaction_reference: reference,
            status: 'SENT'
        }));
        setIsModalOpen(false);
        setAmount('');
        setShelterId('');
        setPurpose('');
        setReference('');
        dispatch(fetchWallet()); // Refresh balance
        dispatch(fetchDisbursements()); // Refresh list
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Organization Wallet</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
                >
                    + Send Funds
                </button>
            </div>

            {/* Wallet Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Received</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        KES {Number(wallet?.total_received || 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Disbursed</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        KES {Number(wallet?.total_disbursed || 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-green-100 dark:border-green-900">
                    <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Current Balance</h3>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">
                        KES {Number(wallet?.current_balance || 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Disbursements Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Disbursements</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
                                <th className="px-6 py-3 font-medium">Date Sent</th>
                                <th className="px-6 py-3 font-medium">Shelter Home</th>
                                <th className="px-6 py-3 font-medium">Amount</th>
                                <th className="px-6 py-3 font-medium">Purpose</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {disbursements.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No disbursements found.
                                    </td>
                                </tr>
                            ) : (
                                disbursements.map((disbursement) => (
                                    <tr key={disbursement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                                            {disbursement.date_sent ? new Date(disbursement.date_sent).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                                            {disbursement.shelter_home_name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {disbursement.currency} {Number(disbursement.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                                            {disbursement.purpose_description}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                disbursement.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                                disbursement.status === 'RECEIPT_UPLOADED' ? 'bg-blue-100 text-blue-700' :
                                                disbursement.status === 'SENT' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {disbursement.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Send Funds to Shelter</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSendFunds} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shelter Home</label>
                                <select 
                                    required 
                                    value={shelterId} 
                                    onChange={(e) => setShelterId(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                >
                                    <option value="">Select a shelter</option>
                                    {shelters.map((shelter: any) => (
                                        <option key={shelter.id} value={shelter.id}>{shelter.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (KES)</label>
                                <input 
                                    type="number" 
                                    required 
                                    min="1"
                                    value={amount} 
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose / Description</label>
                                <textarea 
                                    required 
                                    rows={3}
                                    value={purpose} 
                                    onChange={(e) => setPurpose(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                    placeholder="What are these funds for?"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Ref (Optional)</label>
                                <input 
                                    type="text" 
                                    value={reference} 
                                    onChange={(e) => setReference(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                    placeholder="e.g. M-Pesa Code"
                                />
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Sending...' : 'Send Funds'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletDashboard;
