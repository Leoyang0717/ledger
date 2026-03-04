class CreateAccounts < ActiveRecord::Migration[8.1]
  def change
    create_table :accounts do |t|
      t.string :name, null: false
      t.integer :account_type, null: false, default: 0
      t.decimal :initial_balance, precision: 12, scale: 2, default: 0

      t.timestamps
    end
  end
end
