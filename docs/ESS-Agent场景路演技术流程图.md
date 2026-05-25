# ESS-Agent 小流域智能体场景路演 — 技术流程图

> 源方案:《ESS-Agent 应用场景路演修订阐述稿》
> 案例:涪江绵阳段某支流冬春交替期**总磷(TP)隐性超标**诊断与自适应管理
> 主线:**从一次 TP 异常 → 一条可审计治理链**(先组织环境世界,再生成结论)

---

## 0. 渲染图速览

![主流程八幕](img/ESS-Agent_1_八幕主流程.png)

![假设收敛与证据归因](img/ESS-Agent_2_假设收敛与证据归因.png)

![自适应管理与训练回流](img/ESS-Agent_3_自适应管理闭环.png)

![能力对比](img/ESS-Agent_4_能力对比.png)

---

## 1. 主流程:八幕端到端治理闭环

```mermaid
flowchart TD
    A0["监测异常<br/>3号控制断面 TP=0.28 mg/L<br/>≥2 周期·近15日无雨·排口正常"]:::io

    subgraph ACT1["第一幕 · 异常触发"]
        S1["事件化(非报警)<br/>→ 初始事件包<br/>对象/时间/指标/初始风险/证据缺口"]:::l1
    end
    subgraph ACT2["第二幕 · 环境语义事件生成"]
        S2["指标值 → 语义事件<br/>语义标注:WQ-EXCEEDANCE / TP-RISK<br/>DRY-SEASON / NO-RAINFALL<br/>SOURCE-UNCERTAIN / INTERNAL-LOAD-POSSIBLE"]:::l1
    end
    subgraph ACT3["第三幕 · 候选假设 + 认知网关"]
        S3["6 类候选假设并行<br/>认知网关:无雨期TP超标<br/>不得直接归因偷排/面源<br/>须先过 6 项校验"]:::l2
    end
    subgraph ACT4["第四幕 · 对象关系追溯"]
        S4["调用空间对象/关系库<br/>关系链:A灌溉水闸→放水脉冲<br/>→上游5.2km流速突增→底泥扰动<br/>→3号断面TP升高→下游达标风险"]:::l2
    end
    subgraph ACT5["第五幕 · 多源证据校验"]
        S5["6 类证据链 + 权重综合<br/>水动力/水质响应/空间梯度<br/>排口排除/底泥风险/质控<br/>→ 主因候选:底泥再悬浮释放"]:::l2
    end
    subgraph ACT6["第六幕 · 模型复核与情景模拟"]
        S6["模型=复核器(非裁判)<br/>情景A/B/C 压力测试<br/>B高脉冲 TP 0.26-0.29 ≈ 实测0.28<br/>→ 高置信度主因成立"]:::l3
    end
    subgraph ACT7["第七幕 · 自适应管理方案"]
        S7["可复核/审批/执行建议<br/>阶梯放水+三级阈值+跟踪监测<br/>+底泥复核+保留外源复核<br/>流速控制 < 0.42 m/s"]:::l4
    end
    subgraph ACT8["第八幕 · MVR 审计 + 训练回流"]
        S8["MVR 七段结论出口<br/>概况/结论/证据/不确定性<br/>/建议/责任闭环/训练回流<br/>→ 事件沉淀为训练·规则·阈值资产"]:::l4
    end

    A0 --> ACT1 --> ACT2 --> ACT3 --> ACT4 --> ACT5 --> ACT6 --> ACT7 --> ACT8
    S8 -. "规则库/阈值库/模型参数更新" .-> S3

    classDef io fill:#fde9d9,stroke:#c55a11,color:#000;
    classDef l1 fill:#e2efda,stroke:#538135,color:#000;
    classDef l2 fill:#deebf7,stroke:#2e75b6,color:#000;
    classDef l3 fill:#fff2cc,stroke:#bf9000,color:#000;
    classDef l4 fill:#fce4ec,stroke:#c2185b,color:#000;
```

---

## 2. 认知引擎:假设收敛 → 证据归因 → 模型复核

```mermaid
flowchart TD
    H["6 类候选假设"]:::h
    H --> H1["暴雨面源(无雨→降权)"]:::down
    H --> H2["工业偷排(排口正常→降权)"]:::down
    H --> H3["污水厂尾水(无证据→待查)"]:::hold
    H --> H4["支流输入(查梯度→保留)"]:::hold
    H --> H5["水闸调度扰动(春灌→升权)"]:::up
    H --> H6["底泥再悬浮释放(机制符合→升权)"]:::up
    H --> H7["监测异常(查质控→保留)"]:::hold

    GATE{{"认知网关<br/>无雨期 TP 超标诊断<br/>禁止越证据下结论"}}:::gate
    H1 & H2 & H3 & H4 & H5 & H6 & H7 --> GATE

    GATE --> E["6 类证据链校验"]:::ev
    E --> E1["水动力:流速0.08→0.62>0.5阈值 · 强"]:::ev
    E --> E2["水质响应:TP↑SS↑浊度↑,COD/NH3N平 · 支持颗粒态磷"]:::ev
    E --> E3["空间梯度:异常集中水闸下游,非支流 · 支持"]:::ev
    E --> E4["排口排除:工业/污水厂正常,小散排口待复核"]:::ev
    E --> E5["底泥风险:低流速累积+历史偏高 · 合理"]:::ev
    E --> E6["质控:校准正常,留样偏差可接受 · 排除仪器"]:::ev

    E1 & E2 & E3 & E4 & E5 & E6 --> W["证据权重综合"]:::w

    W --> M["模型复核·情景模拟"]:::m
    M --> MA["情景A 无放水:TP 0.15-0.18 不足解释"]:::down
    M --> MB["情景B 高脉冲:TP 0.26-0.29 ≈ 实测0.28"]:::up
    M --> MC["情景C 阶梯放水:TP 回落 0.19-0.22"]:::hold

    MA & MB & MC --> CAUSE["高置信度主因<br/>水闸春灌放水→水动力扰动<br/>→底泥再悬浮+内源磷释放<br/>(外源偷排/面源=低概率复核)"]:::cause

    classDef h fill:#deebf7,stroke:#2e75b6,color:#000;
    classDef up fill:#e2efda,stroke:#538135,color:#000;
    classDef down fill:#f2dcdb,stroke:#c0504d,color:#000;
    classDef hold fill:#fff2cc,stroke:#bf9000,color:#000;
    classDef gate fill:#1f4e78,stroke:#143a5a,color:#fff;
    classDef ev fill:#deebf7,stroke:#2e75b6,color:#000;
    classDef w fill:#ededed,stroke:#808080,color:#000;
    classDef m fill:#fff2cc,stroke:#bf9000,color:#000;
    classDef cause fill:#c55a11,stroke:#7f3a0a,color:#fff;
```

---

## 3. 自适应管理闭环:阈值响应 + 责任复核 + 训练回流(PDCA)

```mermaid
flowchart LR
    subgraph PLAN["P · 管理建议"]
        direction TB
        P1["阶梯式分级放水<br/>5→15→22→(28) m³/s"]:::l4
        P2["流速控制 < 0.42 m/s<br/>避开底泥启动区"]:::l4
    end

    subgraph DO["D · 三级阈值响应"]
        direction TB
        T1["一级观察<br/>TP≤0.20:维持调度"]:::ok
        T2["二级预警<br/>0.20<TP≤0.25 或浊度↑30%<br/>:加密监测+降增幅"]:::warn
        T3["三级控制<br/>TP>0.25 且 SS/浊度↑<br/>:暂停增流+人工复核+再模拟"]:::bad
    end

    subgraph CHECK["C · 跟踪监测 + 人工复核"]
        direction TB
        C1["多断面 24-72h 跟踪<br/>TP/DTP/PP/SS/浊度/流速"]:::chk
        C2["水务:水闸调度+春灌约束<br/>生态环境:水质+排口+达标<br/>属地:巡河+排口检查<br/>技术组:模型+底泥+MVR更新"]:::gov
    end

    subgraph ACT["A · MVR + 训练回流"]
        direction TB
        A1["MVR 审计报告<br/>可审计/可回放/可学习"]:::l4
        A2["训练资产沉淀<br/>事件样本/因果链样本<br/>底泥阈值/调度策略样本<br/>→规则库/阈值库/模型参数"]:::asset
    end

    PLAN --> DO --> CHECK --> ACT
    A2 -. "本地版本进化·下一轮诊断优先级" .-> PLAN

    classDef l4 fill:#fce4ec,stroke:#c2185b,color:#000;
    classDef ok fill:#e2efda,stroke:#538135,color:#000;
    classDef warn fill:#fff2cc,stroke:#bf9000,color:#000;
    classDef bad fill:#f2dcdb,stroke:#c0504d,color:#000;
    classDef chk fill:#deebf7,stroke:#2e75b6,color:#000;
    classDef gov fill:#ededed,stroke:#808080,color:#000;
    classDef asset fill:#1f4e78,stroke:#143a5a,color:#fff;
```

---

## 4. 能力对比:为什么不是"更会回答"

```mermaid
flowchart TD
    X["TP 异常事实"]:::io

    X --> TRAD["传统智慧环保平台<br/>展示断面/排口/降雨/曲线<br/>→ 报警:哪里超了<br/>✗ 说不清因果"]:::bad
    X --> LLM["普通大模型<br/>自由生成<br/>→ 加强巡查/加密监测/专项执法<br/>✗ 无诊断力度·无行动阈值"]:::bad
    X --> ESS["ESS-Agent<br/>先组织环境世界再生成结论<br/>→ 对象/关系/机制/证据链/阈值/责任<br/>✓ 可解释·可验证·可复核·可执行·可回流"]:::good

    classDef io fill:#fde9d9,stroke:#c55a11,color:#000;
    classDef bad fill:#f2dcdb,stroke:#c0504d,color:#000;
    classDef good fill:#e2efda,stroke:#538135,color:#000;
```

---

## 5. 关键数据表(随附)

### 5.1 初始证据筛选(第三幕)

| 候选假设 | 当前证据 | 初步处理 |
|---|---|---|
| 暴雨冲刷型农业面源 | 近 15 日无明显降雨 | 降权,但不完全排除 |
| 工业异常排放 | 主要工业排口在线数据正常 | 降权,保留低概率复核 |
| 污水厂尾水异常 | 暂无同步异常证据 | 待查 |
| 支流输入 | 需检查上游支流断面梯度 | 保留 |
| 水闸调度扰动 | 冬春交替期存在春灌放水可能 | 升权 |
| 底泥再悬浮释放 | 枯水期、低流速累积后突发扰动符合机制条件 | 升权 |
| 监测异常 | 需核查设备状态和质控记录 | 保留 |

### 5.2 证据权重综合(第五幕)

| 假设 | 证据支持度 | 不确定性 | 综合判断 |
|---|---|---|---|
| 水闸放水诱发底泥再悬浮释放 | 高 | 中低 | 主因候选 |
| 支流污染输入 | 中低 | 中 | 次要待复核 |
| 工业偷排 | 低 | 中 | 暂不支持 |
| 污水厂尾水异常 | 低 | 低 | 暂不支持 |
| 暴雨冲刷农业面源 | 低 | 低 | 不支持 |
| 监测设备异常 | 低 | 低 | 不支持 |

### 5.3 管理动作表(第七幕)

| 管理动作 | 约束条件 | 监测反馈 | 人工复核 |
|---|---|---|---|
| 水闸阶梯式放水 | 3 号断面流速 < 0.42 m/s | TP、SS、浊度 6/12/24 小时响应 | 水务部门确认 |
| 暂停高脉冲放水 | TP > 0.25 mg/L 且浊度同步升高 | 下游断面是否回落 | 生态环境部门复核 |
| 底泥风险排查 | 锁定水闸下游 5.2 km 河段 | 底泥 TP 与可释放态磷 | 专家组复核 |
| 外源低强度排查 | 小散排口和支流汇入口 | 是否存在异常排水 | 属地巡查确认 |
| 模型再模拟 | 调度方案变化后 | 新一轮预测与实测误差 | 技术组复核 |

---

## 6. 七项技术优势(逐幕对应)

| 幕 | 从 → 到 |
|---|---|
| 第二幕 | 指标系统 → 语义系统(环境语义化) |
| 第三幕 | 自由生成 → 受控推理(认知网关) |
| 第四幕 | 地图查询 → 对象关系推理 |
| 第五幕 | 单点结论 → 证据链归因 |
| 第六幕 | 模型运行 → 模型审计(进证据链不凌驾) |
| 第七幕 | 诊断结论 → 治理阈值(可执行边界) |
| 第八幕 | 一次性响应 → 系统进化(训练回流) |
