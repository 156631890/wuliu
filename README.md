# wuliu 独立站

基于 PRD 已完成的中英双语国际物流官网静态站点。

## 页面
- `index.html` 首页
- `services.html` 服务页
- `routes.html` 航线与解决方案
- `why-fugia.html` 为什么选择我们
- `about.html` 关于我们
- `contact.html` 联系我们（含询盘表单 + 反垃圾 honeypot + CRM 接口占位）
- `privacy.html` 隐私政策

## 功能
- 中英双语切换（本地存储记忆）
- 响应式布局（PC / Mobile）
- 基础 SEO 元信息（title/description/keywords/canonical）
- 表单防垃圾字段（honeypot）
- 未来扩展位：AI 报价、客户后台、订单查询、CRM、Blog/News

## 本地运行
在项目目录执行任意一种静态服务命令：

```powershell
python -m http.server 8080
```

然后访问：`http://localhost:8080/index.html`

## 上线前待补充
- 联系方式真实信息（电话、地址）
- 联系页表单 `data-endpoint` 改为实际 CRM API
- Google Map iframe 嵌入
- 域名、HTTPS 与统计代码（如 GA）
