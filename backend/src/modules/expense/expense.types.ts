export interface CreateExpenseDTO {
  description: string;
  amount: number;
  category?: string;
  currency?: string;
  date?: Date;
  merchant?: string;
  notes?: string;
  businessId: string;
}

export interface UpdateExpenseDTO extends Partial<CreateExpenseDTO> {
  id: string;
}
