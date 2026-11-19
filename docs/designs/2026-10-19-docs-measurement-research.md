# 中文文档测量：可复用的方法和产品方案

研究日期：2026-10-19。范围：官方方法、原论文和产品文档；未查询用户流量，未改变采集配置。本文是方案研究，不是已经计算出的指标。

## 结论

**有成熟的方法和现成的产品实现，可以组合使用。没有一个通用报表能单独证明“用户的问题已被正确解决”。** 建议用 KCS 管理自助服务成效，用 Google HEART 组织问题和指标，参考搜索产品与文档平台的事件边界，在现有 PostHog 上实现。用统一采集规范保留可复用的事实，支持以后新增分析问题。下面的产品比较只证明其公开功能，不表示市场份额排名。

本文为 [新中文文档实施方案](./2026-10-19-cn-docs-measurement.md) 提供方法依据。先前的搜索到反馈图是最小流程，实施方案已扩展为完整问题目录、数据规范、分期与验收。

## 两套可作为基础的方法

**KCS：从“少了多少工单”转向“解决了多少问题”。** KCS v6 将用户获得的价值、服务渠道健康度、支持组织价值分别观察；明确没有单一指标代表自助成功。它建议结合用户成功问卷、点击路径、工单变化交叉验证，因为各项单独使用都有歧义。可用来回答“用户有没有找到所需信息、是否容易、哪些需求还需人工帮助”；它不是一套现成的埋点 SDK。[KCS Measurement Matters v6](https://library.serviceinnovation.org/KCS/KCS_v6/Measurement_Matters_v6/79_Build_Proficiency)

**Google HEART：先定问题，再选信号，最后写计算规则。** 2010 年原论文提出 Goals → Signals → Metrics，并把任务成功拆为完成情况、耗时和错误。论文指出：日志常常无法确定用户实际想完成什么任务；指标要结合可用性研究。对中文文档，应优先使用任务成功和满意度，是否观察留存、使用频率，要由问题决定。[HEART 原论文，第 2–4 页](https://storage.googleapis.com/gweb-research2023-media/pubtools/pdf/36299.pdf)

版本说明：KCS 官方在 2026 年宣布向 Knowledge-Centered Success 演进，同时说明 v6 材料和培训仍可用。本文引用 v6 中已明确公开的测量原则，不把标注 2027 的新指导当作本次研究的成熟依据。[官方演进说明](https://www.serviceinnovation.org/from-service-to-success-kcs-is-evolving/)

## 产品实现可以学什么

| 方案 | 官方已提供的能力 | 可以回答 | 证明边界 |
| --- | --- | --- | --- |
| Zendesk Knowledge | 查询词、零结果、无点击、CTR、搜索后建单；按渠道、角色、语言筛选 | 用户找什么；哪些词搜不到；哪些搜索之后还要帮助 | CTR 是点击结果数 / 搜索数；建单与查询的关系不能直接证明答案正确。[搜索报表](https://support.zendesk.com/hc/en-us/articles/4408818465562-Analyzing-help-center-search-results) |
| Mintlify | 搜索量、零结果、CTR；搜索漏斗；页面评分、文字和代码片段反馈 | 用户卡在输入、选择还是到达；哪些内容需要修复 | 名为 Search-to-answer 的漏斗实际止于“到达页面”；这不等于确认解决。[漏斗定义](https://www.mintlify.com/docs/analytics/user-engagements)、[反馈](https://www.mintlify.com/docs/optimize/feedback) |
| ReadMe | 页面浏览、搜索词、页面投票；API 调用量和错误 | 文档使用与 API 使用能否一起解释开发者遇到的困难 | API 成功请求是一种操作证据，是否完成目标任务仍需定义；文档未保证自动因果归因。[指标文档](https://docs.readme.com/main/docs/using-metrics-charts) |
| GitBook | 页面、搜索词、AI 查询、评分和评论；可导出再分析 | 查需求、词汇差异、内容缺口和低评分页 | 官方也提醒高浏览量可能来自有用内容，也可能来自反复困惑；单页评分不能说明哪里错。[文档分析指南](https://gitbook.com/docs/guides/docs-analytics/documentation-analytics) |
| Algolia | 搜索、无结果、CTR、点击位置、转化；用查询 ID、结果 ID 和用户标识关联事件 | 分析缺口、点击排名，以及搜索后的动作 | 转化的含义仍由业务定义；其无点击率和 CTR 分母不同，不能直接互补。[指标定义](https://www.algolia.com/doc/guides/search-analytics/concepts/metrics)、[事件关联](https://www.algolia.com/doc/guides/sending-events) |
| Coveo | 搜索分析、自助服务和 Case Assist 报表 | 哪些建议被查看，之后是否建单 | Case Assist 把查看或点击建议后未建单记为 deflection；这是行为口径，不能直接证明问题解决。[官方报表](https://docs.coveo.com/en/l45l0380/service/generate-case-assist-reports) |

这些产品覆盖不同范围，不是同一类采购选项。Zendesk 偏客服与知识库，Mintlify、GitBook、ReadMe 是文档平台，Algolia、Coveo 偏搜索。借鉴其方法不要求采购它们，也不要求更换现有搜索引擎。

## 两项基础能力也有成熟做法

**统一采集规范（Tracking Plan）。** Segment 将事件、字段、含义、类型、必填条件和允许值放进统一规范，并校验实际数据；事件定义支持版本。Snowplow 通过带版本的 JSON Schema 定义事件和上下文。这适合我们的长期需求：同一个“结果实际展示”事实，可以支持无结果分析、速度分析、路径分析和版本对比，不需要为每张报表各埋一套事件。[Segment Tracking Plan](https://www.twilio.com/docs/segment/protocols/tracking-plan/create)、[Snowplow Schema](https://docs.snowplow.io/docs/fundamentals/schemas/)

结构校验不能单独证明事件的触发时机正确或没有漏报。真实可见、重复发送和漏报仍需端到端验收。

**独立的搜索质量评测。** Elastic 的 Ranking Evaluation 使用典型问题、文档集合和人工相关性评级，计算首个相关结果的排名、前几项相关程度等。这种方法可以借到现有搜索中，不要求迁移到 Elasticsearch。技术步骤是否正确，则要另加指定产品、平台和版本的任务验证。后半项是本项目的设计建议，不能声称排名得分已经证明技术正确。[Elastic Ranking Evaluation](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-rank-eval)

## 现有 PostHog 能承担什么

PostHog 已有事件与属性、趋势、漏斗、路径、可复用的 insight 和仪表盘。Surveys 支持用自有界面展示问题、记录展示和回答。Data Warehouse 支持通过关联字段连接外部表与事件。因此，当前可先沿用它作为采集与分析平台，不必再自建一套报表引擎。[Insights](https://posthog.com/docs/product-analytics/insights)、[Dashboards](https://posthog.com/docs/product-analytics/dashboards)、[自定义 Surveys](https://posthog.com/docs/surveys/implementing-custom-surveys)、[外部数据关联](https://posthog.com/docs/data-warehouse/join)

平台能力不等于我们已经拥有数据。2026-10-16 的 staging 验证证明了基础事件到达；本文的任务、搜索关联、反馈和质量评测仍需实现。外部工单或 SDK 集成结果只有在接通数据、且能可靠关联到同一任务时才能分析。仅能关联到同一个用户时，不能自动归因给某次阅读；匿名访问和跨设备访问也不能保证完整关联。

不建议仅因文档站访问量、停留时间或回访变高就判定更好。文档有时应帮助用户尽快完成任务；HEART 的类别是选择框架，不要求全部变成增长目标。[HEART 原论文](https://storage.googleapis.com/gweb-research2023-media/pubtools/pdf/36299.pdf)

## 长期要能回答的问题目录

下表是本项目建议，不是任何厂商的统一指标清单。范围包含搜索，也包含直接打开、导航和外部引流。这里列的是问题族，主看板仍应少而清楚，不把全部问题变成并列 KPI。

| 问题族 | 代表问题 | 需要的证据 | 主要用于 |
| --- | --- | --- | --- |
| 1. 用户与入口 | 谁在使用哪个产品、平台、版本的文档？从搜索引擎、导航还是站内搜索进入？ | 实际入口、页面上下文、已知身份；未知单列 | 决定优化哪些入口与人群；浏览上下文不能证明用户真实在用哪个 SDK |
| 2. 用户需求 | 用户想完成什么？常用词与文档术语是否不同？哪些问题缺少覆盖？ | 脱敏查询、明确选择的任务、反馈主题、支持问题样本 | 规划内容与同义词；由查询猜测的意图要标为推断 |
| 3. 查找与导航 | 搜不到、筛错、排得低，还是到达失败？用户是否反复改词？ | 查询、筛选、可见结果、排名、选择、实际到达、错误 | 区分内容缺口、召回、排序、路由和界面问题 |
| 4. 内容适配与正确性 | 是不是正确产品、平台和版本？示例与步骤是否有效、是否过期？ | 内容版本、错误原因、真实任务审核、示例验证 | 修复错误与过期内容；相关性排名不替代正确性核验 |
| 5. 解决结果 | 用户解决、部分解决、未解决，还是尚未验证？哪些任务最难完成？ | 与任务关联的用户反馈、可信完成回执、反馈覆盖 | 判断成效；没有反馈保持未知 |
| 6. 速度与可靠性 | 结果多久出现？到确认解决花多久？失败是否变多？ | 可见结果耗时、任务时间边界、失败与未完成状态 | 分开优化技术速度和求助效率；确认时间包含反馈延迟 |
| 7. 易用与满意 | 用户是否看得懂、容易找到并使用信息？哪里费力？ | 易用性问题、页面反馈、任务研究、结构化原因 | 改进术语、内容组织、示例和交互；保留评分分布 |
| 8. 内容改进优先级 | 哪些问题频繁出现且没有解决？先补文档还是先修搜索？ | 需求量、明确未解决、错误严重度、内容覆盖和负责人 | 排修复顺序；低频严重错误不能被高频问题淹没 |
| 9. 修改是否有效 | 改文档、排序或导航后，同类用户是否更容易正确完成？ | 内容与策略版本、固定评测集、可比较人群或受控实验 | 验证改动；普通前后对比只说明变化，不自动证明因果 |
| 10. 后续结果与证据质量 | 用户之后是否仍求助、是否完成 SDK 集成？有多少访问无法关联？结论受漏报影响多大？ | 外部业务事实、同一任务的可靠关联、观测窗、采集与反馈覆盖 | 衡量后续价值，说明结论可信范围；先检查缺失、重复与测试流量 |

“有没有解决、对不对、快不快、好不好”仍是成效主线。上面的需求、路径、内容与版本数据负责解释原因；外部结果和实验负责补强证据。

## 建议采用的组合与实施顺序

1. **先定问题和证据。** 用 KCS 的多源核对方法、HEART 的目标到指标过程，给上表每类问题标记负责人、数据来源和目前能否回答。无基线时不先编目标值。
2. **再定一份共享采集规范。** 借 Segment / Snowplow 的办法，定义少量事实事件、共同上下文、关联方式、枚举、版本和验证规则。保留任务、搜索、结果、文档、反馈的关系；HTTP 次数、页面会话和真实问题分别定义。
3. **在现有 PostHog 中采集并验收。** 参考 Algolia 的查询关联、Mintlify 的实际到达边界，以及既有账号流程的真实事实边界。先补搜索、内容到达、反馈、无结果和错误路径；同时验证去重、脱敏与覆盖。
4. **建立可复用的计算规则与质量样本。** 把统计单位、分子分母、时间窗、未知处理、版本写清楚。用同一规则支持日常看板和临时追问；独立维护真实问题的相关性与步骤验证。
5. **再接更强的结果。** 逐步关联同一任务的工单、产品成功事件或任务研究，用受控实验评估重大改动。新增问题优先复用已有事实；历史没有采集的事实不能靠新的报表补出来。

这套组合复用的是成熟方法和事件原语。字段名、任务边界、反馈频次和观察窗口仍要适配中文文档，不能把之前草案中的 30 分钟分段、24 小时观察窗宣称为行业标准。

## 对中文文档的建议

以下是基于上述资料的设计建议，不是任何厂商的统一标准。

先保留六类可复用的数据：**用户要做什么、搜了什么、看见哪些结果、实际到达哪篇文档、给出什么反馈、之后是否完成任务或求助**。每步保留时间，并带上产品、平台、版本和内容版本。查询、搜索结果和文档到达要能关联；一次浏览会话可作为观察单位，但不能自动等同于一个用户问题。

这样，同一批数据以后可回答搜索缺口、排序、平台误匹配、内容过期、路径中断、完成耗时和求助原因。指标增加时，可以复用事实记录，不必每次重新设计一套点击事件。页面评价、任务解决、AI 回答评价应分开；Mintlify 也明确将页面反馈与 Assistant 满意度分别统计。[页面反馈定义](https://www.mintlify.com/docs/optimize/feedback)

“对不对”需要另一条证据：选真实问题，在指定产品、平台和版本中核验搜索结果与操作步骤。点赞、复制和请求成功只能提供线索，不能替代完整任务验证。这个建议采用 HEART 所强调的任务测试和多源验证思路。[HEART 原论文](https://storage.googleapis.com/gweb-research2023-media/pubtools/pdf/36299.pdf)

## 必须保留的解释边界

- **没建单不等于解决。** Zendesk 将未建单的访问明确称为 assumed deflection；其工单避免报表只覆盖帮助中心请求表单，不能代表所有求助渠道。[会话报表定义及限制](https://support.zendesk.com/hc/en-us/articles/9118856019098-Analyzing-user-session-and-page-efficiency-activity-in-the-help-center)
- **CTR 不等于解决率。** Mintlify 只把选择具体结果算作点击；用户转去问 AI 不算点击。所以无点击也不必然失败。[搜索口径](https://www.mintlify.com/docs/analytics/search)
- **自助比率不是成功概率。** Zendesk 不同报表存在“会话数 / 工单数”与“会话数 / 提单用户数”口径，比较时必须写明分母。[会话报表](https://support.zendesk.com/hc/en-us/articles/9118856019098-Analyzing-user-session-and-page-efficiency-activity-in-the-help-center)、[自助分数](https://support.zendesk.com/hc/en-us/articles/4408894139930-Getting-started-with-self-service-Part-6-Tracking-essential-self-service-metrics)
- **无反馈保留为未知。** 自愿回答可能偏向特定人群。方案应同时报告回答人数、反馈曝光人数、全部观察人数，不把回答者的结果外推为全体真实解决率。这是本项目的统计约束；KCS 的多源交叉验证方法提供其设计依据。[KCS Measurement Matters v6](https://library.serviceinnovation.org/KCS/KCS_v6/Measurement_Matters_v6/79_Build_Proficiency)
- **行为、自报、推断、核验分开。** 看到结果是行为事实，用户说解决是自报，未建单代表成功是推断，指定任务中步骤通过是核验。分析结论必须说明依据是哪一种。隐式反馈弱于显式反馈的限制也见作者教材。[Stanford 信息检索教材](https://nlp.stanford.edu/IR-book/html/htmledition/indirect-relevance-feedback-1.html)
- **指标名字相同不保证口径相同。** Algolia 的 CTR 和无点击率不是互补指标，搜索即输入的请求还会聚合。我们应借鉴关联与去重原则，明确自己的逻辑搜索和版本，不直接拼接不同产品的现成比率。[指标](https://www.algolia.com/doc/guides/search-analytics/concepts/metrics)、[查询聚合](https://www.algolia.com/doc/guides/search-analytics/concepts/query-aggregation)

## 官方来源索引

| 来源 | 核实内容 | 版本或时间说明 |
| --- | --- | --- |
| [KCS v6 — Build Proficiency / Measurement Matters](https://library.serviceinnovation.org/KCS/KCS_v6/Measurement_Matters_v6/79_Build_Proficiency) | 三类价值指标；问卷、路径、工单交叉验证；单项指标的歧义 | 引用 v6 指导，未将标注 2027 的新页面作为既定规范 |
| [KCS 官方演进说明](https://www.serviceinnovation.org/from-service-to-success-kcs-is-evolving/) | 向 Knowledge-Centered Success 演进；v6 材料和培训仍可用 | 2026-05-07 |
| [Consortium 2023 自助成功材料](https://www.serviceinnovation.org/wp-content/uploads/2023/09/Consortium-Self-Service-Success-September2023.pdf) | 从渠道使用走向问题解决；成功问卷、置信区间及路径分析 | 2023-09 官方演示材料 |
| [Google HEART 原论文](https://storage.googleapis.com/gweb-research2023-media/pubtools/pdf/36299.pdf) | HEART 分类、目标到指标的过程、完成率/耗时/错误、研究互证 | CHI 2010 作者版；[Google Research 书目](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/) |
| [Zendesk 搜索报表](https://support.zendesk.com/hc/en-us/articles/4408818465562-Analyzing-help-center-search-results) | 查询、零结果、CTR 公式、搜索后建单、筛选维度 | 页面显示编辑于 2026-07-01 |
| [Zendesk 会话与页面效率](https://support.zendesk.com/hc/en-us/articles/9118856019098-Analyzing-user-session-and-page-efficiency-activity-in-the-help-center) | confirmed/assumed deflection、自助比率、请求表单覆盖限制 | 2026-10-19 检索 |
| [Zendesk 自助指标入门](https://support.zendesk.com/hc/en-us/articles/4408894139930-Getting-started-with-self-service-Part-6-Tracking-essential-self-service-metrics) | self-service score 的会话数 / 提单用户数公式 | 页面显示编辑于 2026-04-17 |
| [Mintlify 搜索分析](https://www.mintlify.com/docs/analytics/search) | CTR、零结果、转向 AI 不计点击 | 2026-10-19 检索 |
| [Mintlify 用户参与](https://www.mintlify.com/docs/analytics/user-engagements) | Search-to-answer 四阶段；实际到达区别于点击 | 2026-10-19 检索；打开搜索阶段注明适用于 2026-07-31 起的数据 |
| [Mintlify 反馈](https://www.mintlify.com/docs/optimize/feedback) | 页面评分、评论、代码片段反馈、AI 满意度分离 | 2026-10-19 检索 |
| [ReadMe API & Docs Metrics Charts](https://docs.readme.com/main/docs/using-metrics-charts) | 页面、搜索、页面质量、API 使用与错误的组合分析 | 2026-10-19 检索 |
| [GitBook 文档分析指南](https://gitbook.com/docs/guides/docs-analytics/documentation-analytics) | 组合指标、查询词与用词差异、投票和评论、导出 | 2026-10-19 检索 |
| [Algolia Search analytics metrics](https://www.algolia.com/doc/guides/search-analytics/concepts/metrics) | 搜索、CTR、无结果、无点击、点击位置；分母区别 | 2026-10-19 检索 |
| [Algolia Click and conversion events](https://www.algolia.com/doc/guides/sending-events) | 稳定用户标识、queryID、结果关联 | 页面显示修改于 2026-06-19 |
| [Algolia Query aggregation](https://www.algolia.com/doc/guides/search-analytics/concepts/query-aggregation) | 输入中的多个请求会聚合；后端统一 IP 的误计风险 | 页面显示修改于 2026-09-02 |
| [Coveo Case Assist reports](https://docs.coveo.com/en/l45l0380/service/generate-case-assist-reports) | 以建议文档交互且未建单统计 deflection | 2026-10-19 检索 |
| [Segment Tracking Plan](https://www.twilio.com/docs/segment/protocols/tracking-plan/create) | 事件和字段规范、校验、版本 | 2026-10-19 检索 |
| [Snowplow Schema](https://docs.snowplow.io/docs/fundamentals/schemas/) | 带版本的事件与上下文结构；字段含义与验证 | 2026-10-19 检索 |
| [Elastic Ranking Evaluation](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-rank-eval) | 代表问题、人工相关性标注和排名评测 | 2026-10-19 检索 |
| [Stanford 信息检索教材](https://nlp.stanford.edu/IR-book/html/htmledition/indirect-relevance-feedback-1.html) | 隐式反馈与显式反馈的可靠性区别 | 作者版教材；不是产品功能说明 |
| [PostHog Insights](https://posthog.com/docs/product-analytics/insights) / [Dashboards](https://posthog.com/docs/product-analytics/dashboards) | 趋势、漏斗、路径；同一 insight 可在多个看板使用 | 2026-10-19 通过官方 docs-search MCP 检索 |
| [PostHog 自定义 Surveys](https://posthog.com/docs/surveys/implementing-custom-surveys) / [Surveys API](https://posthog.com/docs/surveys/surfaces/api) | 自有界面与反馈事件；展示、回答和关闭 | 2026-10-19 通过官方 docs-search MCP 检索 |
| [PostHog Joining data](https://posthog.com/docs/data-warehouse/join) | 外部表关联、关联字段与查询 | 2026-10-19 通过官方 docs-search MCP 检索 |

> 本文未核实采购价格、合同与数据驻留条件，也未建议迁移文档平台。功能是否适用还取决于套餐和集成方式。
