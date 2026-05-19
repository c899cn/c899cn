# ESS-Agent C2 阶段 P0 对象注册说明文档

> 适用项目:ESS-Agent V1.0 大陆溪(泸县段)样板流域
> 适用阶段:C2(P0 三张清单冻结)→ C3(对象与关系注册)
> 版本:基于《P0 注册粒度表 V0.1》与《C2-01 P0 对象清单 V0.1》整理

---

## 0. 总览:两份表的关系

本文档整理两份配套工作底稿,二者是"规则 → 落地"的上下游关系:

| 文件 | 角色 | 作用 |
|---|---|---|
| **P0 注册粒度表** | 规则裁定表 | 逐类裁定:什么算"对象"、按什么粒度注册、是否进入 P0 分母 |
| **C2-01 P0 对象清单** | 规则落地表 | 按粒度规则把大陆溪对象逐条填出来,冻结后作为 C3 注册输入 |

核心口径:**先定分母,再写主语,再接事实。**
流转链路:**粒度表定规则 → C2-01 填实对象行 → 冻结复核 → C3 写入 `object_registry` / `relation_registry`。**

---

## 1. 第一份表:P0 注册粒度表

### 1.1 性质与作用

C2-01 填报前的**注册粒度裁定表 / 结构性工作底稿**。在把实体写入对象库之前,先逐类裁定对象粒度,且一经裁定,C3 注册阶段不得临时变更。

### 1.2 工作表结构

| 工作表 | 内容 |
|---|---|
| P0注册粒度表 | 主表:21 类对象组 × 14 列裁定 |
| 00_说明 | 文件性质、核心口径、3 条红线 |
| 99_码表 | 是否进 P0 / 注册动作 / 关系类型 三套枚举字典 |

### 1.3 主表 14 列含义

每行是一个**对象组**,关键列:

- **是否进入 P0 对象分母**:`YES`(必进)/ `CONDITIONAL`(条件进)/ `NO`、`NO_P0_DEFAULT`(默认不进,需升格审批)
- **注册动作**:`REGISTER`(逐个注册)/ `REGISTER_GROUP`(按设施组,个体进附属台账)/ `REGISTER_OR_HOLD`、`HOLD_OR_REGISTER`(专业组裁定)/ `P1_RESERVE`、`P2_RESERVE`(预留,不计验收)
- **必须建立的关系类型**:`PART_OF / UPSTREAM_OF / DISCHARGES_TO` 等河网拓扑与治理责任关系
- 其余列规定 C2-01 填报要求、C2-02/03 承接、P1/P2 边界、依据来源

### 1.4 21 类对象裁定逻辑

| 处理方式 | 对象组 |
|---|---|
| **逐个/逐处注册**(YES + REGISTER) | BASIN、CU、RIVER、RIVER_REACH、BRANCH(喻家河/冯桥河)、SECTION(8 功能位)、MON_SITE、**OUTFALL(22 个逐行,不得合并)**、WWTP、**WETLAND(15 处逐处)**、MANAGEMENT_ENTITY |
| **按设施组注册**(REGISTER_GROUP) | 电催化(50 台)、曝气(12 台)、生态浮岛——只注册组对象,个体进附属台账,**不进 P0 分母** |
| **条件进**(CONDITIONAL) | POLLUTION_SOURCE、PROJECT_MEASURE、OPS_PATROL_TASK——能独立锚定/作 MVR 主语才注册 |
| **不进 P0(预留)** | 水库水电站(P1)、土地利用/土壤/生态调查(P1/P2)、水质 DOM 光谱(P2)、关键源区 CSA(P2 派生候选) |

### 1.5 三条红线

1. P1/P2、DOM、LULC、土壤、生态调查、水库等扩展项,**未经升格不得进入 V1.0 P0 分母**;
2. 排口/湿地原则逐个逐处登记,电催化/曝气/浮岛按设施组登记;
3. C2 三张清单冻结前,**不得向 object_registry / relation_registry 写正式对象与关系**。

---

## 2. 第二份表:C2-01 P0 对象清单

### 2.1 性质与作用

按粒度表规则**真正填实**的 P0 对象清单初稿。冻结复核通过后,作为 C3 `object_registry` 注册的**唯一分母**,并为 relation_registry、事实锚定、SER、Evidence、MVR、DLX-DEMO-001 烟测提供对象基础。

### 2.2 工作表结构

| 工作表 | 内容 |
|---|---|
| C2-01_P0对象清单 | 主表:79 个对象行 × 31 个字段 |
| 00_说明 | 文件性质、红线、粒度原则、P0C 定义 |
| 99_码表 | p_level / 动作 / 冻结状态等枚举字典 |
| C2-01_统计 | 自动汇总:行数、P0/P0C、复核状态 |

### 2.3 当前状态快照(V0.1)

- 对象总行数 **79**:正式 `P0` **66** 行 + 条件入界 `P0C` **13** 行
- 烟测必需(DLX-DEMO-001 引用)**71** 行
- `freeze_status=frozen`:**0**;`review_status=pending`:**79**
- → 全部仍为 **draft / pending**,尚未经专业组冻结复核(仅预置建议行)

### 2.4 79 个对象按组分布

| 对象组 | 数量 | 说明 |
|---|---|---|
| BASIN | 1 | 大陆溪泸县段(顶层) |
| CONTROL_UNIT | 3 | 上游来水 / 中游支流面源 / 下游出境 |
| RIVER / RIVER_REACH | 1 / 5 | 干流 + 5 段控制断面间河段 |
| TRIBUTARY | 2 | 喻家河、冯桥河 |
| SECTION | 8 | 8 个控制断面(湾凼入境 → 四明水厂出境) |
| **OUTFALL** | **22** | 入河排口逐个登记(01–22) |
| **WETLAND** | **15** | 湿地逐处登记(01–15) |
| WWTP | 3 | 污水处理厂(P0C,名称待核实) |
| TREATMENT_FACILITY | 3 | 电催化 / 曝气 / 生态浮岛(按组注册) |
| MANAGEMENT_ENTITY | 6 | 责任 / 运维主体(P0C,待核实) |
| PROJECT_MEASURE | 6 | 6 项治理措施对象 |
| RESERVOIR / HYD_STRUCT / NPS_ZONE / POND_GROUP | 各 1 | 水库 / 坝体 / 面源区 / 塘群(均 P0C) |

清单**完全遵守粒度表红线**:排口 22 个逐行、湿地 15 处逐处、电催化/曝气/浮岛只建设施组;水库、坝体、面源、责任主体等不确定项统一降为 **P0C**。

### 2.5 31 个字段分类

| 类别 | 字段 |
|---|---|
| **身份** | object_list_id、p_level、object_name/alias/group、temp/formal_object_type_code、object_type_dict_ref |
| **裁定依据** | registry_granularity、p0_inclusion_basis、object_role_in_dlx_demo、dlx_demo_required_flag |
| **拓扑/锚定** | parent_object_ref、spatial_scope_desc、location_desc、candidate_geometry_ref、relation_action、related_site_ref(接 C2-02)、related_data_source_ref(接 C2-03)、c2_pre_source_ref |
| **流转治理** | freeze_status(draft→checked→frozen)、review_status(pending→passed→rejected)、frozen_at/by、freeze_evidence_ref、filled/reviewed/approved_by、v1_1_extension_tag、remark |

### 2.6 P0C 与使用红线

- **P0C = P0-Conditional**:可进入 P0 讨论,但必须补齐来源 / 空间 / 事实或专业复核后,方可冻结为正式 P0。本版水库、坝体、面源区、塘群、3 座污水厂、6 个责任主体均为 P0C。
- **使用红线**:本表 ≠ 正式 object_registry;**只有 `freeze_status=frozen` 且 `review_status=passed` 后**,才能作为 C3 注册输入。

---

## 3. 关键枚举字典(合并参考)

### p_level(对象入界等级)

| 值 | 含义 |
|---|---|
| P0 | 正式 P0 入界对象,可作 C3 注册输入 |
| P0C | 条件入界,需补来源/空间/复核后冻结为 P0 |
| P1 | V1.1 候选/增强对象,不进 V1.0 分母 |
| P2 | 暂缓/后续诊断对象,不进 V1.0 分母 |

### 注册动作

| 值 | 含义 |
|---|---|
| REGISTER | 逐个/逐处注册,写入 object_registry |
| REGISTER_GROUP / REGISTER_IF_CONFIRMED | 按组注册 / 确认后注册 |
| HOLD、P1_RESERVE、P2_RESERVE、P2_DERIVED_CANDIDATE | 暂缓 / 预留 / 派生候选,不计验收分母 |

### freeze_status / review_status(流转状态)

| 字段 | 取值 |
|---|---|
| freeze_status | draft(草稿)→ checked(已核查)→ frozen(已冻结,可作唯一分母) |
| review_status | pending(待复核)→ passed(复核通过)/ rejected(返工) |

### 关系类型(relation_action)

`PART_OF`(隶属)、`UPSTREAM_OF`(上下游)、`DRAINS_TO`(汇入)、`DISCHARGES_TO`(排放至)、`GOVERNED_BY` / `RESPONSIBLE_FOR`(责任)、`MONITORS`(监测)、`TREATS`(治理处理)、`OPERATED_BY`(运维主体)

---

## 4. 一句话总结

> **粒度表**冻结"什么算对象、按什么粒度"的规则;**C2-01 清单**据此填出 79 行 P0 对象初稿(目前全为待复核草稿)。二者共同确保 V1.0 只闭环证明大陆溪主样板链路,防止对象分母失控、设备明细膨胀、扩展项越界。清单冻结复核通过后,即成为 C3 对象与关系注册的唯一分母。
