# 同步列表

> 同步列表的功能是基于 Github-CLI 功能实现的。

主要执行的脚本在 `sync.py`，相关的 `Actions` 文件在 `.github/workflows/sync-repos.yml`。

当 `GitHub Actions` 被触发，首先会尝试从 `sync_list.txt` 读取仓库进行同步，如果这个仓库不存在，就从远程仓库 `Fork`。
