import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["entryType", "transferField"]

  connect() {
    this.toggleTransfer()
  }

  toggleTransfer() {
    const isTransfer = this.entryTypeTarget.value === "transfer"
    this.transferFieldTarget.classList.toggle("hidden", !isTransfer)
  }
}
