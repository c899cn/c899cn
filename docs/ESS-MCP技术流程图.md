# ESS-MCP 在线编排沙盘 — 技术流程图

> 源脚本:`ess_mcp_demo.py`(DLX-DEMO-001 端到端路演)
> 架构主线:**M(意图解析)→ C(态势注入)→ P(九功能编排)**,自上而下调度 **L1→L2→L3→L4**,并贯通「在线编排 + 离线 WPT 进化」双核闭环。

> 下方代码块为 Mermaid 源(GitHub 可直接渲染);同时附 PNG 导出图于 `docs/img/`。

---

## 0. 渲染图速览

![主流程](img/ESS-MCP_1_主流程.png)

![双核闭环](img/ESS-MCP_2_双核闭环.png)

![路由对比](img/ESS-MCP_3_路由对比.png)

---

## 1. 主流程:DLX-DEMO-001 端到端闭环

```mermaid
flowchart TD
    NL["管理者自然语言指令<br/>核证出境断面年度达标能力 + 回放治理响应"]:::io

    subgraph MCP["ESS-MCP 在线中枢"]
        direction TB
        M["M · 意图解析<br/>NL → 结构化任务 → task_graph[1..9]"]:::mcp
        C["C · 态势注入<br/>基础信息包 + 观测事实流 → Context Snapshot"]:::mcp
        P["P · 九功能编排<br/>自上而下唤醒→挂载→调度→卸载"]:::mcp
        M --> C --> P
    end

    NL --> M

    subgraph L1["L1 感知层 · 先建世界再接事实"]
        direction TB
        S1["Skill1 流域基础信息构建<br/>→ BasinFoundationPackage(BFP)"]:::l1
        S2["Skill2 动态感知与事实接入<br/>时间对齐/空间锚定/质量标记<br/>accepted vs staged(≤5% 拒收)"]:::l1
        S1 --> S2
    end

    subgraph L2["L2 认知层 · 三水线综合认知"]
        direction TB
        S3["Skill3 风险识别与关键区诊断<br/>state_assertion + risk_record(HIGH)"]:::l2
        S4["Skill4 通量核算与约束平衡<br/>C×Q 通量;流量=估算→降级 C"]:::l2
        S5["Skill5 溯源与归因(规则版)<br/>四模板并行打分→复合因归因 B"]:::l2
        S3 --> S4 --> S5
    end

    subgraph L3["L3 决策层"]
        direction TB
        S6["Skill6 容量配置<br/>P2 暂缓·仅接口占位"]:::l3
        S7["Skill7 情景模拟与优化<br/>最小能量干预·规则级建议"]:::l3
        S6 --> S7
    end

    subgraph L4["L4 交互层 · PDCA 闭环"]
        direction TB
        S8["Skill8 适应性管理<br/>阈值预警 + 三线纠偏→deviation_record"]:::l4
        S9["Skill9 MVR 评估<br/>背景窗 vs 恢复窗·治理贡献=候选/B"]:::l4
        S8 --> S9
    end

    P --> L1 --> L2 --> L3 --> L4

    %% 治理链与证据链横切
    EV["证据链绑定<br/>evidence_chain_record"]:::gov
    GOV["治理复核(人工留痕)<br/>approval_record"]:::gov
    S5 --> EV
    S3 -. "风险=HIGH" .-> GOV
    S9 --> EV
    S9 -. "MVR 候选结论" .-> GOV

    DEL["结果交付<br/>管理版 + 技术版 + 机器版结论包"]:::io
    L4 --> DEL

    classDef io fill:#fde9d9,stroke:#c55a11,color:#000;
    classDef mcp fill:#1f4e78,stroke:#143a5a,color:#fff;
    classDef l1 fill:#e2efda,stroke:#538135,color:#000;
    classDef l2 fill:#deebf7,stroke:#2e75b6,color:#000;
    classDef l3 fill:#fff2cc,stroke:#bf9000,color:#000;
    classDef l4 fill:#fce4ec,stroke:#c2185b,color:#000;
    classDef gov fill:#ededed,stroke:#808080,color:#000;
```

---

## 2. 双核闭环:在线编排 → 离线 WPT 进化

```mermaid
flowchart LR
    subgraph ONLINE["在线核 · ESS-MCP 编排"]
        direction TB
        O1["对象/关系注册"] --> O2["观测事实 ess_fact"]
        O2 --> O3["SER 语义对象<br/>state/risk/attribution"]
        O3 --> O4["证据链 evidence"]
        O4 --> O5["治理复核 approval"]
        O5 --> O6["MVR 结论"]
    end

    subgraph LAKE["数据湖 · 三线结构化沉淀"]
        direction TB
        WQ["水质线 WQ_LINE"]:::ln
        WR["水量线 WR_LINE"]:::ln
        ECO["生态线 ECO_LINE"]:::ln
    end

    subgraph OFFLINE["离线核 · ESS-WPT-MVP"]
        direction TB
        T1["TrainingPackage<br/>消费 Context+SER+证据链"] --> T2["ValidationPackage<br/>影子运行/Replay"]
        T2 --> T3["VersionPackage<br/>v1.0-min.0 → .1"]
        T3 --> T4["治理审批·版本切换"]
        T4 --> T5["热加载生效"]
        T5 --> T6["回滚演练 → 稳定版"]
        T6 --> T7["ReplayPackage<br/>DLX-DEMO-001 可回放"]
    end

    O6 -. "Skill8/9 异步入湖" .-> LAKE
    LAKE --> T1
    T5 -. "新版本驱动下一轮编排" .-> ONLINE

    classDef ln fill:#deebf7,stroke:#2e75b6,color:#000;
```

**螺旋上升**:调度积累数据 → 数据驱动进化 → 进化提升调度。

---

## 3. 路由对比:同一套 MCP,事件不同 → 调度子图不同

```mermaid
flowchart TD
    EV{{"事件类型<br/>(M 意图解析)"}}:::dec

    EV -->|"A 达标核证"| A["全层全 Skill<br/>1→2→3→4→5→6→7→8→9"]:::a
    EV -->|"B 设施应急<br/>(曝气停机/DO跌落)"| B["稀疏子图<br/>2→3→8<br/>绕过 4/5/6/7"]:::b
    EV -->|"C 面源预警<br/>(暴雨冲刷)"| C["认知重子图<br/>2→3→4→5→7<br/>三因子预留"]:::c

    classDef dec fill:#fff2cc,stroke:#bf9000,color:#000;
    classDef a fill:#e2efda,stroke:#538135,color:#000;
    classDef b fill:#fce4ec,stroke:#c2185b,color:#000;
    classDef c fill:#deebf7,stroke:#2e75b6,color:#000;
```

价值:**M 解析 + P 按需编排**——同一套对象语言与中枢,按事件稀疏唤醒 Skill,用完即卸载。

---

## 4. 关键技术约束(贯穿全流程)

| 约束点 | 体现 |
|---|---|
| 先注册后接事实 | Skill1 建 BFP 世界底稿 → Skill2 才接入事实 |
| 质量准入守线 | staged 暂存而非拒绝,守 ≤5% 拒收线 |
| 数据质量传导降级 | 估算流量(Q3/staged)→ Skill4 通量降 C → Skill5 不出强负荷结论 |
| 复合因归因 | 超标主因 = 排放↑ + 稀释能力↓ 并发,非单因 |
| 窗口化核证 | MVR 用背景窗 vs 恢复窗,浓度下降需扣三因子才算净效应 |
| 高风险必复核 | risk=HIGH 与 MVR 候选结论强制进治理链人工留痕 |
| 可回放 | Replay 重建"看到/判断/为什么/谁审批/如何回滚" |
