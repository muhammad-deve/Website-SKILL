const invoices = [
  {
    customer: "Harbor Goods",
    invoice: "INV-1042",
    due: "31 Oct 2026",
    status: "overdue",
    amount: 18200,
  },
  {
    customer: "Morrow House",
    invoice: "INV-1043",
    due: "18 Nov 2026",
    status: "open",
    amount: 9600,
  },
  {
    customer: "Field Supply",
    invoice: "INV-1044",
    due: "24 Nov 2026",
    status: "open",
    amount: 14600,
  },
  {
    customer: "Cedar Works",
    invoice: "INV-1041",
    due: "10 Nov 2026",
    status: "paid",
    amount: 6700,
  },
];
const query = document.querySelector("#query");
const filter = document.querySelector("#status-filter");
const rows = document.querySelector("#rows");
let visible = [];
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
function render() {
  const term = query.value.trim().toLowerCase();
  visible = invoices.filter(
    (i) =>
      `${i.customer} ${i.invoice}`.toLowerCase().includes(term) &&
      (filter.value === "all" || i.status === filter.value),
  );
  rows.replaceChildren(
    ...visible.map((i) => {
      const row = document.createElement("tr");
      for (const [key, value] of Object.entries(i)) {
        const cell = document.createElement("td");
        if (key === "status") {
          const badge = document.createElement("span");
          badge.className = `status ${value}`;
          badge.textContent = value[0].toUpperCase() + value.slice(1);
          cell.append(badge);
        } else {
          cell.textContent = key === "amount" ? money.format(value) : value;
          if (key === "amount") cell.className = "amount";
        }
        row.append(cell);
      }
      return row;
    }),
  );
  document.querySelector("#result-count").textContent =
    `${visible.length} invoice${visible.length === 1 ? "" : "s"}`;
  document.querySelector("#empty").hidden = visible.length !== 0;
  document.querySelector("#export").disabled = visible.length === 0;
}
query.addEventListener("input", render);
filter.addEventListener("change", render);
document.querySelector("#clear").addEventListener("click", () => {
  query.value = "";
  filter.value = "all";
  render();
  query.focus();
});
document.querySelector("#show-overdue").addEventListener("click", () => {
  query.value = "";
  filter.value = "overdue";
  render();
  filter.focus();
  document.querySelector("#invoices").scrollIntoView({ block: "start" });
});
document.querySelector("#export").addEventListener("click", () => {
  const csv = [
    "Customer,Invoice,Due date,Status,Amount USD",
    ...visible.map((i) =>
      Object.values(i)
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "relay-demo-invoices.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector("#export-status").textContent =
    `Exported ${visible.length} demo invoices.`;
});
render();
