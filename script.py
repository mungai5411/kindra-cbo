import re

with open('frontend/src/components/campaigns/DonationDialog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r"const \[paymentMethod, setPaymentMethod\] = useState.*?;\n", "", content)

content = content.replace("success && paymentMethod === 'MPESA' && mpesaStatus === 'pending'", "success && mpesaStatus === 'pending'")
content = content.replace("[success, paymentMethod, mpesaStatus, checkoutRequestId, dispatch]", "[success, mpesaStatus, checkoutRequestId, dispatch]")

content = content.replace("if (paymentMethod === 'MPESA' && !phoneNumber)", "if (!phoneNumber)")

content = re.sub(
    r"if \(paymentMethod === 'MPESA'\) \{[\s\S]*?\} else \{[\s\S]*?\}",
    "endpoint = endpoints.donations.mpesa;\n            payload.phone_number = phoneNumber;",
    content
)

content = content.replace("paymentMethod === 'MPESA' && mpesaStatus === 'pending' ? (", "mpesaStatus === 'pending' ? (")
content = content.replace(") : paymentMethod === 'MPESA' && mpesaStatus === 'failed' ? (", ") : mpesaStatus === 'failed' ? (")

content = re.sub(
    r"\{/\* Payment Method Selection \*/\}[\s\S]*?\{/\* Amount Selection \*/\}",
    "{/* Amount Selection */}",
    content
)

content = re.sub(
    r"\{paymentMethod === 'MPESA' && \([\s\S]*?<TextField[\s\S]*?label=\"M-Pesa Phone Number\"[\s\S]*?/>\s*\)\s*\}",
    r"<TextField\n                                                fullWidth\n                                                required\n                                                label=\"M-Pesa Phone Number\"\n                                                placeholder=\"254712345678\"\n                                                value={phoneNumber}\n                                                onChange={(e) => setPhoneNumber(e.target.value)}\n                                                InputProps={{ sx: { borderRadius: 2 } }}\n                                            />",
    content
)

with open('frontend/src/components/campaigns/DonationDialog.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
