Rails.application.routes.draw do
  root "dashboard#index"

  resources :accounts, except: [:show]
  resources :categories, except: [:show]
  resources :quick_entries, except: [:show]
  resources :entries, except: [:show] do
    collection do
      post :create_from_quick_entry
    end
  end

  get "concert_calculator", to: "concert_calculator#index", as: :concert_calculator

  get "up" => "rails/health#show", as: :rails_health_check
end
