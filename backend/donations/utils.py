"""
Donation Utilities
"""

def amount_to_words(amount, currency='KES'):
    """
    Convert decimal amount to words in English.
    Example: 1234.50 -> "One Thousand Two Hundred Thirty Four and Fifty Cents"
    """
    
    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    teens = ["Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
    thousands = ["", "Thousand", "Million", "Billion"]

    def _convert_segment(num):
        s = ""
        h = num // 100
        t = (num % 100) // 10
        o = num % 10
        
        if h > 0:
            s += ones[h] + " Hundred "
        
        if t == 1 and o > 0:
            s += teens[o-1]
        else:
            if t > 0:
                s += tens[t]
                if o > 0:
                    s += " "
            if o > 0:
                s += ones[o]
        return s.strip()

    if amount == 0:
        return "Zero"

    int_part = int(amount)
    dec_part = int(round((amount - int_part) * 100))
    
    words = ""
    chunk_count = 0
    
    temp_int = int_part
    while temp_int > 0:
        chunk = temp_int % 1000
        if chunk > 0:
            chunk_words = _convert_segment(chunk)
            words = chunk_words + (f" {thousands[chunk_count]} " if thousands[chunk_count] else "") + words
        temp_int //= 1000
        chunk_count += 1
    
    words = words.strip()
    
    if dec_part > 0:
        words += f" and {dec_part:02d} Cents"
    else:
        words += " Only"
        
    return words

def get_date_digits(date_obj):
    """
    Return a list of digits for Day, Month, Year.
    DDMMYYYY format.
    """
    d = date_obj.strftime('%d')
    m = date_obj.strftime('%m')
    y = date_obj.strftime('%Y')
    
    # Return list of 8 strings
    return list(d + m + y)
