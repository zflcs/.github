# 模块发布要求

如果您想让您的模块发布在 `kern-crates` 组织中，且可以被组织列表识别。您需要在您的仓库中添加一个 `README.json` 文件并填充下面的内容。

```json
{
  "name": "polyhal",
  "description": "This is a crate that help you porting your kernel to multiple platforms.",
  "authors": [{
    "name": "yfblock",
    "email": "321353225@qq.com"
  }],
  "keywords": ["hal", "arch", "platform"],
  "test_repos": [],
  "repo": "Byte-OS/polyhal",
  "doc_url": "https://github.com/Byte-OS/polyhal/wiki"
}
```

## 字段说明

- `name` 字段描述了您的模块的名称;
- `description` 字段描述了您的模块介绍;
- `authors` 中使用一个 `数组` 描述了模块的作者信息;
- `keywords` 中描述了您的模块类型，您可以自由添加一些关键字
- `test_repos` 中描述了相关的测试仓库。

下面是一些可选信息：

- `repo` 描述了您模块的仓库地址，比如 `Byte-OS/polyhal`，无需添加 `github` 前缀。如无次字段则指向我们抓取的仓库，这个字段在应对 `fork` 出的仓库时有比较好的支持。
- `doc_url` 描述了您模块的文档地址，填写的文档地质将在模块列表中显示。需要填入完整的 `url`。


## 抓取程序说明

默认抓取组织内部的仓库，发现含有有效的 `README.json` 文件且格式正确时会被认为是有效模块，加入模块列表。
如果是组织外的仓库需要在 `spider/exterrnal_repos.txt` 中添加仓库地址，格式为 `<Owner>/<Reposity>`， 如: `Byte-OS/lose-net-stack`，一行一个。
