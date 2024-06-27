'use server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

const getIncomeExpense = async (): Promise<{
  income?: number;
  expense?: number;
  error?: string;
}> => {
  const { userId } = auth();

  if (!userId) {
    return {
      error: 'User not found',
    };
  }

  try {
    const transactions = await db.transaction.findMany({
      where: {
        userId,
      },
    });
    const amounts = transactions.map((transaction) => transaction.amount);
    const income = amounts.reduce((acc, amount) => {
      if (amount > 0) {
        return acc + amount;
      }
      return acc;
    }, 0);
    const expense = amounts.reduce((acc, amount) => {
      if (amount < 0) {
        return acc + amount;
      }
      return acc;
    }, 0);
    return { income, expense: Math.abs(expense) };
  } catch (err) {
    return { error: 'Database error' };
  }
};

export default getIncomeExpense;
