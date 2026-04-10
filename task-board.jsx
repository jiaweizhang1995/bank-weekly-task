import { useState, useEffect, useCallback } from "react";
import api from './src/api.js';

/* =================== Color Tokens (OKLCH Warm Linen) =================== */
const c = {
  // Surfaces
  bg:        "oklch(95.5% 0.012 75)",      // warm linen base
  surface:   "oklch(98% 0.008 75)",         // card surface
  surfaceAlt:"oklch(93% 0.015 75)",         // subtle alternate
  overlay:   "oklch(97% 0.01 75)",          // elevated surface

  // Text
  text:      "oklch(22% 0.02 55)",          // deep warm charcoal
  textSec:   "oklch(42% 0.018 55)",         // secondary
  textMuted: "oklch(58% 0.015 60)",         // muted
  textFaint: "oklch(68% 0.012 65)",         // faint hints

  // Accent - terracotta/amber
  accent:    "oklch(52% 0.14 45)",          // terracotta
  accentSoft:"oklch(88% 0.05 50)",          // soft accent bg
  accentHover:"oklch(48% 0.15 45)",         // hover state

  // Semantic
  success:   "oklch(48% 0.12 155)",         // warm green
  successBg: "oklch(92% 0.04 155)",
  danger:    "oklch(50% 0.16 25)",          // warm red
  dangerBg:  "oklch(92% 0.04 25)",
  warning:   "oklch(55% 0.14 70)",          // amber
  warningBg: "oklch(93% 0.04 70)",

  // Borders
  border:    "oklch(87% 0.012 70)",
  borderSub: "oklch(91% 0.008 70)",

  // Interactive
  focus:     "oklch(52% 0.14 45 / 0.3)",
};

/* =================== Google Fonts Loader =================== */
function FontLoader() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Albert+Sans:wght@300;400;500;600;700&display=swap');
    `}</style>
  );
}

/* =================== App =================== */
function App() {
  const [members, setMembers] = useState([]);
  const [week, setWeek] = useState({ tasks: [], status: {}, penalty: "", deadline: "", announcement: "" });
  const [view, setView] = useState("landing");
  const [currentMember, setCurrentMember] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [membersData, weekData] = await Promise.all([
        api.getMembers(),
        api.getWeek()
      ]);
      setMembers(membersData);
      setWeek(weekData);
    } catch (e) {
      console.error("Failed to load data:", e);
    }
  }, []);

  useEffect(() => {
    refreshData().then(() => setLoading(false));
  }, [refreshData]);

  // Build a data object matching the shape components expect
  const data = { members, currentWeek: week };

  if (loading) return <LoadingScreen />;

  if (view === "landing") {
    return (
      <Landing
        data={data}
        onSelectMember={(name) => { setCurrentMember(name); setView("member"); }}
        onAdminClick={() => setView("admin-login")}
      />
    );
  }

  if (view === "admin-login") {
    return (
      <Shell>
        <Header title="管理员验证" onBack={() => { setView("landing"); setPinInput(""); setPinError(false); }} />
        <div style={s.content}>
          <div style={s.card}>
            <p style={{ ...s.label, marginBottom: 12 }}>请输入管理密码</p>
            <input
              type="password"
              value={pinInput}
              onChange={e => { setPinInput(e.target.value); setPinError(false); }}
              onKeyDown={async e => {
                if (e.key === "Enter") {
                  try {
                    await api.login(pinInput);
                    setView("admin");
                    setPinInput("");
                  } catch {
                    setPinError(true);
                  }
                }
              }}
              style={{ ...s.input, borderColor: pinError ? c.danger : c.border }}
              placeholder="默认密码 8888"
              autoFocus
            />
            {pinError && <p style={{ color: c.danger, fontSize: "0.8125rem", marginTop: 8 }}>密码错误</p>}
            <button
              style={s.btnPrimary}
              onClick={async () => {
                try {
                  await api.login(pinInput);
                  setView("admin");
                  setPinInput("");
                } catch {
                  setPinError(true);
                }
              }}
            >
              进入管理后台
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  if (view === "admin") {
    return <AdminView data={data} refreshData={refreshData} onBack={() => { api.logout(); setView("landing"); }} />;
  }

  if (view === "member") {
    return <MemberView data={data} refreshData={refreshData} member={currentMember} onBack={() => { setView("landing"); setCurrentMember(null); }} />;
  }

  return null;
}

/* =================== Shell =================== */
function Shell({ children }) {
  return (
    <>
      <FontLoader />
      <div style={s.container}>{children}</div>
    </>
  );
}

/* =================== Landing =================== */
function Landing({ data, onSelectMember, onAdminClick }) {
  const week = data.currentWeek;
  const hasTasks = week && week.tasks && week.tasks.length > 0;

  return (
    <Shell>
      <div style={{
        padding: "48px 24px 32px",
        textAlign: "left",
        borderBottom: `1px solid ${c.border}`,
      }}>
        <p style={{
          fontFamily: "'Albert Sans', sans-serif",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: c.accent,
          margin: "0 0 8px",
        }}>Weekly Task Board</p>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', serif",
          fontSize: "clamp(1.75rem, 5vw + 0.5rem, 2.25rem)",
          fontWeight: 800,
          color: c.text,
          margin: 0,
          lineHeight: 1.15,
        }}>周工作看板</h1>
        <p style={{
          fontFamily: "'Albert Sans', sans-serif",
          fontSize: "0.9375rem",
          color: c.textMuted,
          marginTop: 8,
          lineHeight: 1.5,
        }}>选择你的名字进入</p>
        <p style={{
          fontFamily: "'Albert Sans', sans-serif",
          fontSize: "0.8125rem",
          color: c.textMuted,
          margin: "8px 0 0",
          fontVariantNumeric: "tabular-nums",
        }}>
          {(() => {
            const d = new Date();
            const days = ["日", "一", "二", "三", "四", "五", "六"];
            return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${days[d.getDay()]}`;
          })()}
        </p>
      </div>

      <div style={s.content}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 12,
        }}>
          {data.members.map((name, idx) => {
            const completed = hasTasks ? week.tasks.filter(t => {
              const st = (week.status || {})[name];
              return st && st[t.id];
            }).length : 0;
            const total = hasTasks ? week.tasks.length : 0;
            const hues = [45, 25, 155, 200, 330];
            const hue = hues[idx % hues.length];

            return (
              <button key={name} style={{
                background: c.surface,
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: "20px 12px 16px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                transition: "border-color 0.2s, box-shadow 0.2s",
                fontFamily: "'Albert Sans', sans-serif",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = c.accent;
                e.currentTarget.style.boxShadow = `0 2px 12px oklch(52% 0.14 45 / 0.08)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = c.border;
                e.currentTarget.style.boxShadow = "none";
              }}
              onClick={() => onSelectMember(name)}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: `oklch(90% 0.06 ${hue})`,
                  color: `oklch(35% 0.1 ${hue})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  fontFamily: "'Bricolage Grotesque', serif",
                }}>{name[0]}</div>
                <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: c.text }}>{name}</div>
                {hasTasks && (
                  <div style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: completed === total ? c.success : c.textFaint,
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {completed}/{total} 已完成
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {hasTasks && (
          <div style={{ marginTop: 28 }}>
            <StatusBoard data={data} />
          </div>
        )}

        <button style={{
          width: "100%",
          padding: "14px 0",
          background: "transparent",
          border: `1px solid ${c.borderSub}`,
          borderRadius: 10,
          color: c.textFaint,
          fontSize: "0.875rem",
          fontFamily: "'Albert Sans', sans-serif",
          fontWeight: 500,
          cursor: "pointer",
          marginTop: 24,
          transition: "border-color 0.2s, color 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.color = c.accent; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = c.borderSub; e.currentTarget.style.color = c.textFaint; }}
        onClick={onAdminClick}
        >
          管理后台
        </button>
      </div>
    </Shell>
  );
}

/* =================== Status Board =================== */
function StatusBoard({ data }) {
  const week = data.currentWeek;
  if (!week || !week.tasks || week.tasks.length === 0) return null;

  return (
    <div>
      {week.announcement && (
        <div style={{
          ...s.card,
          background: c.warningBg,
          border: `1px solid oklch(80% 0.04 70)`,
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', serif",
            fontWeight: 700,
            fontSize: "0.875rem",
            color: c.warning,
            marginBottom: 8,
          }}>本周重点通知</div>
          <div style={{
            fontSize: "0.875rem",
            color: c.textSec,
            lineHeight: 1.65,
            whiteSpace: "pre-wrap",
          }}>{week.announcement}</div>
        </div>
      )}

      <div style={s.card}>
        <SectionHeading>本周重点任务</SectionHeading>
        {week.penalty && (
          <p style={{ fontSize: "0.75rem", color: c.warning, margin: "0 0 8px", fontWeight: 500 }}>
            {"惩罚：" + week.penalty}
          </p>
        )}
        {week.deadline && (
          <p style={{ fontSize: "0.75rem", color: c.danger, margin: "0 0 14px", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
            截止: {new Date(week.deadline).toLocaleString("zh-CN")}
            <CountDown deadline={week.deadline} />
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {week.tasks.map((t, idx) => (
            <div key={t.id} style={{
              padding: "12px 14px",
              background: c.surfaceAlt,
              borderRadius: 8,
            }}>
              <div style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: c.text,
                fontFamily: "'Albert Sans', sans-serif",
              }}>
                <span style={{
                  fontFamily: "'Bricolage Grotesque', serif",
                  fontWeight: 700,
                  color: c.accent,
                  marginRight: 8,
                  fontSize: "0.9375rem",
                }}>{idx + 1}</span>
                {t.name}
              </div>
              {t.desc && (
                <div style={{
                  fontSize: "0.8125rem",
                  color: c.textMuted,
                  marginTop: 4,
                  lineHeight: 1.55,
                  paddingLeft: 22,
                }}>{t.desc}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={s.card}>
        <SectionHeading>完成状态</SectionHeading>
        <div style={{ overflowX: "auto", margin: "0 -18px", padding: "0 18px" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.8125rem",
            fontFamily: "'Albert Sans', sans-serif",
            fontVariantNumeric: "tabular-nums",
          }}>
            <thead>
              <tr>
                <th style={s.th}>姓名</th>
                {week.tasks.map((t, idx) => (
                  <th key={t.id} style={{ ...s.th, textAlign: "center", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.members.map(name => (
                <tr key={name}>
                  <td style={s.td}>{name}</td>
                  {week.tasks.map(t => {
                    const st = (week.status || {})[name];
                    const val = st ? st[t.id] : null;
                    return (
                      <td key={t.id} style={{ ...s.td, textAlign: "center" }}>
                        <StatusDot val={val} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =================== StatusDot =================== */
function StatusDot({ val, clickable, onClick }) {
  const base = {
    width: 22,
    height: 22,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.6875rem",
    fontWeight: 700,
    border: "none",
    cursor: clickable ? "pointer" : "default",
    transition: "transform 0.15s",
    padding: 0,
  };

  if (val === "done") {
    return (
      <span style={{ ...base, background: c.success, color: "#fff" }} onClick={onClick} role={clickable ? "button" : undefined}>
        ✓
      </span>
    );
  }
  if (val === "rejected") {
    return (
      <span style={{ ...base, background: c.danger, color: "#fff" }} onClick={onClick} role={clickable ? "button" : undefined}>
        ✗
      </span>
    );
  }
  return (
    <span style={{
      ...base,
      background: "transparent",
      border: `2px solid ${c.borderSub}`,
      color: c.textFaint,
    }} onClick={onClick} role={clickable ? "button" : undefined}>
    </span>
  );
}

/* =================== CountDown =================== */
function CountDown({ deadline }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const diff = new Date(deadline).getTime() - now;
  if (diff <= 0) return <span style={{ color: c.danger, marginLeft: 8, fontWeight: 600 }}>已截止</span>;
  const days = Math.ceil(diff / 86400000);
  return (
    <span style={{
      marginLeft: 8,
      color: days <= 1 ? c.danger : c.warning,
      fontWeight: 600,
    }}>
      剩余 {days}天
    </span>
  );
}

/* =================== Admin View =================== */
function AdminView({ data, refreshData, onBack }) {
  const [tab, setTab] = useState("tasks");
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [deadline, setDeadline] = useState("");
  const [penalty, setPenalty] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [newMember, setNewMember] = useState("");
  const [newPin, setNewPin] = useState("");

  const week = data.currentWeek || { tasks: [], status: {}, penalty: "", deadline: "", announcement: "" };

  useEffect(() => {
    if (data.currentWeek) {
      setDeadline(data.currentWeek.deadline || "");
      setPenalty(data.currentWeek.penalty || "");
      setAnnouncement(data.currentWeek.announcement || "");
    }
  }, []);

  const publishWeek = async () => {
    try {
      await api.updateAnnouncement(announcement);
      await api.updateSettings({ deadline, penalty });
      await refreshData();
    } catch (e) { console.error("Publish failed:", e); }
  };

  const addTask = async () => {
    if (!taskName.trim()) return;
    try {
      await api.addTask(taskName.trim(), taskDesc.trim());
      await refreshData();
      setTaskName("");
      setTaskDesc("");
    } catch (e) { console.error("Add task failed:", e); }
  };

  const removeTask = async (id) => {
    try {
      await api.deleteTask(id);
      await refreshData();
    } catch (e) { console.error("Remove task failed:", e); }
  };

  const resetWeek = async () => {
    try {
      await api.resetWeek();
      await refreshData();
      setDeadline("");
      setPenalty("");
      setAnnouncement("");
    } catch (e) { console.error("Reset failed:", e); }
  };

  const toggleStatus = async (member, taskId) => {
    const st = (week.status || {})[member];
    const cur = st ? st[taskId] : null;
    let newStatus;
    if (cur === "done") newStatus = "rejected";
    else if (cur === "rejected") newStatus = null;
    else newStatus = "done";
    try {
      await api.updateStatus(taskId, member, newStatus);
      await refreshData();
    } catch (e) { console.error("Toggle status failed:", e); }
  };

  const addMember = async () => {
    if (!newMember.trim() || data.members.includes(newMember.trim())) return;
    try {
      await api.addMember(newMember.trim());
      await refreshData();
      setNewMember("");
    } catch (e) { console.error("Add member failed:", e); }
  };

  const removeMember = async (name) => {
    try {
      await api.deleteMember(name);
      await refreshData();
    } catch (e) { console.error("Remove member failed:", e); }
  };

  const changePin = async () => {
    if (newPin.length >= 4) {
      try {
        const oldPin = prompt("请输入当前密码");
        if (!oldPin) return;
        await api.changePin(oldPin, newPin);
        setNewPin("");
        alert("密码已更新");
      } catch (e) {
        alert(e.message || "密码更新失败");
      }
    }
  };

  const tabs = [
    { key: "tasks", label: "任务" },
    { key: "members", label: "成员" },
    { key: "settings", label: "设置" },
  ];

  return (
    <Shell>
      <Header title="管理后台" onBack={onBack} />
      <div style={{
        display: "flex",
        gap: 0,
        borderBottom: `1px solid ${c.border}`,
        padding: "0 20px",
      }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1,
              padding: "13px 0",
              background: "none",
              border: "none",
              fontFamily: "'Albert Sans', sans-serif",
              color: tab === key ? c.accent : c.textFaint,
              fontSize: "0.875rem",
              fontWeight: tab === key ? 700 : 500,
              borderBottom: tab === key ? `2px solid ${c.accent}` : "2px solid transparent",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
          >{label}</button>
        ))}
      </div>

      <div style={s.content}>
        {tab === "tasks" && (
          <>
            <div style={s.card}>
              <SectionHeading>本周重点通知</SectionHeading>
              <textarea
                style={{ ...s.input, minHeight: 80, resize: "vertical", lineHeight: 1.55 }}
                placeholder="输入本周通知公告，所有人可见..."
                value={announcement}
                onChange={e => setAnnouncement(e.target.value)}
              />
              <button style={{
                ...s.btnPrimary,
                marginTop: 8,
                background: c.warning,
              }} onClick={async () => {
                try {
                  await api.updateAnnouncement(announcement);
                  await refreshData();
                  alert("通知已保存");
                } catch (e) { console.error("Save announcement failed:", e); }
              }}>保存通知</button>
            </div>

            <div style={s.card}>
              <SectionHeading>添加任务</SectionHeading>
              <input style={s.input} placeholder="任务名称" value={taskName} onChange={e => setTaskName(e.target.value)} />
              <input style={s.input} placeholder="任务描述（可选）" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
              <button style={s.btnPrimary} onClick={addTask}>添加任务</button>
            </div>

            {week.tasks && week.tasks.length > 0 && (
              <div style={s.card}>
                <SectionHeading>当前任务列表</SectionHeading>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {week.tasks.map((t, idx) => (
                    <div key={t.id} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: idx < week.tasks.length - 1 ? `1px solid ${c.borderSub}` : "none",
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem", color: c.text }}>{t.name}</div>
                        {t.desc && <div style={{ fontSize: "0.8125rem", color: c.textMuted, marginTop: 2 }}>{t.desc}</div>}
                      </div>
                      <button onClick={() => removeTask(t.id)} style={s.btnDanger}>删除</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={s.card}>
              <SectionHeading>截止时间与规则</SectionHeading>
              <label style={s.label}>截止时间</label>
              <input type="datetime-local" style={s.input} value={deadline} onChange={e => setDeadline(e.target.value)} />
              <label style={s.label}>惩罚规则</label>
              <input style={s.input} placeholder="如：未按时提交每条50元红包" value={penalty} onChange={e => setPenalty(e.target.value)} />
              <button style={s.btnPrimary} onClick={publishWeek}>保存设置</button>
            </div>

            <div style={s.card}>
              <SectionHeading>审核状态</SectionHeading>
              <p style={{ fontSize: "0.75rem", color: c.textFaint, margin: "0 0 14px" }}>点击圆点切换状态</p>
              {week.tasks && week.tasks.length > 0 ? (
                <div style={{ overflowX: "auto", margin: "0 -18px", padding: "0 18px" }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.8125rem",
                    fontFamily: "'Albert Sans', sans-serif",
                  }}>
                    <thead>
                      <tr>
                        <th style={s.th}>姓名</th>
                        {week.tasks.map(t => <th key={t.id} style={{ ...s.th, textAlign: "center" }}>{t.name}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {data.members.map(name => (
                        <tr key={name}>
                          <td style={s.td}>{name}</td>
                          {week.tasks.map(t => {
                            const val = (week.status || {})[name]?.[t.id];
                            return (
                              <td key={t.id} style={{ ...s.td, textAlign: "center" }}>
                                <StatusDot val={val} clickable onClick={() => toggleStatus(name, t.id)} />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p style={{ fontSize: "0.8125rem", color: c.textFaint }}>请先添加任务</p>}
            </div>

            <button style={{
              ...s.btnDanger,
              width: "100%",
              padding: "13px 0",
              marginTop: 8,
              fontSize: "0.875rem",
              borderRadius: 10,
            }} onClick={resetWeek}>清空本周任务（开始新一周）</button>
          </>
        )}

        {tab === "members" && (
          <div style={s.card}>
            <SectionHeading>团队成员管理</SectionHeading>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <input style={{ ...s.input, flex: 1, marginBottom: 0 }} placeholder="新成员姓名" value={newMember} onChange={e => setNewMember(e.target.value)} />
              <button style={{
                ...s.btnPrimary,
                marginTop: 0,
                whiteSpace: "nowrap",
                width: "auto",
                padding: "0 20px",
              }} onClick={addMember}>添加</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {data.members.map((name, idx) => (
                <div key={name} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: idx < data.members.length - 1 ? `1px solid ${c.borderSub}` : "none",
                }}>
                  <span style={{ fontSize: "0.9375rem", fontWeight: 500, color: c.text }}>{name}</span>
                  <button onClick={() => removeMember(name)} style={s.btnDanger}>移除</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div style={s.card}>
            <SectionHeading>修改管理密码</SectionHeading>
            <input style={s.input} placeholder="新密码（至少4位）" value={newPin} onChange={e => setNewPin(e.target.value)} />
            <button style={s.btnPrimary} onClick={changePin}>更新密码</button>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* =================== Member View =================== */
function MemberView({ data, refreshData, member, onBack }) {
  const week = data.currentWeek;
  const hasTasks = week && week.tasks && week.tasks.length > 0;

  const markDone = async (taskId) => {
    const st = (week.status || {})[member];
    if (st && st[taskId] === "done") return;
    try {
      await api.updateStatus(taskId, member, "done");
      await refreshData();
    } catch (e) { console.error("Mark done failed:", e); }
  };

  return (
    <Shell>
      <Header title={`${member} 的任务`} onBack={onBack} />
      <div style={s.content}>
        {!hasTasks ? (
          <div style={{ ...s.card, textAlign: "center", padding: "48px 18px" }}>
            <p style={{
              fontFamily: "'Bricolage Grotesque', serif",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: c.text,
              margin: "0 0 6px",
            }}>本周暂无任务</p>
            <p style={{ color: c.textMuted, fontSize: "0.875rem" }}>等待管理员发布新任务</p>
          </div>
        ) : (
          <>
            {week.deadline && (
              <div style={{
                ...s.card,
                background: c.dangerBg,
                border: `1px solid oklch(82% 0.04 25)`,
              }}>
                <p style={{
                  margin: 0,
                  fontSize: "0.8125rem",
                  color: c.danger,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  截止: {new Date(week.deadline).toLocaleString("zh-CN")}
                  <CountDown deadline={week.deadline} />
                </p>
                {week.penalty && (
                  <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: c.warning, fontWeight: 500 }}>
                    {"惩罚：" + week.penalty}
                  </p>
                )}
              </div>
            )}

            {week.announcement && (
              <div style={{
                ...s.card,
                background: c.warningBg,
                border: `1px solid oklch(80% 0.04 70)`,
              }}>
                <div style={{
                  fontFamily: "'Bricolage Grotesque', serif",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: c.warning,
                  marginBottom: 8,
                }}>本周重点通知</div>
                <div style={{
                  fontSize: "0.875rem",
                  color: c.textSec,
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                }}>{week.announcement}</div>
              </div>
            )}

            <div style={s.card}>
              <SectionHeading>本周任务</SectionHeading>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {week.tasks.map(t => {
                  const val = (week.status || {})[member]?.[t.id];
                  const isDone = val === "done";
                  const isRejected = val === "rejected";

                  let itemBg = c.surfaceAlt;
                  let itemBorder = "transparent";
                  if (isDone) { itemBg = c.successBg; itemBorder = `oklch(82% 0.04 155)`; }
                  if (isRejected) { itemBg = c.dangerBg; itemBorder = `oklch(82% 0.04 25)`; }

                  return (
                    <div key={t.id} style={{
                      background: itemBg,
                      borderRadius: 10,
                      padding: "14px 16px",
                      border: `1px solid ${itemBorder}`,
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 12,
                      }}>
                        <div style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <div style={{ paddingTop: 1 }}>
                            <StatusDot val={val} />
                          </div>
                          <div>
                            <span style={{
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              color: isDone ? c.success : isRejected ? c.danger : c.text,
                            }}>{t.name}</span>
                            {t.desc && (
                              <div style={{
                                fontSize: "0.8125rem",
                                color: c.textMuted,
                                marginTop: 4,
                                lineHeight: 1.55,
                              }}>{t.desc}</div>
                            )}
                            {isRejected && (
                              <div style={{
                                fontSize: "0.75rem",
                                color: c.danger,
                                marginTop: 4,
                                fontWeight: 500,
                              }}>被管理员打回，请重新提交</div>
                            )}
                          </div>
                        </div>
                        {!isDone && (
                          <button
                            style={{
                              ...s.btnPrimary,
                              marginTop: 0,
                              fontSize: "0.75rem",
                              padding: "7px 14px",
                              width: "auto",
                              flexShrink: 0,
                            }}
                            onClick={() => markDone(t.id)}
                          >
                            标记完成
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}

/* =================== Shared Components =================== */
function Header({ title, onBack }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "16px 20px",
      borderBottom: `1px solid ${c.border}`,
    }}>
      <button onClick={onBack} style={{
        background: "none",
        border: "none",
        color: c.accent,
        fontSize: "1.25rem",
        cursor: "pointer",
        padding: "4px 0",
        fontFamily: "'Albert Sans', sans-serif",
        lineHeight: 1,
      }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 4L7 10L13 16" />
        </svg>
      </button>
      <h2 style={{
        margin: 0,
        fontSize: "1.0625rem",
        fontWeight: 700,
        color: c.text,
        fontFamily: "'Bricolage Grotesque', serif",
      }}>{title}</h2>
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h3 style={{
      margin: "0 0 14px",
      fontSize: "0.9375rem",
      fontWeight: 700,
      color: c.text,
      fontFamily: "'Bricolage Grotesque', serif",
      letterSpacing: "-0.01em",
    }}>{children}</h3>
  );
}

function LoadingScreen() {
  return (
    <>
      <FontLoader />
      <div style={{
        ...s.container,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          textAlign: "center",
          fontFamily: "'Bricolage Grotesque', serif",
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `3px solid ${c.borderSub}`,
            borderTopColor: c.accent,
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: c.textMuted, fontSize: "0.875rem" }}>加载中...</p>
        </div>
      </div>
    </>
  );
}

/* =================== Styles =================== */
const s = {
  container: {
    minHeight: "100vh",
    background: c.bg,
    color: c.text,
    fontFamily: "'Albert Sans', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif",
    maxWidth: 480,
    margin: "0 auto",
    boxShadow: "0 0 0 1px oklch(87% 0.012 70 / 0.5)",
  },
  content: {
    padding: "20px 20px 48px",
  },
  card: {
    background: c.surface,
    border: `1px solid ${c.border}`,
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    background: c.bg,
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    color: c.text,
    fontSize: "0.875rem",
    fontFamily: "'Albert Sans', sans-serif",
    marginBottom: 10,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  label: {
    fontSize: "0.8125rem",
    color: c.textMuted,
    fontWeight: 500,
    marginBottom: 6,
    display: "block",
    fontFamily: "'Albert Sans', sans-serif",
  },
  btnPrimary: {
    background: c.accent,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "11px 20px",
    fontSize: "0.875rem",
    fontWeight: 600,
    fontFamily: "'Albert Sans', sans-serif",
    cursor: "pointer",
    marginTop: 6,
    width: "100%",
    transition: "background 0.2s",
  },
  btnDanger: {
    background: c.dangerBg,
    color: c.danger,
    border: "none",
    borderRadius: 6,
    padding: "5px 12px",
    fontSize: "0.8125rem",
    fontWeight: 500,
    fontFamily: "'Albert Sans', sans-serif",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  th: {
    padding: "8px 6px",
    textAlign: "left",
    borderBottom: `1px solid ${c.border}`,
    color: c.textMuted,
    fontWeight: 600,
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  td: {
    padding: "10px 6px",
    borderBottom: `1px solid ${c.borderSub}`,
    color: c.text,
    fontSize: "0.8125rem",
  },
};

export default App;
