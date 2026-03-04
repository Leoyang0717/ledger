class Account < ApplicationRecord
  enum :account_type, { primary: 0, living: 1, loan: 2, investment: 3, other: 4, credit_card: 5 }

  has_many :entries, dependent: :destroy
  has_many :quick_entries, dependent: :nullify
  has_many :transfer_entries, class_name: "Entry", foreign_key: :transfer_to_account_id, dependent: :nullify

  validates :name, presence: true

  def current_balance
    initial_balance + income_total - expense_total - transfer_out_total + transfer_in_total
  end

  def income_total
    entries.income.sum(:amount)
  end

  def expense_total
    entries.expense.sum(:amount)
  end

  def transfer_out_total
    entries.transfer.sum(:amount)
  end

  def transfer_in_total
    Entry.where(transfer_to_account_id: id).sum(:amount)
  end
end
