(function () {
  const { CAMPUSES, fetchDashboardData, verifyCampusLogin, saveCampusPayload } = window.AIXI;

  const LOGIN_KEY = "aixi_dashboard_admin_session";

  const sectionDefs = [
    {
      key: "campusPerformance",
      title: "校区排名数据",
      columns: [
        { key: "campus", label: "校区", type: "text", readonly: true },
        { key: "principal", label: "校长", type: "text" },
        { key: "revenue", label: "创收", type: "number" },
        { key: "refund", label: "退费", type: "number" }
      ],
      singleRow: true
    },
    {
      key: "marketRows",
      title: "市场部排名数据",
      columns: [
        { key: "campus", label: "校区", type: "text", readonly: true },
        { key: "director", label: "市场总监", type: "text" },
        { key: "fullPayPeople", label: "全款人数", type: "number" },
        { key: "fullPayOrders", label: "全款单数", type: "number" },
        { key: "comboPeople", label: "连报人数", type: "number" },
        { key: "comboRate", label: "连报率(%)", type: "number" },
        { key: "enrollAmount", label: "报名金额", type: "number" }
      ]
    },
    {
      key: "coachRows",
      title: "教练排名数据",
      columns: [
        { key: "campus", label: "校区", type: "text", readonly: true },
        { key: "coach", label: "教练", type: "text" },
        { key: "weekPeople", label: "本周人数", type: "number" },
        { key: "weekOrders", label: "本周单数", type: "number" },
        { key: "totalFullPayPeople", label: "累计全款人数", type: "number" },
        { key: "totalFullPayOrders", label: "累计全款单数", type: "number" }
      ]
    },
    {
      key: "supervisorRows",
      title: "主管排名数据",
      columns: [
        { key: "campus", label: "校区", type: "text", readonly: true },
        { key: "supervisor", label: "主管", type: "text" },
        { key: "weekPeople", label: "本周人数", type: "number" },
        { key: "weekOrders", label: "本周单数", type: "number" },
        { key: "totalFullPayPeople", label: "累计全款人数", type: "number" },
        { key: "totalFullPayOrders", label: "累计全款单数", type: "number" }
      ]
    },
    {
      key: "teachingRows",
      title: "教学部排名数据",
      columns: [
        { key: "campus", label: "校区", type: "text", readonly: true },
        { key: "director", label: "教学总监", type: "text" },
        { key: "openPeople", label: "开班人数", type: "number" },
        { key: "renewalBase", label: "续课基数", type: "number" },
        { key: "fullPayPeople", label: "全款人数", type: "number" },
        { key: "winAtWork", label: "赢在职场", type: "number" },
        { key: "depositPeople", label: "定金人数", type: "number" },
        { key: "netRenewRate", label: "净续课率(%)", type: "number" }
      ]
    },
    {
      key: "teacherRows",
      title: "教师排名数据",
      columns: [
        { key: "campus", label: "校区", type: "text", readonly: true },
        { key: "teacher", label: "教师", type: "text" },
        { key: "className", label: "班级", type: "text" },
        { key: "openPeople", label: "开班人数", type: "number" },
        { key: "retrain", label: "复训", type: "number" },
        { key: "renewalBase", label: "续课基数", type: "number" },
        { key: "fullPayPeople", label: "全款人数", type: "number" },
        { key: "netRenewRate", label: "净续课率(%)", type: "number" },
        { key: "depositPeople", label: "定金人数", type: "number" }
      ]
    },
    {
      key: "teacherCourseRows",
      title: "教师续课「赢在职场」数据",
      columns: [
        { key: "campus", label: "校区", type: "text", readonly: true },
        { key: "teacher", label: "教师", type: "text" },
        { key: "winAtWork", label: "赢在职场", type: "number" }
      ]
    }
  ];

  const campusSelect = document.getElementById("campusSelect");
  const passwordInput = document.getElementById("passwordInput");
  const loginBtn = document.getElementById("loginBtn");
  const loginMsg = document.getElementById("loginMsg");
  const loginCard = document.getElementById("loginCard");
  const editorCard = document.getElementById("editorCard");
  const editorTitle = document.getElementById("editorTitle");
  const editorSections = document.getElementById("editorSections");
  const saveAllBtn = document.getElementById("saveAllBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  let activeCampus = "";
  let activePassword = "";
  let draftData = null;

  function initCampusOptions() {
    campusSelect.innerHTML = CAMPUSES.map((c) => '<option value="' + c + '">' + c + "</option>").join("");
  }

  function parseInputValue(type, value) {
    if (type === "number") {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    }
    return value;
  }

  function buildSection(sectionDef, sourceRows) {
    const wrapper = document.createElement("div");
    wrapper.className = "editor-section";

    const title = document.createElement("h3");
    title.textContent = sectionDef.title;
    wrapper.appendChild(title);

    const list = sourceRows.filter((r) => r.campus === activeCampus);
    if (sectionDef.singleRow && list.length === 0) {
      list.push({ campus: activeCampus });
    }

    const tableWrap = document.createElement("div");
    tableWrap.className = "table-wrap";
    const table = document.createElement("table");
    table.dataset.sectionKey = sectionDef.key;

    const thead = document.createElement("thead");
    const hr = document.createElement("tr");
    sectionDef.columns.forEach((col) => {
      const th = document.createElement("th");
      th.textContent = col.label;
      hr.appendChild(th);
    });
    if (!sectionDef.singleRow) {
      const op = document.createElement("th");
      op.textContent = "操作";
      hr.appendChild(op);
    }
    thead.appendChild(hr);

    const tbody = document.createElement("tbody");
    list.forEach((row) => {
      tbody.appendChild(createEditorRow(sectionDef, row));
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    wrapper.appendChild(tableWrap);

    const actions = document.createElement("div");
    actions.className = "editor-actions";
    if (!sectionDef.singleRow) {
      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.textContent = "新增一行";
      addBtn.addEventListener("click", () => {
        const emptyRow = { campus: activeCampus };
        sectionDef.columns.forEach((col) => {
          if (!Object.prototype.hasOwnProperty.call(emptyRow, col.key)) {
            emptyRow[col.key] = col.type === "number" ? 0 : "";
          }
        });
        tbody.appendChild(createEditorRow(sectionDef, emptyRow));
      });
      actions.appendChild(addBtn);
    }
    wrapper.appendChild(actions);

    return wrapper;
  }

  function createEditorRow(sectionDef, row) {
    const tr = document.createElement("tr");
    sectionDef.columns.forEach((col) => {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.className = "small-input";
      input.type = col.type === "number" ? "number" : "text";
      input.value = row[col.key] == null ? "" : row[col.key];
      input.dataset.key = col.key;
      if (col.readonly) {
        input.readOnly = true;
      }
      td.appendChild(input);
      tr.appendChild(td);
    });

    if (!sectionDef.singleRow) {
      const td = document.createElement("td");
      const rmBtn = document.createElement("button");
      rmBtn.type = "button";
      rmBtn.textContent = "删除";
      rmBtn.addEventListener("click", () => tr.remove());
      td.appendChild(rmBtn);
      tr.appendChild(td);
    }

    return tr;
  }

  function renderEditor() {
    editorSections.innerHTML = "";
    sectionDefs.forEach((def) => {
      const rows = draftData[def.key] || [];
      editorSections.appendChild(buildSection(def, rows));
    });
  }

  function collectSectionData(sectionDef) {
    const table = editorSections.querySelector('table[data-section-key="' + sectionDef.key + '"]');
    if (!table) return [];
    const rows = [];
    table.querySelectorAll("tbody tr").forEach((tr) => {
      const item = {};
      sectionDef.columns.forEach((col) => {
        const input = tr.querySelector('input[data-key="' + col.key + '"]');
        item[col.key] = parseInputValue(col.type, input ? input.value : "");
      });
      if (sectionDef.singleRow || Object.values(item).some((v) => String(v).trim() !== "")) {
        item.campus = activeCampus;
        rows.push(item);
      }
    });
    return rows;
  }

  function buildPayloadForCampus() {
    const payload = {};
    sectionDefs.forEach((def) => {
      payload[def.key] = collectSectionData(def);
    });
    return payload;
  }

  async function saveAll() {
    const payload = buildPayloadForCampus();
    saveAllBtn.disabled = true;
    saveAllBtn.textContent = "保存中...";
    try {
      const ok = await saveCampusPayload(activeCampus, activePassword, payload);
      if (!ok) {
        throw new Error("保存失败");
      }
      alert("已保存到云端，所有人页面会自动刷新。\n如无变化，请等待8秒。\n");
    } catch (err) {
      alert("保存失败：" + (err.message || err));
    } finally {
      saveAllBtn.disabled = false;
      saveAllBtn.textContent = "保存全部";
    }
  }

  async function showEditor(campus, password) {
    activeCampus = campus;
    activePassword = password;
    localStorage.setItem(LOGIN_KEY, JSON.stringify({ campus: campus, password: password }));

    const result = await fetchDashboardData();
    draftData = result.data;

    loginCard.classList.add("hidden");
    editorCard.classList.remove("hidden");
    editorTitle.textContent = campus + " 教务数据填报";
    renderEditor();
  }

  function logout() {
    activeCampus = "";
    activePassword = "";
    localStorage.removeItem(LOGIN_KEY);
    editorCard.classList.add("hidden");
    loginCard.classList.remove("hidden");
    passwordInput.value = "";
    loginMsg.textContent = "";
  }

  loginBtn.addEventListener("click", async () => {
    const campus = campusSelect.value;
    const pw = (passwordInput.value || "").trim();
    if (!campus) {
      loginMsg.textContent = "请选择校区。";
      return;
    }
    if (!pw) {
      loginMsg.textContent = "请输入密码。";
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "登录中...";
    const ok = await verifyCampusLogin(campus, pw);
    loginBtn.disabled = false;
    loginBtn.textContent = "登录";

    if (!ok) {
      loginMsg.textContent = "密码错误，请联系总部管理员。";
      return;
    }
    loginMsg.textContent = "";
    await showEditor(campus, pw);
  });

  saveAllBtn.addEventListener("click", saveAll);
  logoutBtn.addEventListener("click", logout);

  initCampusOptions();

  (async function restoreSession() {
    const raw = localStorage.getItem(LOGIN_KEY);
    if (!raw) return;
    try {
      const session = JSON.parse(raw);
      if (session && CAMPUSES.includes(session.campus) && session.password) {
        await showEditor(session.campus, session.password);
      }
    } catch (err) {
      localStorage.removeItem(LOGIN_KEY);
    }
  })();
})();
