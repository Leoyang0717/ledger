class QuickEntry < ApplicationRecord
  enum :entry_type, { income: 0, expense: 1, transfer: 2 }

  belongs_to :account, optional: true
  belongs_to :category
  belongs_to :transfer_to_account, class_name: "Account", optional: true

  validates :name, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :transfer_to_account, presence: true, if: :transfer?

  def to_entry_attributes
    {
      account_id: account_id,
      category_id: category_id,
      amount: amount,
      entry_type: entry_type,
      transfer_to_account_id: transfer_to_account_id,
      description: name,
      entry_date: Date.current
    }
  end
end
