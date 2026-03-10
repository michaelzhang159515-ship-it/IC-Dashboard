(function () {
  const STORAGE_KEY = "aixi_dashboard_data_v1";
  const CAMPUSES = [
    "赣州校区",
    "南昌校区",
    "青镇湖校区",
    "东北校区",
    "成都校区",
    "北京校区",
    "少儿九江校区",
    "少儿南昌校区"
  ];

  const SUPABASE_URL = "https://vmlgntrxmngjnfdzdtfu.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_0xR40-tUPmIoGKd5RdtQ9Q_cwtcCrFn";

  const DEFAULT_PASSWORDS = {
    "赣州校区": "gz2026",
    "南昌校区": "nc2026",
    "青镇湖校区": "qzh2026",
    "东北校区": "db2026",
    "成都校区": "cd2026",
    "北京校区": "bj2026",
    "少儿九江校区": "sejj2026",
    "少儿南昌校区": "senc2026"
  };

  const VIEW_ROLE_LABELS = {
    partner: "合伙人",
    coach: "市场部教练"
  };

  const VIEW_PASSWORDS = {
    partner: "partner2026",
    coach: "coach2026"
  };

  const BASE_DATA = {
    meta: {
      lastUpdated: "2026-03-10",
      strategy: "三年二十校",
      title: "2026爱习集团战果实时报告"
    },
    campusPerformance: [
      { campus: "赣州校区", principal: "李校", revenue: 1860000, refund: 136000 },
      { campus: "南昌校区", principal: "王校", revenue: 2120000, refund: 192000 },
      { campus: "青镇湖校区", principal: "周校", revenue: 1580000, refund: 126000 },
      { campus: "东北校区", principal: "赵校", revenue: 1490000, refund: 98000 },
      { campus: "成都校区", principal: "陈校", revenue: 2050000, refund: 143000 },
      { campus: "北京校区", principal: "孙校", revenue: 2280000, refund: 180000 },
      { campus: "少儿九江校区", principal: "刘校", revenue: 930000, refund: 66000 },
      { campus: "少儿南昌校区", principal: "彭校", revenue: 1020000, refund: 72000 }
    ],
    marketRows: [
      { campus: "赣州校区", director: "韩婷", fullPayPeople: 68, fullPayOrders: 74, comboPeople: 22, comboRate: 32.4, enrollAmount: 892000 },
      { campus: "南昌校区", director: "蒋峰", fullPayPeople: 83, fullPayOrders: 91, comboPeople: 31, comboRate: 37.3, enrollAmount: 1084000 },
      { campus: "青镇湖校区", director: "朱羽", fullPayPeople: 57, fullPayOrders: 62, comboPeople: 15, comboRate: 26.3, enrollAmount: 726000 },
      { campus: "东北校区", director: "杨涛", fullPayPeople: 54, fullPayOrders: 59, comboPeople: 18, comboRate: 33.3, enrollAmount: 684000 },
      { campus: "成都校区", director: "黄宁", fullPayPeople: 79, fullPayOrders: 88, comboPeople: 30, comboRate: 38.0, enrollAmount: 1031000 },
      { campus: "北京校区", director: "罗成", fullPayPeople: 86, fullPayOrders: 95, comboPeople: 35, comboRate: 40.7, enrollAmount: 1163000 },
      { campus: "少儿九江校区", director: "杜欣", fullPayPeople: 40, fullPayOrders: 45, comboPeople: 12, comboRate: 30.0, enrollAmount: 503000 },
      { campus: "少儿南昌校区", director: "吴燕", fullPayPeople: 44, fullPayOrders: 49, comboPeople: 14, comboRate: 31.8, enrollAmount: 551000 }
    ],
    coachRows: [
      { campus: "赣州校区", coach: "董佳", weekPeople: 19, weekOrders: 21, totalFullPayPeople: 201, totalFullPayOrders: 223 },
      { campus: "南昌校区", coach: "曹颖", weekPeople: 24, weekOrders: 27, totalFullPayPeople: 246, totalFullPayOrders: 280 },
      { campus: "青镇湖校区", coach: "贺亮", weekPeople: 16, weekOrders: 18, totalFullPayPeople: 174, totalFullPayOrders: 191 },
      { campus: "东北校区", coach: "熊磊", weekPeople: 15, weekOrders: 16, totalFullPayPeople: 163, totalFullPayOrders: 178 },
      { campus: "成都校区", coach: "梁慧", weekPeople: 22, weekOrders: 24, totalFullPayPeople: 232, totalFullPayOrders: 258 },
      { campus: "北京校区", coach: "郭凡", weekPeople: 26, weekOrders: 30, totalFullPayPeople: 259, totalFullPayOrders: 295 },
      { campus: "少儿九江校区", coach: "石敏", weekPeople: 10, weekOrders: 12, totalFullPayPeople: 117, totalFullPayOrders: 131 },
      { campus: "少儿南昌校区", coach: "简悦", weekPeople: 11, weekOrders: 13, totalFullPayPeople: 128, totalFullPayOrders: 142 }
    ],
    supervisorRows: [
      { campus: "赣州校区", supervisor: "高琳", weekPeople: 14, weekOrders: 16, totalFullPayPeople: 156, totalFullPayOrders: 177 },
      { campus: "南昌校区", supervisor: "闵昕", weekPeople: 18, weekOrders: 21, totalFullPayPeople: 191, totalFullPayOrders: 219 },
      { campus: "青镇湖校区", supervisor: "岳澄", weekPeople: 12, weekOrders: 14, totalFullPayPeople: 136, totalFullPayOrders: 154 },
      { campus: "东北校区", supervisor: "雷航", weekPeople: 11, weekOrders: 12, totalFullPayPeople: 127, totalFullPayOrders: 143 },
      { campus: "成都校区", supervisor: "田雨", weekPeople: 16, weekOrders: 18, totalFullPayPeople: 181, totalFullPayOrders: 208 },
      { campus: "北京校区", supervisor: "苏然", weekPeople: 19, weekOrders: 22, totalFullPayPeople: 204, totalFullPayOrders: 238 },
      { campus: "少儿九江校区", supervisor: "谷一", weekPeople: 9, weekOrders: 10, totalFullPayPeople: 98, totalFullPayOrders: 111 },
      { campus: "少儿南昌校区", supervisor: "廖楠", weekPeople: 10, weekOrders: 11, totalFullPayPeople: 106, totalFullPayOrders: 120 }
    ],
    teachingRows: [
      { campus: "赣州校区", director: "郑薇", openPeople: 53, renewalBase: 120, fullPayPeople: 76, winAtWork: 24, depositPeople: 19, netRenewRate: 63.3 },
      { campus: "南昌校区", director: "葛平", openPeople: 61, renewalBase: 136, fullPayPeople: 92, winAtWork: 31, depositPeople: 23, netRenewRate: 67.6 },
      { campus: "青镇湖校区", director: "沈岩", openPeople: 45, renewalBase: 105, fullPayPeople: 65, winAtWork: 19, depositPeople: 14, netRenewRate: 61.9 },
      { campus: "东北校区", director: "万朵", openPeople: 43, renewalBase: 100, fullPayPeople: 62, winAtWork: 18, depositPeople: 13, netRenewRate: 62.0 },
      { campus: "成都校区", director: "秦丽", openPeople: 59, renewalBase: 130, fullPayPeople: 86, winAtWork: 30, depositPeople: 21, netRenewRate: 66.2 },
      { campus: "北京校区", director: "邓超", openPeople: 65, renewalBase: 143, fullPayPeople: 95, winAtWork: 33, depositPeople: 25, netRenewRate: 66.4 },
      { campus: "少儿九江校区", director: "房琪", openPeople: 31, renewalBase: 71, fullPayPeople: 43, winAtWork: 13, depositPeople: 10, netRenewRate: 60.6 },
      { campus: "少儿南昌校区", director: "孟颖", openPeople: 35, renewalBase: 78, fullPayPeople: 46, winAtWork: 15, depositPeople: 11, netRenewRate: 59.0 }
    ],
    teacherRows: [
      { campus: "赣州校区", teacher: "何老师", className: "GZ-就业冲刺A", openPeople: 22, retrain: 11, renewalBase: 39, fullPayPeople: 25, netRenewRate: 64.1, depositPeople: 6 },
      { campus: "赣州校区", teacher: "马老师", className: "GZ-实战提升B", openPeople: 19, retrain: 8, renewalBase: 33, fullPayPeople: 20, netRenewRate: 60.6, depositPeople: 5 },
      { campus: "南昌校区", teacher: "蒋老师", className: "NC-精英班A", openPeople: 24, retrain: 12, renewalBase: 42, fullPayPeople: 28, netRenewRate: 66.7, depositPeople: 7 },
      { campus: "南昌校区", teacher: "游老师", className: "NC-冲刺班C", openPeople: 21, retrain: 10, renewalBase: 36, fullPayPeople: 23, netRenewRate: 63.9, depositPeople: 6 },
      { campus: "青镇湖校区", teacher: "崔老师", className: "QZH-提分班", openPeople: 18, retrain: 8, renewalBase: 31, fullPayPeople: 18, netRenewRate: 58.1, depositPeople: 5 },
      { campus: "东北校区", teacher: "尤老师", className: "DB-求职班", openPeople: 17, retrain: 7, renewalBase: 30, fullPayPeople: 17, netRenewRate: 56.7, depositPeople: 4 },
      { campus: "成都校区", teacher: "鲁老师", className: "CD-就业班A", openPeople: 23, retrain: 11, renewalBase: 40, fullPayPeople: 26, netRenewRate: 65.0, depositPeople: 7 },
      { campus: "北京校区", teacher: "安老师", className: "BJ-名师班A", openPeople: 25, retrain: 13, renewalBase: 44, fullPayPeople: 30, netRenewRate: 68.2, depositPeople: 8 },
      { campus: "少儿九江校区", teacher: "贝老师", className: "JJ-少儿提能", openPeople: 13, retrain: 6, renewalBase: 23, fullPayPeople: 13, netRenewRate: 56.5, depositPeople: 3 },
      { campus: "少儿南昌校区", teacher: "丁老师", className: "SENC-少儿进阶", openPeople: 14, retrain: 6, renewalBase: 24, fullPayPeople: 14, netRenewRate: 58.3, depositPeople: 3 }
    ],
    teacherCourseRows: [
      { campus: "赣州校区", teacher: "何老师", winAtWork: 9 },
      { campus: "赣州校区", teacher: "马老师", winAtWork: 7 },
      { campus: "南昌校区", teacher: "蒋老师", winAtWork: 11 },
      { campus: "南昌校区", teacher: "游老师", winAtWork: 9 },
      { campus: "青镇湖校区", teacher: "崔老师", winAtWork: 6 },
      { campus: "东北校区", teacher: "尤老师", winAtWork: 6 },
      { campus: "成都校区", teacher: "鲁老师", winAtWork: 10 },
      { campus: "北京校区", teacher: "安老师", winAtWork: 12 },
      { campus: "少儿九江校区", teacher: "贝老师", winAtWork: 4 },
      { campus: "少儿南昌校区", teacher: "丁老师", winAtWork: 5 }
    ]
  };

  function deepClone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function migrateData(raw) {
    const data = deepClone(BASE_DATA);
    if (!raw || typeof raw !== "object") {
      return data;
    }
    Object.keys(data).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(raw, key)) {
        data[key] = raw[key];
      }
    });
    if (!data.meta) {
      data.meta = deepClone(BASE_DATA.meta);
    }
    if (!data.meta.lastUpdated) {
      data.meta.lastUpdated = BASE_DATA.meta.lastUpdated;
    }
    return data;
  }

  function getLocalData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = deepClone(BASE_DATA);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return migrateData(JSON.parse(raw));
    } catch (err) {
      return deepClone(BASE_DATA);
    }
  }

  function saveLocalData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async function supabaseRpc(functionName, payload) {
    const res = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + functionName, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY
      },
      body: JSON.stringify(payload || {})
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error("RPC " + functionName + " failed: " + text);
    }

    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (err) {
      return text;
    }
  }

  async function fetchDashboardData() {
    try {
      const data = await supabaseRpc("get_dashboard_data", {});
      if (!data || typeof data !== "object") {
        throw new Error("empty data");
      }
      const migrated = migrateData(data);
      saveLocalData(migrated);
      return { data: migrated, source: "supabase" };
    } catch (err) {
      const local = getLocalData();
      return { data: local, source: "local", error: String(err.message || err) };
    }
  }

  async function verifyCampusLogin(campus, password) {
    try {
      const res = await supabaseRpc("verify_campus_login", {
        p_campus: campus,
        p_password: password
      });
      return !!res;
    } catch (err) {
      return password === DEFAULT_PASSWORDS[campus];
    }
  }

  async function saveCampusPayload(campus, password, payload) {
    const res = await supabaseRpc("save_campus_payload", {
      p_campus: campus,
      p_password: password,
      p_payload: payload
    });
    return !!res;
  }

  function toCurrency(n) {
    const v = Number(n) || 0;
    return "¥" + v.toLocaleString("zh-CN");
  }

  function toPercent(n) {
    const v = Number(n) || 0;
    return v.toFixed(1) + "%";
  }

  function toDateLabel(iso) {
    const d = new Date(iso + "T00:00:00");
    if (Number.isNaN(d.getTime())) {
      return "截至2026年03月10日";
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return "截至" + y + "年" + m + "月" + day + "日";
  }

  window.AIXI = {
    STORAGE_KEY,
    CAMPUSES,
    DEFAULT_PASSWORDS,
    VIEW_ROLE_LABELS,
    VIEW_PASSWORDS,
    BASE_DATA,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    getLocalData,
    saveLocalData,
    fetchDashboardData,
    verifyCampusLogin,
    saveCampusPayload,
    toCurrency,
    toPercent,
    toDateLabel,
    deepClone
  };
})();
