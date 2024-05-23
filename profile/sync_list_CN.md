# 同步列表

> 同步列表的功能是基于 Github-CLI 功能实现的。

主要执行的脚本在 `sync.py`，相关的 `Actions` 文件在 `.github/workflows/sync-repos.yml`。

当 `GitHub Actions` 被触发，首先会尝试从 `sync_list.txt` 读取仓库进行同步，如果这个仓库不存在，就从远程仓库 `Fork`。

## sync_list.txt 文件要求

`sync_list.txt` 文件中填写的是 `Github` 中远程仓库的地址。例如，我需要同步 `Byte-OS` 组织中 `polyhal` 到 `kern-crates` 下，需要添加一行 `Byte-OS/polyhal`，如果是个人账户，那么需要填写 `{{github-id}}/{{repo-name}}`，如 `yfblock/ByteOS`.
