(function () {
  const {
    fetchDashboardData,
    toCurrency,
    toPercent,
    toDateLabel,
    VIEW_PASSWORDS,
    VIEW_ROLE_LABELS
  } = window.AIXI;

  const COLORS = ["#ffcf60", "#ff7f66", "#ff5a3a", "#ffb36e", "#ffdca1", "#fce69e", "#f7a76d", "#f06e48"];
  const ROLE_SESSION_KEY = "aixi_dashboard_view_role";
  const VIEW_USERNAME = "ICENGLISH";

  function sum(rows, key) {
    return rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
  }

  function avg(rows, key) {
    if (!rows.length) return 0;
    return sum(rows, key) / rows.length;
  }

  function withRank(rows, sortFn) {
    const sorted = [...rows].sort(sortFn);
    return sorted.map((row, i) => ({ ...row, rank: i + 1 }));
  }

  function titleWithoutYear(title) {
    if (!title) return "爱习集团战果实时报告";
    return String(title).replace(/^2026\s*/, "");
  }

  function shortCampusName(campus) {
    return String(campus || "").replace(/校区/g, "");
  }

  function isYouthCampus(campus) {
    return String(campus || "").includes("少儿");
  }

  function buildDepartmentSummaryRows(rows, firstKey, sumKeys, avgKeys) {
    const youthRows = rows.filter((r) => isYouthCampus(r.campus));
    const collegeRows = rows.filter((r) => !isYouthCampus(r.campus));
    const groups = [
      { label: "大学部汇总", data: collegeRows },
      { label: "少儿部汇总", data: youthRows },
      { label: "集团汇总", data: rows }
    ];

    return groups.map((g) => {
      const row = { [firstKey]: g.label, rank: "-" };
      sumKeys.forEach((key) => {
        row[key] = sum(g.data, key);
      });
      avgKeys.forEach((key) => {
        row[key] = avg(g.data, key);
      });
      return row;
    });
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
          if (typeof row[col.key] === "number") {
            const rankClass = v <= 3 ? " r" + v : "";
            td.innerHTML = '<span class="rank-badge' + rankClass + '">第' + v + "名</span>";
          } else {
            td.textContent = v || "-";
          }
        } else {
          td.textContent = v;
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    let tfoot = null;
    if (Array.isArray(opt.summaryRows) && opt.summaryRows.length > 0) {
      tfoot = document.createElement("tfoot");
      opt.summaryRows.forEach((summaryRow) => {
        const tr = document.createElement("tr");
        columns.forEach((col) => {
          const td = document.createElement("td");
          let v = summaryRow[col.key];
          if (typeof col.formatter === "function") {
            v = col.formatter(v, summaryRow);
          }
          td.textContent = v == null ? "-" : v;
          tr.appendChild(td);
        });
        tfoot.appendChild(tr);
      });
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    if (tfoot) {
      table.appendChild(tfoot);
    }

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

    const rankText = { 1: "冠军", 2: "亚军", 3: "季军" };

    podium.innerHTML = "";
    top3.forEach((item) => {
      const div = document.createElement("div");
      div.className = "podium-item r" + item.rank;
      div.innerHTML =
        '<div class="podium-title">' + rankText[item.rank] + "</div>" +
        '<div class="podium-name">' + item.campus + "</div>" +
        '<div class="stage"><span class="stage-number">' + item.rank + "</span></div>";
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
    const r = Math.min(cx, cy) - 20;

    list.forEach((item, i) => {
      const angle = (item.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();

      const mid = start + angle / 2;
      const labelR = r * 0.72;
      const lx = cx + Math.cos(mid) * labelR;
      const ly = cy + Math.sin(mid) * labelR;
      const ratio = ((item.value / total) * 100).toFixed(1) + "%";
      const label = shortCampusName(item.campus) + " " + ratio;

      ctx.save();
      ctx.fillStyle = "rgba(120,0,0,0.72)";
      ctx.font = "700 16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, lx, ly);
      ctx.restore();

      start += angle;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.33, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(120,0,0,.7)";
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "700 19px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("全款人数", cx, cy - 8);
    ctx.fillText(String(total), cx, cy + 18);

    const legend = document.getElementById("pieLegend");
    legend.innerHTML = "";
    list.forEach((item, i) => {
      const div = document.createElement("div");
      div.className = "legend-item";
      div.innerHTML =
        '<span class="legend-dot" style="background:' + COLORS[i % COLORS.length] + '"></span>' +
        "<span>" + shortCampusName(item.campus) + " " + ((item.value / total) * 100).toFixed(1) + "%</span>";
      legend.appendChild(div);
    });
  }

  function applyRolePermission(role) {
    const roleBadge = document.getElementById("roleBadge");
    if (roleBadge) {
      roleBadge.textContent = "身份：" + (VIEW_ROLE_LABELS[role] || "未验证");
    }

    document.querySelectorAll("[data-scope]").forEach((sec) => {
      const scopes = String(sec.getAttribute("data-scope") || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      const canView = scopes.includes(role);
      sec.classList.toggle("hidden", !canView);
    });
  }

  function getSavedRole() {
    try {
      const raw = localStorage.getItem(ROLE_SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.role || !parsed.password || !parsed.username) return null;
      if (String(parsed.username).toUpperCase() !== VIEW_USERNAME) return null;
      if (!VIEW_PASSWORDS[parsed.role]) return null;
      if (VIEW_PASSWORDS[parsed.role] !== parsed.password) return null;
      return parsed;
    } catch (err) {
      return null;
    }
  }

  function initRoleGate() {
    const roleModal = document.getElementById("roleModal");
    const roleEntry = document.getElementById("roleEntry");
    const roleUsername = document.getElementById("roleUsername");
    const roleSelect = document.getElementById("roleSelect");
    const rolePassword = document.getElementById("rolePassword");
    const roleConfirm = document.getElementById("roleConfirm");
    const roleMsg = document.getElementById("roleMsg");

    function openModal() {
      roleModal.classList.remove("hidden");
      roleMsg.textContent = "";
      roleUsername.value = "";
      rolePassword.value = "";
    }

    function closeModal() {
      roleModal.classList.add("hidden");
    }

    roleEntry.addEventListener("click", openModal);

    roleConfirm.addEventListener("click", () => {
      const username = (roleUsername.value || "").trim().toUpperCase();
      const role = roleSelect.value;
      const password = (rolePassword.value || "").trim();
      if (!username) {
        roleMsg.textContent = "请输入用户名。";
        return;
      }
      if (username !== VIEW_USERNAME) {
        roleMsg.textContent = "用户名错误。";
        return;
      }
      if (!password) {
        roleMsg.textContent = "请输入访问密码。";
        return;
      }
      if (password !== VIEW_PASSWORDS[role]) {
        roleMsg.textContent = "密码错误。";
        return;
      }
      localStorage.setItem(ROLE_SESSION_KEY, JSON.stringify({ role: role, username: username, password: password }));
      applyRolePermission(role);
      closeModal();
    });

    const saved = getSavedRole();
    if (!saved) {
      applyRolePermission("market");
      openModal();
    } else {
      applyRolePermission(saved.role);
      closeModal();
    }
  }

  function renderWithData(data) {
    const cleanTitle = titleWithoutYear(data.meta.title || "爱习集团战果实时报告");
    document.title = "2026" + cleanTitle;
    document.querySelector("h1").textContent = cleanTitle;
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
        summaryRows: buildDepartmentSummaryRows(campusRows, "campus", ["revenue", "refund", "net"], [])
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
        summaryRows: buildDepartmentSummaryRows(marketRows, "campus", ["fullPayPeople", "fullPayOrders", "comboPeople", "enrollAmount"], ["comboRate"])
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
        summaryRows: buildDepartmentSummaryRows(coachRows, "campus", ["weekPeople", "weekOrders", "totalFullPayPeople", "totalFullPayOrders"], [])
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
        summaryRows: buildDepartmentSummaryRows(supervisorRows, "campus", ["weekPeople", "weekOrders", "totalFullPayPeople", "totalFullPayOrders"], [])
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
        summaryRows: buildDepartmentSummaryRows(teachingRows, "campus", ["openPeople", "renewalBase", "fullPayPeople", "winAtWork", "depositPeople"], ["netRenewRate"])
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
        summaryRows: buildDepartmentSummaryRows(teacherRows, "campus", ["openPeople", "retrain", "renewalBase", "fullPayPeople", "depositPeople"], ["netRenewRate"])
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
      {
        summaryRows: buildDepartmentSummaryRows(courseRows, "campus", ["winAtWork"], [])
      }
    );

    const progressRows = withRank(data.partnerProgressRows || [], (a, b) => {
      const pa = String(a.progress || "0/1").split("/");
      const pb = String(b.progress || "0/1").split("/");
      const ra = (Number(pa[0]) || 0) / ((Number(pa[1]) || 1));
      const rb = (Number(pb[0]) || 0) / ((Number(pb[1]) || 1));
      return rb - ra;
    });
    renderTable(
      "partnerProgressTable",
      [
        { key: "campusRole", label: "校区岗位" },
        { key: "partner", label: "合伙人" },
        { key: "target", label: "目标" },
        { key: "baseline", label: "保底" },
        { key: "challenge", label: "挑战" },
        { key: "progress", label: "进度" },
        { key: "rank", label: "排名" }
      ],
      progressRows,
      {
        summaryRows: []
      }
    );
  }

  async function render() {
    const result = await fetchDashboardData();
    renderWithData(result.data);
    const saved = getSavedRole();
    applyRolePermission(saved ? saved.role : "market");
  }

  initRoleGate();
  render();
  setInterval(render, 8000);
})();
