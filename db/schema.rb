# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_01_21_040343) do
  create_table "accounts", force: :cascade do |t|
    t.integer "account_type", default: 0, null: false
    t.datetime "created_at", null: false
    t.decimal "initial_balance", precision: 12, scale: 2, default: "0.0"
    t.string "name", null: false
    t.datetime "updated_at", null: false
  end

  create_table "categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.integer "transaction_type", default: 0, null: false
    t.datetime "updated_at", null: false
  end

  create_table "entries", force: :cascade do |t|
    t.integer "account_id", null: false
    t.decimal "amount", precision: 12, scale: 2, null: false
    t.integer "category_id", null: false
    t.datetime "created_at", null: false
    t.string "description"
    t.date "entry_date", null: false
    t.integer "entry_type", default: 0, null: false
    t.integer "transfer_to_account_id"
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_entries_on_account_id"
    t.index ["category_id"], name: "index_entries_on_category_id"
    t.index ["entry_date"], name: "index_entries_on_entry_date"
  end

  create_table "quick_entries", force: :cascade do |t|
    t.integer "account_id"
    t.decimal "amount", precision: 12, scale: 2, null: false
    t.integer "category_id", null: false
    t.datetime "created_at", null: false
    t.integer "entry_type", default: 0, null: false
    t.string "name", null: false
    t.integer "transfer_to_account_id"
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_quick_entries_on_account_id"
    t.index ["category_id"], name: "index_quick_entries_on_category_id"
  end

  add_foreign_key "entries", "accounts"
  add_foreign_key "entries", "accounts", column: "transfer_to_account_id"
  add_foreign_key "entries", "categories"
  add_foreign_key "quick_entries", "accounts"
  add_foreign_key "quick_entries", "accounts", column: "transfer_to_account_id"
  add_foreign_key "quick_entries", "categories"
end
