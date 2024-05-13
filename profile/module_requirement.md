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
  "keywords": ["hal", "arch", "platform"]
}
```

## 字段说明

- `name` 字段描述了您的模块的名称;
- `description` 字段描述了您的模块介绍;
- `authors` 中使用一个 `数组` 描述了模块的作者信息;
- `keywords` 中描述了您的模块类型，您可以自由添加一些关键字

下面是一些可选信息：

- `repo` 描述了您模块的仓库地址，比如 `yfblock/polyhal`，无需添加 `github` 前缀。
- `doc_url` 描述了您模块的文档地址，填写的文档地质将在模块列表中显示。
