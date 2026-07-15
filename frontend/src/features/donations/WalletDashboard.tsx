import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallet, fetchDisbursements, createDisbursement } from './donationsSlice';
import { AppDispatch, RootState } from '../../store';
import { fetchShelters } from '../shelters/shelterSlice';
import { motion, AnimatePresence } from 'framer-motion';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CallMadeIcon from '@mui/icons-material/CallMade';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CloseIcon from '@mui/icons-material/Close';

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
    const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');

    useEffect(() => {
        dispatch(fetchWallet());
        dispatch(fetchDisbursements());
        dispatch(fetchShelters());
    }, [dispatch]);

    const selectedShelter = shelters.find((s: any) => s.id === shelterId);

    const handleSendFunds = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let paymentDetails = {};
        if (selectedShelter) {
            if (paymentMethod === 'BANK_TRANSFER') {
                paymentDetails = {
                    bank_name: selectedShelter.bank_name,
                    bank_account_number: selectedShelter.bank_account_number,
                    bank_branch: selectedShelter.bank_branch
                };
            } else if (paymentMethod === 'MPESA') {
                paymentDetails = {
                    mpesa_paybill_number: selectedShelter.mpesa_paybill_number,
                    mpesa_account_number: selectedShelter.mpesa_account_number,
                    mpesa_phone_number: selectedShelter.mpesa_phone_number
                };
            }
        }

        await dispatch(createDisbursement({
            amount,
            shelter_home: shelterId,
            purpose_description: purpose,
            transaction_reference: reference,
            payment_method: paymentMethod,
            payment_details: paymentDetails,
            status: 'SENT'
        }));
        
        setIsModalOpen(false);
        setAmount('');
        setShelterId('');
        setPurpose('');
        setReference('');
        setPaymentMethod('BANK_TRANSFER');
        dispatch(fetchWallet()); 
        dispatch(fetchDisbursements()); 
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Organization Wallet
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage funds and track disbursements seamlessly.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all text-sm"
                >
                    <CallMadeIcon fontSize="small" /> Send Funds
                </motion.button>
            </div>

            {/* Wallet Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 group transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-primary">
                        <AccountBalanceWalletIcon sx={{ fontSize: 60 }} />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Received</h3>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        <span className="text-lg font-medium text-gray-400 mr-1">KES</span>
                        {Number(wallet?.total_received || 0).toLocaleString()}
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 group transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-primary">
                        <CallMadeIcon sx={{ fontSize: 60 }} />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Disbursed</h3>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        <span className="text-lg font-medium text-gray-400 mr-1">KES</span>
                        {Number(wallet?.total_disbursed || 0).toLocaleString()}
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="relative overflow-hidden bg-primary/10 dark:bg-primary/20 p-6 rounded-2xl border border-primary/20 dark:border-primary/30 group transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
                        <AccountBalanceWalletIcon sx={{ fontSize: 60 }} />
                    </div>
                    <h3 className="text-xs font-semibold text-primary dark:text-primary-light uppercase tracking-wider mb-2">Current Balance</h3>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        <span className="text-lg font-medium text-gray-500 dark:text-gray-400 mr-1">KES</span>
                        {Number(wallet?.current_balance || 0).toLocaleString()}
                    </p>
                </motion.div>
            </div>

            {/* Disbursements Table */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Recent Disbursements
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-3 font-semibold">Date Sent</th>
                                <th className="px-6 py-3 font-semibold">Shelter Home</th>
                                <th className="px-6 py-3 font-semibold">Amount</th>
                                <th className="px-6 py-3 font-semibold">Method</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {disbursements.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <AccountBalanceWalletIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                                            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No disbursements yet.</p>
                                            <p className="text-sm mt-1">When you send funds, they will appear here.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                disbursements.map((disbursement) => (
                                    <tr key={disbursement.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors group">
                                        <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {disbursement.date_sent ? new Date(disbursement.date_sent).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {disbursement.shelter_home_name || 'Unknown'}
                                            <div className="text-xs text-gray-400 dark:text-gray-500 font-normal mt-0.5 truncate max-w-[200px]">{disbursement.purpose_description}</div>
                                        </td>
                                        <td className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                            {disbursement.currency} {Number(disbursement.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-sm whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                                {disbursement.payment_method === 'MPESA' ? <PhoneAndroidIcon fontSize="small" className="text-green-500" /> : <AccountBalanceIcon fontSize="small" className="text-blue-500" />}
                                                <span className="font-medium">{disbursement.payment_method?.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-sm whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                disbursement.status === 'VERIFIED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                disbursement.status === 'RECEIPT_UPLOADED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                disbursement.status === 'SENT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
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
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
                        >
                            <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Send Funds to Shelter</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Disburse resources directly to partner shelters.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <CloseIcon />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-8 custom-scrollbar">
                                <form id="send-funds-form" onSubmit={handleSendFunds} className="space-y-6">
                                    
                                    {/* Shelter Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Shelter Home</label>
                                        <select 
                                            required 
                                            value={shelterId} 
                                            onChange={(e) => setShelterId(e.target.value)}
                                            className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow py-3"
                                        >
                                            <option value="">-- Choose a partner --</option>
                                            {shelters.map((shelter: any) => (
                                                <option key={shelter.id} value={shelter.id}>{shelter.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Amount and Purpose Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Amount (KES)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">KES</span>
                                                <input 
                                                    type="number" 
                                                    required 
                                                    min="1"
                                                    value={amount} 
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className="w-full pl-14 pr-4 py-3 rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow font-bold text-lg"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Purpose</label>
                                            <input 
                                                type="text" 
                                                required 
                                                value={purpose} 
                                                onChange={(e) => setPurpose(e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                                                placeholder="e.g. Monthly Food Supply"
                                            />
                                        </div>
                                    </div>

                                    {/* Payment Method Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Payment Method</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-all ${paymentMethod === 'BANK_TRANSFER' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                                <input type="radio" name="payment_method" value="BANK_TRANSFER" className="sr-only" checked={paymentMethod === 'BANK_TRANSFER'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                                <span className="flex flex-1">
                                                    <span className="flex flex-col">
                                                        <span className="block text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                            <AccountBalanceIcon fontSize="small" className={paymentMethod === 'BANK_TRANSFER' ? 'text-primary' : 'text-gray-400'}/> Bank Transfer
                                                        </span>
                                                        <span className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">Direct deposit to shelter's bank</span>
                                                    </span>
                                                </span>
                                            </label>

                                            <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-all ${paymentMethod === 'MPESA' ? 'border-green-500 bg-green-50 dark:bg-green-900/10 ring-1 ring-green-500' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                                <input type="radio" name="payment_method" value="MPESA" className="sr-only" checked={paymentMethod === 'MPESA'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                                <span className="flex flex-1">
                                                    <span className="flex flex-col">
                                                        <span className="block text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                            <PhoneAndroidIcon fontSize="small" className={paymentMethod === 'MPESA' ? 'text-green-600' : 'text-gray-400'}/> M-Pesa
                                                        </span>
                                                        <span className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">Send to shelter's Paybill/Till</span>
                                                    </span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Dynamic Shelter Payment Details Display */}
                                    <AnimatePresence mode="wait">
                                        {selectedShelter && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-5 mt-4">
                                                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3 uppercase tracking-wider">Registered {paymentMethod === 'MPESA' ? 'M-Pesa' : 'Bank'} Details</h4>
                                                    
                                                    {paymentMethod === 'BANK_TRANSFER' ? (
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <span className="block text-blue-600/70 dark:text-blue-400/70 text-xs mb-1">Bank Name</span>
                                                                <span className="font-semibold text-blue-900 dark:text-blue-100">{selectedShelter.bank_name || 'Not provided'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-blue-600/70 dark:text-blue-400/70 text-xs mb-1">Branch</span>
                                                                <span className="font-semibold text-blue-900 dark:text-blue-100">{selectedShelter.bank_branch || 'Not provided'}</span>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <span className="block text-blue-600/70 dark:text-blue-400/70 text-xs mb-1">Account Number</span>
                                                                <span className="font-mono text-base font-bold text-blue-900 dark:text-blue-100 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50 inline-block">
                                                                    {selectedShelter.bank_account_number || 'Not provided'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <span className="block text-blue-600/70 dark:text-blue-400/70 text-xs mb-1">Paybill / Till Number</span>
                                                                <span className="font-mono text-base font-bold text-blue-900 dark:text-blue-100 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50 inline-block">
                                                                    {selectedShelter.mpesa_paybill_number || 'Not provided'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-blue-600/70 dark:text-blue-400/70 text-xs mb-1">Account No</span>
                                                                <span className="font-semibold text-blue-900 dark:text-blue-100">{selectedShelter.mpesa_account_number || 'N/A'}</span>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <span className="block text-blue-600/70 dark:text-blue-400/70 text-xs mb-1">Registered Phone</span>
                                                                <span className="font-semibold text-blue-900 dark:text-blue-100">{selectedShelter.mpesa_phone_number || 'Not provided'}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {(!selectedShelter.bank_account_number && paymentMethod === 'BANK_TRANSFER') || 
                                                     (!selectedShelter.mpesa_paybill_number && !selectedShelter.mpesa_phone_number && paymentMethod === 'MPESA') ? (
                                                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                                                            <span className="text-red-600 dark:text-red-400 font-medium text-sm">Warning: This shelter has not provided {paymentMethod === 'MPESA' ? 'M-Pesa' : 'Bank'} details. You may need to contact them first.</span>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Transaction Reference</label>
                                        <input 
                                            type="text" 
                                            value={reference} 
                                            onChange={(e) => setReference(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                                            placeholder="Bank Receipt No. or M-Pesa Code"
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="px-8 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 text-sm text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                                >
                                    Cancel
                                </button>
                                <button 
                                    form="send-funds-form"
                                    type="submit" 
                                    disabled={isLoading || !shelterId}
                                    className="px-6 py-2 text-sm bg-primary hover:bg-primary-dark text-white rounded-lg font-medium shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoading ? 'Processing...' : 'Confirm Transfer'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default WalletDashboard;
