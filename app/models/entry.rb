class Entry < ApplicationRecord
  enum :entry_type, { income: 0, expense: 1, transfer: 2 }

  belongs_to :account
  belongs_to :category
  belongs_to :transfer_to_account, class_name: "Account", optional: true

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :entry_date, presence: true
  validates :transfer_to_account, presence: true, if: :transfer?

  scope :by_month, ->(date) { where(entry_date: date.beginning_of_month..date.end_of_month) }
  scope :recent, -> { order(entry_date: :desc, created_at: :desc) }
end
