// ===== ESS-Agent Interactive Web App =====

document.addEventListener('DOMContentLoaded', () => {

  // --- Intersection Observer for layer animations ---
  const layerRows = document.querySelectorAll('.layer-row');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100);
      }
    });
  }, { threshold: 0.15 });
  layerRows.forEach(row => observer.observe(row));

  // --- Modal System ---
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');

  function openModal(title, html) {
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // --- Module Detail Data ---
  const moduleDetails = {
    'm-cog': {
      title: 'M_Cog — 认知引擎',
      html: `
        <p>ESS-MCP的核心大脑，负责理解用户意图并将其转化为可执行任务。</p>
        <h4>核心能力</h4>
        <ul>
          <li><span class="tag tag-tech">LLM</span>自然语言意图解析与多轮对话</li>
          <li><span class="tag tag-tech">视觉模型</span>遥感影像、光谱数据的智能识别</li>
          <li><span class="tag tag-tech">任务编排</span>将复杂需求拆解为Skill调用链</li>
        </ul>
        <h4>数据交互</h4>
        <ul>
          <li><span class="tag tag-data">输入</span>用户指令、上下文状态、传感器数据</li>
          <li><span class="tag tag-data">输出</span>任务执行计划、Skill调度序列</li>
        </ul>
      `
    },
    'c-ctx': {
      title: 'C_Ctx — 生态态势上下文',
      html: `
        <p>汇聚全域生态数据，为决策提供完整的环境感知。</p>
        <h4>数据来源</h4>
        <ul>
          <li><span class="tag tag-data">光谱数据</span>高光谱/多光谱遥感影像</li>
          <li><span class="tag tag-data">图网络</span>流域拓扑结构、空间关联图</li>
          <li><span class="tag tag-data">水文数据</span>实时监测站数据、历史水文记录</li>
        </ul>
        <h4>全息注入机制</h4>
        <p>通过多模态融合技术，将异构数据统一为可计算的态势表征向量，实时注入各功能模块。</p>
      `
    },
    'p-proto': {
      title: 'P_Proto — 标准化协议',
      html: `
        <p>九大功能模块的统一接入层，确保模块间高效协作。</p>
        <h4>协议机制</h4>
        <ul>
          <li><span class="tag tag-tech">标准化挂载</span>每个Skill遵循统一的输入/输出Schema</li>
          <li><span class="tag tag-tech">智能调度</span>根据任务类型与资源状态动态编排执行顺序</li>
          <li><span class="tag tag-tech">负载均衡</span>在线/离线任务自动分流</li>
        </ul>
        <h4>支持模式</h4>
        <ul>
          <li>同步调用：实时响应类任务</li>
          <li>异步调用：批量计算与模型训练</li>
          <li>事件驱动：基于阈值的自动触发</li>
        </ul>
      `
    }
  };

  // --- Skill Detail Data ---
  const skillDetails = {
    1: {
      title: 'Skill 1：流域划分',
      html: `
        <p>基于DEM数据进行自动化流域划分，建立水文分析基础框架。</p>
        <h4>核心流程</h4>
        <ul>
          <li>DEM预处理（填洼、流向计算）</li>
          <li>河网提取与等级划分</li>
          <li>子流域自动划分</li>
          <li>河网拓扑关系确立与边界勾画</li>
        </ul>
        <h4>技术栈</h4>
        <p><span class="tag tag-tech">3D-CNN</span><span class="tag tag-tech">ViT</span><span class="tag tag-tech">DEM水文分析</span></p>
        <h4>所属层级</h4>
        <p>L1 全谱感知层 — 确立系统态势的基础步骤</p>
      `
    },
    2: {
      title: 'Skill 2：HRU提取',
      html: `
        <p>水文响应单元（HRU）的自动化生成与属性标注。</p>
        <h4>叠加分析</h4>
        <ul>
          <li>土地利用类型图层</li>
          <li>土壤类型图层</li>
          <li>坡度分级图层</li>
        </ul>
        <h4>输出成果</h4>
        <ul>
          <li>HRU空间分布图</li>
          <li>各HRU属性参数表</li>
          <li>水文响应单元编码体系</li>
        </ul>
        <h4>所属层级</h4>
        <p>L1 全谱感知层</p>
      `
    },
    3: {
      title: 'Skill 3：关键源区识别',
      html: `
        <p>多因子综合评估，识别流域内高风险污染贡献区（CSA）。</p>
        <h4>评估维度</h4>
        <ul>
          <li>污染物负荷强度</li>
          <li>径流汇流路径</li>
          <li>地形与土壤脆弱性</li>
          <li>土地利用变化影响</li>
        </ul>
        <h4>CSA筛选机制</h4>
        <p>基于多因子叠加分析和风险矩阵，自动筛选并排序高风险区域，输出关键源区清单与空间分布图。</p>
        <h4>所属层级</h4>
        <p>L2 认知与推演层 — 赋能科学治水</p>
      `
    },
    4: {
      title: 'Skill 4：负荷核算与生态流量约束提取',
      html: `
        <p>精确核算非点源污染负荷，并提取生态流量约束指标。</p>
        <h4>负荷核算方法</h4>
        <ul>
          <li><span class="tag tag-tech">SCS-CN</span>产流模型计算径流量</li>
          <li><span class="tag tag-tech">EMC法</span>事件平均浓度法估算负荷</li>
        </ul>
        <h4>生态流量指标</h4>
        <ul>
          <li>Qq — 枯水期最小生态流量</li>
          <li>dQp — 洪水脉冲特征流量</li>
          <li>Qb — 基流维持量</li>
        </ul>
        <h4>所属层级</h4>
        <p>L2 认知与推演层</p>
      `
    },
    5: {
      title: 'Skill 5：污染溯源',
      html: `
        <p>三维分解归因体系，精准定位污染来源。</p>
        <h4>三维溯源框架</h4>
        <ul>
          <li><strong>空间维度</strong> — 源区空间定位</li>
          <li><strong>源类型维度</strong> — 点源/面源/内源分类</li>
          <li><strong>责任主体维度</strong> — 管辖归属与责任划分</li>
        </ul>
        <h4>输出</h4>
        <ul>
          <li>污染源清单与贡献率排序</li>
          <li>空间溯源热力图</li>
          <li>责任分配建议方案</li>
        </ul>
        <h4>所属层级</h4>
        <p>L2 认知与推演层</p>
      `
    },
    6: {
      title: 'Skill 6：总量分配',
      html: `
        <p>在TMDL（最大日负荷总量）约束下，合理分配削减任务。</p>
        <h4>分配策略</h4>
        <ul>
          <li><strong>等比例分配</strong> — 各源区等比削减</li>
          <li><strong>边际成本分配</strong> — 成本最优化削减</li>
          <li><strong>公平性分配</strong> — 综合考量经济发展差异</li>
        </ul>
        <h4>约束条件</h4>
        <ul>
          <li>水质达标约束</li>
          <li>生态流量约束</li>
          <li>经济可行性约束</li>
        </ul>
        <h4>所属层级</h4>
        <p>L3 决策与干预层 — 落实生态理水原则</p>
      `
    },
    7: {
      title: 'Skill 7：情景优化',
      html: `
        <p>强化学习驱动的BMP（最佳管理实践）组合方案优化。</p>
        <h4>优化模式</h4>
        <ul>
          <li><span class="tag tag-tech">在线模式</span>快速推理，秒级返回近似最优方案</li>
          <li><span class="tag tag-tech">离线模式</span>大规模蒙特卡洛推演，全局最优搜索</li>
        </ul>
        <h4>优化目标</h4>
        <ul>
          <li>最小成本达标</li>
          <li>最大生态效益</li>
          <li>多目标Pareto前沿</li>
        </ul>
        <h4>所属层级</h4>
        <p>L3 决策与干预层</p>
      `
    },
    8: {
      title: 'Skill 8：适应性管理',
      html: `
        <p>实现策略的动态校正与闭环管理。</p>
        <h4>核心机制</h4>
        <ul>
          <li><strong>策略校正</strong> — 根据实时监测反馈调整干预措施</li>
          <li><strong>阈值监警</strong> — 多级预警系统，自动触发应急响应</li>
          <li><strong>方案迭代</strong> — 持续优化管理方案，收敛至稳态</li>
        </ul>
        <h4>闭环流程</h4>
        <p>监测 → 评估 → 调整 → 执行 → 监测，形成自适应管理循环。</p>
        <h4>所属层级</h4>
        <p>L4 交互与适应层 — 系统管水与适应性闭环</p>
      `
    },
    9: {
      title: 'Skill 9：MVR评估',
      html: `
        <p>监测-核查-报告（Monitoring, Verification, Reporting）全流程评估。</p>
        <h4>四维效果检查</h4>
        <ul>
          <li><strong>水质维度</strong> — 断面水质达标率与趋势分析</li>
          <li><strong>措施维度</strong> — BMP实施完成率与有效性评估</li>
          <li><strong>成本维度</strong> — 投入产出比与边际效益分析</li>
          <li><strong>生态维度</strong> — 生物多样性与栖息地健康指数</li>
        </ul>
        <h4>报告输出</h4>
        <ul>
          <li>定期评估报告自动生成</li>
          <li>可视化仪表盘实时展示</li>
        </ul>
        <h4>所属层级</h4>
        <p>L4 交互与适应层</p>
      `
    }
  };

  // --- WPT Responsibility Details ---
  const respDetails = {
    1: {
      title: 'Resp1 — 世界模型训练：蒸馏环境结构',
      html: `
        <p>构建流域物理世界的数字镜像，学习环境时空结构。</p>
        <h4>核心技术</h4>
        <ul>
          <li><span class="tag tag-tech">ST-GCN</span>时空图卷积网络拓扑重构</li>
          <li><span class="tag tag-tech">JEPA</span>联合嵌入预测架构，表征更新</li>
          <li><span class="tag tag-tech">课程迁移</span>数字表象到物理模型的知识迁移</li>
        </ul>
        <h4>蒸馏目标</h4>
        <p>将高维传感器数据压缩为紧凑的环境结构表征，供在线系统实时使用。</p>
      `
    },
    2: {
      title: 'Resp2 — 灰盒对齐：蒸馏物理因果',
      html: `
        <p>结合物理模型先验知识与实测数据，构建可解释的因果模型。</p>
        <h4>方法路径</h4>
        <ul>
          <li><span class="tag tag-tech">SWAT仿标签</span>利用SWAT模型生成课程化伪标签</li>
          <li><span class="tag tag-tech">对比学习</span>实测数据与仿真数据的对比学习</li>
          <li><span class="tag tag-tech">课程化注入</span>从简单到复杂的渐进式知识注入</li>
        </ul>
      `
    },
    3: {
      title: 'Resp3 — 强化学习优化：蒸馏干预规律',
      html: `
        <p>通过多任务交互训练，学习最优干预策略。</p>
        <h4>训练框架</h4>
        <ul>
          <li><span class="tag tag-tech">SIMA式训练</span>多任务交互式强化学习</li>
          <li><span class="tag tag-tech">策略网络</span>持续更新决策策略参数</li>
          <li><span class="tag tag-tech">沙盘推演</span>虚拟环境中的大规模策略验证</li>
        </ul>
      `
    },
    4: {
      title: 'Resp4 — 持续学习：校准蒸馏偏差',
      html: `
        <p>监测与修正模型漂移，确保长期预测准确性。</p>
        <h4>关键能力</h4>
        <ul>
          <li><strong>漂移检测</strong> — 分布变化的自动感知</li>
          <li><strong>课程分布调整</strong> — 训练数据配比的动态优化</li>
          <li><strong>增量更新</strong> — 不遗忘旧知识的前提下学习新模式</li>
        </ul>
      `
    },
    5: {
      title: 'Resp5 — 能力反哺：交付蒸馏成果',
      html: `
        <p>将离线训练成果安全、高效地推送至在线系统。</p>
        <h4>交付流程</h4>
        <ul>
          <li><strong>模型权重推送</strong> — 增量式模型更新包</li>
          <li><strong>MCP热加载</strong> — 在不中断服务的情况下更新模型</li>
          <li><strong>A/B测试</strong> — 新旧模型并行验证后切换</li>
        </ul>
      `
    }
  };

  // --- Click handlers for MCP modules ---
  document.querySelectorAll('.module-item').forEach(item => {
    item.addEventListener('click', () => {
      const key = item.dataset.detail;
      if (moduleDetails[key]) {
        openModal(moduleDetails[key].title, moduleDetails[key].html);
      }
    });
  });

  // --- Click handlers for WPT responsibilities ---
  document.querySelectorAll('.resp-item').forEach(item => {
    item.addEventListener('click', () => {
      const key = item.dataset.resp;
      if (respDetails[key]) {
        openModal(respDetails[key].title, respDetails[key].html);
      }
    });
  });

  // --- Click handlers for Skill cards ---
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.skill;
      if (skillDetails[key]) {
        openModal(skillDetails[key].title, skillDetails[key].html);
      }
    });
  });

  // --- Side navigation active state ---
  const navDots = document.querySelectorAll('.nav-dot');
  const sections = [
    document.getElementById('one-body'),
    document.getElementById('dual-core-title'),
    document.querySelector('.layers-section')
  ];

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + window.innerHeight / 3;
    let activeIndex = 0;
    sections.forEach((section, i) => {
      if (section && section.offsetTop <= scrollY) {
        activeIndex = i;
      }
    });
    navDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  });

  // --- Keyboard navigation ---
  document.addEventListener('keydown', (e) => {
    if (e.key === '1') document.getElementById('one-body').scrollIntoView({ behavior: 'smooth' });
    if (e.key === '2') document.getElementById('dual-core-title').scrollIntoView({ behavior: 'smooth' });
    if (e.key === '3') document.querySelector('.layers-section').scrollIntoView({ behavior: 'smooth' });
  });

  // --- Trigger initial visibility check ---
  setTimeout(() => {
    layerRows.forEach(row => {
      const rect = row.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        row.classList.add('visible');
      }
    });
  }, 100);

});
