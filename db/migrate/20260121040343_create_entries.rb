class CreateEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :entries do |t|
      t.references :account, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true
      t.decimal :amount, precision: 12, scale: 2, null: false
      t.integer :entry_type, null: false, default: 0
      t.string :description
      t.date :entry_date, null: false
      t.integer :transfer_to_account_id

      t.timestamps
    end

    add_index :entries, :entry_date
    add_foreign_key :entries, :accounts, column: :transfer_to_account_id
  end
end
