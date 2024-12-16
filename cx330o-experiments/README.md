# cx330o Experiments — A/B 测试与 Feature Flags

GrowthBook 集成，数据驱动的增长实验平台。

## 功能

- A/B 测试（多变量、流量分配、自动停止）
- Feature Flags（渐进式发布、用户分群）
- 贝叶斯统计引擎（显著性检测、置信区间）
- 多平台 SDK（JavaScript / React / Python / Go / Ruby）
- 数据源集成（BigQuery / Snowflake / Postgres）
- 可视化编辑器（无代码创建实验）

## 启动

```bash
docker compose --profile experiments up -d
# 访问: http://localhost:86
# API:  http://localhost:3100
```
