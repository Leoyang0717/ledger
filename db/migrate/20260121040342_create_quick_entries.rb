class CreateQuickEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :quick_entries do |t|
      t.string :name, null: false
      t.references :account, foreign_key: true
      t.references :category, null: false, foreign_key: true
      t.decimal :amount, precision: 12, scale: 2, null: false
      t.integer :entry_type, null: false, default: 0
      t.integer :transfer_to_account_id

      t.timestamps
    end

    add_foreign_key :quick_entries, :accounts, column: :transfer_to_account_id
  end
end
