import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "taiwanList", "koreaList", "japanList", "signingList", "otherList",
    "grandTicket", "grandTransport", "grandAccommodation", "grandFood", "grandMisc",
    "grandConcert", "grandSigning", "grandOther", "grandTotal",
    "monthlySavings", "annualSavings", "savingsGoal", "savingsStatus",
    "actualSpent", "remainingBudget"
  ]

  rowCount = 0

  settings = {
    taiwan:  { ticket: 6000,  transport: 3000,  misc: 200  },
    korea:   { ticket: 4000,  transport: 10000, misc: 1000 },
    japan:   { ticket: 5500,  transport: 13000, misc: 1500 },
    shared:  { accommodation: 2000, food: 1000 },
    signing: { onstage: 70000, audience: 15000 }
  }

  connect() {
    this.loadState()
    this.calculate()
  }

  settingChanged(event) {
    const group = event.currentTarget.dataset.settingGroup
    const field = event.currentTarget.dataset.settingField
    const value = parseInt(event.currentTarget.value) || 0
    if (this.settings[group]) this.settings[group][field] = value
    this.calculate()
  }

  updateSettingsInputs() {
    this.element.querySelectorAll("[data-setting-group]").forEach(input => {
      const g = input.dataset.settingGroup
      const f = input.dataset.settingField
      if (this.settings[g]?.[f] !== undefined) input.value = this.settings[g][f]
    })
  }

  // ── 新增 ─────────────────────────────────────────────

  addTaiwan(event) {
    event.preventDefault()
    this.rowCount++
    this.taiwanListTarget.insertAdjacentHTML("beforeend", this.buildTaiwanRow(this.rowCount, 1))
    this.calculate()
  }

  addKorea(event) {
    event.preventDefault()
    this.rowCount++
    this.koreaListTarget.insertAdjacentHTML("beforeend", this.buildOverseasRow(this.rowCount, "korea", 1, 1))
    this.calculate()
  }

  addJapan(event) {
    event.preventDefault()
    this.rowCount++
    this.japanListTarget.insertAdjacentHTML("beforeend", this.buildOverseasRow(this.rowCount, "japan", 1, 1))
    this.calculate()
  }

  addSigningOnstage(event) {
    event.preventDefault()
    this.rowCount++
    this.signingListTarget.insertAdjacentHTML("beforeend", this.buildSigningRow(this.rowCount, "onstage", 1))
    this.calculate()
  }

  addSigningAudience(event) {
    event.preventDefault()
    this.rowCount++
    this.signingListTarget.insertAdjacentHTML("beforeend", this.buildSigningRow(this.rowCount, "audience", 1))
    this.calculate()
  }

  addOther(event) {
    event.preventDefault()
    this.rowCount++
    this.otherListTarget.insertAdjacentHTML("beforeend", this.buildOtherRow(this.rowCount))
    this.calculate()
  }

  // ── 刪除 / 暫停 / 變更 ───────────────────────────────

  removeRow(event) {
    event.preventDefault()
    event.currentTarget.closest("[data-row-id]").remove()
    this.calculate()
  }

  toggleRow(event) {
    event.preventDefault()
    const row = event.currentTarget.closest("[data-row-id]")
    const nowDisabled = row.dataset.disabled !== "true"
    row.dataset.disabled = String(nowDisabled)
    row.classList.toggle("opacity-40", nowDisabled)
    event.currentTarget.innerHTML = nowDisabled ? this.iconPlay() : this.iconPause()
    event.currentTarget.title = nowDisabled ? "恢復計算" : "暫時排除"
    this.calculate()
  }

  inputChanged() {
    this.calculate()
  }

  // ── 計算 ─────────────────────────────────────────────

  calculate() {
    const c = { ticket: 0, transport: 0, accommodation: 0, food: 0, misc: 0 }
    let signingTotal = 0
    let actualTotal = 0

    this.taiwanListTarget.querySelectorAll("[data-row-id]").forEach(row => {
      if (row.dataset.disabled === "true") { row.querySelector("[data-cost='total']").textContent = "—"; return }
      const shows = parseInt(row.querySelector("[data-field='shows']").value) || 1
      const costs = this.computeCosts("taiwan", shows, 0)
      row.querySelector("[data-cost='total']").textContent = this.format(costs.total)
      c.ticket += costs.ticket
      c.transport += costs.transport
      c.misc += costs.misc
      actualTotal += parseInt(row.querySelector("[data-field='actual']").value) || 0
    })

    this.koreaListTarget.querySelectorAll("[data-row-id]").forEach(row => {
      if (row.dataset.disabled === "true") { row.querySelector("[data-cost='total']").textContent = "—"; return }
      const shows = parseInt(row.querySelector("[data-field='shows']").value) || 1
      const nights = parseInt(row.querySelector("[data-field='nights']").value) || 1
      const costs = this.computeCosts("korea", shows, nights)
      row.querySelector("[data-cost='total']").textContent = this.format(costs.total)
      c.ticket += costs.ticket
      c.transport += costs.transport
      c.accommodation += costs.accommodation
      c.food += costs.food
      c.misc += costs.misc
      actualTotal += parseInt(row.querySelector("[data-field='actual']").value) || 0
    })

    this.japanListTarget.querySelectorAll("[data-row-id]").forEach(row => {
      if (row.dataset.disabled === "true") { row.querySelector("[data-cost='total']").textContent = "—"; return }
      const shows = parseInt(row.querySelector("[data-field='shows']").value) || 1
      const nights = parseInt(row.querySelector("[data-field='nights']").value) || 1
      const costs = this.computeCosts("japan", shows, nights)
      row.querySelector("[data-cost='total']").textContent = this.format(costs.total)
      c.ticket += costs.ticket
      c.transport += costs.transport
      c.accommodation += costs.accommodation
      c.food += costs.food
      c.misc += costs.misc
      actualTotal += parseInt(row.querySelector("[data-field='actual']").value) || 0
    })

    this.signingListTarget.querySelectorAll("[data-row-id]").forEach(row => {
      if (row.dataset.disabled === "true") { row.querySelector("[data-cost='total']").textContent = "—"; return }
      const type = row.dataset.rowType
      const count = parseInt(row.querySelector("[data-field='count']").value) || 1
      const cost = (type === "onstage" ? this.settings.signing.onstage : this.settings.signing.audience) * count
      row.querySelector("[data-cost='total']").textContent = this.format(cost)
      signingTotal += cost
      actualTotal += parseInt(row.querySelector("[data-field='actual']").value) || 0
    })

    let otherTotal = 0
    this.otherListTarget.querySelectorAll("[data-row-id]").forEach(row => {
      if (row.dataset.disabled === "true") { row.querySelector("[data-cost='total']").textContent = "—"; return }
      const amount = parseInt(row.querySelector("[data-field='amount']").value) || 0
      row.querySelector("[data-cost='total']").textContent = this.format(amount)
      otherTotal += amount
      actualTotal += parseInt(row.querySelector("[data-field='actual']").value) || 0
    })

    const concertTotal = c.ticket + c.transport + c.accommodation + c.food + c.misc
    this.grandTicketTarget.textContent = this.format(c.ticket)
    this.grandTransportTarget.textContent = this.format(c.transport)
    this.grandAccommodationTarget.textContent = this.format(c.accommodation)
    this.grandFoodTarget.textContent = this.format(c.food)
    this.grandMiscTarget.textContent = this.format(c.misc)
    this.grandConcertTarget.textContent = this.format(concertTotal)
    this.grandSigningTarget.textContent = this.format(signingTotal)
    this.grandOtherTarget.textContent = this.format(otherTotal)
    const grandTotal = concertTotal + signingTotal + otherTotal
    this.grandTotalTarget.textContent = this.format(grandTotal)
    this.updateSavingsDisplay(grandTotal, actualTotal)
    this.saveState()
  }

  updateSavingsDisplay(grandTotal, actualTotal = 0) {
    const monthly = parseInt(this.monthlySavingsTarget.value) || 0
    const annual = monthly * 12
    this.annualSavingsTarget.textContent = this.format(annual)
    this.savingsGoalTarget.textContent = this.format(grandTotal)
    this.actualSpentTarget.textContent = this.format(actualTotal)
    this.remainingBudgetTarget.textContent = this.format(annual - actualTotal)

    if (monthly === 0 || grandTotal === 0) {
      this.savingsStatusTarget.innerHTML = `
        <div class="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
          <p class="text-xs text-gray-400">輸入每月存款金額以試算</p>
        </div>`
      return
    }

    const diff = annual - grandTotal
    const requiredMonthly = Math.ceil(grandTotal / 12)

    if (diff >= 0) {
      this.savingsStatusTarget.innerHTML = `
        <div class="rounded-lg bg-green-50 border border-green-200 px-4 py-3 space-y-1.5">
          <div class="flex items-center gap-1.5">
            <span class="text-green-500 font-bold text-base">✓</span>
            <span class="text-sm font-semibold text-green-600">已足夠達標！</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">超出預算</span>
            <span class="font-semibold text-green-600">${this.format(diff)}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">每月只需存</span>
            <span class="font-medium text-gray-700">${this.format(requiredMonthly)}</span>
          </div>
        </div>`
    } else {
      this.savingsStatusTarget.innerHTML = `
        <div class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 space-y-1.5">
          <div class="flex items-center gap-1.5">
            <span class="text-red-400 font-bold text-base">✗</span>
            <span class="text-sm font-semibold text-red-500">尚未達標</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">一年後仍缺</span>
            <span class="font-semibold text-red-500">${this.format(-diff)}</span>
          </div>
          <div class="flex justify-between text-sm pt-1.5 border-t border-red-100">
            <span class="text-gray-500">達標每月需存</span>
            <span class="font-semibold text-gray-800">${this.format(requiredMonthly)}</span>
          </div>
        </div>`
    }
  }

  // ── 費用公式 ──────────────────────────────────────────

  computeCosts(location, shows, nights) {
    const s = this.settings
    let ticket, transport, accommodation, food, misc

    if (location === "taiwan") {
      ticket = s.taiwan.ticket * shows
      transport = s.taiwan.transport
      accommodation = 0; food = 0; misc = s.taiwan.misc
    } else if (location === "korea") {
      ticket = s.korea.ticket * shows
      transport = s.korea.transport
      accommodation = s.shared.accommodation * nights
      food = s.shared.food * (nights + 1)
      misc = s.korea.misc
    } else if (location === "japan") {
      ticket = s.japan.ticket * shows
      transport = s.japan.transport
      accommodation = s.shared.accommodation * nights
      food = s.shared.food * (nights + 1)
      misc = s.japan.misc
    }

    return { ticket, transport, accommodation, food, misc, total: ticket + transport + accommodation + food + misc }
  }

  format(amount) {
    return `NT$ ${amount.toLocaleString("zh-TW")}`
  }

  // ── localStorage ──────────────────────────────────────

  saveState() {
    const state = {
      taiwan: [],
      korea: [],
      japan: [],
      signing: [],
      other: [],
      monthlySavings: parseInt(this.monthlySavingsTarget.value) || 0
    }

    this.taiwanListTarget.querySelectorAll("[data-row-id]").forEach(row => {
      state.taiwan.push({
        shows: parseInt(row.querySelector("[data-field='shows']").value) || 1,
        note: row.querySelector("[data-field='note']").value || "",
        actual: parseInt(row.querySelector("[data-field='actual']").value) || 0,
        disabled: row.dataset.disabled === "true"
      })
    })
    this.koreaListTarget.querySelectorAll("[data-row-id]").forEach(row => {
      state.korea.push({
        shows: parseInt(row.querySelector("[data-field='shows']").value) || 1,
        nights: parseInt(row.querySelector("[data-field='nights']").value) || 1,
        note: row.querySelector("[data-field='note']").value || "",
        actual: parseInt(row.querySelector("[data-field='actual']").value) || 0,
        disabled: row.dataset.disabled === "true"
      })
    })
    this.japanListTarget.querySelectorAll("[data-row-id]").forEach(row => {
      state.japan.push({
        shows: parseInt(row.querySelector("[data-field='shows']").value) || 1,
        nights: parseInt(row.querySelector("[data-field='nights']").value) || 1,
        note: row.querySelector("[data-field='note']").value || "",
        actual: parseInt(row.querySelector("[data-field='actual']").value) || 0,
        disabled: row.dataset.disabled === "true"
      })
    })
    this.signingListTarget.querySelectorAll("[data-row-id]").forEach(row => {
      state.signing.push({
        type: row.dataset.rowType,
        count: parseInt(row.querySelector("[data-field='count']").value) || 1,
        actual: parseInt(row.querySelector("[data-field='actual']").value) || 0,
        disabled: row.dataset.disabled === "true"
      })
    })
    this.otherListTarget.querySelectorAll("[data-row-id]").forEach(row => {
      state.other.push({
        label: row.querySelector("[data-field='label']").value || "",
        amount: parseInt(row.querySelector("[data-field='amount']").value) || 0,
        actual: parseInt(row.querySelector("[data-field='actual']").value) || 0,
        disabled: row.dataset.disabled === "true"
      })
    })

    state.settings = this.settings
    localStorage.setItem("concert_calculator_state", JSON.stringify(state))
  }

  loadState() {
    try {
      const saved = localStorage.getItem("concert_calculator_state")
      if (!saved) return

      const state = JSON.parse(saved)

      state.taiwan?.forEach(item => {
        this.rowCount++
        this.taiwanListTarget.insertAdjacentHTML("beforeend", this.buildTaiwanRow(this.rowCount, item.shows, item.disabled, item.actual || 0, item.note || ""))
      })
      state.korea?.forEach(item => {
        this.rowCount++
        this.koreaListTarget.insertAdjacentHTML("beforeend", this.buildOverseasRow(this.rowCount, "korea", item.shows, item.nights, item.disabled, item.actual || 0, item.note || ""))
      })
      state.japan?.forEach(item => {
        this.rowCount++
        this.japanListTarget.insertAdjacentHTML("beforeend", this.buildOverseasRow(this.rowCount, "japan", item.shows, item.nights, item.disabled, item.actual || 0, item.note || ""))
      })
      state.signing?.forEach(item => {
        this.rowCount++
        this.signingListTarget.insertAdjacentHTML("beforeend", this.buildSigningRow(this.rowCount, item.type, item.count, item.disabled, item.actual || 0))
      })
      state.other?.forEach(item => {
        this.rowCount++
        this.otherListTarget.insertAdjacentHTML("beforeend", this.buildOtherRow(this.rowCount, item.label, item.amount, item.disabled, item.actual || 0))
      })

      if (state.monthlySavings) {
        this.monthlySavingsTarget.value = state.monthlySavings
      }
      if (state.settings) {
        Object.keys(state.settings).forEach(group => {
          if (this.settings[group]) Object.assign(this.settings[group], state.settings[group])
        })
        this.updateSettingsInputs()
      }
    } catch {
      localStorage.removeItem("concert_calculator_state")
    }
  }

  // ── Icons ─────────────────────────────────────────────

  iconPause() {
    return `<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`
  }

  iconPlay() {
    return `<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`
  }

  // ── HTML Builders ─────────────────────────────────────

  buildTaiwanRow(id, shows, disabled = false, actual = 0, note = "") {
    const showsOptions = [1, 2, 3, 4]
      .map(n => `<option value="${n}" ${n == shows ? "selected" : ""}>${n} 場</option>`)
      .join("")

    return `
      <div data-row-id="${id}" data-disabled="${disabled}" class="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 transition-opacity ${disabled ? 'opacity-40' : ''}">
        <select
          data-field="shows"
          data-action="change->concert-calculator#inputChanged"
          class="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shrink-0"
        >${showsOptions}</select>
        <input type="text" data-field="note" placeholder="備注" value="${note}" data-action="input->concert-calculator#inputChanged" class="flex-1 min-w-0 text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
        <span data-cost="total" class="text-sm font-semibold text-gray-700 tabular-nums shrink-0"></span>
        <input type="number" data-field="actual" placeholder="實際" value="${actual || ''}" min="0" step="100" data-action="input->concert-calculator#inputChanged" class="w-30 text-sm bg-white border border-emerald-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-right tabular-nums shrink-0" />
        <button
          data-action="click->concert-calculator#toggleRow"
          title="${disabled ? '恢復計算' : '暫時排除'}"
          class="text-gray-300 hover:text-amber-400 transition-colors shrink-0"
        >${disabled ? this.iconPlay() : this.iconPause()}</button>
        <button
          data-action="click->concert-calculator#removeRow"
          class="text-gray-300 hover:text-red-400 text-xl leading-none transition-colors"
        >&times;</button>
      </div>
    `
  }

  buildOverseasRow(id, location, shows, nights, disabled = false, actual = 0, note = "") {
    const showsOptions = [1, 2, 3, 4]
      .map(n => `<option value="${n}" ${n == shows ? "selected" : ""}>${n} 場</option>`)
      .join("")

    const nightsOptions = [1, 2, 3, 4, 5, 6, 7]
      .map(n => `<option value="${n}" ${n == nights ? "selected" : ""}>${n + 1}天${n}夜</option>`)
      .join("")

    const ring = location === "korea" ? "focus:ring-rose-400" : "focus:ring-fuchsia-400"

    return `
      <div data-row-id="${id}" data-disabled="${disabled}" class="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 transition-opacity ${disabled ? 'opacity-40' : ''}">
        <select
          data-field="nights"
          data-action="change->concert-calculator#inputChanged"
          class="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 ${ring} focus:border-transparent shrink-0"
        >${nightsOptions}</select>
        <select
          data-field="shows"
          data-action="change->concert-calculator#inputChanged"
          class="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 ${ring} focus:border-transparent shrink-0"
        >${showsOptions}</select>
        <input type="text" data-field="note" placeholder="備注" value="${note}" data-action="input->concert-calculator#inputChanged" class="flex-1 min-w-0 text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 ${ring} focus:border-transparent" />
        <span data-cost="total" class="text-sm font-semibold text-gray-700 tabular-nums shrink-0"></span>
        <input type="number" data-field="actual" placeholder="實際" value="${actual || ''}" min="0" step="100" data-action="input->concert-calculator#inputChanged" class="w-30 text-sm bg-white border border-emerald-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-right tabular-nums shrink-0" />
        <button
          data-action="click->concert-calculator#toggleRow"
          title="${disabled ? '恢復計算' : '暫時排除'}"
          class="text-gray-300 hover:text-amber-400 transition-colors shrink-0"
        >${disabled ? this.iconPlay() : this.iconPause()}</button>
        <button
          data-action="click->concert-calculator#removeRow"
          class="text-gray-300 hover:text-red-400 text-xl leading-none transition-colors"
        >&times;</button>
      </div>
    `
  }

  buildOtherRow(id, label = "", amount = "", disabled = false, actual = 0) {
    return `
      <div data-row-id="${id}" data-disabled="${disabled}" class="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 transition-opacity ${disabled ? 'opacity-40' : ''}">
        <input
          type="text"
          data-field="label"
          placeholder="項目名稱（例：買電視）"
          value="${label}"
          data-action="input->concert-calculator#inputChanged"
          class="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent min-w-0"
        />
        <input
          type="number"
          data-field="amount"
          placeholder="預計金額"
          value="${amount}"
          min="0"
          step="1000"
          data-action="input->concert-calculator#inputChanged"
          class="w-28 text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-right"
        />
        <span data-cost="total" class="text-sm font-semibold text-gray-700 tabular-nums w-24 text-right shrink-0">NT$ 0</span>
        <input type="number" data-field="actual" placeholder="實際" value="${actual || ''}" min="0" step="100" data-action="input->concert-calculator#inputChanged" class="w-30 text-sm bg-white border border-emerald-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-right tabular-nums shrink-0" />
        <button
          data-action="click->concert-calculator#toggleRow"
          title="${disabled ? '恢復計算' : '暫時排除'}"
          class="text-gray-300 hover:text-amber-400 transition-colors shrink-0"
        >${disabled ? this.iconPlay() : this.iconPause()}</button>
        <button
          data-action="click->concert-calculator#removeRow"
          class="text-gray-300 hover:text-red-400 text-xl leading-none transition-colors"
        >&times;</button>
      </div>
    `
  }

  buildSigningRow(id, type, count, disabled = false, actual = 0) {
    const countOptions = Array.from({ length: 10 }, (_, i) => i + 1)
      .map(n => `<option value="${n}" ${n == count ? "selected" : ""}>${n} 次</option>`)
      .join("")

    const badge = type === "onstage"
      ? `<span class="text-xs font-medium bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full whitespace-nowrap">上台</span>`
      : `<span class="text-xs font-medium bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full whitespace-nowrap">觀禮</span>`

    return `
      <div data-row-id="${id}" data-row-type="${type}" data-disabled="${disabled}" class="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 transition-opacity ${disabled ? 'opacity-40' : ''}">
        ${badge}
        <select
          data-field="count"
          data-action="change->concert-calculator#inputChanged"
          class="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
        >${countOptions}</select>
        <span class="flex-1"></span>
        <span data-cost="total" class="text-sm font-semibold text-gray-700 tabular-nums"></span>
        <input type="number" data-field="actual" placeholder="實際" value="${actual || ''}" min="0" step="100" data-action="input->concert-calculator#inputChanged" class="w-30 text-sm bg-white border border-emerald-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-right tabular-nums shrink-0" />
        <button
          data-action="click->concert-calculator#toggleRow"
          title="${disabled ? '恢復計算' : '暫時排除'}"
          class="text-gray-300 hover:text-amber-400 transition-colors shrink-0"
        >${disabled ? this.iconPlay() : this.iconPause()}</button>
        <button
          data-action="click->concert-calculator#removeRow"
          class="text-gray-300 hover:text-red-400 text-xl leading-none transition-colors"
        >&times;</button>
      </div>
    `
  }
}
