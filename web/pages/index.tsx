import React, { useEffect, useState } from "react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner, getKeyValue, Chip, Button} from "@nextui-org/react";
import {Input, Link} from "@nextui-org/react";
import data from "../data.json";
import { fromDate, getLocalTimeZone } from "@internationalized/date";
import { useAsyncList } from "@react-stately/data";

/* data example
{
	"name": "polyhal",
	"description": "This is a crate that help you porting your kernel to multiple platforms.",
	"authors": [
		{
		"name": "yfblock",
		"email": "321353225@qq.com"
		}
	],
	"keywords": [
		"hal",
		"arch",
		"platform"
	],
	"url": "https://github.com/Byte-OS/polyhal",
	"repo": "Byte-OS/polyhal",
	"created_at": "2024-03-25T14:14:06Z",
	"updated_at": "2024-05-07T18:26:32Z"
}
*/

function CheckNotAvailable({children, item}: any) {
	return <>
		{item?children:<p style={{
			color: 'red'
		}}>Not Available</p>}
	</>
}

export default function IndexPage() {
  let [condition, setCondition] = useState("");
  let list = useAsyncList({
	async load() {
		return {
			items: data.filter((item) => {
				let cond = condition.replaceAll("，", ",");
  				let keys = cond.trim().split(",").filter(v => v.trim().length > 0).map((v) => v.trim());
				console.log(keys);
				return keys.filter((v) => {
					return item.name.match(v) || item.description?.match(v) || (item.keywords != undefined && item.keywords.indexOf(v) >= 0)
				}).length == keys.length;
				// return item.name.match(condition) || item.description?.match(condition) || (item.keywords != undefined && item.keywords.indexOf(condition) >= 0)
			}),
		};
	},
	async sort({items, sortDescriptor}) {
		return {
			items: items.sort((a, b) => {
				if(sortDescriptor.column == undefined) {
					return 0;
				}
				let first = (a as any)[sortDescriptor.column];
				let second = (b as any)[sortDescriptor.column];
				let cmp = first < second ? -1 : 1;
				
				if (sortDescriptor.direction === "descending") {
					cmp *= -1;
				}
	
			  	return cmp;
			}),
		  };
	}
  });

  useEffect(() => {
	list.reload();
  }, [condition])

  return <>
	<div style={{
		width: '90%',
		margin: 'auto',
	}}>
		<div style={{
			padding: '1em 1em',
			paddingBottom: '.5em'
		}}>
			<Input 
				fullWidth={true}
				labelPlacement="outside" 
				placeholder="请输入关键词" 
				type="text" 
				size="sm"
				value={condition} 
				onInput={(e) => setCondition(e.currentTarget.value)} 
			/>
			<div style={{
				marginTop: ".5em",
				color: 'gray'
			}}>
				支持多关键字搜索，关键字之间使用逗号间隔，支持全半角符号。
			</div>
		</div>
		<Table 
			aria-label="Example static collection table" 
			width={"100%"}
			sortDescriptor={list.sortDescriptor}
			onSortChange={list.sort}
		>
			<TableHeader>
				<TableColumn key={"name"} allowsSorting>name</TableColumn>
				<TableColumn maxWidth={"40%"}>description</TableColumn>
				<TableColumn>docs</TableColumn>
				<TableColumn>authors</TableColumn>
				<TableColumn>keywords</TableColumn>
				<TableColumn>repo</TableColumn>
				<TableColumn>update_at</TableColumn>
				<TableColumn>extra_operation</TableColumn>
			</TableHeader>
			<TableBody items={list.items as typeof data}>
				{(item) => (
				<TableRow key={item?.name}>
					<TableCell><Link color="primary" href={"https://github.com/" + item['repo']}>{item['name']}</Link></TableCell>
					<TableCell><CheckNotAvailable item={item['description']}>
					{item['description']}
					</CheckNotAvailable></TableCell>
					<TableCell>
						{
							item['doc_url']!= undefined?
							<Link color="primary" href={item['doc_url']}>Document</Link>:
							<a>not available</a>
						}
					</TableCell>
					<TableCell>
						<CheckNotAvailable item={item['authors']}>
						{
						item['authors']?.map((author) => {
							return  <> {typeof(author) === "string" ?author:(author['name'] + author['email'])} <br /></>
						})
						}
						</CheckNotAvailable>
					</TableCell>
					<TableCell><CheckNotAvailable item={item['keywords']}>
					{item['keywords']?.map((value) => {
						return <><Chip style={{
							cursor: "pointer"
						}} onClick={() => setCondition(value)}>{value}</Chip>&nbsp;</>;
					})}
					</CheckNotAvailable></TableCell>
					<TableCell>{item['repo']}</TableCell>
					<TableCell>{(new Date(item['updated_at'])).toLocaleString()}</TableCell>
					<TableCell>
						<Button onPress={()=>window.open(`https://github.com/${item['repo']}/issues/new/choose`)} size="sm" color="primary">Comment</Button>
					</TableCell>
				</TableRow>
				)}
			</TableBody>
		</Table>
	</div>
  </>;
}
