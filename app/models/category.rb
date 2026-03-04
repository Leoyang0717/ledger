class Category < ApplicationRecord
  enum :transaction_type, { income: 0, expense: 1, transfer: 2 }

  has_many :entries, dependent: :restrict_with_error
  has_many :quick_entries, dependent: :restrict_with_error

  validates :name, presence: true
end
