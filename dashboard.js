(function () {
  const { getData, toCurrency, toPercent, toDateLabel } = window.AIXI;

  const COLORS = ["#ffcf60", "#ff7f66", "#ff5a3a", "#ffb36e", "#ffdca1", "#fce69e", "#f7a76d", "#f06e48"];

  function sum(rows, key) {
    return rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
  }

  function withRank(rows, sortFn) {
    const sorted = [...rows].sort(sortFn);
    return sorted.map((row, i) => ({ ...row, rank: i + 1 }));
  }

  function renderTable(containerId, columns, rows, options) {
    const opt = options || {};
    const container = document.getElementById(containerId);
    if (!container) return;

    const wrap = document.createElement("div");
    wrap.className = "table-wrap";

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const htr = document.createElement("tr");
    columns.forEach((col) => {
      const th = document.createElement("th");
      th.textContent = col.label;
      htr.appendChild(th);
    });
    thead.appendChild(htr);

    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      columns.forEach((col) => {
        const td = document.createElement("td");
        let v = row[col.key];
        if (typeof col.formatter === "function") {
          v = col.formatter(v, row);
        }
        if (col.key === "rank") {
          td.innerHTML = '<span class="rank-badge">#' + v + "</span>";
        } else {
          td.textContent = v;
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    const tfoot = document.createElement("tfoot");
    const ftr = document.createElement("tr");
    columns.forEach((col, idx) => {
      const td = document.createElement("td");
      if (idx === 0) {
        td.textContent = "汇总";
      } else if (opt.total && Object.prototype.hasOwnProperty.call(opt.total, col.key)) {
        const totalVal = opt.total[col.key];
        td.textContent = typeof col.formatter === "function" ? col.formatter(totalVal) : totalVal;
      } else {
        td.textContent = "-";
      }
      ftr.appendChild(td);
    });
    tfoot.appendChild(ftr);

    table.appendChild(thead);
    table.appendChild(tbody);
    table.appendChild(tfoot);

    wrap.appendChild(table);
    container.innerHTML = "";
    container.appendChild(wrap);
  }

  function renderPodium(rows) {
    const podium = document.getElementById("podium");
    if (!podium) return;

    const top3 = [...rows]
      .sort((a, b) => b.net - a.net)
      .slice(0, 3)
      .sort((a, b) => {
        const order = { 2: 1, 1: 2, 3: 3 };
        return order[a.rank] - order[b.rank];
      });

    podium.innerHTML = "";
    top3.forEach((item) => {
      const div = document.createElement("div");
      div.className = "podium-item r" + item.rank;
      div.innerHTML =
        '<div class="rank">第' + item.rank + '名</div>' +
        '<div class="name">' + item.campus + "</div>" +
        '<div class="value">净收 ' + toCurrency(item.net) + "</div>";
      podium.appendChild(div);
    });
  }

  function renderMarketPie(rows) {
    const byCampus = {};
    rows.forEach((row) => {
      const key = row.campus;
      byCampus[key] = (byCampus[key] || 0) + (Number(row.fullPayPeople) || 0);
    });
    const list = Object.keys(byCampus).map((campus) => ({ campus, value: byCampus[campus] }));
    const total = list.reduce((a, b) => a + b.value, 0) || 1;

    const canvas = document.getElementById("marketPie");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let start = -Math.PI / 2;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 12;

    list.forEach((item, i) => {
      const angle = (item.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      start += angle;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(120,0,0,.7)";
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "700 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("全款人数", cx, cy - 4);
    ctx.fillText(String(total), cx, cy + 18);

    const legend = document.getElementById("pieLegend");
    legend.innerHTML = "";
    list.forEach((item, i) => {
      const div = document.createElement("div");
      div.className = "legend-item";
      div.innerHTML =
        '<span class="legend-dot" style="background:' + COLORS[i % COLORS.length] + '"></span>' +
        "<span>" + item.campus + " " + ((item.value / total) * 100).toFixed(1) + "%</span>";
      legend.appendChild(div);
    });
  }

  function render() {
    const data = getData();
    document.title = data.meta.title || "2026爱习集团战果实时报告";
    document.querySelector("h1").textContent = data.meta.title || "2026爱习集团战果实时报告";
    document.querySelector(".strategy").textContent = "战略：" + (data.meta.strategy || "三年二十校");
    document.getElementById("reportDate").textContent = toDateLabel(data.meta.lastUpdated);

    const campusRows = withRank(
      data.campusPerformance.map((r) => ({ ...r, net: (Number(r.revenue) || 0) - (Number(r.refund) || 0) })),
      (a, b) => b.net - a.net
    );
    renderPodium(campusRows);
    renderTable(
      "campusTable",
      [
        { key: "campus", label: "校区" },
        { key: "principal", label: "校长" },
        { key: "revenue", label: "创收", formatter: toCurrency },
        { key: "refund", label: "退费", formatter: toCurrency },
        { key: "net", label: "净收", formatter: toCurrency },
        { key: "rank", label: "排名" }
      ],
      campusRows,
      {
        total: {
          revenue: sum(campusRows, "revenue"),
          refund: sum(campusRows, "refund"),
          net: sum(campusRows, "net")
        }
      }
    );

    const marketRows = withRank(data.marketRows, (a, b) => (Number(b.enrollAmount) || 0) - (Number(a.enrollAmount) || 0));
    renderTable(
      "marketTable",
      [
        { key: "campus", label: "校区" },
        { key: "director", label: "市场总监" },
        { key: "fullPayPeople", label: "全款人数" },
        { key: "fullPayOrders", label: "全款单数" },
        { key: "comboPeople", label: "连报人数" },
        { key: "comboRate", label: "连报率", formatter: toPercent },
        { key: "enrollAmount", label: "报名金额", formatter: toCurrency },
        { key: "rank", label: "排名" }
      ],
      marketRows,
      {
        total: {
          fullPayPeople: sum(marketRows, "fullPayPeople"),
          fullPayOrders: sum(marketRows, "fullPayOrders"),
          comboPeople: sum(marketRows, "comboPeople"),
          comboRate: sum(marketRows, "comboRate") / (marketRows.length || 1),
          enrollAmount: sum(marketRows, "enrollAmount")
        }
      }
    );
    renderMarketPie(marketRows);

    const coachRows = withRank(data.coachRows, (a, b) => (Number(b.totalFullPayPeople) || 0) - (Number(a.totalFullPayPeople) || 0));
    renderTable(
      "coachTable",
      [
        { key: "campus", label: "校区" },
        { key: "coach", label: "教练" },
        { key: "weekPeople", label: "本周人数" },
        { key: "weekOrders", label: "本周单数" },
        { key: "totalFullPayPeople", label: "累计全款人数" },
        { key: "totalFullPayOrders", label: "累计全款单数" },
        { key: "rank", label: "排名" }
      ],
      coachRows,
      {
        total: {
          weekPeople: sum(coachRows, "weekPeople"),
          weekOrders: sum(coachRows, "weekOrders"),
          totalFullPayPeople: sum(coachRows, "totalFullPayPeople"),
          totalFullPayOrders: sum(coachRows, "totalFullPayOrders")
        }
      }
    );

    const supervisorRows = withRank(data.supervisorRows, (a, b) => (Number(b.totalFullPayPeople) || 0) - (Number(a.totalFullPayPeople) || 0));
    renderTable(
      "supervisorTable",
      [
        { key: "campus", label: "校区" },
        { key: "supervisor", label: "主管" },
        { key: "weekPeople", label: "本周人数" },
        { key: "weekOrders", label: "本周单数" },
        { key: "totalFullPayPeople", label: "累计全款人数" },
        { key: "totalFullPayOrders", label: "累计全款单数" },
        { key: "rank", label: "排名" }
      ],
      supervisorRows,
      {
        total: {
          weekPeople: sum(supervisorRows, "weekPeople"),
          weekOrders: sum(supervisorRows, "weekOrders"),
          totalFullPayPeople: sum(supervisorRows, "totalFullPayPeople"),
          totalFullPayOrders: sum(supervisorRows, "totalFullPayOrders")
        }
      }
    );

    const teachingRows = withRank(data.teachingRows, (a, b) => (Number(b.netRenewRate) || 0) - (Number(a.netRenewRate) || 0));
    renderTable(
      "teachingTable",
      [
        { key: "campus", label: "校区" },
        { key: "director", label: "教学总监" },
        { key: "openPeople", label: "开班人数" },
        { key: "renewalBase", label: "续课基数" },
        { key: "fullPayPeople", label: "全款人数" },
        { key: "winAtWork", label: "赢在职场" },
        { key: "depositPeople", label: "定金人数" },
        { key: "netRenewRate", label: "净续课率", formatter: toPercent },
        { key: "rank", label: "排名" }
      ],
      teachingRows,
      {
        total: {
          openPeople: sum(teachingRows, "openPeople"),
          renewalBase: sum(teachingRows, "renewalBase"),
          fullPayPeople: sum(teachingRows, "fullPayPeople"),
          winAtWork: sum(teachingRows, "winAtWork"),
          depositPeople: sum(teachingRows, "depositPeople"),
          netRenewRate: sum(teachingRows, "netRenewRate") / (teachingRows.length || 1)
        }
      }
    );

    const teacherRows = withRank(data.teacherRows, (a, b) => (Number(b.netRenewRate) || 0) - (Number(a.netRenewRate) || 0));
    renderTable(
      "teacherTable",
      [
        { key: "campus", label: "校区" },
        { key: "teacher", label: "教师" },
        { key: "className", label: "班级" },
        { key: "openPeople", label: "开班人数" },
        { key: "retrain", label: "复训" },
        { key: "renewalBase", label: "续课基数" },
        { key: "fullPayPeople", label: "全款人数" },
        { key: "netRenewRate", label: "净续课率", formatter: toPercent },
        { key: "depositPeople", label: "定金人数" },
        { key: "rank", label: "排名" }
      ],
      teacherRows,
      {
        total: {
          openPeople: sum(teacherRows, "openPeople"),
          retrain: sum(teacherRows, "retrain"),
          renewalBase: sum(teacherRows, "renewalBase"),
          fullPayPeople: sum(teacherRows, "fullPayPeople"),
          netRenewRate: sum(teacherRows, "netRenewRate") / (teacherRows.length || 1),
          depositPeople: sum(teacherRows, "depositPeople")
        }
      }
    );

    const courseRows = withRank(data.teacherCourseRows, (a, b) => (Number(b.winAtWork) || 0) - (Number(a.winAtWork) || 0));
    renderTable(
      "teacherCourseTable",
      [
        { key: "campus", label: "校区" },
        { key: "teacher", label: "教师" },
        { key: "winAtWork", label: "赢在职场" },
        { key: "rank", label: "排名" }
      ],
      courseRows,
      { total: { winAtWork: sum(courseRows, "winAtWork") } }
    );
  }

  window.addEventListener("storage", render);
  render();
})();
