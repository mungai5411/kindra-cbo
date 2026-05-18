import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDisbursements, uploadDisbursementReceipt } from '../donations/donationsSlice';
import { AppDispatch, RootState } from '../../store';

const FundsReceived: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { disbursements, isLoading } = useSelector((state: RootState) => state.donations);
    
    const [selectedDisbursement, setSelectedDisbursement] = useState<any>(null);
    const [description, setDescription] = useState('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

    useEffect(() => {
        dispatch(fetchDisbursements());
    }, [dispatch]);

    const handleUploadReceipt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDisbursement || !receiptFile) return;

        const formData = new FormData();
        formData.append('disbursement', selectedDisbursement.id);
        formData.append('description', description);
        formData.append('receipt_file', receiptFile);

        await dispatch(uploadDisbursementReceipt(formData));
        
        // Reset and refresh
        setSelectedDisbursement(null);
        setDescription('');
        setReceiptFile(null);
        dispatch(fetchDisbursements());
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Funds Received</h2>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    View funds sent to your shelter home. Please upload receipts and photos to show how the funds were utilized. This helps maintain transparency and build trust with donors.
                </p>

                <div className="space-y-4">
                    {disbursements.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">No funds have been disbursed to your shelter yet.</p>
                        </div>
                    ) : (
                        disbursements.map((d: any) => (
                            <div key={d.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-gray-800">
                                <div className="mb-4 md:mb-0">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {d.currency} {Number(d.amount).toLocaleString()}
                                        </h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            d.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                            d.status === 'RECEIPT_UPLOADED' ? 'bg-blue-100 text-blue-700' :
                                            d.status === 'SENT' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {d.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        <strong>Date:</strong> {d.date_sent ? new Date(d.date_sent).toLocaleDateString() : 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong>Purpose:</strong> {d.purpose_description}
                                    </p>
                                    {d.transaction_reference && (
                                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                            Ref: {d.transaction_reference}
                                        </p>
                                    )}
                                </div>
                                
                                <div>
                                    {['SENT', 'AWAITING_RECEIPT'].includes(d.status) ? (
                                        <button 
                                            onClick={() => setSelectedDisbursement(d)}
                                            className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg font-medium transition-colors w-full md:w-auto text-sm"
                                        >
                                            Upload Proof of Usage
                                        </button>
                                    ) : (
                                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm text-center">
                                            {d.status === 'VERIFIED' ? 'Receipt Verified ✓' : 'Receipt Pending Verification'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {selectedDisbursement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Upload Proof of Usage</h3>
                            <button onClick={() => setSelectedDisbursement(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                &times;
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto grow">
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Disbursement Details:
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                    {selectedDisbursement.currency} {Number(selectedDisbursement.amount).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedDisbursement.purpose_description}
                                </p>
                            </div>

                            <form onSubmit={handleUploadReceipt} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Receipt Document / Invoice</label>
                                    <input 
                                        type="file" 
                                        required 
                                        accept="image/*,.pdf"
                                        onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-sm text-gray-500 dark:text-gray-400
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-lg file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-primary/10 file:text-primary
                                            hover:file:bg-primary/20
                                            cursor-pointer border border-gray-300 dark:border-gray-600 rounded-lg p-2"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please upload a clear image or PDF of the receipt.</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Impact Description</label>
                                    <textarea 
                                        required 
                                        rows={4}
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                                        placeholder="Describe how the funds were used and the impact they created..."
                                    ></textarea>
                                </div>
                                
                                <div className="pt-4 flex justify-end space-x-3 shrink-0">
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedDisbursement(null)}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? 'Uploading...' : 'Submit Report'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FundsReceived;
