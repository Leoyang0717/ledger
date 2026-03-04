import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["canvas", "filterLabel"]
  static values = { labels: Array, amounts: Array }

  selectedCategory = null

  connect() {
    const colors = [
      "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6",
      "#ec4899", "#14b8a6", "#f97316", "#8b5cf6", "#84cc16",
      "#06b6d4", "#e11d48", "#d97706", "#059669", "#7c3aed"
    ]

    const amounts = this.amountsValue.map(v => Math.round(v))
    const total = amounts.reduce((a, b) => a + b, 0)

    const top5Indices = [...amounts]
      .map((v, i) => ({ v, i }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 5)
      .map(x => x.i)

    window.Chart.register(window.ChartDataLabels)

    new window.Chart(this.canvasTarget, {
      type: "pie",
      data: {
        labels: this.labelsValue,
        datasets: [{
          data: amounts,
          backgroundColor: colors.slice(0, amounts.length),
          borderWidth: 2,
          borderColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        onClick: (event, elements) => {
          if (elements.length === 0) return
          const category = this.labelsValue[elements[0].index]
          if (this.selectedCategory === category) {
            this.resetFilter()
          } else {
            this.filterByCategory(category)
          }
        },
        plugins: {
          legend: {
            position: "right",
            labels: {
              font: { size: 13 },
              padding: 16,
              generateLabels(chart) {
                const data = chart.data
                return data.labels.map((label, i) => ({
                  text: `${label}  $${data.datasets[0].data[i].toLocaleString()}`,
                  fillStyle: colors[i],
                  strokeStyle: colors[i],
                  index: i
                }))
              }
            }
          },
          tooltip: {
            callbacks: {
              label(ctx) {
                const value = ctx.raw
                const pct = ((value / total) * 100).toFixed(1)
                return ` $${value.toLocaleString()}  (${pct}%)`
              }
            }
          },
          datalabels: {
            color: "#ffffff",
            font: { size: 12, weight: "bold" },
            textAlign: "center",
            formatter(value, ctx) {
              return ctx.chart.data.labels[ctx.dataIndex]
            },
            display(ctx) {
              return top5Indices.includes(ctx.dataIndex)
            }
          }
        }
      }
    })
  }

  filterByCategory(category) {
    this.selectedCategory = category
    this.filterLabelTarget.textContent = `篩選中：${category}　　點此取消`
    this.filterLabelTarget.classList.remove("hidden")

    document.querySelectorAll("[data-category]").forEach(el => {
      el.hidden = el.dataset.category !== category
    })

    this.updateDateHeaders()
  }

  resetFilter() {
    this.selectedCategory = null
    this.filterLabelTarget.classList.add("hidden")

    document.querySelectorAll("[data-category], [data-date-header]").forEach(el => {
      el.hidden = false
    })
  }

  updateDateHeaders() {
    document.querySelectorAll("[data-date-header]").forEach(header => {
      let next = header.nextElementSibling
      let hasVisible = false
      while (next && !next.hasAttribute("data-date-header")) {
        if (!next.hidden) hasVisible = true
        next = next.nextElementSibling
      }
      header.hidden = !hasVisible
    })
  }
}
