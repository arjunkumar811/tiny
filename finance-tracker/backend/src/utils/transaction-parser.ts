interface ParsedTransaction {
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: Date;
  confidence: number;
}

export function parseTransactionText(text: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const lines = text.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const amountMatch = line.match(/[-+]?\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    const dateMatch = line.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(\d{4}[/-]\d{1,2}[/-]\d{1,2})/);
    
    if (amountMatch) {
      const amountStr = amountMatch[1].replace(/,/g, '');
      let amount = parseFloat(amountStr);
      
      const isNegative = line.includes('-') || 
                        line.toLowerCase().includes('debit') || 
                        line.toLowerCase().includes('withdrawal') ||
                        line.toLowerCase().includes('payment');
      
      const isPositive = line.includes('+') || 
                        line.toLowerCase().includes('credit') || 
                        line.toLowerCase().includes('deposit');

      let type: 'income' | 'expense' = 'expense';
      
      if (isPositive) {
        type = 'income';
      } else if (isNegative) {
        type = 'expense';
        amount = Math.abs(amount);
      } else {
        type = 'expense';
      }

      let date = new Date();
      if (dateMatch) {
        const dateStr = dateMatch[0];
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate;
        }
      }

      let description = line
        .replace(amountMatch[0], '')
        .replace(dateMatch ? dateMatch[0] : '', '')
        .trim();
      
      if (!description) {
        description = 'Transaction';
      }

      const confidence = calculateConfidence(line, amountMatch, dateMatch);

      transactions.push({
        amount,
        description,
        type,
        date,
        confidence,
      });
    }
  }

  return transactions;
}

function calculateConfidence(
  line: string,
  amountMatch: RegExpMatchArray | null,
  dateMatch: RegExpMatchArray | null
): number {
  let confidence = 0.5;

  if (amountMatch) {
    confidence += 0.3;
  }

  if (dateMatch) {
    confidence += 0.2;
  }

  const hasDescription = line.length > 10;
  if (hasDescription) {
    confidence += 0.1;
  }

  const hasTypeIndicator = 
    line.toLowerCase().includes('debit') ||
    line.toLowerCase().includes('credit') ||
    line.toLowerCase().includes('deposit') ||
    line.toLowerCase().includes('withdrawal');
  
  if (hasTypeIndicator) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1.0);
}
