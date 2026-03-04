# 預設分類
income_categories = [
  { name: "薪資", transaction_type: :income },
  { name: "獎金", transaction_type: :income },
  { name: "利息", transaction_type: :income },
  { name: "其他收入", transaction_type: :income }
]

expense_categories = [
  { name: "伙食費", transaction_type: :expense },
  { name: "交通費", transaction_type: :expense },
  { name: "手機費", transaction_type: :expense },
  { name: "水電瓦斯", transaction_type: :expense },
  { name: "房租", transaction_type: :expense },
  { name: "保險", transaction_type: :expense },
  { name: "醫療", transaction_type: :expense },
  { name: "娛樂", transaction_type: :expense },
  { name: "訂閱服務", transaction_type: :expense },
  { name: "寵物", transaction_type: :expense },
  { name: "日用品", transaction_type: :expense },
  { name: "服飾", transaction_type: :expense },
  { name: "車貸", transaction_type: :expense },
  { name: "其他支出", transaction_type: :expense }
]

transfer_categories = [
  { name: "帳戶轉帳", transaction_type: :transfer }
]

(income_categories + expense_categories + transfer_categories).each do |cat|
  Category.find_or_create_by!(name: cat[:name]) do |c|
    c.transaction_type = cat[:transaction_type]
  end
end

puts "已建立 #{Category.count} 個分類"

# 範例帳戶（開發用）
if Rails.env.development?
  accounts = [
    { name: "主帳戶", account_type: :primary, initial_balance: 50000 },
    { name: "生活帳戶", account_type: :living, initial_balance: 10000 },
    { name: "車貸帳戶", account_type: :loan, initial_balance: 0 },
    { name: "證券帳戶", account_type: :investment, initial_balance: 0 }
  ]

  accounts.each do |acc|
    Account.find_or_create_by!(name: acc[:name]) do |a|
      a.account_type = acc[:account_type]
      a.initial_balance = acc[:initial_balance]
    end
  end

  puts "已建立 #{Account.count} 個帳戶"

  # 範例常用項目
  primary = Account.find_by(name: "主帳戶")
  living = Account.find_by(name: "生活帳戶")
  loan = Account.find_by(name: "車貸帳戶")
  investment = Account.find_by(name: "證券帳戶")

  salary_cat = Category.find_by(name: "薪資")
  transfer_cat = Category.find_by(name: "帳戶轉帳")
  phone_cat = Category.find_by(name: "手機費")
  subscription_cat = Category.find_by(name: "訂閱服務")
  pet_cat = Category.find_by(name: "寵物")
  car_loan_cat = Category.find_by(name: "車貸")

  quick_entries = [
    { name: "每月薪資", account: primary, category: salary_cat, amount: 45000, entry_type: :income },
    { name: "主帳戶→生活帳戶", account: primary, category: transfer_cat, amount: 15000, entry_type: :transfer, transfer_to: living },
    { name: "主帳戶→車貸帳戶", account: primary, category: transfer_cat, amount: 8000, entry_type: :transfer, transfer_to: loan },
    { name: "主帳戶→證券帳戶", account: primary, category: transfer_cat, amount: 10000, entry_type: :transfer, transfer_to: investment },
    { name: "手機月租費", account: living, category: phone_cat, amount: 499, entry_type: :expense },
    { name: "Netflix", account: living, category: subscription_cat, amount: 390, entry_type: :expense },
    { name: "Spotify", account: living, category: subscription_cat, amount: 149, entry_type: :expense },
    { name: "寵物飼料", account: living, category: pet_cat, amount: 800, entry_type: :expense },
    { name: "車貸月繳", account: loan, category: car_loan_cat, amount: 8000, entry_type: :expense }
  ]

  quick_entries.each do |qe|
    QuickEntry.find_or_create_by!(name: qe[:name]) do |q|
      q.account = qe[:account]
      q.category = qe[:category]
      q.amount = qe[:amount]
      q.entry_type = qe[:entry_type]
      q.transfer_to_account = qe[:transfer_to]
    end
  end

  puts "已建立 #{QuickEntry.count} 個常用項目"
end
