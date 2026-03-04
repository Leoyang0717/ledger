class QuickEntriesController < ApplicationController
  before_action :set_quick_entry, only: [:edit, :update, :destroy]

  def index
    @quick_entries = QuickEntry.includes(:account, :category, :transfer_to_account).order(:entry_type, :name)
  end

  def new
    @quick_entry = QuickEntry.new
  end

  def create
    @quick_entry = QuickEntry.new(quick_entry_params)
    if @quick_entry.save
      redirect_to quick_entries_path, notice: "常用項目已建立"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @quick_entry.update(quick_entry_params)
      redirect_to quick_entries_path, notice: "常用項目已更新"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @quick_entry.destroy
    redirect_to quick_entries_path, notice: "常用項目已刪除"
  end

  private

  def set_quick_entry
    @quick_entry = QuickEntry.find(params[:id])
  end

  def quick_entry_params
    params.require(:quick_entry).permit(:name, :account_id, :category_id, :amount, :entry_type, :transfer_to_account_id)
  end
end
