class CreateCategories < ActiveRecord::Migration[8.1]
  def change
    create_table :categories do |t|
      t.string :name, null: false
      t.integer :transaction_type, null: false, default: 0

      t.timestamps
    end
  end
end
