import { Octokit } from "octokit";
import dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { load } from 'js-toml';

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
  authors: {
    name: string;
    email: string;
    url: string | undefined;
  }[] | string [] | undefined;
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
  file_fmt: string | undefined;
  url: string;
}

interface CargoTomlConfigPackage {
  name: string | undefined;
  version: string | undefined;
  authors: string[] | undefined;
  description: string | undefined;
  keywords: string[] | undefined
}

/**
 * This array will storage the information of per repo.
 */
let modules: Array<PerRepoInfo> = new Array();

/**
 * Get module information through repository
 * @param owner The repository owner
 * @param repo The repository name
 * @param html_url The repository html url
 * @param created_at The repository created time string
 * @param updated_at The repository updated time string
 */
async function getRepoInfo(
  owner: string,
  repo: string,
  html_url: string,
  created_at: string | undefined | null,
  updated_at: string | undefined | null,
) {
  console.log(`get ${owner}/${repo}`);
  let full_name = `${owner}/${repo}`;

  let content = await octokit.rest.repos.getContent({
    owner: owner,
    repo,
    path: "README.json",
  }).then((result) => (result.data as any)["content"]).catch(() => null);
  // Insert config into map if file content is not null.
  if (content != null) {
    console.log(`insert into ${full_name}`);
    return modules.push({
      content: Buffer.from(content, "base64").toString("utf-8"),
      repo: full_name,
      create_at: created_at,
      update_at: updated_at,
      url: html_url,
      file_fmt: "json"
    });
  }

  // Check cargo toml content file exists
  let cargoTomlContent = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: "Cargo.toml",
  }).then((result) => (result.data as any)["content"]).catch(() => null);
  // use cargo.toml file content as module info if the 
  if(cargoTomlContent != null) {
    return modules.push({
      content: Buffer.from(cargoTomlContent, "base64").toString("utf-8"),
      repo: full_name,
      create_at: created_at,
      update_at: updated_at,
      url: html_url,
      file_fmt: "toml"
    });
  }
  
  modules.push({
    content: undefined,
    repo: full_name,
    create_at: created_at,
    update_at: updated_at,
    url: html_url,
    file_fmt: undefined
  });
}

/**
 * get repository information from whitelist file
 * @param externListFilePath whitelist file path
 */
async function getExternals(externListFilePath: string) {
  let content = await readFile(externListFilePath);
  for (let line of content.toString("utf8").split("\n")) {
    if (line.indexOf("/") == -1) continue;
    let [owner, name] = line.split("/");
    let repo = await octokit.rest.repos.get({
      owner: owner,
      repo: name,
    });
    await getRepoInfo(owner, name, `https://github.com/${line}`, repo.data.created_at, repo.data.updated_at);
  }
}

/**
 * get repository information from the given orgnazition
 * @param orgName orgnazition name
 */
async function getOrg(orgName: string) {
  const per_page = 50;
  for(let page = 1;;page++) {
    let orgs = await octokit.rest.repos.listForOrg({
      org: orgName,
      per_page,
      page
    });
    // Return if there don't have any repositories needed to be handled.
    if(orgs.data.length == 0) {
      return;
    }
    // set excludes for organization repositories
    let exclude_list = (await readFile("./exclude_repos.txt")).toString("utf8")
      .split("\n");
    // Get all files content
    await Promise.all(
      orgs.data.filter((v) => !exclude_list.includes(v.full_name)).map(async ({
        name,
        owner,
        created_at,
        updated_at,
        html_url,
      }) => {
        await getRepoInfo(owner.login, name, html_url, created_at, updated_at);
      }),
    );
  }
}

/**
 * handle the result and translate then into OsModuleConfig
 * @returns OsModuleConfig object
 */
function handleResult(): OsModuleConfig[] {
  return modules.map((perRepo) => {
    console.log(`handle repo: ${perRepo['repo']}`);
    // Set default values
    let module_config = {
      name: perRepo.repo.split("/").pop(),
      description: undefined,
      version: undefined,
      keywords: undefined,
      doc_url: undefined,
      authors: undefined,
      url: perRepo.url,
      created_at: perRepo.create_at,
      updated_at: perRepo.update_at,
      repo: perRepo.repo,
    } as OsModuleConfig;

    try {
      if(perRepo.file_fmt == "json") {
        // If file is json
        module_config = JSON.parse(perRepo.content!) as OsModuleConfig;
      } else if(perRepo.file_fmt == "toml") {
        // If file is toml
        let toml = load(perRepo.content!) as any;
        if(toml['package'] != null && toml['package'] != undefined) {
          let tomlConfig = toml['package'] as CargoTomlConfigPackage;
          module_config = {
            name: tomlConfig.name ?? perRepo.repo.split("/").pop(),
            description: tomlConfig.description,
            version: tomlConfig.version,
            keywords: tomlConfig.keywords,
            doc_url: undefined,
            authors: tomlConfig.authors,
            url: perRepo.url,
            created_at: perRepo.create_at,
            updated_at: perRepo.update_at,
            repo: perRepo.repo,
          } as OsModuleConfig
        }
      }
    } catch(e) {}

    module_config.url = perRepo.url;
    if (module_config.repo == undefined || module_config.repo == null) {
      module_config.repo = perRepo.repo;
    }
    module_config.created_at = perRepo.create_at;
    module_config.updated_at = perRepo.update_at;
    return module_config;
  });
}

// entry point
async function main() {
  // get github api limit information.
  let rate_limit = await octokit.rest.rateLimit.get();

  // console.log(`rate_limit: ${rate_limit.data.rate.limit}`);
  console.log(rate_limit.data);

  // get module info from orgnazition
  await getOrg("kern-crates");

  // get module info from whitelist
  await getExternals("./external_repos.txt");

  // Handle modules informations.
  let module_configs = handleResult();
  await writeFile("../web/data.json", JSON.stringify(module_configs, null, 2));

  console.log("Get all modules information");
}

// call entry point
main();
