class EntriesController < ApplicationController
  before_action :set_entry, only: [:edit, :update, :destroy]

  def index
    @current_month = params[:month].present? ? Date.parse(params[:month]) : Date.current
    @entries = Entry.includes(:account, :category, :transfer_to_account)
                    .by_month(@current_month)
                    .recent
    @quick_entries = QuickEntry.includes(:account, :category).order(:entry_type, :name)
    expense_by_cat = Entry.by_month(@current_month).expense.joins(:category).group("categories.name").sum(:amount)
    income_by_cat  = Entry.by_month(@current_month).income.joins(:category).group("categories.name").sum(:amount)

    @expense_by_category = expense_by_cat
      .filter_map { |cat, expense| net = expense - income_by_cat.fetch(cat, 0); [cat, net] if net > 0 }
      .sort_by { |_, v| -v }
      .to_h
  end

  def new
    @entry = Entry.new(entry_date: Date.current)
    if params[:quick_entry_id].present?
      quick_entry = QuickEntry.find(params[:quick_entry_id])
      @entry.assign_attributes(quick_entry.to_entry_attributes)
    end
  end

  def create
    @entry = Entry.new(entry_params)
    if @entry.save
      redirect_to entries_path(month: @entry.entry_date.beginning_of_month), notice: "記帳成功"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @entry.update(entry_params)
      redirect_to entries_path(month: @entry.entry_date.beginning_of_month), notice: "記錄已更新"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    month = @entry.entry_date.beginning_of_month
    @entry.destroy
    redirect_to entries_path(month: month), notice: "記錄已刪除"
  end

  def create_from_quick_entry
    quick_entry = QuickEntry.find(params[:quick_entry_id])
    @entry = Entry.new(quick_entry.to_entry_attributes)

    if @entry.account_id.nil?
      redirect_to new_entry_path(quick_entry_id: quick_entry.id), alert: "此常用項目需要選擇帳戶"
      return
    end

    if @entry.save
      redirect_to entries_path, notice: "#{quick_entry.name} 已新增"
    else
      redirect_to entries_path, alert: "新增失敗：#{@entry.errors.full_messages.join(', ')}"
    end
  end

  private

  def set_entry
    @entry = Entry.find(params[:id])
  end

  def entry_params
    params.require(:entry).permit(:account_id, :category_id, :amount, :entry_type, :description, :entry_date, :transfer_to_account_id)
  end
end
