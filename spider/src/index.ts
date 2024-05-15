import { Octokit } from "octokit";
import dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { readFile, writeFile } from "fs/promises";

dotenv.config();

const octokit = new Octokit({
  auth: process.env.TOKEN,
});

interface OsModuleConfig {
  name: string;
  description: string | undefined;
  version: string | undefined;
  keywords: string[] | undefined;
  doc_url: string | undefined;
  author: {
    name: string;
    email: string;
    url: string | undefined;
  }[] | undefined;
  // repo url
  url: string;
  created_at: string | null | undefined;
  updated_at: string | null | undefined;
  repo: string;
}

interface PerRepoInfo {
  repo: string;
  create_at: string | null | undefined;
  update_at: string | null | undefined;
  content: string | undefined;
  url: string;
}

// entry point
async function main() {
  let rate_limit = await octokit.rest.rateLimit.get();
  // console.log(`rate_limit: ${rate_limit.data.rate.limit}`);
  console.log(rate_limit.data);
  let orgs = await octokit.rest.repos.listForOrg({
    org: "kern-crates",
  });
  // console.log(orgs);

  let modules: Array<PerRepoInfo> = new Array();

  let exclude_list = (await readFile('./exclude_repos.txt')).toString("utf8").split("\n");
  // Get all files content
  await Promise.all(orgs.data.filter((v) => !exclude_list.includes(v.full_name)).map(async ({ 
    name, full_name, owner, created_at, updated_at,
    html_url
  }) => {
    console.log(`get ${full_name}`);
    let content = await octokit.rest.repos.getContent({
      owner: owner.login,
      repo: name,
      path: "README.json",
    }).then(result => (result.data as any)['content']).catch(() => null);
    // Insert config into map if file content is not null.
    if (content != null) {
      console.log(`insert into ${full_name}`)
      modules.push({
        content: Buffer.from(content, "base64").toString('utf-8'),
        repo: full_name,
        create_at: created_at,
        update_at: updated_at,
        url: html_url
      });
    } else {
      modules.push({
        content: undefined,
        repo: full_name,
        create_at: created_at,
        update_at: updated_at,
        url: html_url
      });
    }
  }));
  let content = await readFile("./external_repos.txt");
  for(let line of content.toString("utf8").split("\n")) {
    if(line.indexOf("/") == -1) continue; 
    let [owner, name] = line.split("/");
    let repo = await octokit.rest.repos.get({
      owner: owner,
      repo: name,
    });
    let content = await octokit.rest.repos.getContent({
      owner: owner,
      repo: name,
      path: "README.json",
    }).then(result => (result.data as any)['content']).catch(() => null);
    // Insert config into map if file content is not null.
    if (content != null) {
      console.log(`insert into ${line}`)
      modules.push({
        content: Buffer.from(content, "base64").toString('utf-8'),
        repo: line,
        create_at: repo.data.created_at,
        update_at: repo.data.updated_at,
        url: `https://github.com/${line}`
      });
    }
  }  
  let module_configs = modules.map(perRepo => {
    let module_config = null;
    if(perRepo.content != undefined) {
      module_config = JSON.parse(perRepo.content) as OsModuleConfig;
    } else {
      module_config = {
        name: perRepo.repo.split('/').pop(),
        description: undefined,
        version: undefined,
        keywords: undefined,
        doc_url: undefined,
        author: undefined,
        url: perRepo.url,
        created_at: perRepo.create_at,
        updated_at: perRepo.update_at,
        repo: perRepo.repo,
      };
    }
    module_config.url = perRepo.url;
    if(module_config.repo == undefined || module_config.repo == null) {
      module_config.repo = perRepo.repo;
    }
    module_config.created_at = perRepo.create_at;
    module_config.updated_at = perRepo.update_at;
    return module_config;
  });
  await writeFile("../web/data.json", JSON.stringify(module_configs, null, 2));
}

// call entry point
main();
