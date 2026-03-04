class DashboardController < ApplicationController
  def index
    @accounts = Account.order(:account_type, :name)
    @total_balance = @accounts.sum(&:current_balance)

    @current_month = Date.current
    @monthly_income = Entry.by_month(@current_month).income.sum(:amount)
    @monthly_expense = Entry.by_month(@current_month).expense.sum(:amount)

    @recent_entries = Entry.includes(:account, :category).recent.limit(10)
  end
end
